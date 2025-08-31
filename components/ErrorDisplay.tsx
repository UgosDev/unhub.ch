
import React from 'react';
import { XMarkIcon } from './icons';

interface ErrorDisplayProps {
  error: string | null;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  if (!error) return null;

  return (
    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg" role="alert">
      <div className="flex">
        <div className="py-1"><XMarkIcon className="w-6 h-6 text-red-500 mr-4"/></div>
        <div>
          <p className="font-bold">Errore</p>
          <p>{error}</p>
        </div>
      </div>
    </div>
  );
};
