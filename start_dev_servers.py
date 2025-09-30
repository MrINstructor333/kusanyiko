#!/usr/bin/env python3
"""
Development server startup script with HTTPS support for mobile camera access
"""
import subprocess
import sys
import time
import os
import threading
from pathlib import Path

def start_django_server():
    """Start Django development server"""
    print("🚀 Starting Django backend server...")
    os.chdir("kusanyikoo")
    try:
        subprocess.run([
            sys.executable, "manage.py", "runserver", "0.0.0.0:8000"
        ], check=True)
    except KeyboardInterrupt:
        print("🛑 Django server stopped")
    except subprocess.CalledProcessError as e:
        print(f"❌ Django server failed: {e}")

def start_react_server():
    """Start React development server with HTTPS"""
    print("🚀 Starting React frontend server with HTTPS...")
    os.chdir("frontend")
    try:
        # Use the updated npm start command that includes HTTPS
        subprocess.run(["npm", "start"], check=True)
    except KeyboardInterrupt:
        print("🛑 React server stopped")
    except subprocess.CalledProcessError as e:
        print(f"❌ React server failed: {e}")

def main():
    print("🌟 Starting Kusanyiko Development Servers")
    print("=" * 50)
    print("📱 Mobile camera access enabled with HTTPS")
    print("🌐 Frontend: https://10.181.172.168:3000")
    print("🔧 Backend: http://localhost:8000")
    print("=" * 50)
    
    # Start Django in a separate thread
    django_thread = threading.Thread(target=start_django_server, daemon=True)
    django_thread.start()
    
    # Give Django a moment to start
    time.sleep(2)
    
    # Start React server (this will block until stopped)
    try:
        start_react_server()
    except KeyboardInterrupt:
        print("\n🛑 Shutting down servers...")
        print("✅ Development servers stopped")

if __name__ == "__main__":
    # Change to project root directory
    project_root = Path(__file__).parent
    os.chdir(project_root)
    
    main()