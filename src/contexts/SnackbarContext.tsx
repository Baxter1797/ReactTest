import { createContext, useContext } from 'react';

interface SnackbarContextType {
  openSnackbar: (message: string, severity?: 'success' | 'info' | 'warning' | 'error') => void;
}

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export const useSnackbar = (): SnackbarContextType => {
  const context = useContext(SnackbarContext);
  if (!context) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return context;
};

export default SnackbarContext