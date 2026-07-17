import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distFolder = path.join(__dirname, 'dist');

const server = http.createServer((req, res) => {
    const requestUrl = new URL(req.url || '/', 'http://localhost');
    const requestedPath = requestUrl.pathname === '/' ? '/index.html' : requestUrl.pathname;
    const candidatePath = path.resolve(distFolder, '.' + requestedPath);
    const relativePath = path.relative(distFolder, candidatePath);

    if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
    }

    let filePath = candidatePath;
    if (!fs.existsSync(filePath)) {
        filePath = path.join(distFolder, 'index.html');
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(500);
            res.end("Error loading file.");
            return;
        }
        res.writeHead(200);
        res.end(data);
    });
});

server.listen(4201, () => {
    console.log("Raw Node Server listening on port 4201");
});
