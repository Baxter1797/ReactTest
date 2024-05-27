import React, { ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import { FileAttributesContext, FileAttributesUpdateContext } from '../contexts/FileAttributesContext';
import ITraverseFile from '../interfaces/ITraverseFile';

interface TVM_FileAttributesProviderProps {
  children: ReactNode;
}

export const TVM_FileAttributesProvider: React.FC<TVM_FileAttributesProviderProps> = ({ children }) => {
    const [currentFileAttributes, setCurrentFileAttributes] = useState<ITraverseFile>({
        path: '',
        executable: false,
        lastModified: 0,
        canWrite: false,
        fileSize: 0,
    })

    const [fontSize, setFontSize] = useState<number>(14)
    const [isFileContentReadOnly, setIsFileContentReadOnly] = useState<boolean>(true)
    const [isFileActive, setIsFileActive] = useState<boolean>(false)
    const [isFileLoading, setIsFileLoading] = useState<boolean>(false)
    const fileContentRef = useRef<string>('')
    const fileInputRef = useRef<HTMLTextAreaElement | null>(null)

    const updateCurrentFileAttributes = useCallback((fileAttributes: ITraverseFile) => {
      setCurrentFileAttributes(fileAttributes)
    }, [])

    const updateFontSize = useCallback((fontSize: number) => {
      setFontSize(fontSize)
    }, [])

    const updateIsContentReadOnly = useCallback((isContentReadOnly: boolean) => {
      setIsFileContentReadOnly(isContentReadOnly)
    }, [])

    const updateIsFileActive = useCallback((isFileActive: boolean) => {
      setIsFileActive(isFileActive)
    }, [])

    const updateFileContent = useCallback((content: string) => {
      fileContentRef.current = content
            if (fileInputRef.current){
                fileInputRef.current.value = content
            }
    }, [])

    const updateIsFileLoading = useCallback((state: boolean) => {
      setIsFileLoading(state)
    }, [])

    const fileAttributes = useMemo(() =>
      ({ currentFileAttributes, setCurrentFileAttributes, fileContentRef, fileInputRef, fontSize, setFontSize, isFileContentReadOnly, setIsFileContentReadOnly, isFileActive, setIsFileActive, isFileLoading, setIsFileLoading })
    , [currentFileAttributes, fontSize, isFileActive, isFileContentReadOnly, isFileLoading])

    const updateFileAttributes = useMemo(() => 
      ({updateCurrentFileAttributes, updateFontSize, updateIsContentReadOnly, updateIsFileActive, updateFileContent, updateIsFileLoading})
    , [updateCurrentFileAttributes, updateFileContent, updateFontSize, updateIsContentReadOnly, updateIsFileActive, updateIsFileLoading])

  return (
    <FileAttributesContext.Provider value={fileAttributes} >
      <FileAttributesUpdateContext.Provider value={updateFileAttributes} >
      {children}
      </FileAttributesUpdateContext.Provider>
    </FileAttributesContext.Provider>
  );
};