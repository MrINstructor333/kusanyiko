/**
 * Network Detection Utility
 * Automatically detects and provides optimal API base URL for different environments
 */

interface NetworkInfo {
  baseURL: string;
  isLocalhost: boolean;
  networkIP?: string;
  detectedIPs: string[];
}

class NetworkDetector {
  private static instance: NetworkDetector;
  private cachedNetworkInfo: NetworkInfo | null = null;
  private detectionPromise: Promise<NetworkInfo> | null = null;

  private constructor() {}

  static getInstance(): NetworkDetector {
    if (!NetworkDetector.instance) {
      NetworkDetector.instance = new NetworkDetector();
    }
    return NetworkDetector.instance;
  }

  /**
   * Get local network IP addresses using WebRTC
   */
  private async getLocalIPs(): Promise<string[]> {
    return new Promise((resolve) => {
      const ips: string[] = [];
      const RTCPeerConnection = window.RTCPeerConnection || 
                               (window as any).webkitRTCPeerConnection || 
                               (window as any).mozRTCPeerConnection;

      if (!RTCPeerConnection) {
        resolve([]);
        return;
      }

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      pc.createDataChannel('');
      
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const candidate = event.candidate.candidate;
          const ipMatch = candidate.match(/(\d+\.\d+\.\d+\.\d+)/);
          if (ipMatch && ipMatch[1] !== '127.0.0.1' && !ips.includes(ipMatch[1])) {
            ips.push(ipMatch[1]);
          }
        }
      };

      pc.createOffer()
        .then(offer => pc.setLocalDescription(offer))
        .catch(() => {});

      // Timeout after 3 seconds
      setTimeout(() => {
        pc.close();
        resolve(ips);
      }, 3000);
    });
  }

  /**
   * Test if a given URL is reachable
   */
  private async testConnection(baseURL: string, timeout = 5000): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(`${baseURL}/api/health/`, {
        method: 'GET',
        signal: controller.signal,
        mode: 'cors',
        cache: 'no-cache',
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Detect the best available API endpoint
   */
  async detectOptimalEndpoint(): Promise<NetworkInfo> {
    // Return cached result if available and less than 5 minutes old
    if (this.cachedNetworkInfo) {
      return this.cachedNetworkInfo;
    }

    // Return existing promise if detection is in progress
    if (this.detectionPromise) {
      return this.detectionPromise;
    }

    this.detectionPromise = this._performDetection();
    const result = await this.detectionPromise;
    this.detectionPromise = null;
    
    return result;
  }

  private async _performDetection(): Promise<NetworkInfo> {
    const detectedIPs = await this.getLocalIPs();
    
    // Common port for Django development server
    const port = process.env.REACT_APP_API_PORT || '8000';
    
    // Candidate URLs to test (in order of preference)
    const candidates = [
      // Environment variable takes precedence
      ...(process.env.REACT_APP_API_URL ? [process.env.REACT_APP_API_URL] : []),
      
      // Localhost variations
      `http://localhost:${port}`,
      `http://127.0.0.1:${port}`,
      
      // Network IPs
      ...detectedIPs.map(ip => `http://${ip}:${port}`),
      
      // Common local network ranges
      'http://192.168.1.100:8000',
      'http://192.168.0.100:8000',
      'http://10.0.0.100:8000',
    ];

    console.log('🔍 Detecting optimal API endpoint...');
    console.log('🌐 Detected local IPs:', detectedIPs);
    console.log('🎯 Testing candidates:', candidates);

    // Test each candidate URL
    for (const baseURL of candidates) {
      try {
        console.log(`⏳ Testing: ${baseURL}`);
        const isReachable = await this.testConnection(baseURL, 3000);
        
        if (isReachable) {
          const isLocalhost = baseURL.includes('localhost') || baseURL.includes('127.0.0.1');
          const networkInfo: NetworkInfo = {
            baseURL,
            isLocalhost,
            networkIP: isLocalhost ? undefined : this.extractIP(baseURL),
            detectedIPs,
          };
          
          console.log('✅ Found working endpoint:', baseURL);
          console.log('📊 Network info:', networkInfo);
          
          this.cachedNetworkInfo = networkInfo;
          
          // Cache result for 5 minutes
          setTimeout(() => {
            this.cachedNetworkInfo = null;
          }, 5 * 60 * 1000);
          
          return networkInfo;
        }
      } catch (error) {
        console.log(`❌ Failed: ${baseURL}`, error);
      }
    }

    // Fallback to localhost if nothing works
    const fallbackURL = `http://localhost:${port}`;
    console.log('⚠️ No endpoint found, falling back to:', fallbackURL);
    
    const fallbackInfo: NetworkInfo = {
      baseURL: fallbackURL,
      isLocalhost: true,
      detectedIPs,
    };
    
    this.cachedNetworkInfo = fallbackInfo;
    return fallbackInfo;
  }

  private extractIP(url: string): string | undefined {
    const match = url.match(/http:\/\/(\d+\.\d+\.\d+\.\d+)/);
    return match ? match[1] : undefined;
  }

  /**
   * Force refresh of network detection
   */
  async refresh(): Promise<NetworkInfo> {
    this.cachedNetworkInfo = null;
    this.detectionPromise = null;
    return this.detectOptimalEndpoint();
  }

  /**
   * Get current network info (cached if available)
   */
  getCurrentNetworkInfo(): NetworkInfo | null {
    return this.cachedNetworkInfo;
  }

  /**
   * Manual override for testing
   */
  setManualEndpoint(baseURL: string): void {
    const isLocalhost = baseURL.includes('localhost') || baseURL.includes('127.0.0.1');
    this.cachedNetworkInfo = {
      baseURL,
      isLocalhost,
      networkIP: isLocalhost ? undefined : this.extractIP(baseURL),
      detectedIPs: [],
    };
    console.log('🔧 Manual endpoint set:', baseURL);
  }
}

// Export singleton instance
export const networkDetector = NetworkDetector.getInstance();

// Export types
export type { NetworkInfo };

// Utility functions
export const getOptimalApiUrl = async (): Promise<string> => {
  const networkInfo = await networkDetector.detectOptimalEndpoint();
  return networkInfo.baseURL;
};

export const isUsingLocalhost = async (): Promise<boolean> => {
  const networkInfo = await networkDetector.detectOptimalEndpoint();
  return networkInfo.isLocalhost;
};

export const getNetworkIP = async (): Promise<string | undefined> => {
  const networkInfo = await networkDetector.detectOptimalEndpoint();
  return networkInfo.networkIP;
};

export const refreshNetworkDetection = (): Promise<NetworkInfo> => {
  return networkDetector.refresh();
};