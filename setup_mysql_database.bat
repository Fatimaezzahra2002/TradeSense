@echo off
echo Setting up MySQL database for TradeSense AI
echo ==========================================

echo.
echo Checking if Python is installed...
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✓ Python is installed
) else (
    echo ✗ Python is not installed
    echo Please install Python first before running this script
    pause
    exit /b 1
)

echo.
echo Checking if pip is available...
pip --version >nul 2>&1
if %errorlevel% == 0 (
    echo ✓ pip is available
) else (
    echo ✗ pip is not available
    echo Please ensure Python is properly installed with pip
    pause
    exit /b 1
)

echo.
echo Installing required Python packages...
pip install -r backend/requirements.txt
if %errorlevel% == 0 (
    echo ✓ Dependencies installed successfully
) else (
    echo ✗ Error installing dependencies
    pause
    exit /b 1
)

echo.
echo Checking if MySQL is accessible...
echo SHOW DATABASES; | mysql -u root -p123456 >nul 2>&1
if %errorlevel% == 0 (
    echo ✓ MySQL connection successful
) else (
    echo ⚠ Could not connect to MySQL with default credentials
    echo Please verify MySQL is running and credentials are correct
    echo Check backend/.env file for database configuration
)

echo.
echo Running database setup script...
python backend/setup_mysql.py

echo.
echo Database setup completed!
echo.
echo To run the backend server, use:
echo   cd backend && python app.py
echo.
pause