import { ChevronRight, ExpandMore } from "@mui/icons-material";
import { Alert, Box, Button, Divider, FormControl, IconButton, InputLabel, ListItemIcon, ListItemText, Menu, MenuItem, Select, Snackbar, SvgIconTypeMap, TextField, Tooltip, Typography } from "@mui/material";
import { RichTreeView, SimpleTreeView, TreeItem, TreeView } from "@mui/x-tree-view";
import { useEffect, useMemo, useRef, useState } from "react";
import SaveIcon from '@mui/icons-material/Save';
import { useQuery } from "@tanstack/react-query";
import LaptopIcon from '@mui/icons-material/Laptop';
import ConnectSessionForm from "../components/TraverseVM/ConnectSessionForm";
import ITraverseDir from "../interfaces/ITraverseDir";
import EditIcon from '@mui/icons-material/Edit';
import TextIncreaseIcon from '@mui/icons-material/TextIncrease';
import TextDecreaseIcon from '@mui/icons-material/TextDecrease';
import LockIcon from '@mui/icons-material/Lock';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import {string, z} from 'zod'
import IsnackbarProperties from "../interfaces/IsnackbarProperties";
import CustomSnackbar from "../components/CustomSnackbar";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import RefreshIcon from '@mui/icons-material/Refresh';
import { OverridableComponent } from "@mui/material/OverridableComponent";
import ApiRequest from "../utils/apiRequest";
import IApiOptions from "../interfaces/IApiOptions";
import TVM_ActionMenu from "../components/TraverseVM/TVM_ActionMenu";
import { render } from "react-dom";

const fileContentDisplayToolBar: {title: string, icon: OverridableComponent<SvgIconTypeMap<object, "svg">> & { muiName: string;}}[] = ([
    {title: 'Decrease Font Size', icon: TextDecreaseIcon},
    {title: 'Increase Font Size', icon: TextIncreaseIcon},
    {title: 'Lock File', icon: LockIcon},
    {title: 'Edit File', icon: EditIcon}
])

const fileQuickActions: {title: string, icon: OverridableComponent<SvgIconTypeMap<object, "svg">> & { muiName: string;}}[] = ([
    {title: 'Save Contents', icon: SaveIcon},
    {title: 'Refresh Contents', icon: RefreshIcon},
    {title: 'Copy Contents', icon: ContentCopyIcon}
])

const traverseDirModel = z.object({
    fileName: z.string(),
    type: z.string(),
    executable: z.boolean(),
    lastModified: z.number(),
    canWrite: z.boolean(),
    fileSize: z.number()
})
const traversDirModels = z.array(traverseDirModel)

interface ITraverseFileModel {
    fileName: string
    type: string
    executable: boolean
    lastModified: number
    canWrite: boolean
    fileSize: number
    fileContents: string
}

const traverseFileModel = z.object({
    fileName: z.string(),
    type: z.string(),
    executable: z.boolean(),
    lastModified: z.number(),
    canWrite: z.boolean(),
    fileSize: z.number(),
    fileContents: z.string()
})

const apiBaseEndPoint = '/grc/ext/NFR'
const listDirEndPoint = '/ListDir'
const handleFileChangeEndPoint = '/handleFileChange'
const executeShellEndPoint = '/executeShell'

function TraverseVM(): JSX.Element {

    const [traverseList, setTraverseList] = useState<ITraverseDir>({
        id: '0',
        fileName: 'Init state',
        type: 'dir',
        path: 'Init State',
        canWrite: false,
        executable: false,
        fileSize: 1234556,
        lastModified: 1234456,
        children: [],
    })

    const [windowHeight, setWindowHeight] = useState(window.innerHeight)
    const [isActiveSession, setIsActiveSession] = useState<boolean>(false)
    const [isConnectSessionOpen, setIsConnectSessionOpen] = useState<boolean>(false)
    const [isCopyFileFormOpen, setIsCopyFileFormOpen] = useState<boolean>(false)
    const [expandedNodeIds, setExpandedNodeIds] = useState<string[]>([])
    const [isSnackbarOpen, setIsSnackbarOpen] = useState<boolean>(false)
    const [fileFontSize, setFileFontSize] = useState<number>(14)
    const [isFileContentReadOnly, setIsFileContentReadOnly] = useState<boolean>(true)
    const [activeFilePath, setActiveFilePath] = useState<string>('')
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [isActionMenuOpen, setIsActionMenuOpen] = useState<boolean>(false)
    const [isFileActive, setIsFileActive] = useState<boolean>(false)
    const [currentFileAttributes, setCurrentFileAttributes] = useState<{path: string, executable: boolean, lastModified: number, canWrite: boolean, fileSize: number}>({
        path: '',
        executable: false,
        lastModified: 0,
        canWrite: false,
        fileSize: 0
    })
    const [selectedFileContentDisplayToolBarIndex, setSelectedFileContentDisplayToolBarIndex] = useState<number>(2)
    const currentQueryURL = useRef<string>('')
    const nodeId = useRef<number>(0)
    const snackbarPropertiesRef = useRef<IsnackbarProperties>({message: '', severity: "info"})
    const isClosingRef = useRef<boolean>(false)
    const testRef = useRef<HTMLDivElement>(null)
    const searchFilePath = useRef<string>('')
    const fileContent = useRef<string>('')
    const fileInputRef = useRef<HTMLTextAreaElement | null>(null)
    const activeDNSRef = useRef<string>('')
    const usernameRef = useRef<string>('')
    const passwordRef = useRef<string>('')
    const isFetchingDirData = useRef<boolean>(false)

    const renderedTree = useMemo(() => {
        return renderTree(traverseList)
    }, [traverseList])

    /*
    const { isLoading, data, error } = useQuery({
        queryKey: ['listDir'],
        queryFn: async () => {
            //const res = await axios.get('http://localhost:3500/items')
            //return await res.data
        },
        //enabled: isListDirAPIEnabled,
    })
    */

    async function setStageOnNewConnect(initialObject: ITraverseDir, initialPath: string, dns: string, username: string, password: string): Promise<void> {
        nodeId.current = 0
        try {
            activeDNSRef.current = dns
            usernameRef.current = username
            passwordRef.current = password
            const updatedProperties = await fetchDirData(initialPath)
            setTraverseList(updateObjectById(initialObject, '0', updatedProperties))
            fileContent.current = ''
            setIsFileActive(false)
            setIsActiveSession(true)
            setIsConnectSessionOpen(false)
            setExpandedNodeIds(['0'])
            handleSnackbarRequest({message: 'Successfully established connection to '+dns, severity: 'success'})
            //set is list dir enabled to true (if I decide to to react query)
        } catch (error) {
            handleSnackbarRequest({message: 'Failed to set the stage for: '+dns, severity: 'error'})
        }
    }

    function handleDeleteFile(): void {
        fileContent.current = ''
        if (fileInputRef.current){
            fileInputRef.current.value = ''
        }
        setIsFileActive(false)
    }
    
    useEffect(() => {
        window.addEventListener('resize', handleWindowResize)
        return () => {window.removeEventListener('resize', handleWindowResize)}
      }, [windowHeight]);
    
    useEffect(() => {
        setIsFileContentReadOnly(true)
        setSelectedFileContentDisplayToolBarIndex(2)
    }, [activeFilePath, isFileActive])

    function handleWindowResize(): void {
        setWindowHeight(window.innerHeight)
        console.log(window.innerHeight)
    }

    async function handleTraverseClick(node: ITraverseDir): Promise<void> {
        if (node.type == 'dir') {
            const expandedNodeIndex = expandedNodeIds.indexOf(node.id)
            if (expandedNodeIndex >= 0) {
                const updatedProperties = {children: []}
                // Sleep are so that animation can take place, 500ms is what the animation is set to. This allows time for it to complete smoothly
                // Is closing checks are in place to prevent fetching if user quickly closes and re opens a folder - prevents race conditions now that animation sleeps are in place.
                // Make improvement in that when a user quickly closes and opens a DIR, refresh that DIR with the latest data regardless, or even better, have a refresh button next to DIRs
                if (expandedNodeIndex > 0) {
                    console.log('made it into the > 0 section')
                    isClosingRef.current = true
                    //await unsetExpandedDirs(node, expandedNodeIds)
                    await new Promise(resolve => setTimeout(resolve, 500))
                    if (isClosingRef.current) {
                        setTraverseList(updateObjectById(traverseList, node.id, updatedProperties))
                        isClosingRef.current = false
                    }
                } else {
                    isClosingRef.current = true
                    //await unsetAllExpandedDirs()
                    await new Promise(resolve => setTimeout(resolve, 500))
                    if (isClosingRef.current) {
                        console.log('I am executing this block of code!!!')
                        setTraverseList(updateObjectById(traverseList, node.id, updatedProperties))
                        isClosingRef.current = false
                    }
                }
            } else {
                try {
                    if (!isClosingRef.current) {
                        const updatedProperties = await fetchDirData(node.path)
                        setTraverseList(updateObjectById(traverseList, node.id, updatedProperties))
                        //setExpandedDirs(node)
                    } else {
                        console.log("unsetting the closure!!")
                        isClosingRef.current = false
                        //setExpandedDirs(node)
                    }
                } catch (error) {
                    console.log('Error fetching and setting clicked DIR!')
                    return
                }
            }
        } else {
            try {
                const data = await fetchFileData(node.path)
                fileContent.current = data.fileContents
                if (fileInputRef.current){
                    fileInputRef.current.value = data.fileContents
                }
                setIsFileActive(true)
                setCurrentFileAttributes({path: node.path, canWrite: node.canWrite, executable: node.executable, fileSize: node.fileSize, lastModified: node.lastModified})
                setActiveFilePath(node.path)
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
            console.log('Setting expanded DIRs')
            console.log(expandedNodes)
            setExpandedNodeIds(expandedNodes)
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
                const someArray: ITraverseDir[] = data.map(object => {
                    ++nodeId.current
                    return {...object, id: nodeId.current.toString(), path: parentPath+'/'+object.fileName , children: []}
                })
                const returnObject = {children: [...someArray]}
                return returnObject
            } catch (error) {
                console.log('JSON PARSING ERROR!!!')
                handleSnackbarRequest({message: 'Unable to fetch data for '+url+'\n\nJSON Parsing Error! Data returned did not match expected type.', severity:'error'})
                throw Error
            }
        } catch (error) {
            handleSnackbarRequest({message: 'Unable to fetch data for '+url, severity:'error'})
            throw Error
        }
    }

    async function fetchFileData(parentPath: string): Promise<ITraverseFileModel> {
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
                traverseFileModel.parse(data)
                return data as ITraverseFileModel
            } catch (error) {
                console.log('Error passing file data as string')
                handleSnackbarRequest({message: 'Error when parsing returned data to string. Ensure fetch is requesting a file and not a DIR', severity: 'error'})
                throw Error
            }
        } catch (error) {
            console.log("Error fetching data for the URL: "+url)
            handleSnackbarRequest({message: 'Error fetching data for the address: '+url, severity: 'error'})
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

    function getObjectById(obj: ITraverseDir, idToGet: string): ITraverseDir | undefined {

        if (obj.id === idToGet) {
            return obj
        } 
        
        if (obj.children) {
            for (const child of obj.children) {
                const result = getObjectById(child, idToGet);
                if (result) {
                    return result;
                }
            }
        }
        return undefined;
    }

    function renderTree(nodes: ITraverseDir): JSX.Element {
        return (
        <>
        {nodes.type === 'file' ?
        <TreeItem itemId={nodes.id} key={nodes.id} label={nodes.fileName} onClick={() => handleTraverseClick(nodes)} />
        :
        <TreeItem itemId={nodes.id} key={nodes.id} label={nodes.fileName} >
            {Array.isArray(nodes.children) ? nodes.children.map((node) => renderTree(node)) : null}
            {nodes.type == 'dir' && nodes.children.length < 1 && <TreeItem itemId={nodes.id+"expandable"} key={nodes.id+"expandable"} label="Loading..."></TreeItem>}
        </TreeItem>
        }
        </>
        )
    }

    function handleSnackbarRequest(snackbarProperties: IsnackbarProperties): void {
        snackbarPropertiesRef.current = snackbarProperties
        setIsSnackbarOpen(true)
    }

    function handleFileContentToolbarClick(item: string, i: number): void {
        // handle each action with the appropriate additional screen or API call.
        switch(item) {
            case 'Increase Font Size':
                setFileFontSize(fileFontSize+2)
                break;
            case 'Decrease Font Size':
                if (fileFontSize > 2) {
                    setFileFontSize(fileFontSize-2)
                } else {
                    handleSnackbarRequest({message: 'How can you read the text if it has no positive size! :)', severity: 'info'})
                }
                break;
            case 'Edit File':
                if (isFileContentReadOnly) {
                    setSelectedFileContentDisplayToolBarIndex(i)
                    setIsFileContentReadOnly(false)
                    handleSnackbarRequest({message: 'Editing file on local machine, remember to save if you want changes to persist', severity: 'info'})
                }
                break;
            case 'Lock File':
                if (!isFileContentReadOnly) {
                    setSelectedFileContentDisplayToolBarIndex(i)
                    setIsFileContentReadOnly(true)
                    handleSnackbarRequest({message: 'Content is now locked in current state for read only', severity: 'info'})
                }
                break;
        }
    }

    function handleQuickAction(type: string): void {
        switch (type) {
            case 'Save Contents':
                handleUpdateContents()
                break;
            case 'Refresh Contents':
                handleRefreshContents()
                break;
            case 'Copy Contents':
                handleCopyContent()
                break;
        }
    }

    async function handleUpdateContents(): Promise<void> {
        const url = activeDNSRef.current+apiBaseEndPoint+handleFileChangeEndPoint
        const apiOptions: IApiOptions = {
            method: 'POST',
            url: url,
            params: {path: currentFileAttributes.path, action: 'update', content: fileContent.current},
            auth: {username: usernameRef.current, password: passwordRef.current}
        }
        try {
            await ApiRequest(apiOptions)
            handleSnackbarRequest({message: 'Successfully saved the file', severity: 'success'})
        } catch (error) {
            handleSnackbarRequest({message: 'Failed to save the file', severity: 'error'})
        }
    }

    async function handleRefreshContents(): Promise<void> {
        try {
            const data = await fetchFileData(currentFileAttributes.path)
            setCurrentFileAttributes({...currentFileAttributes, canWrite: data.canWrite, executable: data.executable, fileSize: data.fileSize, lastModified: data.lastModified})
            fileContent.current = data.fileContents
            if (fileInputRef.current){
                fileInputRef.current.value = data.fileContents
            }
            handleSnackbarRequest({message: 'Refreshed contents!', severity: 'info'})
        } catch (error) {
            handleSnackbarRequest({message: 'Failed to refresh contents!', severity: 'error'})
        }
    }

    function handleCopyContent(): void {
        navigator.clipboard.writeText(fileContent.current)
        handleSnackbarRequest({message: 'Copied File Contents To Clipboard!', severity: 'info'})
    }

    async function handleSearchFile(e: string): Promise<void> {
        if (e === 'Enter') {
            let newURL = ''
            newURL = searchFilePath.current
            try {
                const data = await fetchFileData(newURL)
                fileContent.current = data.fileContents
                if (fileInputRef.current){
                    fileInputRef.current.value = data.fileContents
                }
                // Amend API so that it returns an object of information as well as the content
                setActiveFilePath(searchFilePath.current)
                setIsFileActive(true)
                setIsFileContentReadOnly(true)
                handleSnackbarRequest({message: 'Fetched data for: '+searchFilePath.current, severity: 'success'})
            } catch (error) {
                return
            }
        }
    }

    function handleResizer(): void {
        console.log('Inside risizer!')
        if (testRef.current){
            console.log('Current width: '+testRef.current.getBoundingClientRect().width)
            testRef.current.style.width = '100px'
            console.log('Post change width: '+testRef.current.getBoundingClientRect().width)
        }
    }

    function handleActionMenuClose(): void {
        setAnchorEl(null);
        setIsActionMenuOpen(false);
    }

    function handleActionMenuOpen(event: React.MouseEvent<HTMLButtonElement>): void {
        setAnchorEl(event.currentTarget);
        setIsActionMenuOpen(true);
    }

    function getLocalTime(epoch: number): string {
        const date = new Date(epoch)
        return date.toLocaleString()
    }

    function handleItemExpansion(event: React.SyntheticEvent, itemId: string[]): void {
        //somehow delay this so that updates are made to model prior to rendering tree
        setExpandedNodeIds(itemId)
    }

    function handleItemExpansionToggle(event: React.SyntheticEvent, itemId: string): void {
        const traverseObject = getObjectById(traverseList, itemId)

        if (traverseObject) {
            handleTraverseClick(traverseObject);
        }
    }

    function isExpandingCheck(arr1: string[], arr2: string[]): boolean {
        const difference = arr2.filter(item => !arr1.includes(item))
        if (difference.length > 0) {
            return true
        }
        return false
    }
    
    console.log('TraverseVM has been refreshed!')

    return (
        <>
            <CustomSnackbar isSnackbarOpen={isSnackbarOpen} setIsSnackbarOpen={setIsSnackbarOpen} snackbarProperties={snackbarPropertiesRef.current} />
            <ConnectSessionForm isConnectSessionOpen={isConnectSessionOpen} setIsConnectSessionOpen={setIsConnectSessionOpen} setStageOnNewConnect={setStageOnNewConnect}/>
            <Box boxShadow={8} borderRadius={'10px'} p={1} top={0} bottom={0} display={'inline-flex'} flexDirection={'row'} width={'100%'} height={windowHeight-110}>
                <Box height={'100%'} maxWidth={'40%'} minWidth={'20%'}>
                    <Box height={'36px'} display={'flex'} flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'} marginBottom={'4px'}>
                        <Typography fontSize={'18px'}>Traverse VM 2.0</Typography>
                        <Tooltip title={'Connect Session'}>
                            <IconButton size="small" onClick={() => setIsConnectSessionOpen(true)}>
                                <LaptopIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                    <Divider />
                    <Box sx={{backgroundColor: 'background.default', marginTop: '10px'}} height={windowHeight-170} overflow={'auto'} whiteSpace={'nowrap'}>
                        {isActiveSession ?
                        <>
                            <Box display={"inline-flex"} flexDirection={'row'} alignContent={'center'} alignItems={'center'} height={'40px'} sx={{width: '100%'}} paddingLeft={'4px'} paddingRight={'4px'}>
                                <LaptopIcon sx={{marginRight: '12px'}}/>
                                <Typography fontSize={'16px'}>{activeDNSRef.current}</Typography>
                            </Box>
                            <SimpleTreeView expandedItems={expandedNodeIds} onExpandedItemsChange={handleItemExpansion} onItemExpansionToggle={handleItemExpansionToggle} >
                                {renderedTree}
                            </SimpleTreeView>
                        </>
                        :
                        <Button endIcon={<LaptopIcon/>} variant="contained" fullWidth onClick={() => setIsConnectSessionOpen(true)}>Connect Session</Button>
                        }
                    </Box>
                </Box>
                <Box height={'100%'} width={'100%'}>
                    <Box maxHeight={'34px'} display={'inline-flex'} flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'} marginBottom={'6px'} width={'100%'}>
                        <Box display={'inline-flex'} flexDirection={'row'} alignItems={'center'} height={'34px'} flexGrow={1}>
                            {fileContentDisplayToolBar.map((item, i) => (
                                <Tooltip title={item.title} key={i}>
                                    <IconButton size="small" onClick={() => handleFileContentToolbarClick(item.title, i)} disabled={!isFileActive} sx={ i==selectedFileContentDisplayToolBarIndex ? { backgroundColor: 'primary.light' } : {}}>
                                        {<item.icon/>}
                                    </IconButton>
                                </Tooltip>
                            ))}
                            <Divider flexItem orientation="vertical" sx={{height:'32px', marginLeft: '6px'}}/>
                            <TextField placeholder="/search/directly/for/file" disabled={!isActiveSession} size={"small"} InputProps={{style: {fontSize: 18}, disableUnderline: true}} sx={{marginLeft: '12px', marginRight: '12px'}} variant="standard" fullWidth onKeyDown={e => handleSearchFile(e.key)} onChange={e => searchFilePath.current = e.target.value}/>
                        </Box>
                        <Box display={'inline-flex'} flexDirection={'row'} alignItems={'center'}>
                            <TVM_ActionMenu traverseListDetails={{traverseList: traverseList, expandedNodeIds: expandedNodeIds, nodeId: nodeId.current}} anchorEl={anchorEl} apiConnectionDetails={{dns: activeDNSRef.current+apiBaseEndPoint, executeFileEndPoint: executeShellEndPoint, handleFileEndPoint: handleFileChangeEndPoint, listDirEndPoint: listDirEndPoint, username: usernameRef.current, password: passwordRef.current}} currentFileAttributes={currentFileAttributes} fileContent={fileContent.current} handleActionMenuClose={handleActionMenuClose} handleActionMenuOpen={handleActionMenuOpen} handleSnackbarRequest={handleSnackbarRequest} handleDeleteFile={handleDeleteFile} setCurrentFileAttributes={setCurrentFileAttributes} setActiveFilePath={setActiveFilePath} isActionMenuDisabled={isFileActive} isActionMenuOpen={isActionMenuOpen}/>
                        </Box>
                    </Box>
                    <Divider />
                    <Box sx={{ backgroundColor: 'primary.dark', marginTop: '10px', borderRadius: '0px 0px 10px 0px', overflowY: 'hidden'}} height={windowHeight-176} p={1} width={'100%'} position='relative'>
                        {fileContent.current != '' &&
                            <>
                                <Box display={'inline-flex'} flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'} flexGrow={1} width={'100%'} marginBottom={'10px'}>
                                    <Typography>{activeFilePath}</Typography>
                                    <Box>
                                        {fileQuickActions.map((value, i) => (
                                            <Tooltip title={value.title} key={i}>
                                                <IconButton onClick={() => handleQuickAction(value.title)}>
                                                    {<value.icon/>}
                                                </IconButton>
                                            </Tooltip>
                                        ))}
                                    </Box>
                                </Box>
                                <Box onClick={() => document.getElementById('file-content')?.focus()} marginBottom={'6px'} height={windowHeight-270} overflow={'auto'} sx={{backgroundColor: 'background.consoleBlack', cursor: 'text'}} borderRadius={'10px'} p={1}>
                                    <TextField id='file-content' sx={{height: '100%'}} variant="standard" InputProps={{style: {fontSize: fileFontSize}, readOnly: isFileContentReadOnly, disableUnderline: true}} size={"small"} defaultValue={fileContent.current} inputRef={fileInputRef} fullWidth multiline onChange={e => fileContent.current = e.target.value}/>
                                </Box>
                                <Box display={"inline-flex"} flexDirection={'row'} justifyContent={'space-between'} sx={{width: '100%'}}>
                                    <Typography>Last Modified: {getLocalTime(currentFileAttributes.lastModified)}</Typography>
                                    <Typography>File Size: {currentFileAttributes.fileSize} Bytes</Typography>
                                </Box>
                            </>
                        }
                    </Box>
                </Box>
            </Box>
        </>
    )
}

export default TraverseVM;