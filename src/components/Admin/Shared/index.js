// src/components/admin/shared/index.js
// Barrel export importe tout depuis un seul endroit

export { default as AlertBanner } from './AlertBanner';
export { default as Button } from './Button';
export { default as ConfirmDialog } from './ConfirmDialog';
export { default as ExportButton } from './ExportButton';
export {
    InputField,
    PasswordField,
    SelectField,
    TextareaField
} from './FormFields';
export { default as Modal } from './Modal';
export { OverlayLoader, PageLoader, default as Spinner } from './Spinner';
export { default as StatusBadge } from './StatusBadge';
export { useToast } from './ToastContext';
export { ToastProvider } from './ToastNotification';
