import React, { createContext, useContext, useCallback } from 'react';
import { toast, Toaster } from 'sonner';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const showToast = useCallback((message, type = 'info', options = {}) => {
    const opts = typeof options === 'number' ? { duration: options } : options;
    if (type === 'success') return toast.success(message, opts);
    if (type === 'error') return toast.error(message, opts);
    if (type === 'warning') return toast.warning(message, opts);
    return toast.info(message, opts);
  }, []);

  const showSuccess = useCallback((msg, options) => {
    const opts = typeof options === 'number' ? { duration: options } : options;
    return toast.success(msg, opts);
  }, []);

  const showError = useCallback((msg, options) => {
    const opts = typeof options === 'number' ? { duration: options } : options;
    return toast.error(msg, opts);
  }, []);

  const showInfo = useCallback((msg, options) => {
    const opts = typeof options === 'number' ? { duration: options } : options;
    return toast.info(msg, opts);
  }, []);

  const showWarning = useCallback((msg, options) => {
    const opts = typeof options === 'number' ? { duration: options } : options;
    return toast.warning(msg, opts);
  }, []);

  const removeToast = useCallback((id) => {
    if (id) {
      toast.dismiss(id);
    } else {
      toast.dismiss();
    }
  }, []);

  return (
    <ToastContext.Provider
      value={{
        toasts: [],
        showToast,
        addToast: showToast,
        showSuccess,
        showError,
        showInfo,
        showWarning,
        removeToast,
        toast,
      }}
    >
      {children}
      <Toaster
        position="bottom-right"
        richColors
        closeButton
        duration={5000}
        toastOptions={{
          style: {
            borderRadius: '12px',
            fontSize: '0.9rem',
          },
        }}
      />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export { toast };

