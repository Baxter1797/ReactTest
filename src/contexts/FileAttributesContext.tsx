import React from 'react'
import { createContext } from 'react'
import ITraverseFile from '../interfaces/ITraverseFile'

interface FileAttributesContextProps {
  currentFileAttributes: ITraverseFile
  setCurrentFileAttributes: React.Dispatch<React.SetStateAction<ITraverseFile>>
  fileContentRef: React.MutableRefObject<string>
  fileInputRef: React.MutableRefObject<HTMLTextAreaElement | null>
  fontSize: number
  setFontSize: React.Dispatch<React.SetStateAction<number>>
  isFileContentReadOnly: boolean
  setIsFileContentReadOnly: React.Dispatch<React.SetStateAction<boolean>>
  isFileActive: boolean
  setIsFileActive: React.Dispatch<React.SetStateAction<boolean>>
  isFileLoading: boolean
  setIsFileLoading: React.Dispatch<React.SetStateAction<boolean>>
}

interface FileAttributesUpdateContextProps {
  updateCurrentFileAttributes: (node: ITraverseFile) => void
  updateFontSize: (size: number) => void
  updateIsContentReadOnly: (readOnly: boolean) => void
  updateIsFileActive: (active: boolean) => void
  updateFileContent: (content: string) => void
  updateIsFileLoading: (state: boolean) => void
}

const FileAttributesContext = createContext<FileAttributesContextProps | undefined>(undefined)
const FileAttributesUpdateContext = createContext<FileAttributesUpdateContextProps | undefined>(undefined)
export { FileAttributesContext, FileAttributesUpdateContext }
export type { FileAttributesContextProps, FileAttributesUpdateContextProps }