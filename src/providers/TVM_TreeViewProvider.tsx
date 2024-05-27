import React, { useState, ReactNode, useRef, useCallback } from 'react';
import { TreeViewContext, TreeViewUpdateContext } from '../contexts/TreeViewContext';
import ITraverseDir from '../interfaces/ITraverseDir';

interface TVM_TreeViewProviderProps {
  children: ReactNode;
}

export const TVM_TreeViewProvider: React.FC<TVM_TreeViewProviderProps> = ({ children }) => {
  const [traverseList, setTraverseList] = useState<ITraverseDir>({
    id: '0',
    fileName: 'props.initialName',
    canWrite: false,
    executable: false,
    fileSize: 123,
    lastModified: 123,
    type: 'dir',
    path: 'props.initialPath',
    children: []
  })
  const [expandedNodeIds, setExpandedNodeIds] = useState<string[]>([])
  const nodeId = useRef<number>(0)

  const updateTree = useCallback((node: ITraverseDir) => {
    setTraverseList(node)
    nodeId.current = 0
    setExpandedNodeIds([])
  }, [])

  const updateTreeContextValue = React.useMemo(
    () => ({ updateTree }),
    [updateTree]
  );

  // Memoize the context value for the other state values
  const stateContextValue = React.useMemo(
    () => ({ traverseList, setTraverseList, expandedNodeIds, setExpandedNodeIds, nodeId }),
    [traverseList, expandedNodeIds]
  );


  return (
    <TreeViewContext.Provider value={stateContextValue}>
      <TreeViewUpdateContext.Provider value={updateTreeContextValue}>
      {children}
      </TreeViewUpdateContext.Provider>
    </TreeViewContext.Provider>
  );
};