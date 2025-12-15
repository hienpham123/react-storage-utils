/** ---------- Imports ---------- **/
import { openDB, IDBPDatabase, DBSchema } from "idb";
import CryptoJS from "crypto-js";
import * as React from "react";
import * as ReactDOM from "react-dom";

/** ---------- Config ---------- **/
const DB_NAME = "FormDraftDB";
const STORE_NAME = "drafts";
// Support both React and SPFx environments
// Default key nếu không có env variable - đảm bảo mã hóa/giải mã hoạt động đúng
const SECRET_KEY = (typeof process !== "undefined" && process.env && process.env.REACT_APP_SECRET_KEY) 
    ? process.env.REACT_APP_SECRET_KEY 
    : "react-storage-utils-default-secret-key-2024";

/** ---------- DB Schema ---------- **/
interface DraftDB extends DBSchema {
    drafts: {
        key: string;
        value: {
            key: string;
            value: string; // encrypted JSON string
        };
    };
}

let dbPromise: Promise<IDBPDatabase<DraftDB>> | null = null;

const getDB = (): Promise<IDBPDatabase<DraftDB>> => {
    if (!dbPromise) {
        dbPromise = openDB<DraftDB>(DB_NAME, 1, {
            upgrade(db: any) {
                if (!db.objectStoreNames.contains("drafts")) {
                    db.createObjectStore("drafts", { keyPath: "key" });
                }
            },
        });
    }
    return dbPromise;
};
/** ---------- Encrypt/Decrypt ---------- **/
export const encryptPassword = (param: string) =>
    CryptoJS.AES.encrypt(param, SECRET_KEY).toString();

/** Decrypt function **/
export const decryptPassword = (param: string) => {
    const bytes = CryptoJS.AES.decrypt(param, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
};

/** Hash key để đảm bảo cùng key luôn tạo ra cùng hash (deterministic) **/
const hashKey = (key: string): string => {
    return CryptoJS.HmacSHA256(key, SECRET_KEY).toString();
};

/** ---------- React 18/19 Compatibility Helpers ---------- **/
// Helper để render component tương thích với React 16, 17, 18, và 19
const renderComponent = (element: React.ReactElement, container: HTMLElement): (() => void) => {
    const reactDOMAny = ReactDOM as any;
    
    // Thử dùng React 18+ API (createRoot) - tương thích cả React 19
    if (reactDOMAny.createRoot && typeof reactDOMAny.createRoot === 'function') {
        try {
            const root = reactDOMAny.createRoot(container);
            root.render(element);
            return () => {
                try {
                    root.unmount();
                } catch (e) {
                    // Ignore unmount errors
                }
            };
        } catch (e) {
            // Fallback nếu có lỗi
        }
    }
    
    // Fallback về React 17 API (render/unmountComponentAtNode)
    if (reactDOMAny.render && typeof reactDOMAny.render === 'function') {
        reactDOMAny.render(element, container);
        return () => {
            try {
                if (reactDOMAny.unmountComponentAtNode && typeof reactDOMAny.unmountComponentAtNode === 'function') {
                    reactDOMAny.unmountComponentAtNode(container);
                }
            } catch (e) {
                // Ignore unmount errors
            }
        };
    }
    
    // Fallback cuối cùng
    console.warn('react-storage-utils: Unable to render component. React DOM APIs not available.');
    return () => {};
};

/** ---------- File to/from JSON ---------- **/
export const fileToJson = (file: File): Promise<{ name: string; type: string; data: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () =>
            resolve({
                name: file.name,
                type: file.type,
                data: reader.result as string,
            });
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

export const jsonToFile = async (obj: { name?: string; FileName?: string; type: string; data: string }) => {
    const res = await fetch(obj.data);
    const blob = await res.blob();
    const fileName = obj.name || obj.FileName || "untitled";
    return new File([blob], fileName, { type: obj.type });
};

/** ---------- Remove ---------- **/
type RemoveDraftFromStorageParams = { keysArr: string[] };

export const removeDraftFromStorage = async ({ keysArr }: RemoveDraftFromStorageParams): Promise<void> => {
    const db = await getDB();
    const tx = (db as any).transaction("drafts", "readwrite");
    const store = tx.objectStore("drafts");

    for (const key of keysArr) {
        // Dùng hash thay vì encrypt để đảm bảo deterministic
        const hashedKey = hashKey(key);
        await store.delete(hashedKey);
    }

    await tx.done;
};

/** ---------- Save ---------- **/
type SaveDraftEntryValue = File | File[] | unknown;
type SaveDraftToStorageParams = {
    entries: [string, SaveDraftEntryValue][];
};

export const saveDraftToStorage = async ({ entries }: SaveDraftToStorageParams) => {
    const db = await getDB();
    const processedEntries: { key: string; value: any }[] = [];

    for (const [key, value] of entries) {
        let dataToSave = value;

        if (Array.isArray(value) && value.length && value[0] instanceof File) {
            const fileArr = await Promise.all(value.map(fileToJson));
            dataToSave = encryptPassword(JSON.stringify(fileArr));
        } else if (value instanceof File) {
            const fileObj = await fileToJson(value);
            dataToSave = encryptPassword(JSON.stringify(fileObj));
        } else if ((Array.isArray(value) && value.length) || (!Array.isArray(value) && value)) {
            dataToSave = encryptPassword(JSON.stringify(value));
        }

        // Hash key để đảm bảo cùng key luôn tạo ra cùng hash (deterministic)
        // Dùng hash thay vì encrypt vì key cần deterministic để tìm lại được
        const hashedKey = hashKey(key);
        processedEntries.push({ key: hashedKey, value: dataToSave });
    }

    const tx = (db as any).transaction("drafts", "readwrite");
    const store = tx.objectStore("drafts");

    for (const entry of processedEntries) {
        await store.put(entry);
    }

    await tx.done;
};

/** ---------- Get ---------- **/
export const getDraftFromStorage = async <T = any>(key: string): Promise<T | null> => {
    try {
        const db = await getDB();
        // Hash key để tìm (deterministic)
        const hashedKey = hashKey(key);
        const rec = await (db as any).get("drafts", hashedKey);
        if (!rec) return null;
        const decrypted = decryptPassword(rec.value);
        return JSON.parse(decrypted) as T;
    } catch (err) {
        console.error("getDraftFromStorage failed:", err);
        return null;
    }
};

export const checkHasDraftInStorage = async (keys: string[]): Promise<boolean> => {
    for (const key of keys) {
        const hasDraft = await checkKeyHasDraftInStorage(key);
        if (hasDraft) {
            return true;
        }
    }
    return false;
};

const checkKeyHasDraftInStorage = async (key: string): Promise<boolean> => {
    try {
        const db = await getDB();
        // Hash key để kiểm tra (deterministic)
        const hashedKey = hashKey(key);
        const rec = await (db as any).get("drafts", hashedKey);
        return !!(rec && rec.value);
    } catch (err) {
        console.error("checkKeyHasDraftInStorage failed:", err);
        return false;
    }
}

/** ---------- Helper: Check và hiển thị dialog restore draft (dùng trong componentDidMount) ---------- **/
type CheckDraftWithDialogOptions = {
    keys: string[];
    title?: string;
    message?: string;
    onRestore?: (data: Record<string, any>) => void;
    onCancel?: () => void;
    useNativeConfirm?: boolean; // Nếu true, dùng window.confirm thay vì Fluent UI Dialog
};

/**
 * Check draft data và hiển thị dialog xác nhận
 * Trả về Promise với data nếu user chọn restore, null nếu cancel hoặc không có data
 * 
 * @example
 * componentDidMount() {
 *   checkDraftWithDialog({
 *     keys: ["formData", "file"],
 *     onRestore: (data) => this.setState({ formData: data.formData })
 *   });
 * }
 */
export const checkDraftWithDialog = async (options: CheckDraftWithDialogOptions): Promise<Record<string, any> | null> => {
    const {
        keys,
        title = "Restore data?",
        message = "Do you want to restore the previously entered data before submitting/saving again?",
        onRestore,
        onCancel,
        useNativeConfirm = false,
    } = options;

    try {
        const hasDraft = await checkHasDraftInStorage(keys);
        if (!hasDraft) {
            return null;
        }

        // Lấy draft data
        const data: Record<string, any> = {};
        for (const key of keys) {
            let value = await getDraftFromStorage(key);
            if (
                value &&
                Object.prototype.hasOwnProperty.call(value, "data") &&
                Object.prototype.hasOwnProperty.call(value, "type") &&
                Object.prototype.hasOwnProperty.call(value, "name")
            ) {
                value = await jsonToFile(value);
            }
            if (value !== null && value !== undefined) data[key] = value;
        }

        if (Object.keys(data).length === 0) {
            return null;
        }

        // Hiển thị dialog
        if (useNativeConfirm) {
            // Dùng native browser confirm
            const shouldRestore = window.confirm(`${title}\n\n${message}`);
            if (shouldRestore) {
                if (onRestore) onRestore(data);
                return data;
            } else {
                if (onCancel) onCancel();
                await removeDraftFromStorage({ keysArr: keys });
                return null;
            }
        } else {
            // Dùng Fluent UI Dialog programmatically hoặc fallback về native confirm
            return new Promise<Record<string, any> | null>(async (resolve) => {
                // Thử dùng Fluent UI Dialog
                try {
                    // Dynamic import Fluent UI
                    const FluentUIModule = await import("@fluentui/react");
                    const { Dialog, DialogType, DialogFooter, DefaultButton, PrimaryButton } = FluentUIModule;

                        // Tạo container cho dialog
                        const dialogContainer = document.createElement("div");
                        document.body.appendChild(dialogContainer);

                        // Tạo cleanup function
                        let unmountFn: (() => void) | null = null;

                        const cleanup = () => {
                            if (unmountFn) {
                                unmountFn();
                                unmountFn = null;
                            }
                            if (dialogContainer.parentNode) {
                                document.body.removeChild(dialogContainer);
                            }
                        };

                        const handleConfirm = async () => {
                            cleanup();
                            if (onRestore) onRestore(data);
                            resolve(data);
                        };

                        const handleCancel = async () => {
                            cleanup();
                            await removeDraftFromStorage({ keysArr: keys });
                            if (onCancel) onCancel();
                            resolve(null);
                        };

                        // Render dialog với React 16/17/18/19 compatibility
                        const dialogElement = React.createElement(Dialog, {
                            hidden: false,
                            onDismiss: handleCancel,
                            dialogContentProps: {
                                type: DialogType.normal,
                                title: title,
                                closeButtonAriaLabel: "Close",
                                subText: message,
                            },
                            minWidth: 450,
                            modalProps: { isBlocking: true },
                        },
                            React.createElement(DialogFooter, null,
                                React.createElement(PrimaryButton, { onClick: handleConfirm, text: "Yes, restore" }),
                                React.createElement(DefaultButton, { onClick: handleCancel, text: "No" })
                            )
                        );

                        // Render component và lưu cleanup function
                        unmountFn = renderComponent(dialogElement, dialogContainer);
                } catch (err) {
                    // Fallback về native confirm nếu Fluent UI không có hoặc có lỗi
                    console.warn("Fluent UI not available or error, using native confirm:", err);
                    const shouldRestore = window.confirm(`${title}\n\n${message}`);
                    if (shouldRestore) {
                        if (onRestore) onRestore(data);
                        resolve(data);
                    } else {
                        if (onCancel) onCancel();
                        removeDraftFromStorage({ keysArr: keys });
                        resolve(null);
                    }
                }
            });
        }
    } catch (err) {
        console.error("checkDraftWithDialog failed:", err);
        return null;
    }
};
