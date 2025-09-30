import React, { useEffect, useState } from 'react';
import { Camera, AlertCircle, Smartphone, Settings, Wifi } from 'lucide-react';

interface CameraPermissionGuideProps {
  onRetry: () => void;
  isVisible: boolean;
  onClose: () => void;
}

const CameraPermissionGuide: React.FC<CameraPermissionGuideProps> = ({ 
  onRetry, 
  isVisible, 
  onClose 
}) => {
  const [deviceInfo, setDeviceInfo] = useState<{
    isMobile: boolean;
    isIOS: boolean;
    isAndroid: boolean;
    browser: string;
  }>({
    isMobile: false,
    isIOS: false,
    isAndroid: false,
    browser: 'unknown'
  });

  useEffect(() => {
    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);
    
    let browser = 'unknown';
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    setDeviceInfo({ isMobile, isIOS, isAndroid, browser });
  }, []);

  if (!isVisible) return null;

  return (
    <div className="camera-permission-overlay">
      <div className="camera-permission-modal">
        <div className="permission-header">
          <div className="permission-icon">
            <Camera size={48} className="camera-icon" />
            <AlertCircle size={24} className="alert-icon" />
          </div>
          <h2>Camera Access Needed</h2>
          <p>To take profile pictures, we need access to your camera</p>
        </div>

        <div className="permission-content">
          {deviceInfo.isMobile && (
            <div className="mobile-instructions">
              <Smartphone size={24} />
              <h3>Mobile Device Instructions</h3>
              
              {window.location.protocol !== 'https:' && (
                <div className="https-warning">
                  <Wifi size={20} />
                  <div>
                    <h4>HTTPS Required for Camera Access</h4>
                    <p>Mobile browsers require HTTPS to access camera from external IPs.</p>
                  </div>
                </div>
              )}

              <div className="browser-steps">
                <h4>Enable Camera Permissions:</h4>
                <div className="steps-list">
                  {deviceInfo.isIOS ? (
                    <>
                      <div className="step">
                        <span className="step-number">1</span>
                        <span>Tap the <strong>aA</strong> icon in Safari's address bar</span>
                      </div>
                      <div className="step">
                        <span className="step-number">2</span>
                        <span>Select <strong>"Website Settings"</strong></span>
                      </div>
                      <div className="step">
                        <span className="step-number">3</span>
                        <span>Enable <strong>"Camera"</strong> permission</span>
                      </div>
                    </>
                  ) : deviceInfo.isAndroid ? (
                    <>
                      <div className="step">
                        <span className="step-number">1</span>
                        <span>Tap the <strong>🔒</strong> lock icon in the address bar</span>
                      </div>
                      <div className="step">
                        <span className="step-number">2</span>
                        <span>Select <strong>"Permissions"</strong></span>
                      </div>
                      <div className="step">
                        <span className="step-number">3</span>
                        <span>Allow <strong>"Camera"</strong> access</span>
                      </div>
                    </>
                  ) : (
                    <div className="step">
                      <span className="step-number">1</span>
                      <span>Look for camera permission request popup and click <strong>"Allow"</strong></span>
                    </div>
                  )}
                </div>
              </div>

              {window.location.protocol !== 'https:' && (
                <div className="alternative-solutions">
                  <h4>Alternative Solutions:</h4>
                  <div className="solutions-list">
                    <div className="solution">
                      <span>📱</span>
                      <span>Access via <code>https://10.181.172.168:3000</code> (if HTTPS is enabled)</span>
                    </div>
                    <div className="solution">
                      <span>💻</span>
                      <span>Use the desktop/laptop browser for camera features</span>
                    </div>
                    <div className="solution">
                      <span>📁</span>
                      <span>Upload photos from device gallery instead</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {!deviceInfo.isMobile && (
            <div className="desktop-instructions">
              <Settings size={24} />
              <h3>Desktop Browser Instructions</h3>
              <div className="steps-list">
                <div className="step">
                  <span className="step-number">1</span>
                  <span>Look for camera permission popup in browser</span>
                </div>
                <div className="step">
                  <span className="step-number">2</span>
                  <span>Click <strong>"Allow"</strong> to grant camera access</span>
                </div>
                <div className="step">
                  <span className="step-number">3</span>
                  <span>If blocked, click the camera icon in address bar to enable</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="permission-actions">
          <button className="btn-secondary" onClick={onClose}>
            Skip Camera
          </button>
          <button className="btn-primary" onClick={onRetry}>
            <Camera size={16} />
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default CameraPermissionGuide;