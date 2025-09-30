// Development console override to suppress unwanted error messages
export const initializeConsoleOverrides = () => {
  if (process.env.NODE_ENV === 'development') {
    const originalError = console.error;
    
    console.error = (...args: any[]) => {
      const message = args.join(' ');
      
      // Suppress specific error messages that are expected in development
      const suppressedMessages = [
        'Failed to load resource',
        'Bad Request',
        'API Error',
        'Mixed Content',
        'net::ERR_',
        'Connection test failed',
        'Proxy error'
      ];
      
      const shouldSuppress = suppressedMessages.some(suppressedMsg => 
        message.includes(suppressedMsg)
      );
      
      if (!shouldSuppress) {
        originalError.apply(console, args);
      }
    };
  }
};