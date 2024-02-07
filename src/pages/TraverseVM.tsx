import { ChevronRight, ExpandMore } from "@mui/icons-material";
import { Alert, Box, Button, Divider, IconButton, Snackbar, SvgIconTypeMap, TextField, Tooltip, Typography } from "@mui/material";
import { TreeItem, TreeView } from "@mui/x-tree-view";
import { useEffect, useRef, useState } from "react";
import SaveIcon from '@mui/icons-material/Save';
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import LaptopIcon from '@mui/icons-material/Laptop';
import ConnectSessionForm from "../components/ConnectSessionForm";
import ITraverseDir from "../interfaces/ITraverseDir";
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import TextIncreaseIcon from '@mui/icons-material/TextIncrease';
import TextDecreaseIcon from '@mui/icons-material/TextDecrease';
import FormatSizeIcon from '@mui/icons-material/FormatSize';
import LockIcon from '@mui/icons-material/Lock';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import {string, z} from 'zod'
import IsnackbarProperties from "../interfaces/IsnackbarProperties";
import CustomSnackbar from "../components/CustomSnackbar";
import { OverridableComponent } from "@mui/material/OverridableComponent";

const fileContentDisplayToolBar: {title: string, icon: OverridableComponent<SvgIconTypeMap<object, "svg">> & { muiName: string;}}[] = ([
    {title: 'Decrease Font Size', icon: TextDecreaseIcon},
    {title: 'Increase Font Size', icon: TextIncreaseIcon},
    {title: 'Lock File', icon: LockIcon},
    {title: 'Edit File', icon: EditIcon}
])

const fileContentActionToolBar = [
    {title: 'Save File', icon: SaveIcon},
    {title: 'Delete File', icon: DeleteForeverIcon}
]

const traverseDirModel = z.object({
    fileName: z.string(),
    type: z.string(),
})
const traversDirModels = z.array(traverseDirModel)

const traverseFileModel = z.string()

function TraverseVM(): JSX.Element {

    const [traverseList, setTraverseList] = useState<ITraverseDir>({
        id: '0',
        fileName: 'Init state',
        type: 'dir',
        path: 'Init State',
        children: [],
    })

    /*const fileContentDisplayToolBar = [
        {title: 'Decrease Font Size', icon: TextDecreaseIcon},
        {title: 'Increase Font Size', icon: TextIncreaseIcon},
        {title: 'Lock Content', icon: LockIcon}
    ] */
    const [fileContent, setFileContent] = useState<string>('')
    const [windowHeight, setWindowHeight] = useState(window.innerHeight)
    const [isListDirAPIEnabled, setIsListDirAPIEnabled] = useState<boolean>(false)
    const [isActiveSession, setIsActiveSession] = useState<boolean>(false)
    const [isConnectSessionOpen, setIsConnectSessionOpen] = useState<boolean>(false)
    const nodeId = useRef<number>(0)
    const [expandedNodeIds, setExpandedNodeIds] = useState<string[]>([])
    const currentQueryPath = useRef<string>('')
    const currentQueryURL = useRef<string>('')
    const [isSnackbarOpen, setIsSnackbarOpen] = useState<boolean>(false)
    const isClosingRef = useRef<boolean>(false)
    const snackbarPropertiesRef = useRef<IsnackbarProperties>({message: '', severity: "info"})
    const [activeDns, setActiveDns] = useState<string>('')
    const [fileFontSize, setFileFontSize] = useState<number>(14)
    const [isFileContentReadOnly, setIsFileContentReadOnly] = useState<boolean>(true)
    const [activeFilePath, setActiveFilePath] = useState<string>('')
    const [searchFilePath, setSearchFilePath] = useState<string>('')


    const { isLoading, data, error } = useQuery({
        queryKey: ['listDir'],
        queryFn: async () => {
            const res = await axios.get('http://localhost:3500/items')
            return await res.data
        },
        enabled: isListDirAPIEnabled,
    })

    async function setStageOnNewConnect(initialObject: ITraverseDir, url: string, initialPath: string, dns: string): Promise<void> {
        nodeId.current = 0
        try {
            currentQueryURL.current = url
            currentQueryPath.current = initialPath
            const updatedProperties = await fetchDirData(initialPath)
            setTraverseList(updateObjectById(initialObject, '0', updatedProperties))
            setFileContent('')
            setIsActiveSession(true)
            setIsConnectSessionOpen(false)
            setExpandedNodeIds(['0'])
            setActiveDns(dns)
            handleSnackbarRequest({message: 'Successfully established connection to '+url, severity: 'success'})
            //set is list dir enabled to true (if I decide to to react query)
        } catch (error) {
            // handle error - use something like snackbar notification.
        }
    }

    console.log(data)

    useEffect(() => {
        window.addEventListener('resize', handleWindowResize)
        return () => {window.removeEventListener('resize', handleWindowResize)}
      }, [windowHeight]);

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
                if (expandedNodeIndex > 0) {
                    isClosingRef.current = true
                    await unsetExpandedDirs(node, expandedNodeIds)
                    await new Promise(resolve => setTimeout(resolve, 500))
                    if (isClosingRef.current) {
                        setTraverseList(updateObjectById(traverseList, node.id, updatedProperties))
                        isClosingRef.current = false
                    }
                } else {
                    isClosingRef.current = true
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
                setFileContent(await fetchFileData(node.path))
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
            setExpandedNodeIds(expandedNodes)
        }
    }

    async function fetchDirData(parentPath: string): Promise<object> {
        const newURL = currentQueryURL.current.replace(currentQueryPath.current, parentPath)
        //console.log('About to fetch: '+newURL)
        try {
            const data = await fetchData(new URL(newURL))
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
                handleSnackbarRequest({message: 'Unable to fetch data for '+newURL+'\n\nJSON Parsing Error! Data returned did not match expected type.', severity:'error'})
                throw Error
            }
        } catch (error) {
            handleSnackbarRequest({message: 'Unable to fetch data for '+newURL, severity:'error'})
            throw Error
        }
    }

    async function fetchFileData(parentPath: string): Promise<string> {
        const newURL = currentQueryURL.current.replace(currentQueryPath.current, parentPath)
        //console.log("About to fetch data for the path: "+newURL)
        try {
            const data = await fetchData(new URL(newURL)) as Promise<string>
            try {
                traverseFileModel.parse(data)
                return data
            } catch (error) {
                console.log('Error passing file data as string')
                handleSnackbarRequest({message: 'Error when parsing returned data to string. Ensure fetch is requesting a file and not a DIR', severity: 'error'})
                throw Error
            }
        } catch (error) {
            console.log("Error fetching data for the URL: "+newURL)
            handleSnackbarRequest({message: 'Error fetching data for the address: '+newURL, severity: 'error'})
            throw Error
        }
    }

    async function fetchData(url: URL): Promise<unknown> {
        try {
            const response = await axios.get(url.toString())
            return await response.data
        } catch (error) {
            console.log('error getting data')
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
        <TreeItem TransitionProps={{timeout: 500}} key={nodes.id} nodeId={nodes.id} label={nodes.fileName} onClick={() => handleTraverseClick(nodes)} icon={nodes.type == 'dir' && !expandedNodeIds.includes(nodes.id) && <ChevronRight color="secondary"/>} >
            {Array.isArray(nodes.children) ? nodes.children.map((node) => renderTree(node)) : null}
        </TreeItem>
    )}

    function handleSnackbarRequest(snackbarProperties: IsnackbarProperties): void {
        snackbarPropertiesRef.current = snackbarProperties
        setIsSnackbarOpen(true)
    }

    function handleFileContentToolbarClick(item: string): void {
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
                    setIsFileContentReadOnly(false)
                    handleSnackbarRequest({message: 'Editing file on local machine, remember to save if you want changes to persist', severity: 'info'})
                }
                break;
            case 'Lock File':
                if (!isFileContentReadOnly) {
                    setIsFileContentReadOnly(true)
                    handleSnackbarRequest({message: 'Content is now locked in current state for read only', severity: 'info'})
                }
                break;
        }
        console.log(item)
    }

    function handleCopyContent(): void {
        console.log('Copying content.....')
        console.log(fileContent)
        navigator.clipboard.writeText(fileContent)
        handleSnackbarRequest({message: 'Copied File Contents To Clipboard!', severity: 'info'})
    }

    async function handleFetchFile(e: string): Promise<void> {
        if (e === 'Enter') {
            console.log('You have hit the enter key!')
            let newURL = ''
            if (searchFilePath.charAt(0) == '/') {
                newURL = searchFilePath.substring(1, searchFilePath.length)
            } else {
                newURL = searchFilePath
            }
            try {
                const data = await fetchFileData(newURL)
                setFileContent(data)
                setActiveFilePath(searchFilePath)
                handleSnackbarRequest({message: 'Fetched data for: '+searchFilePath, severity: 'success'})
            } catch (error) {
                return
            }
        }
    }
    
    console.log('TraverseVM has been refreshed!')

    return (
        <>
            <CustomSnackbar isSnackbarOpen={isSnackbarOpen} setIsSnackbarOpen={setIsSnackbarOpen} snackbarProperties={snackbarPropertiesRef.current} />
            <ConnectSessionForm isConnectSessionOpen={isConnectSessionOpen} setIsConnectSessionOpen={setIsConnectSessionOpen} setStageOnNewConnect={setStageOnNewConnect}/>
            <Box boxShadow={8} borderRadius={'10px'} p={1} top={0} bottom={0} display={'inline-flex'} flexDirection={'row'} width={'100%'} height={windowHeight-110}>
                <Box height={'100%'} maxWidth={'40%'} minWidth={'20%'}>
                    <Box height={'36px'} display={'flex'} alignItems={'center'} marginBottom={'4px'}>
                        <Typography fontSize={'18px'}>Traverse VM</Typography>
                    </Box>
                    <Divider />
                    <Box sx={{backgroundColor: 'background.default', marginTop: '10px'}} height={windowHeight-170} overflow={'auto'} whiteSpace={'nowrap'}>
                        {isActiveSession &&
                        <>
                            <Box display={"inline-flex"} flexDirection={'row'} alignContent={'center'} alignItems={'center'} height={'40px'} sx={{width: '100%'}} paddingLeft={'4px'} paddingRight={'4px'}>
                                <LaptopIcon sx={{marginRight: '12px'}}/>
                                <Typography fontSize={'16px'}>{activeDns}</Typography>
                            </Box>
                            <TreeView defaultExpandIcon={<ChevronRight color="secondary"/>} defaultCollapseIcon={<ExpandMore color="secondary"/> } expanded={expandedNodeIds}>
                                {renderTree(traverseList)}
                            </TreeView>
                        </>
                        }
                        <Button endIcon={<LaptopIcon/>} variant="contained" fullWidth onClick={() => setIsConnectSessionOpen(true)}>Connect Session</Button>
                    </Box>
                </Box>
                <Box sx={{ marginRight: '4px', marginLeft: '4px' }} />
                <Box height={'100%'} width={'100%'}>
                    <Box maxHeight={'34px'} display={'inline-flex'} flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'} marginBottom={'6px'} width={'100%'}>
                        <Box display={'inline-flex'} flexDirection={'row'} alignItems={'center'} height={'34px'} flexGrow={1}>
                            {fileContentDisplayToolBar.map((item, i) => (
                                <Tooltip title={item.title} key={i}>
                                    <IconButton size="small" onClick={() => handleFileContentToolbarClick(item.title)} disabled={fileContent == ''}>
                                        {<item.icon/>}
                                    </IconButton>
                                </Tooltip>
                            ))}
                            <Divider flexItem orientation="vertical" sx={{height:'32px', marginLeft: '6px'}}/>
                            <TextField placeholder="/search/directly/for/file" disabled={!isActiveSession} size={"small"} InputProps={{style: {fontSize: 18}, disableUnderline: true}} sx={{marginLeft: '12px', marginRight: '12px'}} variant="standard" fullWidth onKeyDown={e => handleFetchFile(e.key)} onChange={e => setSearchFilePath(e.target.value)}/>
                        </Box>
                        <Box display={'inline-flex'} flexDirection={'row'} alignItems={'center'}>
                            {fileContentActionToolBar.map((item, i) => (
                                <Tooltip title={item.title} key={i}>
                                    <IconButton size="small" onClick={() => handleFileContentToolbarClick(item.title)} disabled={fileContent == ''}>
                                        {<item.icon/>}
                                    </IconButton>
                                </Tooltip>
                            ))}
                        </Box>
                    </Box>
                    <Divider />
                    <Box sx={{ backgroundColor: 'primary.dark', marginTop: '10px', borderRadius: '0px 0px 10px 0px', overflowY: 'scroll'}} height={windowHeight-176} p={1} width={'100%'}>
                        {fileContent != '' &&
                            <>
                                <Box display={'inline-flex'} flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'} flexGrow={1} width={'100%'} height={'42px'}>
                                    <Typography marginBottom={'8px'}>{activeFilePath}</Typography>
                                    <Tooltip title='Copy Content'>
                                        <IconButton size='small' onClick={handleCopyContent}>
                                            <ContentCopyIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                                <TextField inputProps={{style: {fontSize: fileFontSize}, readOnly: isFileContentReadOnly}} size={"small"} value={fileContent} fullWidth multiline onChange={e => setFileContent(e.target.value)} sx={{position: 'relative'}}/>
                            </>
                        }
                    </Box>
                </Box>
            </Box>
        </>
    )
}

export default TraverseVM;