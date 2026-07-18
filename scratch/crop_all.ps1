Add-Type -AssemblyName System.Drawing

$sourcePath = "C:\Users\philg\.gemini\antigravity-ide\brain\69122f21-8d14-4a5c-b7ea-9f087ae4a43f\social_origami_pocketgull_happy_orange_card_1781247383182.png"
$outDir = "c:\Users\philg\Pocketgull\pocketgull\docs\images\social"
$rootPreview = "c:\Users\philg\Pocketgull\pocketgull\social-preview.png"
$docsPreview = "c:\Users\philg\Pocketgull\pocketgull\docs\images\social-preview.png"

if (!(Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir -Force | Out-Null
}

# 1. Resize/Save the square version first
$sourceImg = [System.Drawing.Image]::FromFile($sourcePath)
$sq = New-Object System.Drawing.Bitmap(1080, 1080)
$g = [System.Drawing.Graphics]::FromImage($sq)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.DrawImage($sourceImg, 0, 0, 1080, 1080)
$g.Dispose()
$sourceImg.Dispose()
$sq.Save("$outDir\square-1080x1080.png", [System.Drawing.Imaging.ImageFormat]::Png)
$sq.Dispose()
Write-Host "Generated square-1080x1080.png"

# Center POI to capture the top postcard and bottom bird together
$poiX = 540
$poiY = 540
$squarePath = "$outDir\square-1080x1080.png"

function ThirdsCrop($srcPath, $poiX, $poiY, $targetW, $targetH, $outPath, $fracX, $fracY) {
    $img = [System.Drawing.Image]::FromFile($srcPath)
    $targetRatio = $targetW / $targetH
    
    # Calculate crop dimensions
    if ($img.Width / $img.Height -gt $targetRatio) {
        $cropH = $img.Height
        $cropW = [int]($cropH * $targetRatio)
    } else {
        $cropW = $img.Width
        $cropH = [int]($cropW / $targetRatio)
    }
    
    $cropW = [Math]::Min($cropW, $img.Width)
    $cropH = [Math]::Min($cropH, $img.Height)
    
    # Calculate crop offset
    $cropX = [int]($poiX - ($fracX * $cropW))
    $cropY = [int]($poiY - ($fracY * $cropH))
    
    # Clamp coordinates to bounds
    $cropX = [Math]::Max(0, [Math]::Min($cropX, $img.Width - $cropW))
    $cropY = [Math]::Max(0, [Math]::Min($cropY, $img.Height - $cropH))
    
    $cropRect = New-Object System.Drawing.Rectangle($cropX, $cropY, $cropW, $cropH)
    $cropped = ([System.Drawing.Bitmap]$img).Clone($cropRect, $img.PixelFormat)
    
    $resized = New-Object System.Drawing.Bitmap($targetW, $targetH)
    $g2 = [System.Drawing.Graphics]::FromImage($resized)
    $g2.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g2.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g2.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g2.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    
    $g2.DrawImage($cropped, 0, 0, $targetW, $targetH)
    
    $resized.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    
    $g2.Dispose()
    $resized.Dispose()
    $cropped.Dispose()
    $img.Dispose()
    
    Write-Host "Generated crop: $outPath ($targetW x $targetH)"
}

# Crop target sizes (Centering POI to keep top-to-bottom balance):
ThirdsCrop -srcPath $squarePath -poiX $poiX -poiY $poiY -targetW 1280 -targetH 640 -outPath "$outDir\github-og-1280x640.png" -fracX 0.50 -fracY 0.50
ThirdsCrop -srcPath $squarePath -poiX $poiX -poiY $poiY -targetW 1280 -targetH 720 -outPath "$outDir\widescreen-1280x720.png" -fracX 0.50 -fracY 0.50
ThirdsCrop -srcPath $squarePath -poiX $poiX -poiY $poiY -targetW 1500 -targetH 500 -outPath "$outDir\banner-1500x500.png" -fracX 0.50 -fracY 0.50
ThirdsCrop -srcPath $squarePath -poiX $poiX -poiY $poiY -targetW 1080 -targetH 1920 -outPath "$outDir\story-1080x1920.png" -fracX 0.50 -fracY 0.50

# Update root and docs previews with the uncropped square version
Copy-Item -Path $squarePath -Destination $rootPreview -Force
Copy-Item -Path $squarePath -Destination $docsPreview -Force
Write-Host "Updated root and docs social preview copies with the uncropped square version."
