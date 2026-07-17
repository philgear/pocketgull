import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distFolder = path.join(__dirname, 'dist');

const server = http.createServer((req, res) => {
    const targetPath = path.join(distFolder, req.url === '/' ? 'index.html' : req.url);
    const resolvedPath = path.resolve(targetPath);
    const expectedBase = path.resolve(distFolder);

    let filePath = resolvedPath;
    if (!resolvedPath.startsWith(expectedBase) || !fs.existsSync(resolvedPath)) {
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
