import { Button, ListItemIcon, ListItemText, Menu, MenuItem, SvgIconTypeMap } from "@mui/material"
import IApiOptions from "../../interfaces/IApiOptions"
import ApiRequest from "../../utils/apiRequest"
import CopyFileForm from "./ActionMenuForms/CopyFileForm"
import IsnackbarProperties from "../../interfaces/IsnackbarProperties"
import FileCopyIcon from '@mui/icons-material/FileCopy';
import DescriptionIcon from '@mui/icons-material/Description';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import TerminalIcon from '@mui/icons-material/Terminal';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { OverridableComponent } from "@mui/material/OverridableComponent"
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useRef, useState } from "react"
import ITraverseDir from "../../interfaces/ITraverseDir"
import RenameFileForm from "./ActionMenuForms/RenameFileForm"
import CreateNewFileForm from "./ActionMenuForms/CreateNewFileForm"
import ExecuteFileForm from "./ActionMenuForms/ExecuteFileForm"
import ConfirmationDialog from "../ConfirmationDialog"

interface ITVM_ActionMenu {
    traverseListDetails: {traverseList: ITraverseDir, expandedNodeIds: string[], nodeId: number}
    fileContent: string
    currentFileAttributes: {path: string, executable: boolean, lastModified: number, canWrite: boolean, fileSize: number}
    isActionMenuDisabled: boolean
    isActionMenuOpen: boolean
    anchorEl: null | HTMLElement
    handleDeleteFile(): void
    setCurrentFileAttributes: React.Dispatch<React.SetStateAction<{path: string;executable: boolean, lastModified: number, canWrite: boolean, fileSize: number}>>
    handleActionMenuClose(): void
    handleActionMenuOpen(event: React.MouseEvent<HTMLButtonElement>): void
    handleSnackbarRequest(snackbarProperties: IsnackbarProperties): void
    setActiveFilePath: React.Dispatch<React.SetStateAction<string>>
    apiConnectionDetails: {dns: string, handleFileEndPoint: string, executeFileEndPoint: string, listDirEndPoint: string, username: string, password: string}
}

const actionMenuOptions: { itemName: string, action: string, icon: OverridableComponent<SvgIconTypeMap<object, "svg">> & { muiName: string;} }[] = [
    {itemName: 'Save', action: 'update', icon: SaveIcon},
    {itemName: 'Copy', action: 'copy', icon: FileCopyIcon},
    {itemName: 'Rename', action: 'rename', icon: DescriptionIcon},
    {itemName: 'Create New File', action: 'create new file', icon: NoteAddIcon},
    {itemName: 'Set Executable', action: 'set executable', icon: TerminalIcon},
    {itemName: 'Run Script', action: 'run script', icon: PlayArrowIcon},
    {itemName: 'Delete', action: 'delete', icon: DeleteIcon},
];

function TVM_ActionMenu(props: ITVM_ActionMenu): JSX.Element {
    const dns = props.apiConnectionDetails.dns
    const handleFileEndPoint = props.apiConnectionDetails.handleFileEndPoint
    const executeFileEndPoint = props.apiConnectionDetails.executeFileEndPoint
    const listDirEndPoint = props.apiConnectionDetails.listDirEndPoint
    const username = props.apiConnectionDetails.username
    const password = props.apiConnectionDetails.password
    const isActionMenuOpen = props.isActionMenuOpen
    const isActionMenuDisabled = props.isActionMenuDisabled
    const anchorEl = props.anchorEl
    const currentFileAttributes = props.currentFileAttributes
    const fileContent = props.fileContent

    const [isCopyFileFormOpen, setIsCopyFileFormOpen] = useState<boolean>(false)
    const [isRenameFileFormOpen, setIsRenameFileFormOpen] = useState<boolean>(false)
    const [isCreateNewFileFormOpen, setIsCreateNewFileFormOpen] = useState<boolean>(false)
    const [isExecuteFileFormOpen, setIsExecuteFileFormOpen] = useState<boolean>(false)
    const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState<boolean>(false)
    const confirmationDialogMessage = useRef<string>('')
    const confirmationAction = useRef<string>('')

    function handleActionMenuClose(): void {
        props.handleActionMenuClose()
    }

    function handleActionMenuOpen(event: React.MouseEvent<HTMLButtonElement>): void {
        props.handleActionMenuOpen(event)
    }

    async function handleActionMenuRequest(action: string): Promise<void> {
        handleActionMenuClose()
        const url  = dns+handleFileEndPoint
        switch(action) {
            case 'update': {
                const apiOptions: IApiOptions = {
                    method: 'POST',
                    url: url,
                    params: {path: currentFileAttributes.path, action: 'update', content: fileContent},
                    auth: {username: username, password: password}
                }
                try {
                    await ApiRequest(apiOptions)
                    props.handleSnackbarRequest({message: 'Successfully saved the file', severity: 'success'})
                } catch (error) {
                    props.handleSnackbarRequest({message: 'Failed to save the file', severity: 'error'})
                }
                break
            }
            case 'copy': {
                setIsCopyFileFormOpen(true)
                break
            }
            case 'rename': {
                setIsRenameFileFormOpen(true)
                // set the file prop to new name
                break
            }
            case 'create new file': {
                setIsCreateNewFileFormOpen(true)
                break
            }
            case 'set executable': {
                confirmationDialogMessage.current = 'You are about to GRANT EXECUTE PERMISSIONS to the following file: '+currentFileAttributes.path
                confirmationAction.current = 'executable'
                setIsConfirmationDialogOpen(true)
                break
            }
            case 'run script': {
                setIsExecuteFileFormOpen(true)
                break
            }
            case 'delete': {
                confirmationDialogMessage.current = 'You are about to DELETE the following file: '+currentFileAttributes.path
                confirmationAction.current = 'delete'
                setIsConfirmationDialogOpen(true)
                break
            }
        }
    }

    async function deleteFile(): Promise<void> {
        const url  = dns+handleFileEndPoint
        const apiOptions: IApiOptions = {
            method: 'POST',
            url: url,
            params: {path: currentFileAttributes.path, action: 'delete'},
            auth: {username: username, password: password}
        }
        try {
            await ApiRequest(apiOptions)
            props.handleDeleteFile()
            props.handleSnackbarRequest({message: 'Successfully deleted the file', severity: 'success'})
        } catch (error) {
            props.handleSnackbarRequest({message: 'Failed to delete the file', severity: 'error'})
        }
    }

    async function setExecutable(): Promise<void> {
        const url  = dns+handleFileEndPoint
        const apiOptions: IApiOptions = {
            method: 'POST',
            url: url,
            params: {path: currentFileAttributes.path, action: 'executable'},
            auth: {username: username, password: password}
        }
        try {
            await ApiRequest(apiOptions)
            props.setCurrentFileAttributes({...currentFileAttributes, executable: true})
            props.handleSnackbarRequest({message: 'Successfully set file as executable', severity: 'success'})
        } catch (error) {
            props.handleSnackbarRequest({message: 'Failed to set file as executable', severity: 'error'})
        }
    }

    console.log('TVM_ActionMenu refreshed!')

    return (
        <>
            <Button variant="contained" endIcon={<ArrowDropDownIcon />} disabled={!isActionMenuDisabled} sx={{ textTransform: 'none', marginLeft: '6px', marginBottom: '6px' }} onClick={handleActionMenuOpen}>Actions</Button>
            <Menu id="basic-menu" transformOrigin={{vertical: 'top', horizontal: 'right'}} anchorOrigin={{vertical: 'bottom', horizontal: 'right'}} anchorEl={anchorEl} open={isActionMenuOpen} onClose={handleActionMenuClose}>
                {actionMenuOptions.map((value, i) => (
                    <MenuItem key={i} onClick={() => handleActionMenuRequest(value.action)} disabled={(value.itemName != 'Create New File' && !props.currentFileAttributes.canWrite) || (value.itemName == 'Run Script' && !props.currentFileAttributes.executable)}>
                        <ListItemIcon>
                            {<value.icon fontSize='medium'/>}
                        </ListItemIcon>
                        <ListItemText sx={{ height: '20px' }} primaryTypographyProps={{ fontSize: '14px' }}>{value.itemName}</ListItemText>
                    </MenuItem>
                ))}
            </Menu>
            { isCopyFileFormOpen &&
                <CopyFileForm traverseListDetails={props.traverseListDetails} apiConnectionDetails={{dns: dns, endPoint: handleFileEndPoint, listDirEndPoint: listDirEndPoint, username: username, password: password}} isCopyFileFormOpen={isCopyFileFormOpen} setIsCopyFileFormOpen={setIsCopyFileFormOpen} sourceFilePath={currentFileAttributes.path} handleSnackbarRequest={props.handleSnackbarRequest}/>
            }
            { isRenameFileFormOpen &&
                <RenameFileForm traverseListDetails={props.traverseListDetails} apiConnectionDetails={{dns: dns, endPoint: handleFileEndPoint, listDirEndPoint: listDirEndPoint, username: username, password: password}} isRenameFileFormOpen={isRenameFileFormOpen} setIsRenameFileFormOpen={setIsRenameFileFormOpen} currentFileAttributes={currentFileAttributes} setCurrentFileAttributes={props.setCurrentFileAttributes} handleSnackbarRequest={props.handleSnackbarRequest} setActiveFilePath={props.setActiveFilePath}/>
            }
            { isCreateNewFileFormOpen &&
                <CreateNewFileForm traverseListDetails={props.traverseListDetails} apiConnectionDetails={{dns: dns, endPoint: handleFileEndPoint, listDirEndPoint: listDirEndPoint, username: username, password: password}} isCreateNewFileFormOpen={isCreateNewFileFormOpen} setIsCreateNewFileFormOpen={setIsCreateNewFileFormOpen} sourceFilePath={currentFileAttributes.path} handleSnackbarRequest={props.handleSnackbarRequest}/>
            }
            { isExecuteFileFormOpen &&
                <ExecuteFileForm apiConnectionDetails={{dns: dns, endPoint: executeFileEndPoint, username: username, password: password}} isExecuteFileFormOpen={isExecuteFileFormOpen} setIsExecuteFileFormOpen={setIsExecuteFileFormOpen} sourceFilePath={currentFileAttributes.path} handleSnackbarRequest={props.handleSnackbarRequest}/>
            }
            { isConfirmationDialogOpen && confirmationAction.current == 'delete' &&
                <ConfirmationDialog onConfirmAction={deleteFile} confirmationDialogMessage={confirmationDialogMessage.current} isConfirmationDialogOpen={isConfirmationDialogOpen} setIsConfirmationDialogOpen={setIsConfirmationDialogOpen}/>
            }
            { isConfirmationDialogOpen && confirmationAction.current == 'executable' &&
                <ConfirmationDialog onConfirmAction={setExecutable} confirmationDialogMessage={confirmationDialogMessage.current} isConfirmationDialogOpen={isConfirmationDialogOpen} setIsConfirmationDialogOpen={setIsConfirmationDialogOpen}/>
            }
        </>
    )
}

export default TVM_ActionMenu