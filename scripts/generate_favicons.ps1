Add-Type -AssemblyName System.Drawing

$sourcePath = (Resolve-Path "Logo.jpeg").Path
$src = [System.Drawing.Bitmap]::FromFile($sourcePath)

$w = $src.Width
$h = $src.Height

# Calculate center square crop
$size = [Math]::Min($w, $h)
$x = [int](($w - $size) / 2)
$y = [int](($h - $size) / 2)

# Create 512x512 master square bitmap
$master = New-Object System.Drawing.Bitmap(512, 512, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($master)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.Clear([System.Drawing.Color]::FromArgb(246, 244, 239)) # Match logo background color

$srcRect = New-Object System.Drawing.Rectangle($x, $y, $size, $size)
$destRect = New-Object System.Drawing.Rectangle(0, 0, 512, 512)
$g.DrawImage($src, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()

function Resize-And-Save($sourceBmp, $targetWidth, $targetHeight, $outputPath, $format) {
    $resized = New-Object System.Drawing.Bitmap($targetWidth, $targetHeight, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $gr = [System.Drawing.Graphics]::FromImage($resized)
    $gr.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $gr.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $gr.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $gr.Clear([System.Drawing.Color]::FromArgb(246, 244, 239))
    $gr.DrawImage($sourceBmp, 0, 0, $targetWidth, $targetHeight)
    $gr.Dispose()
    
    $parentDir = [System.IO.Path]::GetDirectoryName($outputPath)
    if (-not [string]::IsNullOrEmpty($parentDir) -and -not (Test-Path $parentDir)) {
        New-Item -ItemType Directory -Path $parentDir -Force | Out-Null
    }
    
    $resized.Save($outputPath, $format)
    $resized.Dispose()
    Write-Output "Generated: $outputPath ($targetWidth x $targetHeight)"
}

# Generate Google Search / web sizes
Resize-And-Save $master 512 512 "public/icon-512.png" ([System.Drawing.Imaging.ImageFormat]::Png)
Resize-And-Save $master 192 192 "public/icon-192.png" ([System.Drawing.Imaging.ImageFormat]::Png)
Resize-And-Save $master 180 180 "public/apple-touch-icon.png" ([System.Drawing.Imaging.ImageFormat]::Png)
Resize-And-Save $master 96 96 "public/icon-96.png" ([System.Drawing.Imaging.ImageFormat]::Png)
Resize-And-Save $master 48 48 "public/icon-48.png" ([System.Drawing.Imaging.ImageFormat]::Png)
Resize-And-Save $master 32 32 "public/icon-32.png" ([System.Drawing.Imaging.ImageFormat]::Png)
Resize-And-Save $master 16 16 "public/icon-16.png" ([System.Drawing.Imaging.ImageFormat]::Png)

# Next.js App Router standard files
Resize-And-Save $master 512 512 "app/icon.png" ([System.Drawing.Imaging.ImageFormat]::Png)
Resize-And-Save $master 180 180 "app/apple-icon.png" ([System.Drawing.Imaging.ImageFormat]::Png)
Resize-And-Save $master 48 48 "public/favicon.ico" ([System.Drawing.Imaging.ImageFormat]::Icon)
Resize-And-Save $master 48 48 "app/favicon.ico" ([System.Drawing.Imaging.ImageFormat]::Icon)

$master.Dispose()
$src.Dispose()
Write-Output "All favicon files generated successfully."
