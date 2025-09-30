#!/usr/bin/env bash
# Exit on error
set -e

echo "Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "Navigating to Django project directory..."
cd kusanyikoo

echo "Collecting static files..."
python manage.py collectstatic --no-input --clear

echo "Running database migrations..."
python manage.py migrate

echo "Build completed successfully!"