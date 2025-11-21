import * as React from 'react';

/** ---------- Encrypt/Decrypt ---------- **/
declare const encryptPassword: (param: string) => string;
/** Decrypt function **/
declare const decryptPassword: (param: string) => string;
/** ---------- File to/from JSON ---------- **/
declare const fileToJson: (file: File) => Promise<{
    name: string;
    type: string;
    data: string;
}>;
declare const jsonToFile: (obj: {
    name?: string;
    FileName?: string;
    type: string;
    data: string;
}) => Promise<File>;
/** ---------- Remove ---------- **/
type RemoveDraftFromStorageParams = {
    keysArr: string[];
};
declare const removeDraftFromStorage: ({ keysArr }: RemoveDraftFromStorageParams) => Promise<void>;
/** ---------- Save ---------- **/
type SaveDraftEntryValue = File | File[] | unknown;
type SaveDraftToStorageParams = {
    entries: [string, SaveDraftEntryValue][];
};
declare const saveDraftToStorage: ({ entries }: SaveDraftToStorageParams) => Promise<void>;
/** ---------- Get ---------- **/
declare const getDraftFromStorage: <T = any>(key: string) => Promise<T | null>;
declare const checkHasDraftInStorage: (keys: string[]) => Promise<boolean>;
/** ---------- Helper: Check và hiển thị dialog restore draft (dùng trong componentDidMount) ---------- **/
type CheckDraftWithDialogOptions = {
    keys: string[];
    title?: string;
    message?: string;
    onRestore?: (data: Record<string, any>) => void;
    onCancel?: () => void;
    useNativeConfirm?: boolean;
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
declare const checkDraftWithDialog: (options: CheckDraftWithDialogOptions) => Promise<Record<string, any> | null>;

/** ---------- Types ---------- **/
interface UseDraftCheckOptions {
    keys: string[];
    onConfirm: (data: Record<string, any> | null) => void;
    condition?: boolean;
    dependencies?: any[];
}
/** ---------- Hook ---------- **/
declare const useDraftCheck: ({ keys, onConfirm, condition, dependencies }: UseDraftCheckOptions) => {
    dialog: React.JSX.Element;
};

interface DraftCheckManagerProps {
    keys: string[];
    onConfirm?: (data: Record<string, any> | null) => void;
    onRestore?: (data: Record<string, any>) => void;
    onCancel?: () => void;
    dialogTitle?: string;
    dialogSubText?: string;
    delay?: number;
}
interface DraftCheckManagerState {
    isDialogVisible: boolean;
    draftData: Record<string, any>;
    isLoading: boolean;
}
declare class DraftCheckManager extends React.Component<DraftCheckManagerProps, DraftCheckManagerState> {
    state: DraftCheckManagerState;
    componentDidMount(): void;
    componentDidUpdate(prevProps: DraftCheckManagerProps): void;
    checkDraft: () => Promise<void>;
    handleConfirm: () => void;
    handleCancel: () => Promise<void>;
    render(): React.JSX.Element | null;
}
declare const checkDraftData: (keys: string[]) => Promise<Record<string, any> | null>;

export { DraftCheckManager, checkDraftData, checkDraftWithDialog, checkHasDraftInStorage, decryptPassword, encryptPassword, fileToJson, getDraftFromStorage, jsonToFile, removeDraftFromStorage, saveDraftToStorage, useDraftCheck };
