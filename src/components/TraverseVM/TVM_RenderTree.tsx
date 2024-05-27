import { SimpleTreeView, TreeItem } from "@mui/x-tree-view"
import ITraverseDir from "../../interfaces/ITraverseDir"
import {useContext, useMemo, useRef, useState } from "react"
import IApiOptions from "../../interfaces/IApiOptions"
import ApiRequest from "../../utils/apiRequest"
import { z } from "zod"
import { TreeViewContext } from "../../contexts/TreeViewContext"
import APIConnectionContext from "../../contexts/APIConnectionContext"
import KeyboardArrowRightSharpIcon from '@mui/icons-material/KeyboardArrowRightSharp';
import { useSnackbar } from "../../contexts/SnackbarContext"

interface ITVM_RenderTree {
    updateContext?: boolean
    handleFileClick(node: ITraverseDir): Promise<void>
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

const apiBaseEndPoint = '/grc/ext/NFR'
const listDirEndPoint = '/ListDir'

export default function TVM_RenderTree(props: ITVM_RenderTree): JSX.Element {
    const treeViewContext = useContext(TreeViewContext)
    const apiConnectionContext = useContext(APIConnectionContext)

    if (!treeViewContext || !apiConnectionContext) {
        throw new Error('TreeView and apiContext must be used within a the respected providers!')
    }

    const { traverseList, setTraverseList, expandedNodeIds, setExpandedNodeIds, nodeId } = treeViewContext
    const { activeDNSRef, usernameRef, passwordRef } = apiConnectionContext

    const { openSnackbar } = useSnackbar();
    
    const [traverseListLocal, setTraverseListLocal] = useState<ITraverseDir>(traverseList)
    const [expandedNodeIdsLocal, setExpandedNodeIdsLocal] = useState<string[]>(expandedNodeIds)
    const nodeIdLocal = useRef<number>(nodeId.current)
    const isClosingRef = useRef<boolean>(false)
    
    const renderedTree = useMemo(() => {
        //console.log('Running traverse list render')
        if (props.updateContext) {
            return renderTree(traverseList)
        } else {
            return renderTree(traverseListLocal)
        }
    }, [traverseList,traverseListLocal])

    function handleTreeUpdate (idToUpdate: string, updatedProperties: object): void {
        if (props.updateContext) {
            setTraverseList(updateObjectById(traverseList, idToUpdate, updatedProperties))
        } else {
            setTraverseListLocal(updateObjectById(traverseListLocal, idToUpdate, updatedProperties))
        }
    }

    async function handleTraverseClick(node: ITraverseDir): Promise<void> {
        if (node.type == 'dir') {
            let expandedNodeIndex
            if (props.updateContext) {
                expandedNodeIndex = expandedNodeIds.indexOf(node.id)
            } else {
                expandedNodeIndex = expandedNodeIdsLocal.indexOf(node.id)
            }
            if (expandedNodeIndex >= 0) {
                const updatedProperties = {children: []}
                // Sleep are so that animation can take place, 500ms is what the animation is set to. This allows time for it to complete smoothly
                // Is closing checks are in place to prevent fetching if user quickly closes and re opens a folder - prevents race conditions now that animation sleeps are in place.
                // Make improvement in that when a user quickly closes and opens a DIR, refresh that DIR with the latest data regardless, or even better, have a refresh button next to DIRs
                if (expandedNodeIndex > 0) {
                    isClosingRef.current = true
                    if (props.updateContext) {
                        await unsetExpandedDirs(node, expandedNodeIds)
                    } else {
                        await unsetExpandedDirs(node, expandedNodeIdsLocal)
                    }
                    await new Promise(resolve => setTimeout(resolve, 500))
                    if (isClosingRef.current) {
                        handleTreeUpdate(node.id, updatedProperties)
                        isClosingRef.current = false
                    }
                } else {
                    isClosingRef.current = true
                    await unsetAllExpandedDirs()
                    await new Promise(resolve => setTimeout(resolve, 500))
                    if (isClosingRef.current) {
                        handleTreeUpdate(node.id, updatedProperties)
                        isClosingRef.current = false
                    }
                }
            } else {
                try {
                    if (!isClosingRef.current) {
                        const updatedProperties = await fetchDirData(node.path)
                        handleTreeUpdate(node.id, updatedProperties)
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
            props.handleFileClick(node)
        }
    }

    function setExpandedDirs(node: ITraverseDir): void {
        if (props.updateContext) {
            setExpandedNodeIds([...expandedNodeIds, node.id])
        } else {
            setExpandedNodeIdsLocal([...expandedNodeIdsLocal, node.id])
        }
    }

    async function unsetAllExpandedDirs(): Promise<void>{
        if (props.updateContext) {
            setExpandedNodeIds([])
        } else {
            setExpandedNodeIdsLocal([])
        }
    }

    async function unsetExpandedDirs(node: ITraverseDir, expandedNodes: string[]): Promise<void> {
        if (node.children?.length != 0) {
            if (node.children != undefined) {
                for (let i = 0; i < node.children.length; ++i) {
                    unsetExpandedDirs(node.children[i], expandedNodes.filter((currentNode) => currentNode !== node.id))
                }
            }
        } else {
            if (props.updateContext) {
                setExpandedNodeIds(expandedNodes)
            } else {
                setExpandedNodeIdsLocal(expandedNodes)
            }
        }
    }

    async function fetchDirData(parentPath: string): Promise<object> {
        //await new Promise(resolve => setTimeout(resolve, 500))
        const url = activeDNSRef.current+apiBaseEndPoint+listDirEndPoint
        try {
            const apiOptions: IApiOptions = {
                url: url,
                method: 'GET',
                params: {path: parentPath},
                auth: {username: usernameRef.current, password: passwordRef.current}
            }
            const {data} = await ApiRequest(apiOptions)
            try {
                traversDirModels.parse(data)
                let someArray: ITraverseDir[]
                if (props.updateContext) {
                    someArray = data.map(object => {
                        ++nodeId.current
                        return {...object, id: nodeId.current.toString(), path: parentPath!='/'? parentPath+'/'+object.fileName : parentPath+object.fileName , children: []}
                    })
                } else {
                    someArray = data.map(object => {
                        ++nodeIdLocal.current
                        return {...object, id: nodeIdLocal.current.toString(), path: parentPath!='/'? parentPath+'/'+object.fileName : parentPath+object.fileName , children: []}
                    })
                }
                const returnObject = {children: [...someArray]}
                return returnObject
            } catch (error) {
                console.log('JSON PARSING ERROR!!!')
                openSnackbar('Unable to fetch data for '+url+'\n\nJSON Parsing Error! Data returned did not match expected type.', 'error')
                throw Error
            }
        } catch (error) {
            openSnackbar('Unable to fetch data for '+url, 'error')
            throw Error
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

    function renderTree(nodes: ITraverseDir): JSX.Element {
        return (
        <>
        {nodes.type === 'file' ?
        <TreeItem itemId={nodes.id} key={nodes.id} label={nodes.fileName} onClick={() => handleTraverseClick(nodes)} />
        :
        <TreeItem itemId={nodes.id} key={nodes.id} label={nodes.fileName} onClick={() => handleTraverseClick(nodes)} slots={{endIcon: KeyboardArrowRightSharpIcon}}>
            {Array.isArray(nodes.children) ? nodes.children.map((node) => renderTree(node)) : null}
        </TreeItem>
        }
        </>
        )
    }

    //console.log('TVM_RenderTree refreshed!')

    return (
        <>
            <SimpleTreeView expandedItems={props.updateContext? expandedNodeIds : expandedNodeIdsLocal} >
                {renderedTree}
            </SimpleTreeView>
        </> 
    )
}