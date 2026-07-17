import '@angular/compiler';
console.log("Importing service...");
import('../src/services/python-bridge.service').then(m => {
  console.log("Imported successfully!", m);
}).catch(err => {
  console.error("Error importing:", err.stack);
});
