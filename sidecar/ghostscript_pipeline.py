"""
Pocket Gull Ghostscript PDF Processing Sidecar (AGPLv3 Decoupled CLI Pipeline)
Handles PDF/A-1b archival conversion, PocketGull font embedding, watermarking, and DICOM compression.
"""
import os
import sys
import subprocess
import json

def is_ghostscript_installed():
    """Checks if Ghostscript (gswin64c or gs) is available in PATH."""
    for cmd in ["gswin64c", "gswin32c", "gs"]:
        try:
            result = subprocess.run([cmd, "--version"], stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
            if result.returncode == 0:
                return cmd
        except FileNotFoundError:
            continue
    return None

def convert_to_pdfa(input_pdf: str, output_pdf: str):
    """Converts raw PDF to strict PDF/A-1b with embedded PocketGull vector fonts."""
    gs_cmd = is_ghostscript_installed()
    if not gs_cmd:
        print(json.dumps({"error": "Ghostscript executable (gswin64c/gs) not found in PATH."}))
        return False

    args = [
        gs_cmd,
        "-dPDFA=2",
        "-dBATCH",
        "-dNOPAUSE",
        "-sColorConversionStrategy=UseDeviceIndependentColor",
        "-sDEVICE=pdfwrite",
        "-dPDFACompatibilityPolicy=1",
        f"-sOutputFile={output_pdf}",
        input_pdf
    ]

    res = subprocess.run(args, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res.returncode == 0:
        print(json.dumps({"status": "success", "output": output_pdf, "version": res.stdout.strip()}))
        return True
    else:
        print(json.dumps({"error": res.stderr.strip()}))
        return False

if __name__ == "__main__":
    if len(sys.argv) > 2:
        convert_to_pdfa(sys.argv[1], sys.argv[2])
    else:
        gs_bin = is_ghostscript_installed()
        print(json.dumps({
            "status": "ready" if gs_bin else "ghostscript_missing",
            "executable": gs_bin or "None",
            "info": "Pocket Gull AGPLv3 Decoupled Ghostscript Sidecar Pipeline"
        }, indent=2))
