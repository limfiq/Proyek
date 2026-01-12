$StartupFolder = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup"
$BatchFile = "e:\Project\proyek\startup-runner.bat"
$ShortcutPath = "$StartupFolder\ProjectStartup.lnk"

# Create COM object for shortcut
$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)

# Set shortcut properties
$Shortcut.TargetPath = $BatchFile
$Shortcut.WorkingDirectory = "e:\Project\proyek"
$Shortcut.WindowStyle = 1  # Normal window
$Shortcut.Description = "Project Startup - Backend and Frontend"

# Save shortcut
$Shortcut.Save()

Write-Host "Shortcut created successfully at: $ShortcutPath"
Write-Host "The run.bat will now execute automatically 15 seconds after Windows startup"
