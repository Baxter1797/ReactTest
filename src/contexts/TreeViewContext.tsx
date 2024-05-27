import { createContext } from 'react'
import ITraverseDir from '../interfaces/ITraverseDir'

interface TreeViewContextProps {
  traverseList: ITraverseDir
  setTraverseList: React.Dispatch<React.SetStateAction<ITraverseDir>>
  expandedNodeIds: string[]
  setExpandedNodeIds: React.Dispatch<React.SetStateAction<string[]>>
  nodeId: React.MutableRefObject<number>
}

interface TreeViewUpdateContextProps {
  updateTree: (node: ITraverseDir) => void
}

const TreeViewContext = createContext<TreeViewContextProps | undefined>(undefined)
const TreeViewUpdateContext = createContext<TreeViewUpdateContextProps | undefined>(undefined)

export { TreeViewContext, TreeViewUpdateContext }

//export default TreeViewContext
export type { TreeViewContextProps, TreeViewUpdateContextProps }