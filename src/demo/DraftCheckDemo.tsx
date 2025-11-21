import * as React from "react";
import { checkDraftWithDialog, saveDraftToStorage, removeDraftFromStorage } from "../Storage";

interface DraftCheckDemoState {
    formData: {
        name: string;
        email: string;
        phone: string;
    };
    selectedFile: File | null;
    message: string;
}

/**
 * Demo component để test checkDraftWithDialog
 * 
 * Cách test:
 * 1. Nhập thông tin vào form
 * 2. Click "Save Draft" để lưu vào IndexedDB
 * 3. Refresh trang (F5)
 * 4. Dialog sẽ tự động hiển thị hỏi có muốn restore data không
 * 5. Chọn "Yes, restore" để khôi phục hoặc "No" để bỏ qua
 */
class DraftCheckDemo extends React.Component<{}, DraftCheckDemoState> {
    state: DraftCheckDemoState = {
        formData: {
            name: "",
            email: "",
            phone: "",
        },
        selectedFile: null,
        message: "",
    };

    componentDidMount() {
        // Cách dùng mới: Chỉ cần gọi function trong componentDidMount
        // Không cần render component nào cả!
        checkDraftWithDialog({
            useNativeConfirm: false,
            keys: ["formData", "selectedFile"],
            title: "Khôi phục dữ liệu?",
            message: "Bạn có muốn khôi phục dữ liệu đã lưu trước đó không?",
            onRestore: (data) => {
                console.log("✅ User chọn restore:", data);
                this.setState({
                    formData: data.formData || this.state.formData,
                    selectedFile: data.selectedFile || null,
                    message: "✅ Đã khôi phục dữ liệu từ IndexedDB!",
                });
            },
            onCancel: () => {
                console.log("❌ User chọn cancel");
                this.setState({
                    message: "ℹ️ Đã bỏ qua khôi phục dữ liệu",
                });
            },
            // useNativeConfirm: true, // Uncomment để dùng native browser confirm
        });
    }

    handleInputChange = (field: keyof DraftCheckDemoState["formData"], value: string) => {
        this.setState((prevState) => ({
            formData: {
                ...prevState.formData,
                [field]: value,
            },
        }));
    };

    handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            this.setState({ selectedFile: file });
        }
    };

    handleSaveDraft = async () => {
        try {
            const entries: [string, any][] = [
                ["formData", this.state.formData],
            ];
            
            if (this.state.selectedFile) {
                entries.push(["selectedFile", this.state.selectedFile]);
            }
            
            await saveDraftToStorage({ entries });
            this.setState({ message: "💾 Đã lưu draft vào IndexedDB! Refresh trang để test restore." });
        } catch (err) {
            console.error("Save draft failed:", err);
            this.setState({ message: "❌ Lỗi khi lưu draft" });
        }
    };

    handleClearDraft = async () => {
        try {
            await removeDraftFromStorage({ keysArr: ["formData", "selectedFile"] });
            this.setState({ message: "🗑️ Đã xóa draft!" });
        } catch (err) {
            console.error("Clear draft failed:", err);
            this.setState({ message: "❌ Lỗi khi xóa draft" });
        }
    };

    handleClearForm = () => {
        this.setState({
            formData: { name: "", email: "", phone: "" },
            selectedFile: null,
            message: "",
        });
    };

    render() {
        const { formData, selectedFile, message } = this.state;

        return (
            <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
            <h2>Demo: checkDraftWithDialog</h2>
            <p style={{ color: "#666", marginBottom: "20px" }}>
                Nhập thông tin và click "Save Draft", sau đó refresh trang để test restore.
            </p>

            {message && (
                <div
                    style={{
                        padding: "10px",
                        marginBottom: "20px",
                        backgroundColor: message.includes("✅") ? "#d4edda" : message.includes("❌") ? "#f8d7da" : "#d1ecf1",
                        border: `1px solid ${message.includes("✅") ? "#c3e6cb" : message.includes("❌") ? "#f5c6cb" : "#bee5eb"}`,
                        borderRadius: "4px",
                        color: message.includes("✅") ? "#155724" : message.includes("❌") ? "#721c24" : "#0c5460",
                    }}
                >
                    {message}
                </div>
            )}

            <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                    Name:
                </label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => this.handleInputChange("name", e.target.value)}
                    style={{
                        width: "100%",
                        padding: "8px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                    }}
                    placeholder="Nhập tên"
                />
            </div>

            <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                    Email:
                </label>
                <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => this.handleInputChange("email", e.target.value)}
                    style={{
                        width: "100%",
                        padding: "8px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                    }}
                    placeholder="Nhập email"
                />
            </div>

            <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                    Phone:
                </label>
                <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => this.handleInputChange("phone", e.target.value)}
                    style={{
                        width: "100%",
                        padding: "8px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                    }}
                    placeholder="Nhập số điện thoại"
                />
            </div>

            <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                    File:
                </label>
                <input
                    type="file"
                    onChange={this.handleFileChange}
                    style={{
                        width: "100%",
                        padding: "8px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                    }}
                />
                {selectedFile && (
                    <p style={{ marginTop: "5px", color: "#666", fontSize: "14px" }}>
                        Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
                    </p>
                )}
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <button
                    onClick={this.handleSaveDraft}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontWeight: "bold",
                    }}
                >
                    💾 Save Draft
                </button>
                <button
                    onClick={this.handleClearDraft}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontWeight: "bold",
                    }}
                >
                    🗑️ Clear Draft
                </button>
                <button
                    onClick={this.handleClearForm}
                    style={{
                        padding: "10px 20px",
                        backgroundColor: "#6c757d",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontWeight: "bold",
                    }}
                >
                    🧹 Clear Form
                </button>
            </div>

            <div style={{ marginTop: "30px", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "4px" }}>
                <h3 style={{ marginTop: 0 }}>Hướng dẫn test:</h3>
                <ol style={{ margin: "10px 0", paddingLeft: "20px" }}>
                    <li>Nhập thông tin vào form (name, email, phone, file)</li>
                    <li>Click "Save Draft" để lưu vào IndexedDB</li>
                    <li>Refresh trang (F5 hoặc Ctrl+R)</li>
                    <li>
                        <strong>Dialog sẽ tự động hiển thị</strong> hỏi có muốn restore data không
                    </li>
                    <li>Chọn "Yes, restore" để khôi phục hoặc "No" để bỏ qua</li>
                </ol>
                <p style={{ marginTop: "10px", color: "#666", fontSize: "14px" }}>
                    <strong>Lưu ý:</strong> Function <code>checkDraftWithDialog</code> được gọi trong{" "}
                    <code>componentDidMount</code>, không cần render component nào cả!
                </p>
            </div>

            <div style={{ marginTop: "20px", padding: "15px", backgroundColor: "#fff3cd", borderRadius: "4px" }}>
                <h4 style={{ marginTop: 0 }}>Current Form Data:</h4>
                <pre style={{ margin: 0, fontSize: "12px", overflow: "auto" }}>
                    {JSON.stringify({ formData, selectedFile: selectedFile?.name || null }, null, 2)}
                </pre>
            </div>
        </div>
        );
    }
}

export default DraftCheckDemo;

