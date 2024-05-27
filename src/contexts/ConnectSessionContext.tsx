import { createContext, useContext } from 'react';

interface ConnectSessionContextType {
    openConnectSession: () => void
    isActiveSession: boolean
    setIsActiveSession: React.Dispatch<React.SetStateAction<boolean>>
}

const ConnectSessionContext = createContext<ConnectSessionContextType | undefined>(undefined);

export const useConnectSession = (): ConnectSessionContextType => {
  const context = useContext(ConnectSessionContext);
  if (!context) {
    throw new Error('useConnectSession must be used within a ConnectSessionProvider');
  }
  return context;
};

export default ConnectSessionContext