import { ChevronRight, ExpandMore } from "@mui/icons-material";
import { Box, Divider, IconButton, Typography } from "@mui/material";
import { TreeItem, TreeView } from "@mui/x-tree-view";
import { useEffect, useRef, useState } from "react";
import SaveIcon from '@mui/icons-material/Save';

interface ITraverseDir {
    id: string;
    fileName: string;
    type: string;
    children?: ITraverseDir[];
}

// Each item will be mapped to a key, that key corresponds to the position in the listDir array of objects
// Once a DIR is selected to be expanded, the API will take the filename from the index of the objects and use this in the query
// Handle the response by handling the array of returned IListDir objects and add them into the appropaite child array
// When the component is refreshed following this state change it should re-index and the process continues
// Ensure to not re-fetch if the user clicks on an already expanded folder, however, this is okay to refrech after closing and re-opening

// In future, will need to build and handle API requests for file clicks to fetch and return file data into second div / view panel

const dummyData = [
    {fileName: 'someDir', type: 'dir'},
    {fileName: 'some other dir', type: 'dir'},
    {fileName: 'some file', type: 'file'},
    {fileName: 'some extra dir', type: 'dir'}
]

const dummyFileData = 'doadwdwhfwqfnwefbwedbfwqifdwdwmdomwodmwdm'

function TraverseVM(): JSX.Element {

    const [traverseList, setTraverseList] = useState<ITraverseDir>({
        id: '0', fileName: 'root', type: 'dir', children:[
            {id: '1', fileName: 'LogFiles', type: 'dir', children: [
                {id: '2', fileName: 'nested folder', type: 'dir', children: [
                    {id: '3', fileName: 'Deeply nested file', type: 'file'}
                ]}
            ]},
            {id: '4', fileName: 'scripts', type: 'dir', children: []},
            {id: '5', fileName: 'startAllServers.sh', type: 'file'},
            {id: '6', fileName: 'testing space', type: 'dir', children: []}
        ]
    })
    const [fileContent, setFileContent] = useState<string>('')
    const nodeId = useRef<number>(6)
    const expandedNodeIds = useRef<string[]>([])
    const [windowHeight, setWindowHeight] = useState(window.innerHeight)

    useEffect(() => {
        window.addEventListener('resize', handleWindowResize)
        return () => {window.removeEventListener('resize', handleWindowResize)}
      }, [windowHeight]);

    function handleWindowResize(): void {
        setWindowHeight(window.innerHeight)
        console.log(window.innerHeight)
    }

    function handleTraverseClick(node: ITraverseDir): void {
        if (node.type == 'dir') {
            const expandedNodeIndex = expandedNodeIds.current.indexOf(node.id)
            console.log(expandedNodeIds.current.indexOf(node.id))
            if (expandedNodeIndex >= 0) {
                if (expandedNodeIndex > 0) {
                    unsetExpandedDirs(node)
                } else {
                    expandedNodeIds.current = []
                }
            } else {
                expandedNodeIds.current.push(node.id)
            }
            const updatedProperties = fetchDirData()
            setTraverseList(updateObjectById(traverseList, node.id, updatedProperties))
        } else {
            setFileContent(fetchFileData())
        }
    }

    function unsetExpandedDirs(node: ITraverseDir): void {
        const expandedNodesIndex = expandedNodeIds.current.indexOf(node.id)
        if (expandedNodesIndex >= 0) {
            expandedNodeIds.current.splice(expandedNodesIndex, expandedNodesIndex)
        }
        if (node.children != undefined) {
            for (let i = 0; i < node.children.length; ++i) {
                unsetExpandedDirs(node.children[i])
            }
        }
    }

    function fetchDirData(): object {
        const someArray: ITraverseDir[] = dummyData.map(object => {
            ++nodeId.current
            return object.type == 'dir' ? {...object, id: nodeId.current.toString(), children: []} : {...object, id: nodeId.current.toString()} 
        })
        const returnObject = {children: [...someArray]}
        return returnObject
    }

    function fetchFileData(): string {
        return dummyFileData
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
        <TreeItem key={nodes.id} nodeId={nodes.id} label={nodes.fileName} onClick={() => handleTraverseClick(nodes)} icon={nodes.type == 'dir' && !expandedNodeIds.current.includes(nodes.id) && <ChevronRight color="secondary"/>} >
            {Array.isArray(nodes.children) ? nodes.children.map((node) => renderTree(node)) : null}
        </TreeItem>
    )}
    
    console.log('TraverseVM has been refreshed!')

    return (
        <>
            <Box boxShadow={8} borderRadius={'10px'} p={1} top={0} bottom={0} display={'inline-flex'} flexDirection={'row'} width={'100%'} height={windowHeight-110}>
                <Box height={'100%'} maxWidth={'40%'} minWidth={'20%'}>
                    <Box height={'36px'} display={'flex'} alignItems={'center'} marginBottom={'4px'}>
                        <Typography fontSize={'18px'}>Traverse VM</Typography>
                    </Box>
                    <Divider />
                    <Box sx={{backgroundColor: 'background.default', marginTop: '10px'}} height={windowHeight-170} overflow={'auto'} whiteSpace={'nowrap'}>
                        <TreeView defaultExpandIcon={<ChevronRight color="secondary"/>} defaultCollapseIcon={<ExpandMore color="secondary"/> } expanded={expandedNodeIds.current}>
                            {renderTree(traverseList)}
                        </TreeView>
                    </Box>
                </Box>
                <Box sx={{ marginRight: '4px', marginLeft: '4px' }} />
                <Box height={'100%'} width={'100%'}>
                    <Box maxHeight={'36px'} display={'inline-flex'} flexDirection={'row'} justifyContent={'end'} alignItems={'center'} marginBottom={'6px'} width={'100%'}>
                        <IconButton size="small">
                            <SaveIcon />
                        </IconButton>
                    </Box>
                    <Divider />
                    <Box sx={{ backgroundColor: 'primary.dark', marginTop: '10px', borderRadius: '0px 0px 10px 0px'}} height={windowHeight-176} p={1} width={'100%'}>
                        <Typography sx={{wordBreak: 'break-word'}}>{fileContent}</Typography>
                    </Box>
                </Box>
            </Box>
        </>
    )
}

export default TraverseVM;