export type ToastTone = 'success' | 'warning' | 'error';

export type ShowToast = (message: string, tone?: ToastTone) => void;
