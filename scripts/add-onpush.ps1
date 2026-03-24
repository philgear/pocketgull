$files = Get-ChildItem -Path "src" -Filter "*.component.ts" -Recurse
$updatedCount = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $changed = $false
    
    if ($content -match "@Component" -and $content -notmatch "ChangeDetectionStrategy\.OnPush") {
        # Check if we need to add ChangeDetectionStrategy import
        if ($content -notmatch "ChangeDetectionStrategy") {
            $content = [regex]::Replace($content, "import \{([^}]+)\} from '@angular/core';", "import {`$1, ChangeDetectionStrategy} from '@angular/core';")
        }
        
        # Inject the changeDetection property right after Component open brace
        $content = [regex]::Replace($content, "@Component\(\{\s*", "@Component({`n  changeDetection: ChangeDetectionStrategy.OnPush,`n  ")
        $changed = $true
    }
    
    if ($changed) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $updatedCount++
    }
}

Write-Host "Successfully updated $updatedCount components with OnPush change detection."
