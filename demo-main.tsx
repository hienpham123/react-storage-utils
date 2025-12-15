import * as React from "react";
import * as ReactDOM from "react-dom";
import App from "./src/demo/App";

// Tương thích với React 16, 17, 18, và 19
const rootElement = document.getElementById("root");
if (!rootElement) {
    throw new Error("Root element not found");
}

const reactDOMAny = ReactDOM as any;

// Kiểm tra React version và sử dụng API phù hợp
// React 18/19 có createRoot, React 17 trở xuống dùng render
if (reactDOMAny.createRoot && typeof reactDOMAny.createRoot === 'function') {
    // React 18/19+
    const root = reactDOMAny.createRoot(rootElement);
    root.render(React.createElement(App));
} else if (reactDOMAny.render && typeof reactDOMAny.render === 'function') {
    // React 17 hoặc cũ hơn
    reactDOMAny.render(React.createElement(App), rootElement);
} else {
    throw new Error("React DOM render method not available");
}

