import { createContext } from 'react'

interface APIConnectionContextProps {
  activeDNSRef: React.MutableRefObject<string>
  usernameRef: React.MutableRefObject<string>
  passwordRef: React.MutableRefObject<string>
  apiBaseEndPoint: string
  listDirEndPoint: string
  handleFileChangeEndPoint: string
  executeShellEndPoint: string
}

const APIConnectionContext = createContext<APIConnectionContextProps | undefined>(undefined)

export default APIConnectionContext
export type { APIConnectionContextProps }