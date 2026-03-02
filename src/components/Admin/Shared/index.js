// src/components/admin/shared/index.js
// Barrel export — importe tout depuis un seul endroit

export { default as Button }         from './Button';
export { default as Modal }          from './Modal';
export { default as ConfirmDialog }  from './ConfirmDialog';
export { default as StatusBadge }    from './StatusBadge';
export { default as Spinner, PageLoader, OverlayLoader } from './Spinner';
export { default as ExportButton }   from './ExportButton';
export { default as AlertBanner }    from './AlertBanner';
export { ToastProvider, useToast }   from './ToastNotification';
export {
  InputField,
  PasswordField,
  SelectField,
  TextareaField,
} from './FormFields';
