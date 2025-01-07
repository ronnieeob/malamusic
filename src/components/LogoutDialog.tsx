import React from 'react';
import { LogOut } from 'lucide-react';

interface LogoutDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function LogoutDialog({ isOpen, onConfirm, onCancel }: LogoutDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-zinc-900 rounded-lg p-6 w-full max-w-sm border border-red-900/20">
        <div className="flex items-center space-x-3 mb-4">
          <LogOut className="w-6 h-6 text-red-500" />
          <h2 className="text-xl font-bold">Sign Out</h2>
        </div>
        <p className="text-gray-400 mb-6">Are you sure you want to sign out?</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-400 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}