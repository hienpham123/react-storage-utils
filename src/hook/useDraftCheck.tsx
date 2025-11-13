import * as React from "react";
import { Dialog, DialogType, DialogFooter } from "@fluentui/react";
import { DefaultButton, PrimaryButton } from "@fluentui/react";
import { checkHasDraftInStorage, getDraftFromStorage, jsonToFile, removeDraftFromStorage } from "../Storage";

/** ---------- Types ---------- **/
interface UseDraftCheckOptions {
    keys: string[];
    onConfirm: (data: Record<string, any> | null) => void;
    condition?: boolean;
    dependencies?: any[];
}

/** ---------- Hook ---------- **/
export const useDraftCheck = ({ keys, onConfirm, condition = true, dependencies = [] }: UseDraftCheckOptions) => {
    const [isDialogVisible, setIsDialogVisible] = React.useState<boolean>(false);
    const [draftData, setDraftData] = React.useState<Record<string, any>>({});

    React.useEffect(() => {
        const check = async () => {
            try {
                const hasDraft = await checkHasDraftInStorage(keys);
                const data: Record<string, any> = {};

                for (const key of keys) {
                    let value = await getDraftFromStorage(key);
                    if (value && Object.hasOwn(value, 'data') && Object.hasOwn(value, 'type') && Object.hasOwn(value, 'name')) {
                        value = await jsonToFile(value);
                    }
                    if (value !== null && value !== undefined) data[key] = value;
                }

                setDraftData(data);

                if (hasDraft) {
                    setTimeout(() => {
                        setIsDialogVisible(true);
                    }, 1000)
                }
                else onConfirm(null);
            } catch (err) {
                console.error("checkHasDraftInStorage failed:", err);
                onConfirm(null);
            }
        };

        if (condition) {
            check();
        }
    }, [...dependencies]);

    const handleConfirm = React.useCallback(() => {
        setIsDialogVisible(false);
        onConfirm(draftData);
    }, [onConfirm, draftData]);

    const handleCancel = React.useCallback(() => {
        setIsDialogVisible(false);
        onConfirm(null);
        removeDraftFromStorage({ keysArr: keys })
    }, [onConfirm, keys]);

    const dialog = (
        <Dialog
            hidden={!isDialogVisible}
            onDismiss={handleCancel}
            dialogContentProps={{
                type: DialogType.normal,
                title: "Restore data?",
                closeButtonAriaLabel: "Close",
                subText:
                    "Do you want to restore the previously entered data before submitting/saving again?",
            }}
            minWidth={450}
            modalProps={{
                isBlocking: true,
            }}
        >
            <DialogFooter>
                <PrimaryButton onClick={handleConfirm} text="Yes, restore" />
                <DefaultButton onClick={handleCancel} text="No" />
            </DialogFooter>
        </Dialog>
    );

    return { dialog };
};
