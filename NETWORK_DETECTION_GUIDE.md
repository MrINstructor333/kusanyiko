# Automatic Network IP Detection - User Guide

## Overview
Your Kusanyiko application now automatically detects and switches between localhost and network IP addresses without any manual configuration required.

## How It Works

### 1. **Automatic Detection**
- When the app starts, it automatically scans for available network endpoints
- Tests connections to localhost (127.0.0.1) and your local network IP
- Automatically selects the best working endpoint
- No manual configuration needed!

### 2. **Network Status Widget**
You'll see a **Network Status** widget in the top-right corner of your app that shows:
- ✅ **Current API Endpoint**: Shows which URL is being used (localhost or network IP)
- 🔄 **Connection Status**: Green = Connected, Red = Disconnected
- 📍 **Detected Network IPs**: Lists all available network IP addresses
- ⏰ **Last Checked**: When the connection was last tested

### 3. **Manual Controls**
The Network Status widget provides several options:

#### Quick Actions:
- **🔄 Refresh Button**: Manually re-scan and auto-detect the best endpoint
- **Localhost Button**: Quickly switch to localhost (useful for development)
- **Auto Detect Button**: Run automatic detection again

#### Custom Endpoint:
- **Text Input**: Enter any custom IP address (e.g., `http://192.168.1.100:8000`)
- **Test Button**: Test your custom endpoint before switching
- **Use Button**: Quick-switch to any detected network IP

## Usage Scenarios

### **Scenario 1: Development on Same Machine**
- App automatically uses `http://localhost:8000`
- Django server runs normally with `python manage.py runserver`

### **Scenario 2: Accessing from Another Device**
1. Start Django server with: `python manage.py runserver 0.0.0.0:8000`
2. The app automatically detects your network IP (e.g., `192.168.1.100:8000`)
3. Other devices on the same network can access the app
4. No configuration changes needed!

### **Scenario 3: Network IP Changes**
- If your network IP changes, just click the **Refresh** button
- The app will automatically find and switch to the new IP
- Your work continues seamlessly

## Technical Details

### **Supported Endpoints**
- `http://localhost:8000` (Default development)
- `http://127.0.0.1:8000` (Loopback)
- `http://[YOUR_NETWORK_IP]:8000` (Local network access)

### **How Detection Works**
1. **WebRTC IP Discovery**: Uses browser WebRTC to detect local network IPs
2. **Health Check Testing**: Tests each endpoint with `/api/health/` 
3. **Automatic Selection**: Chooses the first working endpoint
4. **Persistent Storage**: Remembers your preference in browser localStorage

### **Error Handling**
- If no endpoint works, you'll see a red "Disconnected" status
- Use the custom endpoint input to manually specify your Django server URL
- The widget shows clear status indicators for troubleshooting

## Django Server Setup

### **For Local Development Only:**
```bash
python manage.py runserver
# App will use localhost:8000
```

### **For Network Access (Other Devices):**
```bash
python manage.py runserver 0.0.0.0:8000
# App will automatically detect and use your network IP
```

## Benefits

✅ **Zero Configuration**: No need to edit config files or environment variables
✅ **Automatic Switching**: Seamlessly works on localhost and network IPs
✅ **Cross-Device Compatible**: Access from phones, tablets, other computers
✅ **Development Friendly**: Perfect for testing on multiple devices
✅ **Error Recovery**: Easy troubleshooting with manual override options
✅ **Real-time Status**: Always know your connection status

## Troubleshooting

### **Red "Disconnected" Status**
1. Check if Django server is running: `python manage.py runserver 0.0.0.0:8000`
2. Click the **Refresh** button to re-scan
3. Try the **Auto Detect** button
4. Manually enter your server URL in the custom endpoint field

### **Can't Access from Other Devices**
1. Make sure Django server is running with: `python manage.py runserver 0.0.0.0:8000`
2. Check that your firewall allows connections on port 8000
3. Verify all devices are on the same network
4. Try accessing directly: `http://[YOUR_IP]:8000/api/health/`

### **IP Address Changed**
1. Just click the **🔄 Refresh** button
2. The app will automatically detect your new IP
3. No restart required!

---

**That's it!** Your Kusanyiko app now automatically handles localhost and network IP switching without any manual configuration. Enjoy seamless development and testing across all your devices! 🚀