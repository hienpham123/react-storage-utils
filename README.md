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

```
import React from "react";
import * as _ from "react-storage-utils";

import React from "react";
import {
  saveDraftToStorage,
  useDraftCheck,
  getDraftFromStorage,
} from "react-storage-utils";

function App() {
  // 1️⃣ Lưu dữ liệu mẫu (object + file) vào IndexedDB
  React.useEffect(() => {
    const fakeFile = new File(["Hello world!"], "example.txt", {
      type: "text/plain",
    });

    saveDraftToStorage({
      entries: [
        ["userProfile", { name: "Alice", age: 25 }],
        ["userFiles", fakeFile],
      ],
    });
  }, []);

  // 2️⃣ Kiểm tra xem có bản nháp cũ không
  const { dialog } = useDraftCheck({
    keys: ["userProfile", "userFiles"],
    onConfirm: async (fromStorage) => {
      if (fromStorage) {
        // 3️⃣ Nếu người dùng chọn khôi phục, load lại dữ liệu
        const userProfile = await getDraftFromStorage("userProfile");
        const userFilesJson = await getDraftFromStorage("userFiles");
        const userFiles = await jsonToFile(userFilesJson)
        console.log("✅ Dữ liệu khôi phục:", { userProfile, userFiles });
      } else {
        console.log("⚡ Không khôi phục dữ liệu (người dùng chọn bỏ qua)");
      }
    },
  });

  // 4️⃣ Render dialog xác nhận + UI
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
