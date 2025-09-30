import React, { useState, useEffect } from 'react';
import { ArrowPathIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface NetworkInfo {
  currentEndpoint: string;
  isConnected: boolean;
  detectedIPs: string[];
  lastChecked: Date;
}

const NetworkConfig: React.FC = () => {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({
    currentEndpoint: 'http://localhost:8000',
    isConnected: false,
    detectedIPs: [],
    lastChecked: new Date()
  });
  
  const [customEndpoint, setCustomEndpoint] = useState('');
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  // Detect local network IPs
  const detectNetworkIPs = async (): Promise<string[]> => {
    const ips: string[] = [];
    
    try {
      // Use WebRTC to detect local IP addresses
      const RTCPeerConnection = (window as any).RTCPeerConnection || 
                               (window as any).webkitRTCPeerConnection || 
                               (window as any).mozRTCPeerConnection;

      if (RTCPeerConnection) {
        const pc = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
        });

        pc.createDataChannel('');
        
        return new Promise((resolve) => {
          pc.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
            if (event.candidate) {
              const candidate = event.candidate.candidate;
              const ipMatch = candidate.match(/(\d+\.\d+\.\d+\.\d+)/);
              if (ipMatch && ipMatch[1] !== '127.0.0.1' && !ips.includes(ipMatch[1])) {
                ips.push(ipMatch[1]);
              }
            }
          };

          pc.createOffer()
            .then((offer: RTCSessionDescriptionInit) => pc.setLocalDescription(offer))
            .catch(() => {});

          // Timeout after 3 seconds
          setTimeout(() => {
            pc.close();
            resolve(ips);
          }, 3000);
        });
      }
    } catch (error) {
      console.error('Failed to detect network IPs:', error);
    }
    
    return ips;
  };

  // Test connection to an endpoint
  const testConnection = async (endpoint: string): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${endpoint}/api/health/`, {
        method: 'GET',
        signal: controller.signal,
        mode: 'cors',
        cache: 'no-cache',
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.error(`Connection test failed for ${endpoint}:`, error);
      return false;
    }
  };

  // Auto-detect the best endpoint
  const autoDetectEndpoint = async () => {
    setIsTestingConnection(true);
    
    try {
      const detectedIPs = await detectNetworkIPs();
      const port = '8000'; // Default Django development server port
      
      // Candidate endpoints to test
      const candidates = [
        'http://localhost:8000',
        'http://127.0.0.1:8000',
        ...detectedIPs.map(ip => `http://${ip}:${port}`)
      ];

      console.log('🔍 Testing endpoints:', candidates);

      // Test each endpoint
      for (const endpoint of candidates) {
        console.log(`⏳ Testing: ${endpoint}`);
        const isConnected = await testConnection(endpoint);
        
        if (isConnected) {
          console.log(`✅ Connected to: ${endpoint}`);
          setNetworkInfo({
            currentEndpoint: endpoint,
            isConnected: true,
            detectedIPs,
            lastChecked: new Date()
          });
          
          // Update environment variable or localStorage
          localStorage.setItem('REACT_APP_API_URL', endpoint);
          
          setIsTestingConnection(false);
          return;
        }
      }

      // No endpoint worked
      console.log('❌ No working endpoint found');
      setNetworkInfo(prev => ({
        ...prev,
        isConnected: false,
        detectedIPs,
        lastChecked: new Date()
      }));
    } catch (error) {
      console.error('Auto-detection failed:', error);
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Test custom endpoint
  const testCustomEndpoint = async () => {
    if (!customEndpoint.trim()) return;
    
    setIsTestingConnection(true);
    const isConnected = await testConnection(customEndpoint.trim());
    
    if (isConnected) {
      setNetworkInfo(prev => ({
        ...prev,
        currentEndpoint: customEndpoint.trim(),
        isConnected: true,
        lastChecked: new Date()
      }));
      localStorage.setItem('REACT_APP_API_URL', customEndpoint.trim());
      setCustomEndpoint('');
    }
    
    setIsTestingConnection(false);
  };

  // Initial auto-detection on component mount
  useEffect(() => {
    const savedEndpoint = localStorage.getItem('REACT_APP_API_URL');
    if (savedEndpoint) {
      setNetworkInfo(prev => ({
        ...prev,
        currentEndpoint: savedEndpoint
      }));
      // Test saved endpoint
      testConnection(savedEndpoint).then(isConnected => {
        setNetworkInfo(prev => ({
          ...prev,
          isConnected,
          lastChecked: new Date()
        }));
      });
    } else {
      autoDetectEndpoint();
    }
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-80">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-900">Network Status</h3>
          <button
            onClick={autoDetectEndpoint}
            disabled={isTestingConnection}
            className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
            title="Refresh network detection"
          >
            <ArrowPathIcon 
              className={`h-4 w-4 text-gray-500 ${isTestingConnection ? 'animate-spin' : ''}`} 
            />
          </button>
        </div>

        {/* Current Status */}
        <div className="flex items-center mb-3">
          {networkInfo.isConnected ? (
            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
          ) : (
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
          )}
          <div className="flex-1">
            <div className="text-xs text-gray-600">API Endpoint</div>
            <div className="text-sm font-mono text-gray-900 truncate" title={networkInfo.currentEndpoint}>
              {networkInfo.currentEndpoint}
            </div>
          </div>
        </div>

        {/* Status indicator */}
        <div className="text-xs text-gray-500 mb-3">
          Status: <span className={networkInfo.isConnected ? 'text-green-600' : 'text-red-600'}>
            {networkInfo.isConnected ? 'Connected' : 'Disconnected'}
          </span>
          <span className="ml-2">
            Last checked: {networkInfo.lastChecked.toLocaleTimeString()}
          </span>
        </div>

        {/* Detected IPs */}
        {networkInfo.detectedIPs.length > 0 && (
          <div className="mb-3">
            <div className="text-xs text-gray-600 mb-1">Detected Network IPs:</div>
            <div className="text-xs space-y-1">
              {networkInfo.detectedIPs.map(ip => (
                <div key={ip} className="flex items-center justify-between">
                  <span className="font-mono">{ip}:8000</span>
                  <button
                    onClick={() => setCustomEndpoint(`http://${ip}:8000`)}
                    className="text-blue-600 hover:text-blue-800 text-xs"
                  >
                    Use
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Custom endpoint input */}
        <div className="space-y-2">
          <div className="text-xs text-gray-600">Custom Endpoint:</div>
          <div className="flex space-x-2">
            <input
              type="text"
              value={customEndpoint}
              onChange={(e) => setCustomEndpoint(e.target.value)}
              placeholder="http://192.168.1.100:8000"
              className="flex-1 text-xs px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={testCustomEndpoint}
              disabled={isTestingConnection || !customEndpoint.trim()}
              className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Test
            </button>
          </div>
        </div>

        {/* Quick actions */}
        <div className="mt-3 flex space-x-2">
          <button
            onClick={() => setCustomEndpoint('http://localhost:8000')}
            className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Localhost
          </button>
          <button
            onClick={autoDetectEndpoint}
            disabled={isTestingConnection}
            className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50"
          >
            Auto Detect
          </button>
        </div>
      </div>
    </div>
  );
};

export default NetworkConfig;