import { Button, ListItemIcon, ListItemText, Menu, MenuItem, SvgIconTypeMap } from "@mui/material"
import IApiOptions from "../../interfaces/IApiOptions"
import ApiRequest from "../../utils/apiRequest"
import CopyFileForm from "./ActionMenuForms/CopyFileForm"
import FileCopyIcon from '@mui/icons-material/FileCopy';
import DescriptionIcon from '@mui/icons-material/Description';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import TerminalIcon from '@mui/icons-material/Terminal';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { OverridableComponent } from "@mui/material/OverridableComponent"
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useContext, useRef, useState } from "react"
import RenameFileForm from "./ActionMenuForms/RenameFileForm"
import CreateNewFileForm from "./ActionMenuForms/CreateNewFileForm"
import ExecuteFileForm from "./ActionMenuForms/ExecuteFileForm"
import ConfirmationDialog from "../Shared/ConfirmationDialog"
import { useSnackbar } from "../../contexts/SnackbarContext"
import APIConnectionContext from "../../contexts/APIConnectionContext";
import { FileAttributesContext } from "../../contexts/FileAttributesContext";

interface ITVM_ActionMenu {
    isActionMenuOpen: boolean
    anchorEl: null | HTMLElement
    handleDeleteFile(): void
    handleActionMenuClose(): void
    handleActionMenuOpen(event: React.MouseEvent<HTMLButtonElement>): void
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

export default function TVM_ActionMenu(props: ITVM_ActionMenu): JSX.Element {
    const apiConnectionContext = useContext(APIConnectionContext)
    const fileAttributesContext = useContext(FileAttributesContext)

    if (!apiConnectionContext || !fileAttributesContext) {
        throw new Error('Appropriate contexts must be supplied!')
    }

    const { activeDNSRef, usernameRef, passwordRef, apiBaseEndPoint, handleFileChangeEndPoint } = apiConnectionContext
    const { currentFileAttributes, setCurrentFileAttributes, fileContentRef, isFileActive } = fileAttributesContext
    
    const { openSnackbar } = useSnackbar();
    const isActionMenuOpen = props.isActionMenuOpen
    //const isActionMenuDisabled = props.isActionMenuDisabled
    const anchorEl = props.anchorEl

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
        const url  = activeDNSRef.current+apiBaseEndPoint+handleFileChangeEndPoint
        switch(action) {
            case 'update': {
                const apiOptions: IApiOptions = {
                    method: 'POST',
                    url: url,
                    params: {path: currentFileAttributes.path, action: 'update', content: fileContentRef.current},
                    auth: {username: usernameRef.current, password: passwordRef.current}
                }
                try {
                    await ApiRequest(apiOptions)
                    openSnackbar('Successfully saved the file', 'success')
                } catch (error) {
                    openSnackbar('Failed to save the file', 'error')
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
        const url  = activeDNSRef.current+apiBaseEndPoint+handleFileChangeEndPoint
        const apiOptions: IApiOptions = {
            method: 'POST',
            url: url,
            params: {path: currentFileAttributes.path, action: 'delete'},
            auth: {username: usernameRef.current, password: passwordRef.current}
        }
        try {
            await ApiRequest(apiOptions)
            props.handleDeleteFile()
            openSnackbar('Successfully deleted the file', 'success')
        } catch (error) {
            openSnackbar('Failed to delete the file', 'error')
        }
    }

    async function setExecutable(): Promise<void> {
        const url  = activeDNSRef.current+apiBaseEndPoint+handleFileChangeEndPoint
        const apiOptions: IApiOptions = {
            method: 'POST',
            url: url,
            params: {path: currentFileAttributes.path, action: 'executable'},
            auth: {username: usernameRef.current, password: passwordRef.current}
        }
        try {
            await ApiRequest(apiOptions)
            setCurrentFileAttributes({...currentFileAttributes, executable: true})
            openSnackbar('Successfully set file as executable', 'success')
        } catch (error) {
            openSnackbar('Failed to set file as executable', 'error')
        }
    }

    //console.log('TVM_ActionMenu refreshed!')

    return (
        <>
            <Button variant="contained" endIcon={<ArrowDropDownIcon />} disabled={!isFileActive} sx={{ textTransform: 'none', marginLeft: '6px', marginBottom: '6px' }} onClick={handleActionMenuOpen}>Actions</Button>
            <Menu id="basic-menu" transformOrigin={{vertical: 'top', horizontal: 'right'}} anchorOrigin={{vertical: 'bottom', horizontal: 'right'}} anchorEl={anchorEl} open={isActionMenuOpen} onClose={handleActionMenuClose}>
                {actionMenuOptions.map((value, i) => (
                    <MenuItem key={i} onClick={() => handleActionMenuRequest(value.action)} disabled={(value.itemName != 'Create New File' && !currentFileAttributes.canWrite) || (value.itemName == 'Run Script' && !currentFileAttributes.executable)}>
                        <ListItemIcon>
                            {<value.icon fontSize='medium'/>}
                        </ListItemIcon>
                        <ListItemText sx={{ height: '20px' }} primaryTypographyProps={{ fontSize: '14px' }}>{value.itemName}</ListItemText>
                    </MenuItem>
                ))}
            </Menu>
            { isCopyFileFormOpen &&
                <CopyFileForm isCopyFileFormOpen={isCopyFileFormOpen} setIsCopyFileFormOpen={setIsCopyFileFormOpen} />
            }
            { isRenameFileFormOpen &&
                <RenameFileForm isRenameFileFormOpen={isRenameFileFormOpen} setIsRenameFileFormOpen={setIsRenameFileFormOpen} />
            }
            { isCreateNewFileFormOpen &&
                <CreateNewFileForm isCreateNewFileFormOpen={isCreateNewFileFormOpen} setIsCreateNewFileFormOpen={setIsCreateNewFileFormOpen} />
            }
            { isExecuteFileFormOpen &&
                <ExecuteFileForm isExecuteFileFormOpen={isExecuteFileFormOpen} setIsExecuteFileFormOpen={setIsExecuteFileFormOpen} />
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