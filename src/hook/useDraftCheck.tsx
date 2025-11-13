import * as React from "react";
import { Dialog, DialogType, DialogFooter } from "@fluentui/react";
import { DefaultButton, PrimaryButton } from "@fluentui/react";
import { checkHasDraftInStorage } from "../Storage";

/** ---------- Types ---------- **/
interface UseDraftCheckOptions {
    keys: string[];
    onConfirm: (fromStorage: boolean) => void;
}

/** ---------- Hook ---------- **/
export const useDraftCheck = ({ keys, onConfirm }: UseDraftCheckOptions) => {
    const [isDialogVisible, setIsDialogVisible] = React.useState(false);

    React.useEffect(() => {
        const check = async () => {
            try {
                const hasDraft = await checkHasDraftInStorage(keys);
                if (hasDraft) setIsDialogVisible(true);
                else onConfirm(false);
            } catch (err) {
                console.error("checkHasDraftInStorage failed:", err);
                onConfirm(false);
            }
        };
        check();
    }, []);

    const handleConfirm = React.useCallback(() => {
        setIsDialogVisible(false);
        onConfirm(true);
    }, [onConfirm]);

    const handleCancel = React.useCallback(() => {
        setIsDialogVisible(false);
        onConfirm(false);
    }, [onConfirm]);

    const dialog = (
        <Dialog
            hidden={!isDialogVisible}
            onDismiss={handleCancel}
            dialogContentProps={{
                type: DialogType.normal,
                title: "Restore data?",
                closeButtonAriaLabel: "Close",
                subText: "Do you want to restore the previously entered data before submitting/saving again?",
            }}
            modalProps={{
                isBlocking: true,
                styles: { main: { maxWidth: 450 } },
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
