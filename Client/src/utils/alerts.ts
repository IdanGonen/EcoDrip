import Swal from 'sweetalert2';

interface AlertOptions {
  title?: string;
  text?: string;
  icon?: 'success' | 'error' | 'warning' | 'info' | 'question';
  confirmButtonText?: string;
  cancelButtonText?: string;
  showCancelButton?: boolean;
}

interface ConfirmOptions {
  title?: string;
  text?: string;
  icon?: 'warning' | 'question' | 'info';
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonColor?: string;
  cancelButtonColor?: string;
}

export const showAlert = async (options: AlertOptions) => {
  return await Swal.fire({
    title: options.title || 'Alert',
    text: options.text,
    icon: options.icon || 'info',
    confirmButtonText: options.confirmButtonText || 'OK',
    cancelButtonText: options.cancelButtonText || 'Cancel',
    showCancelButton: options.showCancelButton || false,
    customClass: {
      confirmButton: 'px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium',
      cancelButton: 'px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-md font-medium ml-2'
    },
    buttonsStyling: false
  });
};

export const showConfirm = async (options: ConfirmOptions) => {
  return await Swal.fire({
    title: options.title || 'Are you sure?',
    text: options.text,
    icon: options.icon || 'warning',
    showCancelButton: true,
    confirmButtonText: options.confirmButtonText || 'Yes, confirm!',
    cancelButtonText: options.cancelButtonText || 'Cancel',
    confirmButtonColor: options.confirmButtonColor || '#dc2626',
    cancelButtonColor: options.cancelButtonColor || '#6b7280',
    customClass: {
      confirmButton: 'px-4 py-2 text-white rounded-md font-medium',
      cancelButton: 'px-4 py-2 text-white rounded-md font-medium ml-2'
    }
  });
};

export const showSuccess = async (title: string, text?: string) => {
  return await showAlert({
    title,
    text,
    icon: 'success',
    confirmButtonText: 'Great!'
  });
};

export const showError = async (title: string, text?: string) => {
  return await showAlert({
    title,
    text,
    icon: 'error',
    confirmButtonText: 'OK'
  });
};

export const showWarning = async (title: string, text?: string) => {
  return await showAlert({
    title,
    text,
    icon: 'warning',
    confirmButtonText: 'Understood'
  });
};