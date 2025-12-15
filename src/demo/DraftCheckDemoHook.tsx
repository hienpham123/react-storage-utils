import * as React from "react";
import { useDraftCheck } from "../hook/useDraftCheck";
import { saveDraftToStorage, removeDraftFromStorage } from "../Storage";

interface FormData {
    name: string;
    email: string;
    phone: string;
}

/**
 * Demo functional component sử dụng useDraftCheck hook
 * 
 * Cách test:
 * 1. Nhập thông tin vào form
 * 2. Click "Save Draft" để lưu vào IndexedDB
 * 3. Refresh trang (F5)
 * 4. Dialog sẽ tự động hiển thị hỏi có muốn restore data không
 * 5. Chọn "Yes, restore" để khôi phục hoặc "No" để bỏ qua
 */
const DraftCheckDemoHook: React.FC = () => {
    const [formData, setFormData] = React.useState<FormData>({
        name: "",
        email: "",
        phone: "",
    });
    const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
    const [message, setMessage] = React.useState<string>("");

    // Sử dụng useDraftCheck hook
    const { dialog } = useDraftCheck({
        keys: ["formData", "selectedFile"],
        onConfirm: (data) => {
            if (data) {
                console.log("✅ User chọn restore:", data);
                setFormData(data.formData || formData);
                setSelectedFile(data.selectedFile || null);
                setMessage("✅ Đã khôi phục dữ liệu từ IndexedDB!");
            } else {
                console.log("❌ User chọn cancel hoặc không có data");
                setMessage("ℹ️ Đã bỏ qua khôi phục dữ liệu");
            }
        },
        condition: true,
        dependencies: [],
    });

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleSaveDraft = async () => {
        try {
            const entries: [string, any][] = [["formData", formData]];

            if (selectedFile) {
                entries.push(["selectedFile", selectedFile]);
            }

            await saveDraftToStorage({ entries });
            setMessage("💾 Đã lưu draft vào IndexedDB! Refresh trang để test restore.");
        } catch (err) {
            console.error("Save draft failed:", err);
            setMessage("❌ Lỗi khi lưu draft");
        }
    };

    const handleClearDraft = async () => {
        try {
            await removeDraftFromStorage({ keysArr: ["formData", "selectedFile"] });
            setMessage("🗑️ Đã xóa draft!");
        } catch (err) {
            console.error("Clear draft failed:", err);
            setMessage("❌ Lỗi khi xóa draft");
        }
    };

    const handleClearForm = () => {
        setFormData({ name: "", email: "", phone: "" });
        setSelectedFile(null);
        setMessage("");
    };

    return (
        <>
            {dialog}
            <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
                <h2>Demo: useDraftCheck Hook</h2>
                <p style={{ color: "#666", marginBottom: "20px" }}>
                    Nhập thông tin và click "Save Draft", sau đó refresh trang để test restore.
                </p>

                {message && (
                    <div
                        style={{
                            padding: "10px",
                            marginBottom: "20px",
                            backgroundColor: message.includes("✅")
                                ? "#d4edda"
                                : message.includes("❌")
                                ? "#f8d7da"
                                : "#d1ecf1",
                            border: `1px solid ${
                                message.includes("✅")
                                    ? "#c3e6cb"
                                    : message.includes("❌")
                                    ? "#f5c6cb"
                                    : "#bee5eb"
                            }`,
                            borderRadius: "4px",
                            color: message.includes("✅")
                                ? "#155724"
                                : message.includes("❌")
                                ? "#721c24"
                                : "#0c5460",
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
                        onChange={(e) => handleInputChange("name", e.target.value)}
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
                        onChange={(e) => handleInputChange("email", e.target.value)}
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
                        onChange={(e) => handleInputChange("phone", e.target.value)}
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
                        onChange={handleFileChange}
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
                        onClick={handleSaveDraft}
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
                        onClick={handleClearDraft}
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
                        onClick={handleClearForm}
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
                        <strong>Lưu ý:</strong> Component này sử dụng <code>useDraftCheck</code> hook thay vì{" "}
                        <code>checkDraftWithDialog</code> function.
                    </p>
                </div>

                <div style={{ marginTop: "20px", padding: "15px", backgroundColor: "#fff3cd", borderRadius: "4px" }}>
                    <h4 style={{ marginTop: 0 }}>Current Form Data:</h4>
                    <pre style={{ margin: 0, fontSize: "12px", overflow: "auto" }}>
                        {JSON.stringify({ formData, selectedFile: selectedFile?.name || null }, null, 2)}
                    </pre>
                </div>
            </div>
        </>
    );
};

export default DraftCheckDemoHook;
