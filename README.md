# React Storage Utils

Storage library for React/JS with **IndexedDB** and **AES encryption**. Supports objects, single files, or arrays of files.

---

## Installation

The easiest way to use `react-storage-utils` is to install it from NPM and include it in your own React build process (using [Browserify](http://browserify.org), etc).

You can also use the standalone build by including `dist/react-storage-utils.js` in your page. If you use this, make sure you have already included React, and it is available as a global variable.

```
npm install react-storage-utils --save
```

## Demo & Examples

You can quickly test the library in a React project:

### With FunctionalComponent

```
import React from "react";
import {
  saveDraftToStorage,
  useDraftCheck,
  getDraftFromStorage,
} from "react-storage-utils";

function App() {
  const showNotify = true; // ví dụ flag
  const fakeFile = new File(["Hello world!"], "example.txt", {
    type: "text/plain",
  });

  // 1️⃣ Lưu dữ liệu mẫu (object + file) vào IndexedDB
  React.useEffect(() => {
    saveDraftToStorage({
      entries: [
        ["userProfile", { name: "Alice", age: 25 }],
        ["userFiles", fakeFile],
      ],
    });
  }, []);

  // 2️⃣ Kiểm tra xem có bản nháp cũ không
  const { dialog } = useDraftCheck({
    condition: showNotify,
    dependencies: [],
    keys: ["userProfile", "userFiles"],
    onConfirm: async (fromStorage, data) => {
      console.log({ fromStorage, data });
      // data = { userProfile: { name: "Alice", age: 25 }, userFiles: File }

      if (fromStorage) {
        // TODO: reset hoặc restore dữ liệu từ data
        console.log("⚡ Khôi phục dữ liệu từ IndexedDB", data);
      } else {
        console.log("⚡ Không khôi phục dữ liệu (người dùng chọn bỏ qua)");
      }
    },
  });

  // 3️⃣ Render dialog xác nhận + UI
  return (
    <div>
      <h2>React Storage Utils Example</h2>
      <p>Kiểm tra console để xem dữ liệu được lưu hoặc khôi phục.</p>
      {dialog}
    </div>
  );
}

export default App;
```

### With ClassComponent

```
import * as React from "react";
import { DraftCheckManager } from "./DraftCheckManager";
import { saveDraftToStorage } from "react-storage-utils";

export class App extends React.Component {
    componentDidMount() {
        // Lưu dữ liệu ví dụ
        const fakeFile = new File(["Hello world!"], "example.txt", { type: "text/plain" });
        saveDraftToStorage({
            entries: [
                ["userProfile", { name: "Alice", age: 25 }],
                ["userFiles", fakeFile],
            ],
        });
    }

    handleDraftConfirm = (data: Record<string, any> | null) => {
        if (data) {
            console.log("Restored data:", data);
            // data = { userProfile: { name: "Alice", age: 25 }, userFiles: File }
        } else {
            console.log("User skipped restoring data.");
        }
    };

    render() {
        return (
            <div>
                <h2>React Storage Utils Example (Class Component)</h2>
                <DraftCheckManager
                    keys={["userProfile", "userFiles"]}
                    onConfirm={this.handleDraftConfirm}
                    condition={true}
                />
            </div>
        );
    }
}

```
