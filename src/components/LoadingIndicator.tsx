import React from 'react';
import { Loader } from 'lucide-react';

interface LoadingIndicatorProps {
  fullScreen?: boolean;
  message?: string;
}

export function LoadingIndicator({ fullScreen, message }: LoadingIndicatorProps) {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <Loader className="w-8 h-8 text-red-500 animate-spin" />
      {message && <p className="text-gray-400">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-zinc-900/80 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
}