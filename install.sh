#!/bin/bash
# Installation and startup script for Convertation

echo "Convertation - Video Conferencing Application"
echo "============================================="

# Check if PHP is installed
if ! command -v php &> /dev/null; then
    echo "Error: PHP is not installed. Please install PHP 7.0 or higher."
    exit 1
fi

echo "PHP is installed. Starting development server..."

# Start the PHP development server
echo "Starting server on http://localhost:8080"
echo "Open your browser and navigate to http://localhost:8080 to use the application."
echo "Press Ctrl+C to stop the server."

php -S localhost:8080 -t .