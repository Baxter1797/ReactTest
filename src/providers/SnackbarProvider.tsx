import React, { ReactNode, useCallback } from 'react';
import SnackbarContext from '../contexts/SnackbarContext';
import { Bounce, ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface SnackbarProviderProps {
  children: ReactNode;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'info' | 'warning' | 'error';
}

export const SnackbarProvider: React.FC<SnackbarProviderProps> = ({ children }) => {

  const openSnackbar = useCallback((message: string, severity: SnackbarState['severity'] = 'info') => {
    //console.log('Made it into openSnackbar', severity)
    switch (severity) {
      case 'success':
        toast.success(message)
        break
      case 'info':
        toast.info(message)
        break
      case 'warning':
        toast.warning(message)
        break
      case 'error':
        toast.error(message)
        break
    }
  }, []);

  const contextValue = React.useMemo(
    () => ({ openSnackbar }),
    [openSnackbar]
  );

  //console.log('Refreshing Snackbar')

  return (
    <SnackbarContext.Provider value={contextValue}>
      {children}
      <ToastContainer position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        transition={Bounce}
        style={{width: '400px'}} />
    </SnackbarContext.Provider>
  );
};