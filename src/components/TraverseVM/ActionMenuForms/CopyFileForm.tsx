import { Dialog, Typography, DialogContent, Box, DialogContentText, TextField, Button, Alert, AlertTitle, Divider } from "@mui/material"
import CancelPresentationIcon from '@mui/icons-material/CancelPresentation';
import {useContext, useRef, useState } from "react";
import IApiOptions from "../../../interfaces/IApiOptions";
import ApiRequest from "../../../utils/apiRequest";
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ITraverseDir from "../../../interfaces/ITraverseDir";
import TVM_RenderTree from "../TVM_RenderTree";
import { useSnackbar } from "../../../contexts/SnackbarContext";
import APIConnectionContext from "../../../contexts/APIConnectionContext";
import { FileAttributesContext } from "../../../contexts/FileAttributesContext";
import ConfirmationDialog from "../../Shared/ConfirmationDialog";

interface ICopyFileForm {
    isCopyFileFormOpen: boolean
    setIsCopyFileFormOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export default function CopyFileForm(props: ICopyFileForm): JSX.Element {
    const apiConnectionContext = useContext(APIConnectionContext)
    const fileAttributesContext = useContext(FileAttributesContext)

    if (!apiConnectionContext || !fileAttributesContext) {
        throw new Error('TreeView and apiContext must be used within a the respected providers!')
    }

    const { activeDNSRef, usernameRef, passwordRef, apiBaseEndPoint, handleFileChangeEndPoint } = apiConnectionContext
    const { currentFileAttributes } = fileAttributesContext

    const { openSnackbar } = useSnackbar();
    const [canCopy, setCanCopy] = useState<boolean>(true)
    const [errorReason, setErrorReason] = useState<string>('')
    const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState<boolean>(false)
    const filePathInputFieldRef = useRef<string>(currentFileAttributes.path)
    const filePathInputRef = useRef<HTMLTextAreaElement | null>(null)
    const shouldConfirmSubmit = useRef<boolean>(true)
    const confirmationMessage = useRef<string>('')
    const sourceFilePath = currentFileAttributes.path

    function setAlert(message: string): void {
        setCanCopy(false)
        setErrorReason(message)
    }

    async function handleCopyFileClick(): Promise<void> {
        if (shouldConfirmSubmit.current) {
            confirmationMessage.current = "You are about to copy this file to an existing file named: "+filePathInputFieldRef.current+"\nAre you sure you want to overwrite this file?"
            setIsConfirmationDialogOpen(true)
        } else {
            if (filePathInputFieldRef.current.charAt(0) != '/') {
                setAlert('File path must begin with a /')
                return
            }
    
            try {
                const address = activeDNSRef.current+apiBaseEndPoint+handleFileChangeEndPoint
                new URL(address)
                const apiOptions : IApiOptions = {
                    url: address,
                    method: 'POST',
                    params: {path: sourceFilePath, action: 'copy', content: filePathInputFieldRef.current},
                    auth: {username: usernameRef.current, password: passwordRef.current}
                }
                try {
                    await ApiRequest(apiOptions)
                    openSnackbar('Successfully copied files', 'success')
                    handleClose()
                } catch (error) {
                    setAlert('Failed to successfully copy contents. Error reason:\n'+error)
                }
            } catch (error) {
                setAlert('Invalid URL Type, ensure that a valid URL has been constructed')
                return
            }
        }
    }

    function handleKeyDown(e: React.KeyboardEvent): void {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleCopyFileClick()
            return
        }
    }

    function handleClose(): void {
        props.setIsCopyFileFormOpen(false)
        if (!canCopy) {
            setErrorReason('')
            setCanCopy(true)
        }
    }

    function handleOnChange(value: string): void {
        
        filePathInputFieldRef.current = value

        if (shouldConfirmSubmit.current) {
            shouldConfirmSubmit.current = false
        }
    }

    async function handleFileClick(node: ITraverseDir): Promise<void> {
        if (filePathInputRef.current) {
        filePathInputRef.current.value = node.path
        filePathInputFieldRef.current = node.path
        }
        shouldConfirmSubmit.current = true
    }

    function handleOnConfirm(): void {
        shouldConfirmSubmit.current = false
        handleCopyFileClick()
    }

    //console.log('Copy File Form Refreshed!')

    return (
        <>
            <Dialog open={props.isCopyFileFormOpen} onClose={handleClose}>
                <Typography alignSelf={'center'} marginTop={'8px'}>Copy File</Typography>
                <DialogContent>
                    <Box sx={{backgroundColor: 'background.default', backdropFilter: 'blur(10px)'}} padding={2} borderRadius={1}>
                        <DialogContentText marginBottom={'16px'}>
                            {"Please provide the target path for copying the file to"}
                        </DialogContentText>
                        <TextField inputRef={filePathInputRef} placeholder={'/File/Path'} defaultValue={filePathInputFieldRef.current} variant='outlined' label='File Path' id='File Path' fullWidth required type={"url"} multiline color={'secondary'} error={!canCopy} FormHelperTextProps={{ error: true }} onChange={e => handleOnChange(e.target.value)} onKeyDown={e => handleKeyDown(e)}/>
                        <Divider variant={'fullWidth'} orientation={"horizontal"} sx={{ paddingTop: '10px', marginBottom: '10px', fontSize: '14px'}}>Tree View</Divider>
                        <Box maxHeight={'400px'} overflow={'auto'}>
                            <TVM_RenderTree handleFileClick={handleFileClick}/>
                        </Box>
                        {!canCopy && 
                            <Box marginTop={'12px'}>
                                <Alert color="error" severity="error">
                                    <AlertTitle>API Request Error!</AlertTitle>
                                    <pre style={{whiteSpace: 'pre-wrap'}}>
                                        {"Unable to build a successful response from address:\n"+activeDNSRef.current+apiBaseEndPoint+handleFileChangeEndPoint+"\n\nReason: "+errorReason}
                                    </pre>
                                </Alert>
                            </Box>
                        }
                    </Box>
                </DialogContent>
                <Box display={'inline-flex'} flexDirection={'row'} alignContent={'center'} justifyContent={'center'} marginBottom={'12px'}>
                    <Button endIcon={<CancelPresentationIcon/>} variant="contained" sx={{marginRight: '6px'}} onClick={handleClose}>Cancel</Button>
                    <Button endIcon={<KeyboardArrowUpIcon/>} variant="contained" sx={{marginLeft: '6px'}} onClick={handleCopyFileClick}>Submit</Button>
                </Box>
            </Dialog>
            <ConfirmationDialog isConfirmationDialogOpen={isConfirmationDialogOpen} onConfirmAction={handleOnConfirm} setIsConfirmationDialogOpen={setIsConfirmationDialogOpen} confirmationDialogMessage={confirmationMessage.current}/>
        </>
    )
}