import React, { ReactNode, useRef } from 'react';
import APIConnectionContext from '../contexts/APIConnectionContext';

interface TVM_APIConnectionProviderProps {
  children: ReactNode;
}

export const TVM_APIConnectionProvider: React.FC<TVM_APIConnectionProviderProps> = ({ children }) => {
  const activeDNSRef = useRef<string>('')
  const usernameRef = useRef<string>('')
  const passwordRef = useRef<string>('')
  const apiBaseEndPoint = '/grc/ext/NFR'
  const listDirEndPoint = '/ListDir'
  const handleFileChangeEndPoint = '/handleFileChange'
  const executeShellEndPoint = '/executeShell'

  return (
    <APIConnectionContext.Provider value={{ activeDNSRef, usernameRef, passwordRef, apiBaseEndPoint, listDirEndPoint, handleFileChangeEndPoint, executeShellEndPoint }}>
      {children}
    </APIConnectionContext.Provider>
  );
};