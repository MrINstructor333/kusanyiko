import React, { useState, useEffect } from 'react';

const HealthCheck: React.FC = () => {
  const [status, setStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const [message, setMessage] = useState('Checking app health...');

  useEffect(() => {
    const checkHealth = async () => {
      try {
        // Check if we can access the API
        const response = await fetch('/api/health/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          setStatus('success');
          setMessage('✅ App is healthy! API connection successful.');
        } else {
          setStatus('error');
          setMessage(`❌ API Error: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        setStatus('error');
        setMessage(`❌ Connection Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    checkHealth();
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'checking': return 'text-blue-600';
      case 'success': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-white border border-gray-200 rounded-lg shadow-lg max-w-sm">
      <div className="flex items-center space-x-2">
        {status === 'checking' && (
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        )}
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          {message}
        </span>
      </div>
    </div>
  );
};

export default HealthCheck;