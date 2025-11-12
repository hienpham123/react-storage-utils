# Path tới package.json
$packagePath = ".\package.json"

# Đọc nội dung package.json
$packageJson = Get-Content $packagePath -Raw | ConvertFrom-Json

# Tách version
$versionParts = $packageJson.version -split '\.'

# Chuyển patch (cuối) sang int và tăng 1
$versionParts[2] = ([int]$versionParts[2] + 1).ToString()

# Gộp lại thành version mới
$newVersion = $versionParts -join '.'

# Cập nhật package.json
$packageJson.version = $newVersion

# Ghi lại file package.json
$packageJson | ConvertTo-Json -Depth 10 | Set-Content $packagePath

Write-Host "Version updated to $newVersion"
