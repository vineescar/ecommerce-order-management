import React from 'react';

type AlertType = 'error' | 'success' | 'warning' | 'info';

interface AlertProps {
  type: AlertType;
  message: string;
  onClose?: () => void;
}

const Alert: React.FC<AlertProps> = ({ type, message, onClose }) => {
  const styles: Record<AlertType, string> = {
    error: 'bg-red-50 border-red-200 text-red-700',
    success: 'bg-green-50 border-green-200 text-green-700',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    info: 'bg-blue-50 border-blue-200 text-blue-700',
  };

  const icons: Record<AlertType, string> = {
    error: '✕',
    success: '✓',
    warning: '⚠',
    info: 'ℹ',
  };

  return (
    <div className={`${styles[type]} border px-4 py-3 rounded-lg relative mb-4`}>
      <div className="flex items-center">
        <span className="font-bold mr-2">{icons[type]}</span>
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-0 right-0 px-4 py-3 hover:opacity-70"
          aria-label="Close alert"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default Alert;
