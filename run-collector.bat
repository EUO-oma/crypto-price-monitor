@echo off
:: Crypto Price Monitor - Windows Task Scheduler Script
:: This script runs the crypto price collector and commits data to GitHub

echo ========================================
echo Crypto Price Monitor - Data Collection
echo Started at: %date% %time%
echo ========================================

:: Change to the script's directory
cd /d "%~dp0"

:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Run the collector
echo.
echo Running crypto price collector...
node collector.js
if %errorlevel% neq 0 (
    echo ERROR: Failed to run collector.js
    pause
    exit /b 1
)

:: Check if git is installed
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo WARNING: Git is not installed or not in PATH
    echo Data collected but not committed to GitHub
    pause
    exit /b 0
)

:: Git operations
echo.
echo Committing data to GitHub...
git add data/*.json
git commit -m "Auto-update: Crypto prices %date% %time%"
if %errorlevel% equ 0 (
    echo Pushing to GitHub...
    git push origin main
    if %errorlevel% equ 0 (
        echo SUCCESS: Data collected and pushed to GitHub
    ) else (
        echo ERROR: Failed to push to GitHub
        echo Check your internet connection and GitHub credentials
    )
) else (
    echo No changes to commit (data might be unchanged)
)

echo.
echo ========================================
echo Completed at: %date% %time%
echo ========================================

:: Optional: Keep window open to see results (remove for silent operation)
:: pause