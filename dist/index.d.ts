import * as react_jsx_runtime from 'react/jsx-runtime';
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
/** ---------- Check & Notify ---------- **/
declare const checkStorageAndNotify: (keys: string[], showNotify: (keys: string[], getItems: (fromStorage: boolean) => void) => void, getItems: (fromStorage: boolean) => void) => Promise<void>;

/** ---------- Types ---------- **/
interface UseDraftCheckOptions {
    keys: string[];
    onConfirm: (data: Record<string, any> | null) => void;
    condition?: boolean;
    dependencies?: any[];
}
/** ---------- Hook ---------- **/
declare const useDraftCheck: ({ keys, onConfirm, condition, dependencies }: UseDraftCheckOptions) => {
    dialog: react_jsx_runtime.JSX.Element;
};

interface DraftCheckManagerProps {
    keys: string[];
    condition?: boolean;
    onConfirm: (data: Record<string, any> | null) => void;
}
interface DraftCheckManagerState {
    isDialogVisible: boolean;
    draftData: Record<string, any>;
}
declare class DraftCheckManager extends React.Component<DraftCheckManagerProps, DraftCheckManagerState> {
    state: DraftCheckManagerState;
    componentDidMount(): void;
    checkDraft: () => Promise<void>;
    handleConfirm: () => void;
    handleCancel: () => Promise<void>;
    render(): react_jsx_runtime.JSX.Element;
}

export { DraftCheckManager, checkHasDraftInStorage, checkStorageAndNotify, decryptPassword, encryptPassword, fileToJson, getDraftFromStorage, jsonToFile, removeDraftFromStorage, saveDraftToStorage, useDraftCheck };
