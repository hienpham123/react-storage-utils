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

function App() {
  React.useEffect(() => {
    // Save example object and file
    _.saveDraftToStorage({
      entries: [
        ["userProfile", { name: "Alice", age: 25 }],
        ["userImages", attachment], // file
      ],
    });

    // Load saved object
    _.getDraftFromStorage("userProfile").then((data) => {
      console.log(data);
    });
  }, []);

  return <div>Check console for stored draft output</div>;
}


export default App;
```
