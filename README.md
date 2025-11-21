# React Storage Utils

Thư viện lưu trữ dữ liệu cho React/SPFx sử dụng **IndexedDB** (idb v5) và **AES encryption**. Hỗ trợ lưu trữ objects, single files, hoặc arrays of files. Tương thích với **React 16+** và **SharePoint Framework (SPFx)**.

---

## Cài đặt

```bash
npm install react-storage-utils --save
```

**Yêu cầu:**
- React 16.8.0+ (hỗ trợ React 16, 17, 18)
- idb v5 (đã được bao gồm trong dependencies)
- @fluentui/react (cho DraftCheckManager component)

---

## Tính năng

- ✅ Lưu trữ dữ liệu vào IndexedDB với mã hóa AES
- ✅ Hỗ trợ lưu trữ objects, files, và arrays of files
- ✅ Tự động khôi phục dữ liệu đã lưu với dialog xác nhận
- ✅ Tương thích với React 16+ và SPFx
- ✅ Hỗ trợ Class Components (ưu tiên)
- ✅ Hỗ trợ Functional Components với hooks

---

## API Reference

### Core Functions

#### `saveDraftToStorage({ entries })`
Lưu dữ liệu vào IndexedDB với mã hóa.

**Parameters:**
- `entries`: Array of `[key, value]` tuples
  - `key`: string - Key để lưu trữ
  - `value`: File | File[] | any - Dữ liệu cần lưu

**Example:**
```typescript
import { saveDraftToStorage } from "react-storage-utils";

await saveDraftToStorage({
  entries: [
    ["userProfile", { name: "John", age: 30 }],
    ["userFile", fileObject],
    ["userFiles", [file1, file2]]
  ]
});
```

#### `getDraftFromStorage<T>(key)`
Lấy dữ liệu từ IndexedDB và giải mã.

**Parameters:**
- `key`: string - Key của dữ liệu cần lấy

**Returns:** `Promise<T | null>`

**Example:**
```typescript
import { getDraftFromStorage } from "react-storage-utils";

const userProfile = await getDraftFromStorage<{ name: string; age: number }>("userProfile");
```

#### `removeDraftFromStorage({ keysArr })`
Xóa dữ liệu khỏi IndexedDB.

**Parameters:**
- `keysArr`: string[] - Array các keys cần xóa

**Example:**
```typescript
import { removeDraftFromStorage } from "react-storage-utils";

await removeDraftFromStorage({ keysArr: ["userProfile", "userFile"] });
```

#### `checkHasDraftInStorage(keys)`
Kiểm tra xem có dữ liệu đã lưu trong IndexedDB không.

**Parameters:**
- `keys`: string[] - Array các keys cần kiểm tra

**Returns:** `Promise<boolean>`

---

## Sử dụng với Class Components (Khuyến nghị)

### Cách 1: Sử dụng checkDraftWithDialog trong componentDidMount (Đơn giản nhất - Khuyến nghị)

**Không cần render component**, chỉ cần gọi function trong `componentDidMount`:

```typescript
import * as React from "react";
import { checkDraftWithDialog, saveDraftToStorage } from "react-storage-utils";

class MyFormComponent extends React.Component<{}, MyComponentState> {
  state: MyComponentState = {
    formData: { name: "", email: "" },
    selectedFile: null,
  };

  componentDidMount() {
    // Chỉ cần gọi function này - tự động check và hiển thị dialog
    checkDraftWithDialog({
      keys: ["formData", "selectedFile"],
      onRestore: (data) => {
        // Tự động fill data vào form
        this.setState({
          formData: data.formData || this.state.formData,
          selectedFile: data.selectedFile || null,
        });
      },
    });
  }

  // Lưu draft khi người dùng nhập liệu
  handleInputChange = async (field: string, value: any) => {
    this.setState(
      (prevState) => ({
        formData: { ...prevState.formData, [field]: value },
      }),
      async () => {
        await saveDraftToStorage({
          entries: [
            ["formData", this.state.formData],
            ...(this.state.selectedFile ? [["selectedFile", this.state.selectedFile]] : []),
          ],
        });
      }
    );
  };

  render() {
    return (
      <div>
        {/* Không cần render DraftCheckManager nữa! */}
        <input
          type="text"
          placeholder="Name"
          value={this.state.formData.name}
          onChange={(e) => this.handleInputChange("name", e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={this.state.formData.email}
          onChange={(e) => this.handleInputChange("email", e.target.value)}
        />
      </div>
    );
  }
}

export default MyFormComponent;
```

### Cách 2: Sử dụng DraftCheckManager Component

Nếu bạn muốn dùng component, chỉ cần truyền `keys` vào component, nó sẽ tự động kiểm tra và hiển thị dialog nếu có data trong storage.

```typescript
import * as React from "react";
import { DraftCheckManager, saveDraftToStorage } from "react-storage-utils";

interface MyComponentState {
  formData: {
    name: string;
    email: string;
  };
  selectedFile: File | null;
}

class MyFormComponent extends React.Component<{}, MyComponentState> {
  state: MyComponentState = {
    formData: { name: "", email: "" },
    selectedFile: null,
  };

  // Lưu draft khi người dùng nhập liệu
  handleInputChange = async (field: string, value: any) => {
    this.setState(
      (prevState) => ({
        formData: { ...prevState.formData, [field]: value },
      }),
      async () => {
        // Auto-save draft
        await saveDraftToStorage({
          entries: [
            ["formData", this.state.formData],
            ...(this.state.selectedFile ? [["selectedFile", this.state.selectedFile]] : []),
          ],
        });
      }
    );
  };

  // Xử lý khi người dùng chọn khôi phục
  handleDraftRestore = (data: Record<string, any>) => {
    this.setState({
      formData: data.formData || this.state.formData,
      selectedFile: data.selectedFile || null,
    });
    console.log("✅ Đã khôi phục dữ liệu từ IndexedDB");
  };

  // Xử lý khi người dùng chọn bỏ qua
  handleDraftCancel = () => {
    console.log("ℹ️ Người dùng đã bỏ qua khôi phục");
  };

  render() {
    return (
      <div>
        {/* Chỉ cần truyền keys - tự động check và hiển thị dialog */}
        <DraftCheckManager
          keys={["formData", "selectedFile"]}
          onRestore={this.handleDraftRestore}
          onCancel={this.handleDraftCancel}
        />

        <input
          type="text"
          placeholder="Name"
          value={this.state.formData.name}
          onChange={(e) => this.handleInputChange("name", e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={this.state.formData.email}
          onChange={(e) => this.handleInputChange("email", e.target.value)}
        />
        <input
          type="file"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              this.handleInputChange("selectedFile", file);
            }
          }}
        />
      </div>
    );
  }
}

export default MyFormComponent;
```

### Cách 3: Sử dụng checkDraftData (Tự kiểm soát logic)

Nếu bạn muốn tự kiểm soát logic và hiển thị dialog của riêng bạn:

```typescript
import * as React from "react";
import { checkDraftData, saveDraftToStorage } from "react-storage-utils";

class MyFormComponent extends React.Component<{}, MyComponentState> {
  state: MyComponentState = {
    formData: { name: "", email: "" },
    selectedFile: null,
  };

  componentDidMount() {
    // Chỉ lấy data, không hiển thị dialog
    checkDraftData(["formData", "selectedFile"]).then((data) => {
      if (data) {
        // Hiển thị dialog xác nhận của bạn
        const shouldRestore = window.confirm("Bạn có muốn khôi phục dữ liệu đã lưu?");
        if (shouldRestore) {
          this.setState({
            formData: data.formData || this.state.formData,
            selectedFile: data.selectedFile || null,
          });
        }
      }
    });
  }

  // ... rest of component
}
```

### API: checkDraftWithDialog

Function helper để check và hiển thị dialog tự động.

**Parameters:**
- `keys`: `string[]` - Array các keys cần kiểm tra
- `title?`: `string` - Tiêu đề dialog (default: "Restore data?")
- `message?`: `string` - Nội dung dialog
- `onRestore?`: `(data: Record<string, any>) => void` - Callback khi user chọn restore
- `onCancel?`: `() => void` - Callback khi user chọn cancel
- `useNativeConfirm?`: `boolean` - Dùng `window.confirm` thay vì Fluent UI Dialog (default: false)

**Returns:** `Promise<Record<string, any> | null>` - Data nếu restore, null nếu cancel

**Example:**
```typescript
// Dùng Fluent UI Dialog (mặc định)
checkDraftWithDialog({
  keys: ["formData"],
  onRestore: (data) => this.setState({ formData: data.formData })
});

// Dùng native browser confirm
checkDraftWithDialog({
  keys: ["formData"],
  useNativeConfirm: true,
  onRestore: (data) => this.setState({ formData: data.formData })
});
```

### Ví dụ sử dụng trong SPFx

```typescript
import * as React from "react";
import { DraftCheckManager, saveDraftToStorage, removeDraftFromStorage } from "react-storage-utils";
import { TextField, PrimaryButton } from "@fluentui/react";

export default class MySPFxWebPart extends React.Component<IProps, IState> {
  // ... component code

  // Lưu draft trước khi submit
  handleSave = async () => {
    await saveDraftToStorage({
      entries: [
        ["listItemData", this.state.formData],
        ["attachments", this.state.files],
      ],
    });
    
    // Submit logic here
  };

  // Xóa draft sau khi submit thành công
  handleSubmitSuccess = async () => {
    await removeDraftFromStorage({
      keysArr: ["listItemData", "attachments"],
    });
  };

  handleDraftRestore = (data: Record<string, any>) => {
    this.setState({
      formData: data.listItemData || {},
      files: data.attachments || [],
    });
  };

  render() {
    return (
      <div>
        {/* Đơn giản - chỉ cần truyền keys */}
        <DraftCheckManager
          keys={["listItemData", "attachments"]}
          onRestore={this.handleDraftRestore}
        />
        {/* Your form UI */}
      </div>
    );
  }
}
```

### Props của DraftCheckManager

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `keys` | `string[]` | ✅ | Array các keys cần kiểm tra trong IndexedDB |
| `onRestore` | `(data: Record<string, any>) => void` | ❌ | Callback khi người dùng chọn "Yes, restore" |
| `onCancel` | `() => void` | ❌ | Callback khi người dùng chọn "No" hoặc đóng dialog |
| `onConfirm` | `(data: Record<string, any> \| null) => void` | ❌ | Callback tổng hợp: data khi restore, null khi cancel |
| `dialogTitle` | `string` | ❌ | Tiêu đề dialog. Default: "Restore data?" |
| `dialogSubText` | `string` | ❌ | Nội dung dialog. Default: "Do you want to restore..." |
| `delay` | `number` | ❌ | Delay trước khi hiển thị dialog (ms). Default: 500 |

**Lưu ý:** Component tự động check trong `componentDidMount`, không cần truyền `condition` prop nữa.

---

## Sử dụng với Functional Components

Nếu bạn sử dụng Functional Components, có thể dùng hook `useDraftCheck`:

```typescript
import React from "react";
import { useDraftCheck, saveDraftToStorage } from "react-storage-utils";

function MyFunctionalComponent() {
  const [formData, setFormData] = React.useState({ name: "", email: "" });

  // Auto-save draft
  React.useEffect(() => {
    const timer = setTimeout(() => {
      saveDraftToStorage({
        entries: [["formData", formData]],
      });
    }, 1000); // Debounce 1s

    return () => clearTimeout(timer);
  }, [formData]);

  // Check và hiển thị dialog khôi phục
  const { dialog } = useDraftCheck({
    keys: ["formData"],
    condition: true,
    dependencies: [],
    onConfirm: (data) => {
      if (data) {
        setFormData(data.formData || formData);
      }
    },
  });

  return (
    <div>
      {dialog}
      <input
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
    </div>
  );
}
```

---

## Cấu hình

### Environment Variables

Để sử dụng mã hóa AES, bạn cần set `REACT_APP_SECRET_KEY` trong environment variables:

**React App:**
```bash
# .env
REACT_APP_SECRET_KEY=your-secret-key-here
```

**SPFx:**
```json
// config/config.json
{
  "REACT_APP_SECRET_KEY": "your-secret-key-here"
}
```

Nếu không set, sẽ sử dụng empty string (không khuyến nghị cho production).

---

## Xử lý Files

Thư viện tự động xử lý File objects:

```typescript
import { saveDraftToStorage, getDraftFromStorage } from "react-storage-utils";

// Lưu single file
const file = new File(["content"], "example.txt", { type: "text/plain" });
await saveDraftToStorage({
  entries: [["myFile", file]],
});

// Lưu multiple files
await saveDraftToStorage({
  entries: [["myFiles", [file1, file2, file3]]],
});

// Lấy file về
const restoredFile = await getDraftFromStorage<File>("myFile");
```

---

## Best Practices

1. **Lưu draft định kỳ**: Sử dụng debounce/throttle khi auto-save để tránh quá nhiều writes vào IndexedDB
2. **Xóa draft sau khi submit thành công**: Luôn xóa draft sau khi dữ liệu đã được lưu thành công
3. **Xử lý errors**: Luôn wrap các async operations trong try-catch
4. **Keys naming**: Sử dụng prefix để tránh conflict, ví dụ: `"myApp_formData"`

---

## Troubleshooting

### Lỗi "idb is not defined"
Đảm bảo bạn đang sử dụng idb v5:
```bash
npm install idb@^5.0.6
```

### Dialog không hiển thị
Kiểm tra xem đã cài đặt `@fluentui/react`:
```bash
npm install @fluentui/react
```

### Dữ liệu không được lưu
- Kiểm tra browser có hỗ trợ IndexedDB
- Kiểm tra console để xem có errors không
- Đảm bảo `SECRET_KEY` đã được set đúng

---

## License

MIT

---

## Changelog

### v0.1.15
- ✅ Tối ưu cho React 16+ và SPFx
- ✅ Sử dụng idb v5 (tương thích tốt hơn)
- ✅ Tập trung vào Class Components
- ✅ Cải thiện error handling
- ✅ Hỗ trợ SPFx environment variables
