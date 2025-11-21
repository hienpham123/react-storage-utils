#!/usr/bin/env node

/**
 * Script để chạy demo
 * Sử dụng: node run-demo.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 1999;
const DEMO_FILE = path.join(__dirname, 'demo-standalone.html');

const server = http.createServer((req, res) => {
    let filePath = req.url === '/' ? DEMO_FILE : path.join(__dirname, req.url);
    
    // Security: chỉ serve files trong thư mục hiện tại
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('File not found');
            return;
        }

        const ext = path.extname(filePath);
        const contentType = {
            '.html': 'text/html',
            '.js': 'text/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
        }[ext] || 'text/plain';

        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
});

server.listen(PORT, () => {
    console.log(`\n🚀 Demo server đang chạy tại:`);
    console.log(`   http://localhost:${PORT}`);
    console.log(`\n📝 Mở trình duyệt và truy cập URL trên để xem demo`);
    console.log(`\n⚠️  Lưu ý: Đây là demo đơn giản với localStorage.`);
    console.log(`   Để test đầy đủ với IndexedDB, hãy import component vào project React/SPFx của bạn.\n`);
    
    // Tự động mở browser (Windows)
    if (process.platform === 'win32') {
        const { exec } = require('child_process');
        exec(`start http://localhost:${PORT}`);
    }
});

