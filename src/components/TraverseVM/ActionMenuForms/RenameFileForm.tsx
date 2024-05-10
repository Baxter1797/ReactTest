import { Dialog, Typography, DialogContent, Box, DialogContentText, TextField, Button, Alert, AlertTitle, Divider } from "@mui/material"
import CancelPresentationIcon from '@mui/icons-material/CancelPresentation';
import {useEffect, useMemo, useRef, useState } from "react";
import IApiOptions from "../../../interfaces/IApiOptions";
import ApiRequest from "../../../utils/apiRequest";
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import IsnackbarProperties from "../../../interfaces/IsnackbarProperties";
import ITraverseDir from "../../../interfaces/ITraverseDir";
import { TreeItem, TreeView } from "@mui/x-tree-view";
import { ChevronRight, ExpandMore } from "@mui/icons-material";
import { z } from "zod";

interface IRenameFileForm {
    traverseListDetails: {traverseList: ITraverseDir, expandedNodeIds: string[], nodeId: number}
    apiConnectionDetails: {dns: string, endPoint: string, listDirEndPoint: string, username: string, password: string}
    isRenameFileFormOpen: boolean
    setIsRenameFileFormOpen: React.Dispatch<React.SetStateAction<boolean>>
    setCurrentFileAttributes: React.Dispatch<React.SetStateAction<{path: string;executable: boolean, lastModified: number, canWrite: boolean, fileSize: number}>>
    setActiveFilePath: React.Dispatch<React.SetStateAction<string>>
    //sourceFilePath: string
    currentFileAttributes: {path: string, executable: boolean, lastModified: number, canWrite: boolean, fileSize: number}
    handleSnackbarRequest(snackbarProperties: IsnackbarProperties): void
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

function RenameFileForm(props: IRenameFileForm): JSX.Element {
    const [canRename, setCanRename] = useState<boolean>(true)
    const [errorReason, setErrorReason] = useState<string>('')
    const [traverseList, setTraverseList] = useState<ITraverseDir>(props.traverseListDetails.traverseList)
    const [expandedNodeIds, setExpandedNodeIds] = useState<string[]>(props.traverseListDetails.expandedNodeIds)
    const isClosingRef = useRef<boolean>(false)
    const nodeId = useRef<number>(props.traverseListDetails.nodeId)
    const filePathInputFieldRef = useRef<string>(props.currentFileAttributes.path)
    const filePathInputRef = useRef<HTMLTextAreaElement | null>(null)
    
    const sourceFilePath = props.currentFileAttributes.path
    //const fileName = sourceFilePath.substring(sourceFilePath.lastIndexOf('/')+1)
    const dns = props.apiConnectionDetails.dns
    const endPoint = props.apiConnectionDetails.endPoint
    const listDirEndPoint = props.apiConnectionDetails.listDirEndPoint
    const isRenameFileFormOpen = props.isRenameFileFormOpen
    const username = props.apiConnectionDetails.username
    const password = props.apiConnectionDetails.password
    const currentFileAttributes = props.currentFileAttributes
    
    const renderedTree = useMemo(() => {
        return renderTree(traverseList)
    }, [traverseList])

    function setAlert(message: string): void {
        setCanRename(false)
        setErrorReason(message)
    }

    async function handleRenameFileClick(): Promise<void> {
        if (filePathInputFieldRef.current.charAt(0) != '/') {
            setAlert('File path must begin with a /')
            return
        }

        try {
            const address = dns+endPoint
            new URL(address)
            const apiOptions : IApiOptions = {
                url: address,
                method: 'POST',
                params: {path: sourceFilePath, action: 'rename', content: filePathInputFieldRef.current},
                auth: {username: username, password: password}
            }
            try {
                await ApiRequest(apiOptions)
                props.setActiveFilePath(filePathInputFieldRef.current)
                props.setCurrentFileAttributes({...currentFileAttributes, path: filePathInputFieldRef.current})
                props.handleSnackbarRequest({message: 'Successfully renamed files', severity: 'success'})
                handleClose()
            } catch (error) {
                setAlert('Failed to successfully rename contents. Error reason:\n'+error)
            }
        } catch (error) {
            setAlert('Invalid URL Type, ensure that a valid URL has been constructed')
            return
        }
        
    }

    function handleKeyDown(e: React.KeyboardEvent): void {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleRenameFileClick()
            return
        }
    }

    function handleClose(): void {
        props.setIsRenameFileFormOpen(false)
        if (!canRename) {
            setErrorReason('')
            setCanRename(true)
        }
    }

    function renderTree(nodes: ITraverseDir): JSX.Element {
        return (
        <TreeItem TransitionProps={{timeout: 500}} key={nodes.id} nodeId={nodes.id} label={nodes.fileName} onClick={() => handleTraverseClick(nodes)} icon={nodes.type == 'dir' && !expandedNodeIds.includes(nodes.id) && <ChevronRight color="secondary"/>} >
            {Array.isArray(nodes.children) ? nodes.children.map((node) => renderTree(node)) : null}
        </TreeItem>
    )}

    function setFilePath(path: string): void {
        if (filePathInputRef.current){
        filePathInputRef.current.value = path+filePathInputFieldRef.current.substring(filePathInputFieldRef.current.lastIndexOf('/'))
        }
    }

    async function handleTraverseClick(node: ITraverseDir): Promise<void> {
        if (node.type == 'dir') {
            const expandedNodeIndex = expandedNodeIds.indexOf(node.id)
            if (expandedNodeIndex >= 0) {
                const updatedProperties = {children: []}
                // Sleep are so that animation can take place, 500ms is what the animation is set to. This allows time for it to complete smoothly
                if (expandedNodeIndex > 0) {
                    isClosingRef.current = true
                    setFilePath(node.path)
                    await unsetExpandedDirs(node, expandedNodeIds)
                    await new Promise(resolve => setTimeout(resolve, 500))
                    if (isClosingRef.current) {
                        setTraverseList(updateObjectById(traverseList, node.id, updatedProperties))
                        isClosingRef.current = false
                    }
                } else {
                    isClosingRef.current = true
                    setFilePath(node.path)
                    await unsetAllExpandedDirs()
                    await new Promise(resolve => setTimeout(resolve, 500))
                    if (isClosingRef.current) {
                        setTraverseList(updateObjectById(traverseList, node.id, updatedProperties))
                        isClosingRef.current = false
                    }
                }
            } else {
                try {
                    const updatedProperties = await fetchDirData(node.path)
                    setFilePath(node.path)
                    setTraverseList(updateObjectById(traverseList, node.id, updatedProperties))
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
                if (filePathInputRef.current) {
                    filePathInputRef.current.value = node.path
                }
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

    async function fetchDirData(parentPath: string): Promise<object> {
        const url = dns+listDirEndPoint
        try {
            const apiOptions: IApiOptions = {
                url: url,
                method: 'GET',
                params: {path: parentPath},
                auth: {username: username, password: password}
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
                setAlert('Unable to fetch data for '+url+'\n\nJSON Parsing Error! Data returned did not match expected type.')
                throw Error
            }
        } catch (error) {
            setAlert('Unable to fetch data for '+url)
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

    console.log('Rename File Form Refreshed!')

    return (
        <>
            <Dialog open={isRenameFileFormOpen} onClose={handleClose}>
                <Typography alignSelf={'center'} marginTop={'8px'}>Rename File</Typography>
                <DialogContent>
                    <Box sx={{backgroundColor: 'background.default', backdropFilter: 'blur(10px)'}} padding={2} borderRadius={1}>
                        <DialogContentText marginBottom={'16px'}>
                            {"Please provide the target path for renaming the file to"}
                        </DialogContentText>
                        <TextField inputRef={filePathInputRef} placeholder={'/File/Path'} defaultValue={filePathInputFieldRef.current} variant='outlined' label='File Path' id='File Path' fullWidth required type={"url"} multiline color={'secondary'} error={!canRename} FormHelperTextProps={{ error: true }} onChange={e => filePathInputFieldRef.current = e.target.value} onKeyDown={e => handleKeyDown(e)}/>
                        <Divider variant={'fullWidth'} orientation={"horizontal"} sx={{ paddingTop: '10px', marginBottom: '10px', fontSize: '14px'}}>Tree View</Divider>
                        <TreeView defaultExpandIcon={<ChevronRight color="secondary"/>} defaultCollapseIcon={<ExpandMore color="secondary"/> } expanded={expandedNodeIds}>
                            {renderedTree}
                        </TreeView>
                        {!canRename && 
                            <Box marginTop={'12px'}>
                                <Alert color="error" severity="error">
                                    <AlertTitle>API Request Error!</AlertTitle>
                                    <pre style={{whiteSpace: 'pre-wrap'}}>
                                        {"Unable to build a successful response from address:\n"+dns+endPoint+"\n\nReason: "+errorReason}
                                    </pre>
                                </Alert>
                            </Box>
                        }
                    </Box>
                </DialogContent>
                <Box display={'inline-flex'} flexDirection={'row'} alignContent={'center'} justifyContent={'center'} marginBottom={'12px'}>
                    <Button endIcon={<CancelPresentationIcon/>} variant="contained" sx={{marginRight: '6px'}} onClick={handleClose}>Cancel</Button>
                    <Button endIcon={<KeyboardArrowUpIcon/>} variant="contained" sx={{marginLeft: '6px'}} onClick={handleRenameFileClick}>Submit</Button>
                </Box>
            </Dialog>
        </>
    )
}

export default RenameFileForm