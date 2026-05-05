$cachePath = Join-Path (Get-Location) "bootstrap\cache"

Write-Host "1) Ensure nothing weird exists at bootstrap\cache..."
if (Test-Path $cachePath -PathType Leaf) {
    Write-Host " - A file was found at bootstrap\cache — removing it..."
    Remove-Item $cachePath -Force
}

if (Test-Path $cachePath -PathType Container) {
    Write-Host " - Directory exists, removing Attributes (if readonly)..."
    attrib -R $cachePath /S /D 2>$null
} else {
    Write-Host " - Creating bootstrap\cache directory..."
    New-Item -ItemType Directory -Path $cachePath -Force | Out-Null
}

Write-Host "`n2) Take ownership and set permissive ACLs (Everyone:F) — temporary..."
takeown /f $cachePath /r /d y | Out-Null
icacls $cachePath /grant "Everyone:(OI)(CI)F" /T | Out-Null

Write-Host "`n3) Show folder attributes and ACL for inspection:"
Get-Item $cachePath | Format-List FullName,Attributes
icacls $cachePath

Write-Host "`n4) Show which php binary and ini are used by CLI (important):"
where.exe php
php -v
php --ini

Write-Host "`n5) PHP check: is_dir / is_writable (as seen by PHP):"
php -r "echo 'is_dir:'.(is_dir('bootstrap/cache')? 'true':'false').\"`n\"; echo 'is_writable:'.(is_writable('bootstrap/cache')? 'true':'false').\"`n\";"

Write-Host "`n6) Run artisan package:discover -vvv now (shows full error if still fails):"
php artisan package:discover -vvv