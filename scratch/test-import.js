console.log("Starting test-import...");
import('./src/services/python-bridge.service.js')
  .then(m => {
    console.log("Imported successfully!", m);
  })
  .catch(err => {
    console.error("Error importing:", err.stack);
  });
