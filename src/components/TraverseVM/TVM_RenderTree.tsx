import { ChevronRight, ExpandMore } from "@mui/icons-material"
import { TreeItem, TreeView } from "@mui/x-tree-view"
import ITraverseDir from "../../interfaces/ITraverseDir"
import { useMemo, useRef, useState } from "react"
import IApiOptions from "../../interfaces/IApiOptions"
import ApiRequest from "../../utils/apiRequest"
import { z } from "zod"
import IsnackbarProperties from "../../interfaces/IsnackbarProperties"

// Add function for handling setting the stage on new connect
// Could use a flag so that when this is true, set the stage
// Flag could be shouldResetRenderTree
// Or just agree to handle most of the state within the parent object, since this needs to be shared between multiple comps
// Then wrap the render of the TextField in a useMemo hook so that big files don't cause any performance hits when they need to be re-rendered

interface ITVM_RenderTree {
    traverseList: ITraverseDir
    setTraverseList: React.Dispatch<React.SetStateAction<ITraverseDir>>
    //isNewConnectionFlag: boolean
    apiConnectionDetails: {dns: string, endPoint: string}
    expandedNodes: string[]
    handleTraverseClick(node: ITraverseDir): Promise<void>
    handleSnackbarRequest(snackbarProperties: IsnackbarProperties): void
    setFileAttributes(fileContents: string, isFileActive: boolean, fileAttributes: {path: string, canWrite: boolean, executable: boolean, fileSize: number, lastModified: number}): void
}

const traverseDirModel = z.object({
    fileName: z.string(),
    type: z.string(),
    executable: z.boolean(),
    lastModified: z.number(),
    canWrite: z.boolean(),
    fileSize: z.number()
})
const traversDirModels = z.array(traverseDirModel)

const traverseFileModel = z.string()

function TVM_RenderTree(props: ITVM_RenderTree): JSX.Element {
    /*const [traverseList, setTraverseList] = useState<ITraverseDir>({
        id: '0',
        fileName: 'Init state',
        type: 'dir',
        path: 'Init State',
        canWrite: false,
        executable: false,
        fileSize: 1234556,
        lastModified: 1234456,
        children: [],
    })*/
    const [expandedNodeIds, setExpandedNodeIds] = useState<string[]>([])
    const nodeId = useRef<number>(0)
    const isClosingRef = useRef<boolean>(false)
    
    const renderedTree = useMemo(() => {
        console.log('Running traverse list render')
        return renderTree(props.traverseList)
    }, [props.traverseList])

    const dns = props.apiConnectionDetails.dns
    const endPoint = props.apiConnectionDetails.endPoint

    async function handleTraverseClick(node: ITraverseDir): Promise<void> {
        if (node.type == 'dir') {
            const expandedNodeIndex = expandedNodeIds.indexOf(node.id)
            if (expandedNodeIndex >= 0) {
                const updatedProperties = {children: []}
                // Sleep are so that animation can take place, 500ms is what the animation is set to. This allows time for it to complete smoothly
                if (expandedNodeIndex > 0) {
                    isClosingRef.current = true
                    await unsetExpandedDirs(node, expandedNodeIds)
                    await new Promise(resolve => setTimeout(resolve, 500))
                    if (isClosingRef.current) {
                        props.setTraverseList(updateObjectById(props.traverseList, node.id, updatedProperties))
                        isClosingRef.current = false
                    }
                } else {
                    isClosingRef.current = true
                    await unsetAllExpandedDirs()
                    await new Promise(resolve => setTimeout(resolve, 500))
                    if (isClosingRef.current) {
                        props.setTraverseList(updateObjectById(props.traverseList, node.id, updatedProperties))
                        isClosingRef.current = false
                    }
                }
            } else {
                try {
                    const updatedProperties = await fetchDirData(node.path)
                    props.setTraverseList(updateObjectById(props.traverseList, node.id, updatedProperties))
                    if (!isClosingRef.current) {
                        setExpandedDirs(node)
                    } else {
                        isClosingRef.current = false
                        setExpandedDirs(node)
                    }
                } catch (error) {
                    console.log('Error fetching and setting clicked DIR!')
                    return
                }
            }
        } else {
            try {
                const fileContent = await fetchFileData(node.path)
                props.setFileAttributes(fileContent, true, {path: node.path, canWrite: node.canWrite, executable: node.executable, fileSize: node.fileSize, lastModified: node.lastModified})
            } catch (error) {
                console.log("Error fetching and setting clicked file!")
            }
        }
    }

    function setExpandedDirs(node: ITraverseDir): void {
        expandedNodeIds.push(node.id)
        setExpandedNodeIds(expandedNodeIds)
    }

    async function unsetAllExpandedDirs(): Promise<void>{
        setExpandedNodeIds([])
    }

    async function unsetExpandedDirs(node: ITraverseDir, expandedNodes: string[]): Promise<void> {
        const expandedNodesIndex = expandedNodes.indexOf(node.id)
        if (expandedNodesIndex >= 0) {
            expandedNodes.splice(expandedNodesIndex, expandedNodesIndex)
        }
        if (node.children?.length != 0) {
            if (node.children != undefined) {
                for (let i = 0; i < node.children.length; ++i) {
                    unsetExpandedDirs(node.children[i], expandedNodes)
                }
            }
        } else {
            setExpandedNodeIds(expandedNodes)
        }
    }

    function updateObjectById(obj: ITraverseDir, idToUpdate: string, updatedProperties: object): ITraverseDir {
        if (obj.id === idToUpdate) {
            return { ...obj, ...updatedProperties };
        } else if (obj.children) {
            return {
                ...obj,
                children: obj.children.map(child => updateObjectById(child, idToUpdate, updatedProperties))
            };
        }
        return obj;
    }

    async function fetchDirData(parentPath: string): Promise<object> {
        const url = dns+endPoint
        try {
            const apiOptions: IApiOptions = {
                url: url,
                method: 'GET',
                params: {path: parentPath}
            }
            const {data} = await ApiRequest(apiOptions)
            try {
                traversDirModels.parse(data)
                const someArray: ITraverseDir[] = data.map(object => {
                    ++nodeId.current
                    return {...object, id: nodeId.current.toString(), path: parentPath+'/'+object.fileName , children: []}
                })
                const returnObject = {children: [...someArray]}
                return returnObject
            } catch (error) {
                console.log('JSON PARSING ERROR!!!')
                props.handleSnackbarRequest({message: 'Unable to fetch data for '+url+'\n\nJSON Parsing Error! Data returned did not match expected type.', severity:'error'})
                throw Error
            }
        } catch (error) {
            props.handleSnackbarRequest({message: 'Unable to fetch data for '+url, severity:'error'})
            throw Error
        }
    }

    async function fetchFileData(parentPath: string): Promise<string> {
        const url = dns+endPoint
        try {
            const apiOptions: IApiOptions = {
                url: url,
                method: 'GET',
                params: {path: parentPath}
            }
            const {data} = await ApiRequest(apiOptions)
            try {
                traverseFileModel.parse(data)
                return data
            } catch (error) {
                console.log('Error passing file data as string')
                props.handleSnackbarRequest({message: 'Error when parsing returned data to string. Ensure fetch is requesting a file and not a DIR', severity: 'error'})
                throw Error
            }
        } catch (error) {
            console.log("Error fetching data for the URL: "+url)
            props.handleSnackbarRequest({message: 'Error fetching data for the address: '+url, severity: 'error'})
            throw Error
        }
    }

    function renderTree(nodes: ITraverseDir): JSX.Element {
        return (
        <TreeItem TransitionProps={{timeout: 500}} key={nodes.id} nodeId={nodes.id} label={nodes.fileName} onClick={() => handleTraverseClick(nodes)} icon={nodes.type == 'dir' && !expandedNodeIds.includes(nodes.id) && <ChevronRight color="secondary"/>} >
            {Array.isArray(nodes.children) ? nodes.children.map((node) => renderTree(node)) : null}
        </TreeItem>
    )}

    return (
        <>
            <TreeView defaultExpandIcon={<ChevronRight color="secondary"/>} defaultCollapseIcon={<ExpandMore color="secondary"/> } expanded={expandedNodeIds}>
                {renderedTree}
            </TreeView>
        </> 
    )
}

export default TVM_RenderTree