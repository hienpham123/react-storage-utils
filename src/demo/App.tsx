import * as React from "react";
import DraftCheckDemoHook from "./DraftCheckDemoHook";

/**
 * App component để chạy demo
 * 
 * Để chạy demo:
 * 1. Import component này vào file entry point của bạn
 * 2. Hoặc tạo một file HTML đơn giản để test
 */
class App extends React.Component {
    render() {
        return (
            <div>
                {/* <DraftCheckDemo /> */}
                <DraftCheckDemoHook />
            </div>
        );
    }
}

export default App;

