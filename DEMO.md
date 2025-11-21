# Demo: checkDraftWithDialog

File demo để test cách sử dụng mới `checkDraftWithDialog` trong `componentDidMount`.

## Cách chạy demo

### Option 1: Sử dụng trong project React/SPFx của bạn

1. Import component demo vào project:

```typescript
import DraftCheckDemo from "react-storage-utils/demo/DraftCheckDemo";

// Hoặc copy file src/demo/DraftCheckDemo.tsx vào project của bạn
```

2. Render component:

```typescript
<DraftCheckDemo />
```

### Option 2: Copy code vào project của bạn

Copy nội dung file `src/demo/DraftCheckDemo.tsx` vào component của bạn và sửa import:

```typescript
import { checkDraftWithDialog, saveDraftToStorage } from "react-storage-utils";
```

## Cách test

1. **Nhập thông tin vào form:**
   - Name: "John Doe"
   - Email: "john@example.com"
   - Phone: "123456789"
   - File: Chọn một file bất kỳ

2. **Click "Save Draft"** để lưu vào IndexedDB

3. **Refresh trang** (F5 hoặc Ctrl+R)

4. **Dialog sẽ tự động hiển thị** hỏi có muốn restore data không

5. **Chọn "Yes, restore"** để khôi phục dữ liệu hoặc **"No"** để bỏ qua

## Code mẫu đơn giản

```typescript
import * as React from "react";
import { checkDraftWithDialog, saveDraftToStorage } from "react-storage-utils";

class MyForm extends React.Component {
  state = {
    formData: { name: "", email: "" }
  };

  componentDidMount() {
    // Chỉ cần gọi function này - không cần render component!
    checkDraftWithDialog({
      keys: ["formData"],
      onRestore: (data) => {
        this.setState({ formData: data.formData });
      }
    });
  }

  render() {
    return (
      <div>
        <input 
          value={this.state.formData.name}
          onChange={(e) => this.setState({ 
            formData: { ...this.state.formData, name: e.target.value }
          })}
        />
        <button onClick={() => saveDraftToStorage({ 
          entries: [["formData", this.state.formData]] 
        })}>
          Save Draft
        </button>
      </div>
    );
  }
}
```

## Lưu ý

- Function `checkDraftWithDialog` tự động check trong `componentDidMount`
- Không cần render component `DraftCheckManager` nữa
- Dialog sẽ tự động hiển thị nếu có data trong IndexedDB
- Có thể dùng `useNativeConfirm: true` để dùng native browser confirm thay vì Fluent UI Dialog

