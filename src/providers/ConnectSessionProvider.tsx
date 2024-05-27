import React, { useState, ReactNode, useCallback } from 'react';
import ConnectSessionContext from '../contexts/ConnectSessionContext';
import ConnectSessionForm from '../components/TraverseVM/ConnectSessionForm';

interface ConnectSessionProviderProps {
  children: ReactNode;
}

export const ConnectSessionProvider: React.FC<ConnectSessionProviderProps> = ({ children }) => {

  const [isConnectSessionOpen, setIsConnectSessionOpen] = useState<boolean>(false)
  const [isActiveSession, setIsActiveSession] = useState<boolean>(false)

  const openConnectSession = useCallback(() => {
    setIsConnectSessionOpen(true)
  }, [])

  const contextValue = React.useMemo(
    () => ({ openConnectSession, isActiveSession, setIsActiveSession }),
    [openConnectSession, isActiveSession, setIsActiveSession]
  );

  return (
    <ConnectSessionContext.Provider value={contextValue}>
      {children}
      <ConnectSessionForm isConnectSessionOpen={isConnectSessionOpen} setIsConnectSessionOpen={setIsConnectSessionOpen} setIsActiveSession={setIsActiveSession}/>
    </ConnectSessionContext.Provider>
  );
};