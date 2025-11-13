import * as React from "react";
import { Dialog, DialogType, DialogFooter } from "@fluentui/react";
import { DefaultButton, PrimaryButton } from "@fluentui/react";
import { checkHasDraftInStorage, getDraftFromStorage, jsonToFile, removeDraftFromStorage } from "../Storage";

interface DraftCheckManagerProps {
    keys: string[];
    condition?: boolean;
    onConfirm: (data: Record<string, any> | null) => void;
}

interface DraftCheckManagerState {
    isDialogVisible: boolean;
    draftData: Record<string, any>;
}

class DraftCheckManager extends React.Component<DraftCheckManagerProps, DraftCheckManagerState> {
    state: DraftCheckManagerState = {
        isDialogVisible: false,
        draftData: {},
    };

    componentDidMount() {
        if (this.props.condition !== false) {
            this.checkDraft();
        }
    }

    checkDraft = async () => {
        try {
            const { keys, onConfirm } = this.props;
            const hasDraft = await checkHasDraftInStorage(keys);
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

            this.setState({ draftData: data });

            if (hasDraft) {
                setTimeout(() => {
                    this.setState({ isDialogVisible: true });
                }, 1000)
            } else {
                onConfirm(null);
            }
        } catch (err) {
            console.error("Draft check failed:", err);
            this.props.onConfirm(null);
        }
    };

    handleConfirm = () => {
        this.setState({ isDialogVisible: false });
        this.props.onConfirm(this.state.draftData);
    };

    handleCancel = async () => {
        this.setState({ isDialogVisible: false });
        this.props.onConfirm(null);
        await removeDraftFromStorage({ keysArr: this.props.keys });
    };

    render() {
        const { isDialogVisible } = this.state;

        return (
            <Dialog
                hidden={!isDialogVisible}
                onDismiss={this.handleCancel}
                dialogContentProps={{
                    type: DialogType.normal,
                    title: "Restore data?",
                    closeButtonAriaLabel: "Close",
                    subText:
                        "Do you want to restore the previously entered data before submitting/saving again?",
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

export default DraftCheckManager;