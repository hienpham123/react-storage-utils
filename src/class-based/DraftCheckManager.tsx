import * as React from "react";
import { Dialog, DialogType, DialogFooter } from "@fluentui/react";
import { DefaultButton, PrimaryButton } from "@fluentui/react";
import { checkHasDraftInStorage, getDraftFromStorage, jsonToFile, removeDraftFromStorage } from "../Storage";

interface DraftCheckManagerProps {
    keys: string[];
    onConfirm?: (data: Record<string, any> | null) => void;
    onRestore?: (data: Record<string, any>) => void;
    onCancel?: () => void;
    dialogTitle?: string;
    dialogSubText?: string;
    delay?: number; // Delay trước khi hiển thị dialog (ms)
}

interface DraftCheckManagerState {
    isDialogVisible: boolean;
    draftData: Record<string, any>;
    isLoading: boolean;
}

class DraftCheckManager extends React.Component<DraftCheckManagerProps, DraftCheckManagerState> {
    state: DraftCheckManagerState = {
        isDialogVisible: false,
        draftData: {},
        isLoading: true,
    };

    componentDidMount() {
        this.checkDraft();
    }

    componentDidUpdate(prevProps: DraftCheckManagerProps) {
        // Re-check draft if keys change
        if (prevProps.keys !== this.props.keys) {
            this.checkDraft();
        }
    }

    checkDraft = async () => {
        try {
            const { keys } = this.props;
            this.setState({ isLoading: true });
            
            const hasDraft = await checkHasDraftInStorage(keys);
            
            if (!hasDraft) {
                this.setState({ isLoading: false });
                if (this.props.onConfirm) {
                    this.props.onConfirm(null);
                }
                return;
            }

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

            this.setState({ draftData: data, isLoading: false });

            // Hiển thị dialog sau delay (mặc định 500ms)
            const delay = this.props.delay !== undefined ? this.props.delay : 500;
            setTimeout(() => {
                this.setState({ isDialogVisible: true });
            }, delay);
        } catch (err) {
            console.error("Draft check failed:", err);
            this.setState({ isLoading: false });
            if (this.props.onConfirm) {
                this.props.onConfirm(null);
            }
        }
    };

    handleConfirm = () => {
        this.setState({ isDialogVisible: false });
        const { draftData } = this.state;
        
        if (this.props.onRestore) {
            this.props.onRestore(draftData);
        }
        
        if (this.props.onConfirm) {
            this.props.onConfirm(draftData);
        }
    };

    handleCancel = async () => {
        this.setState({ isDialogVisible: false });
        
        if (this.props.onCancel) {
            this.props.onCancel();
        }
        
        if (this.props.onConfirm) {
            this.props.onConfirm(null);
        }
        
        // Xóa draft khi user chọn "No"
        await removeDraftFromStorage({ keysArr: this.props.keys });
    };

    render() {
        const { isDialogVisible } = this.state;
        const { dialogTitle = "Restore data?", dialogSubText = "Do you want to restore the previously entered data before submitting/saving again?" } = this.props;

        if (!isDialogVisible) {
            return null;
        }

        return (
            <Dialog
                hidden={!isDialogVisible}
                onDismiss={this.handleCancel}
                dialogContentProps={{
                    type: DialogType.normal,
                    title: dialogTitle,
                    closeButtonAriaLabel: "Close",
                    subText: dialogSubText,
                }}
                minWidth={450}
                modalProps={{ isBlocking: true }}
            >
                <DialogFooter>
                    <PrimaryButton onClick={this.handleConfirm} text="Yes, restore" />
                    <DefaultButton onClick={this.handleCancel} text="No" />
                </DialogFooter>
            </Dialog>
        );
    }
}

// Helper function để check và lấy draft data (dùng trong componentDidMount)
export const checkDraftData = async (keys: string[]): Promise<Record<string, any> | null> => {
    try {
        const hasDraft = await checkHasDraftInStorage(keys);
        if (!hasDraft) {
            return null;
        }

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

        return Object.keys(data).length > 0 ? data : null;
    } catch (err) {
        console.error("checkDraftData failed:", err);
        return null;
    }
};

export default DraftCheckManager;