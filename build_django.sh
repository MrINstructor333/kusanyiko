#!/usr/bin/env bash
# Django Build Script - Similar to npm run build
set -e

echo "🔧 Building Kusanyiko Django Application..."

# Navigate to Django directory
cd kusanyikoo

echo "📦 Installing Python dependencies..."
pip install -r ../requirements.txt

echo "🔍 Checking for deployment issues..."
python manage.py check --deploy

echo "🗄️ Running database migrations..."
python manage.py migrate

echo "📁 Collecting static files..."
python manage.py collectstatic --noinput --clear

echo "🧹 Clearing expired sessions..."
python manage.py clearsessions

echo "✅ Django build completed successfully!"
echo "🚀 Ready for deployment!"

# Show build summary
echo ""
echo "📊 Build Summary:"
echo "- Static files: $(find staticfiles -type f | wc -l) files"
echo "- Database: $(python manage.py showmigrations --plan | grep '\[X\]' | wc -l) migrations applied"
echo "- Apps installed: $(python manage.py check 2>/dev/null | grep -c 'System check identified no issues' || echo 'Issues found')"