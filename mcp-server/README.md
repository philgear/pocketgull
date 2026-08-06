# PocketGull Clinical Intelligence MCP Server

The **PocketGull MCP Server** is a standalone, standardized Model Context Protocol (MCP) server that provides clinical care plan intelligence, FHIR R4 exports, PHI compliance scanning, and Tri-Paradigm medical synthesis over stdio JSON-RPC 2.0.

---

## 🛠️ Provided MCP Tools

| Tool Name | Description | Key Arguments |
| :--- | :--- | :--- |
| **`pocketgull_get_patient`** | Retrieves active patient vitals, symptoms, biometrics, and intake state. | `patientId` (default: `p_default_patient` / Alexander Vance) |
| **`pocketgull_tri_paradigm_synthesis`** | Synthesizes Western Allopathic, TCM Zang-Fu, and Ayurvedic Tridosha care plans. | `symptoms` (`array`), `vitals` (`object`) |
| **`pocketgull_generate_soap_note`** | Generates structured SOAP notes & FHIR DocumentReference from clinical audio transcripts. | `transcript` (`string`), `patientName` (`string`) |
| **`pocketgull_phi_scan`** | Audits input text for Protected Health Information (PHI) leaks (SSN, emails, IDs). | `text` (`string`) |
| **`pocketgull_fhir_export`** | Generates a valid FHIR R4 Bundle (JSON) containing Patient, Observation, and Condition resources. | `patientName` (`string`), `conditions` (`array`) |

---

## 🚀 Usage & Registration

### 1. Run Directly via Node.js CLI
```bash
node mcp-server/pocketgull-mcp-server.mjs
```

### 2. Register in Antigravity IDE / Gemini IDE
Add the following entry to your MCP config (`mcp.json` or Global Customization Root):

```json
{
  "mcpServers": {
    "pocketgull": {
      "command": "node",
      "args": ["C:/Users/philg/Pocketgull/pocketgull/mcp-server/pocketgull-mcp-server.mjs"]
    }
  }
}
```

### 3. Register in Claude Desktop (`claude_desktop_config.json`)
```json
{
  "mcpServers": {
    "pocketgull": {
      "command": "node",
      "args": ["C:/Users/philg/Pocketgull/pocketgull/mcp-server/pocketgull-mcp-server.mjs"]
    }
  }
}
```

---

## 🧪 Testing the MCP Server Directly

You can test tools directly via JSON-RPC 2.0 over stdin:

```json
{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}
{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}
{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"pocketgull_get_patient","arguments":{"patientId":"p_default_patient"}}}
```
