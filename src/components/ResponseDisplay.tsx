import React, { useEffect, useRef } from 'react';

interface ResponseDisplayProps {
  message: string;
  isVisible: boolean;
}

const ResponseDisplay: React.FC<ResponseDisplayProps> = ({ message, isVisible }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isVisible, message]);

  if (!isVisible || !message) {
    return null;
  }

  return (
    <div 
      ref={containerRef}
      className="mt-8 px-6 py-4 bg-white rounded-lg shadow-md max-w-md w-full mx-auto animate-fadeIn"
    >
      <p className="text-gray-700">{message}</p>
    </div>
  );
};

export default ResponseDisplay;