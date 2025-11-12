/** ---------- Imports ---------- **/
import { openDB, IDBPDatabase, DBSchema } from "idb";
import CryptoJS from "crypto-js";

/** ---------- Config ---------- **/
const DB_NAME = "FormDraftDB";
const STORE_NAME = "drafts";
const SECRET_KEY = process.env.REACT_APP_SECRET_KEY || "";

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

const getDB = () => {
    if (!dbPromise) {
        dbPromise = openDB<DraftDB>(DB_NAME, 1, {
            upgrade(db) {
                db.createObjectStore(STORE_NAME, { keyPath: "key" });
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
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    for (const key of keysArr) {
        await store.delete(key);
    }

    await tx.done;
};

/** ---------- Save ---------- **/
type SaveDraftEntryValue = File | File[] | unknown;
type SaveDraftToStorageParams = {
    entries: [string, SaveDraftEntryValue][];
};

export const saveDraftToStorage = async ({ entries }: SaveDraftToStorageParams) => {
    const db = await openDB(DB_NAME, 1);
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

        processedEntries.push({ key, value: dataToSave });
    }

    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    for (const entry of processedEntries) {
        await store.put(entry);
    }

    await tx.done;
};

/** ---------- Get ---------- **/
export const getDraftFromStorage = async <T = any>(key: string): Promise<T | null> => {
    try {
        const db = await getDB();
        const rec = await db.get(STORE_NAME, key);
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
    const db = await getDB();
    const rec = await db.get(STORE_NAME, key);
    return !!(rec && rec.value);
}

/** ---------- Check & Notify ---------- **/
export const checkStorageAndNotify = async (
    keys: string[],
    showNotify: (keys: string[], getItems: (fromStorage: boolean) => void) => void,
    getItems: (fromStorage: boolean) => void
) => {
    const db = await getDB();
    const store = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME);
    let hasData = false;

    for (const key of keys) {
        const rec = await store.get(key);
        if (rec && rec.value) {
            hasData = true;
            break;
        }
    }

    if (hasData) {
        setTimeout(() => {
            showNotify(keys, getItems);
        }, 1000);
    } else {
        getItems(false);
    }
};

