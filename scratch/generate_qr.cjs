const fs = require('fs');
const https = require('https');
const path = require('path');

const url = 'https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=https://pocketgull.app';
const dest = 'c:\\Users\\philg\\Pocketgull\\pocketgull\\docs\\images\\qr-code.png';

console.log(`Downloading QR code for https://pocketgull.app...`);

const file = fs.createWriteStream(dest);

https.get(url, (response) => {
  if (response.statusCode !== 200) {
    console.error(`Failed to download QR code. Status code: ${response.statusCode}`);
    return;
  }
  
  response.pipe(file);
  
  file.on('finish', () => {
    file.close();
    console.log(`Successfully saved QR code to: ${dest}`);
  });
}).on('error', (err) => {
  fs.unlink(dest, () => {}); // Delete the file on error
  console.error(`Error downloading QR code: ${err.message}`);
});
