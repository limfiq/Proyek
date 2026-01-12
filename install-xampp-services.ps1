# Script PowerShell untuk install Apache dan MySQL sebagai Windows Service
# Jalankan sebagai Administrator

param(
    [switch]$Install = $false,
    [switch]$Uninstall = $false,
    [switch]$Start = $false,
    [switch]$Stop = $false
)

# Configuration
$XAMPP_PATH = "E:\xampp"
$APACHE_PATH = "$XAMPP_PATH\apache"
$MYSQL_PATH = "$XAMPP_PATH\mysql"
$APACHE_SERVICE_NAME = "ApacheXAMPP"
$MYSQL_SERVICE_NAME = "MySQL80"

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Please right-click PowerShell and select 'Run as administrator'"
    exit 1
}

function Install-Services {
    Write-Host "`n====================================`n" -ForegroundColor Cyan
    Write-Host "Installing XAMPP Services" -ForegroundColor Cyan
    Write-Host "====================================`n" -ForegroundColor Cyan
    
    # Check XAMPP existence
    if (-not (Test-Path $XAMPP_PATH)) {
        Write-Host "ERROR: XAMPP not found at $XAMPP_PATH" -ForegroundColor Red
        exit 1
    }
    
    # Install Apache
    Write-Host "`n--- Installing Apache as Service ---`n" -ForegroundColor Yellow
    
    # Stop existing service if running
    $apacheService = Get-Service -Name $APACHE_SERVICE_NAME -ErrorAction SilentlyContinue
    if ($apacheService) {
        Write-Host "Removing existing Apache service..."
        Stop-Service -Name $APACHE_SERVICE_NAME -ErrorAction SilentlyContinue
        & "$APACHE_PATH\bin\httpd.exe" -k uninstall -n $APACHE_SERVICE_NAME
        Start-Sleep -Seconds 2
    }
    
    # Install Apache
    Write-Host "Installing Apache service..."
    & "$APACHE_PATH\bin\httpd.exe" -k install -n $APACHE_SERVICE_NAME
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Apache installed successfully!" -ForegroundColor Green
        Write-Host "Starting Apache service..."
        Start-Service -Name $APACHE_SERVICE_NAME
        Start-Sleep -Seconds 2
    } else {
        Write-Host "✗ Failed to install Apache service" -ForegroundColor Red
        exit 1
    }
    
    # Install MySQL
    Write-Host "`n--- Installing MySQL as Service ---`n" -ForegroundColor Yellow
    
    # Stop existing service if running
    $mysqlService = Get-Service -Name $MYSQL_SERVICE_NAME -ErrorAction SilentlyContinue
    if ($mysqlService) {
        Write-Host "Removing existing MySQL service..."
        Stop-Service -Name $MYSQL_SERVICE_NAME -ErrorAction SilentlyContinue
        & "$MYSQL_PATH\bin\mysqld.exe" --remove
        Start-Sleep -Seconds 2
    }
    
    # Install MySQL
    Write-Host "Installing MySQL service..."
    & "$MYSQL_PATH\bin\mysqld.exe" --install $MYSQL_SERVICE_NAME --defaults-file="$MYSQL_PATH\bin\my.ini"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ MySQL installed successfully!" -ForegroundColor Green
        Write-Host "Starting MySQL service..."
        Start-Service -Name $MYSQL_SERVICE_NAME
        Start-Sleep -Seconds 2
    } else {
        Write-Host "✗ Failed to install MySQL service" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "`n====================================`n" -ForegroundColor Cyan
    Write-Host "Installation Complete!" -ForegroundColor Green
    Write-Host "====================================`n" -ForegroundColor Cyan
    
    Write-Host "Services installed:" -ForegroundColor Green
    Write-Host "  ✓ $APACHE_SERVICE_NAME (Apache Web Server)" -ForegroundColor Green
    Write-Host "  ✓ $MYSQL_SERVICE_NAME (MySQL Database)`n" -ForegroundColor Green
    
    Write-Host "Both services will start automatically on Windows startup.`n" -ForegroundColor Cyan
}

function Uninstall-Services {
    Write-Host "`n====================================`n" -ForegroundColor Cyan
    Write-Host "Uninstalling XAMPP Services" -ForegroundColor Cyan
    Write-Host "====================================`n" -ForegroundColor Cyan
    
    # Stop and remove Apache
    Write-Host "Stopping Apache service..." -ForegroundColor Yellow
    Stop-Service -Name $APACHE_SERVICE_NAME -ErrorAction SilentlyContinue
    & "$APACHE_PATH\bin\httpd.exe" -k uninstall -n $APACHE_SERVICE_NAME
    Write-Host "✓ Apache service removed" -ForegroundColor Green
    
    # Stop and remove MySQL
    Write-Host "Stopping MySQL service..." -ForegroundColor Yellow
    Stop-Service -Name $MYSQL_SERVICE_NAME -ErrorAction SilentlyContinue
    & "$MYSQL_PATH\bin\mysqld.exe" --remove
    Write-Host "✓ MySQL service removed`n" -ForegroundColor Green
}

function Start-Services {
    Write-Host "Starting services..." -ForegroundColor Yellow
    Start-Service -Name $APACHE_SERVICE_NAME -ErrorAction SilentlyContinue
    Start-Service -Name $MYSQL_SERVICE_NAME -ErrorAction SilentlyContinue
    Write-Host "✓ Services started`n" -ForegroundColor Green
}

function Stop-Services {
    Write-Host "Stopping services..." -ForegroundColor Yellow
    Stop-Service -Name $APACHE_SERVICE_NAME -ErrorAction SilentlyContinue
    Stop-Service -Name $MYSQL_SERVICE_NAME -ErrorAction SilentlyContinue
    Write-Host "✓ Services stopped`n" -ForegroundColor Green
}

function Show-Status {
    Write-Host "`n====================================`n" -ForegroundColor Cyan
    Write-Host "XAMPP Services Status" -ForegroundColor Cyan
    Write-Host "====================================`n" -ForegroundColor Cyan
    
    $apacheStatus = Get-Service -Name $APACHE_SERVICE_NAME -ErrorAction SilentlyContinue
    $mysqlStatus = Get-Service -Name $MYSQL_SERVICE_NAME -ErrorAction SilentlyContinue
    
    if ($apacheStatus) {
        $apacheStat = if ($apacheStatus.Status -eq "Running") { "✓ Running" } else { "✗ Stopped" }
        Write-Host "$APACHE_SERVICE_NAME: $apacheStat" -ForegroundColor $(if ($apacheStatus.Status -eq "Running") { 'Green' } else { 'Red' })
    } else {
        Write-Host "$APACHE_SERVICE_NAME: Not installed" -ForegroundColor Red
    }
    
    if ($mysqlStatus) {
        $mysqlStat = if ($mysqlStatus.Status -eq "Running") { "✓ Running" } else { "✗ Stopped" }
        Write-Host "$MYSQL_SERVICE_NAME: $mysqlStat`n" -ForegroundColor $(if ($mysqlStatus.Status -eq "Running") { 'Green' } else { 'Red' })
    } else {
        Write-Host "$MYSQL_SERVICE_NAME: Not installed`n" -ForegroundColor Red
    }
}

# Main
if ($Install) {
    Install-Services
} elseif ($Uninstall) {
    Uninstall-Services
} elseif ($Start) {
    Start-Services
} elseif ($Stop) {
    Stop-Services
} else {
    Show-Status
    Write-Host "Usage:`n" -ForegroundColor Cyan
    Write-Host "  Install services:"
    Write-Host "    .\install-xampp-services.ps1 -Install`n"
    Write-Host "  Uninstall services:"
    Write-Host "    .\install-xampp-services.ps1 -Uninstall`n"
    Write-Host "  Start services:"
    Write-Host "    .\install-xampp-services.ps1 -Start`n"
    Write-Host "  Stop services:"
    Write-Host "    .\install-xampp-services.ps1 -Stop`n"
}
