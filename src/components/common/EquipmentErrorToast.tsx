import React, { useEffect, useState } from 'react';
import { storeEvents } from '../../store/storeEvents';

export const EquipmentErrorToast: React.FC = () => {
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = storeEvents.subscribe<string>('equipment-error', (message) => {
      setErrorMessage(message);
      setIsVisible(true);

      // 3초 후 자동으로 숨김
      setTimeout(() => {
        setIsVisible(false);
      }, 3000);
    });

    return unsubscribe;
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in">
      <div className="bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg max-w-sm">
        <div className="flex items-center">
          <div className="flex-shrink-0 mr-3">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">장착 실패</p>
            <p className="text-sm">{errorMessage}</p>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="ml-3 text-red-200 hover:text-white"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};