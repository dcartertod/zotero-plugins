# script to build the .xpi file from the folder
# maybe skip unnecessary files but right now not doing that
# it is just a .zip but hey .xpi just seems right and moving and renaming things is tedious
# prompts with a dialog


Function Get-Folder($initialDirectory="") {
    [System.Reflection.Assembly]::LoadWithPartialName("System.windows.forms")|Out-Null

    $foldername = New-Object System.Windows.Forms.FolderBrowserDialog
    $foldername.Description = "Select a folder"
    #$foldername.rootfolder = $initialDirectory
    $foldername.SelectedPath = $initialDirectory
    Write-Host $initialDirectory
    if($foldername.ShowDialog() -eq "OK")
    {
        $folder += $foldername.SelectedPath
    }
    return $folder
}

$Path = Get-Folder -initialDirectory $pwd

if ($null -eq $Path){
    exit
}

# Write-Host $Path
$folderName = Split-Path -Path $Path -Leaf
# Write-Host $folderName
# Write-Host "$pwd\$folderName.zip"

$todaysDate = (Get-Date).ToString("yyyy-MM-dd-hh-mm")

# https://github.com/PowerShell/Microsoft.PowerShell.Archive/issues/48 - generates bad path separators
# Get-ChildItem -Path $Path | Compress-Archive -DestinationPath "$pwd\$folderName.zip" -Update

& "C:\Program Files\7-Zip\7z.exe" a -tzip -o"$pwd\" "$folderName.zip" "$Path\*" -aoa

Move-Item -Path "$pwd\$folderName.xpi" -Destination "$pwd\$folderName.xpi.$todaysDate.bak" -Force
Rename-Item "$pwd\$folderName.zip" -NewName "$folderName.xpi"
