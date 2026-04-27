import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from './Button';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary' | 'warning';
  isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false
}) => {
  if (!isOpen) return null;

  const variantColors = {
    danger: 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white',
    primary: 'bg-primary-500/10 text-primary-500 border-primary-500/20 hover:bg-primary-500 hover:text-white',
    warning: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500 hover:text-white'
  };

  const buttonVariants: Record<string, "danger" | "primary" | "warning"> = {
    danger: 'danger',
    primary: 'primary',
    warning: 'warning'
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-[#161B2C] border border-white/10 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className={`p-3 rounded-2xl ${variant === 'danger' ? 'bg-red-500/10 text-red-500' : 'bg-primary-500/10 text-primary-500'}`}>
              <AlertTriangle size={24} />
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          <p className="text-gray-400 text-sm leading-relaxed mb-8">
            {message}
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="ghost" 
              fullWidth 
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              {cancelLabel}
            </Button>
            <Button 
              variant={variant === 'danger' ? 'danger' : 'primary'}
              fullWidth 
              onClick={() => {
                onConfirm();
                onClose();
              }}
              isLoading={isLoading}
              className="shadow-xl"
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
