import { Dialog, Typography, DialogContent, Box, DialogContentText, TextField, Button, Alert, AlertTitle, Checkbox, FormControlLabel } from "@mui/material"
import CancelPresentationIcon from '@mui/icons-material/CancelPresentation';
import {useContext, useRef, useState } from "react";
import IApiOptions from "../../../interfaces/IApiOptions";
import ApiRequest from "../../../utils/apiRequest";
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import APIConnectionContext from "../../../contexts/APIConnectionContext";
import { FileAttributesContext } from "../../../contexts/FileAttributesContext";
import { useSnackbar } from "../../../contexts/SnackbarContext";

interface IExecuteFileForm {
    isExecuteFileFormOpen: boolean
    setIsExecuteFileFormOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export default function ExecuteFileForm(props: IExecuteFileForm): JSX.Element {
    const apiConnectionContext = useContext(APIConnectionContext)
    const fileAttributesContext = useContext(FileAttributesContext)

    if (!apiConnectionContext || !fileAttributesContext) {
        throw new Error('TreeView and apiContext must be used within a the respected providers!')
    }

    const { activeDNSRef, usernameRef, passwordRef, apiBaseEndPoint, executeShellEndPoint } = apiConnectionContext
    const { currentFileAttributes } = fileAttributesContext

    const { openSnackbar } = useSnackbar();
    const [canExecute, setCanExecute] = useState<boolean>(true)
    const [errorReason, setErrorReason] = useState<string>('')
    const argsInputRef = useRef<string>('')
    const isExecutionBackgroundRef = useRef<boolean>(true)

    const sourceFilePath = currentFileAttributes.path

    function setAlert(message: string): void {
        setCanExecute(false)
        setErrorReason(message)
    }

    async function handleExecuteFileClick(): Promise<void> {
        argsInputRef.current = argsInputRef.current.trim()
        
        let argsInput = argsInputRef.current
        if (argsInput.charAt(argsInput.length-1) === '&') {
            if (isExecutionBackgroundRef.current) {
                argsInput = argsInput.substring(0,argsInput.length-2)
            }
        } 
        if (isExecutionBackgroundRef.current) {
            argsInput = argsInput+' &'
        }

        try {
            const address = activeDNSRef.current+apiBaseEndPoint+executeShellEndPoint
            new URL(address)
            const apiOptions : IApiOptions = {
                url: address,
                method: 'POST',
                params: {path: sourceFilePath, args: argsInput},
                auth: {username: usernameRef.current, password: passwordRef.current}
            }
            try {
                const {data} = await ApiRequest(apiOptions)
                openSnackbar('Successfully executed file, response:\n\n '+data, 'success')
                handleClose()
            } catch (error) {
                setAlert('Failed to successfully execute file. Error reason:\n'+error)
            }
        } catch (error) {
            setAlert('Invalid URL Type, ensure that a valid URL has been constructed')
            return
        }
        
    }

    function handleKeyDown(e: React.KeyboardEvent): void {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleExecuteFileClick()
            return
        }
    }

    function handleClose(): void {
        props.setIsExecuteFileFormOpen(false)
        if (!canExecute) {
            setErrorReason('')
            setCanExecute(true)
        }
    }

    function handleCheckBox(): void {
        isExecutionBackgroundRef.current = !isExecutionBackgroundRef.current
    }

    //console.log('Execute File Form Refreshed!')

    return (
        <>
            <Dialog open={props.isExecuteFileFormOpen} onClose={handleClose}>
                <Typography alignSelf={'center'} marginTop={'8px'}>Execute File</Typography>
                <DialogContent>
                    <Box sx={{backgroundColor: 'background.default', backdropFilter: 'blur(10px)'}} padding={2} borderRadius={1}>
                        <DialogContentText marginBottom={'16px'} whiteSpace={'break-spaces'}>
                            {"You are about to execute the following script: "+sourceFilePath+"\n\nPlease provide any additional args in the input box below, with each input arg being sperated by whitespace"}
                        </DialogContentText>
                        <TextField placeholder={'Optional Args...'} variant='outlined' label='Optional Args' id='File Path' fullWidth multiline color={'secondary'} onChange={e => argsInputRef.current = e.target.value} onKeyDown={e => handleKeyDown(e)}/>
                        <FormControlLabel control={<Checkbox defaultChecked/>} label={'Run In Background'} sx={{alignSelf: 'center', justifySelf: 'center', marginTop: '12px'}} onChange={handleCheckBox} />
                        {!canExecute && 
                            <Box marginTop={'12px'}>
                                <Alert color="error" severity="error">
                                    <AlertTitle>API Request Error!</AlertTitle>
                                    <pre style={{whiteSpace: 'pre-wrap'}}>
                                        {"Unable to build a successful response from address:\n"+activeDNSRef.current+apiBaseEndPoint+executeShellEndPoint+"\n\nReason: "+errorReason}
                                    </pre>
                                </Alert>
                            </Box>
                        }
                    </Box>
                </DialogContent>
                <Box display={'inline-flex'} flexDirection={'row'} alignContent={'center'} justifyContent={'center'} marginBottom={'12px'}>
                    <Button endIcon={<CancelPresentationIcon/>} variant="contained" sx={{marginRight: '6px'}} onClick={handleClose}>Cancel</Button>
                    <Button endIcon={<KeyboardArrowUpIcon/>} variant="contained" sx={{marginLeft: '6px'}} onClick={handleExecuteFileClick}>Submit</Button>
                </Box>
            </Dialog>
        </>
    )
}