import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState(null);
  const [progress, setProgress] = useState(100);

  const showNotification = useCallback((message, type = 'error') => {
    setNotification({ message, type });
    setProgress(100);

    // Start progress bar
    const startTime = Date.now();
    const duration = 2000; // 2 seconds

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (remaining > 0) {
        requestAnimationFrame(updateProgress);
      } else {
        setNotification(null);
      }
    };

    requestAnimationFrame(updateProgress);
  }, []);

  const dismissNotification = useCallback(() => {
    setNotification(null);
  }, []);

  return (
    <NotificationContext.Provider value={{ notification, showNotification, dismissNotification, progress }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const Notification = () => {
  const { notification, dismissNotification, progress } = useNotification();

  if (!notification) return null;

  const bgColor = notification.type === 'error' ? 'bg-red-50' : 'bg-green-50';
  const borderColor = notification.type === 'error' ? 'border-red-500' : 'border-green-500';
  const textColor = notification.type === 'error' ? 'text-red-700' : 'text-green-700';
  const iconColor = notification.type === 'error' ? 'text-red-400' : 'text-green-400';

  return (
    <div className="fixed top-4 right-4 z-50 w-96">
      <div className={`${bgColor} border-l-4 ${borderColor} p-4 rounded-lg shadow-lg relative overflow-hidden`}>
        {/* Progress bar */}
        <div 
          className="absolute bottom-0 left-0 h-1 bg-gray-200 w-full"
          style={{ 
            transform: `scaleX(${progress / 100})`,
            transformOrigin: 'left',
            transition: 'transform 50ms linear'
          }}
        />
        
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {notification.type === 'error' ? (
              <svg className={`h-5 w-5 ${iconColor}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className={`h-5 w-5 ${iconColor}`} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <div className="ml-3">
            <p className={`text-sm ${textColor}`}>{notification.message}</p>
          </div>
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                onClick={dismissNotification}
                className={`inline-flex rounded-md p-1.5 ${iconColor} hover:bg-opacity-10 hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-gray-600`}
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 