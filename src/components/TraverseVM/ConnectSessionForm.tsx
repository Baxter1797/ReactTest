import { Dialog, Typography, DialogContent, Box, DialogContentText, TextField, Button, Alert, AlertTitle, Divider } from "@mui/material"
import LaptopIcon from '@mui/icons-material/Laptop';
import CancelPresentationIcon from '@mui/icons-material/CancelPresentation';
import {useContext, useRef, useState } from "react";
import {z} from 'zod'
import ITraverseDir from "../../interfaces/ITraverseDir";
import IApiOptions from "../../interfaces/IApiOptions";
import ApiRequest from "../../utils/apiRequest";
import { TreeViewUpdateContext } from "../../contexts/TreeViewContext";
import APIConnectionContext from "../../contexts/APIConnectionContext";
import { FileAttributesUpdateContext } from "../../contexts/FileAttributesContext";
import { useSnackbar } from "../../contexts/SnackbarContext";

interface IConnectSessionForm {
    isConnectSessionOpen: boolean
    setIsConnectSessionOpen: React.Dispatch<React.SetStateAction<boolean>>
    setIsActiveSession: React.Dispatch<React.SetStateAction<boolean>>
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

function ConnectSessionForm(props: IConnectSessionForm): JSX.Element {
    const treeViewContext = useContext(TreeViewUpdateContext)
    const apiConnectionContext = useContext(APIConnectionContext)
    const fileAttributesUpdateContext = useContext(FileAttributesUpdateContext)

    if (!treeViewContext || !apiConnectionContext || !fileAttributesUpdateContext) {
        throw new Error('TreeView and apiContext must be used within a the respected providers!')
    }

    const { updateTree } = treeViewContext
    const { activeDNSRef, usernameRef, passwordRef } = apiConnectionContext
    const { updateIsContentReadOnly, updateIsFileActive, updateFileContent } = fileAttributesUpdateContext
    const { openSnackbar } = useSnackbar()
    const [isAddressInputValid, setIsAddressInputValid] = useState<boolean>(true)
    const [errorReason, setErrorReason] = useState<string>('')
    const isConnectSessionOpenRef = useRef<boolean>(false)
    const dnsInputFieldRef = useRef<string>(window.location.origin)
    const filePathInputFieldRef = useRef<string>('/')
    const usernameFieldRef  = useRef<string>('')
    const passwordFieldRef = useRef<string>('')

    isConnectSessionOpenRef.current = props.isConnectSessionOpen

    async function handleConnectSessionClick(): Promise<void> {
        if (dnsInputFieldRef.current == '' || filePathInputFieldRef.current == '') {
            setIsAddressInputValid(false)
            setErrorReason('Not all fields have been set, ensure you have completed all fields before trying to connect')
            return
        }
        if (filePathInputFieldRef.current.charAt(0) != '/') {
            setIsAddressInputValid(false)
            setErrorReason('File path must begin with a /')
            return
        }
        try {
            const address = dnsInputFieldRef.current+apiBaseEndPoint+listDirEndPoint
            new URL(address)
            const apiOptions : IApiOptions = {
                url: address,
                method: 'GET',
                params: {path: filePathInputFieldRef.current},
                auth: {username: usernameFieldRef.current, password: passwordFieldRef.current}
            }
            const {data} = await ApiRequest(apiOptions)
            try {
                traversDirModels.parse(data)
            } catch (error) {
                setIsAddressInputValid(false)
                setErrorReason('Returned data does not match Traverse schema, ensure API response aligns to the Traverse schema.')
                return
            }
        } catch (error) {
            setErrorReason('Invalid URL Type, ensure that a valid URL has been constructed')
            setIsAddressInputValid(false)
            return
        }

        if (!isAddressInputValid) {
            setIsAddressInputValid(true)
            setErrorReason('')
        }
        
        let filePathName: string = ''
        if (filePathInputFieldRef.current.length == 1) {
            filePathName = 'root'
        } else if (filePathInputFieldRef.current.charAt(filePathInputFieldRef.current.length -1) == '/') {
            filePathName = filePathInputFieldRef.current.substring(0, filePathInputFieldRef.current.length-1)
            filePathName = filePathName.substring(filePathName.lastIndexOf('/')+1, filePathName.length)
        } else {
            filePathName = filePathInputFieldRef.current.substring(filePathInputFieldRef.current.lastIndexOf('/')+1, filePathInputFieldRef.current.length)
        }

        const initialTravereseResponse: ITraverseDir = {
            id: '0',
            fileName: filePathName,
            canWrite: false,
            executable: false,
            fileSize: 123,
            lastModified: 123,
            type: 'dir',
            path: filePathInputFieldRef.current,
            children: []
        }
        setStageOnConnect(initialTravereseResponse)
    }

    function handleKeyDown(e: React.KeyboardEvent): void {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleConnectSessionClick()
            return
        }
    }

    function setStageOnConnect(initialNode: ITraverseDir): void {
        try {
            activeDNSRef.current = dnsInputFieldRef.current
            usernameRef.current = usernameFieldRef.current
            passwordRef.current = passwordFieldRef.current
            props.setIsConnectSessionOpen(false)
            //fileContentRef.current = ''
            updateFileContent('')
            //setIsFileContentReadOnly(true)
            updateIsContentReadOnly(true)
            //setIsFileActive(false)
            updateIsFileActive(false)
            props.setIsActiveSession(true)
            updateTree(initialNode)
            openSnackbar('Successfully established connection to '+activeDNSRef.current, 'success')
        } catch (error) {
            openSnackbar('Failed to set the stage for: '+activeDNSRef.current, 'error')
        }
    }

    //console.log('Connect form refreshed!')

    return (
        <>
            <Dialog open={isConnectSessionOpenRef.current} onClose={() => props.setIsConnectSessionOpen(false)}>
                <Typography alignSelf={'center'} marginTop={'8px'}>Connect Session</Typography>
                <DialogContent>
                    <Box sx={{backgroundColor: 'background.default', backdropFilter: 'blur(10px)'}} padding={2} borderRadius={1}>
                        <pre>
                            <DialogContentText marginBottom={'16px'}>
                                {"Please Provide The Connection Details. For example.\n\nDNS: https://mydns.com\nFile Path: /File/Path"}
                            </DialogContentText>
                        </pre>
                        <TextField defaultValue={dnsInputFieldRef.current} sx={{marginBottom: '16px'}} placeholder={'https://mydns.com'} variant='outlined' label='DNS' id='DNS' fullWidth required type={"url"} multiline color={'secondary'} error={!isAddressInputValid} FormHelperTextProps={{ error: true }} onChange={e => dnsInputFieldRef.current = e.target.value} onKeyDown={e => handleKeyDown(e)}/>
                        <TextField defaultValue={filePathInputFieldRef.current} placeholder={'/File/Path'} variant='outlined' label='File Path' id='File Path' fullWidth required type={"url"} multiline color={'secondary'} error={!isAddressInputValid} FormHelperTextProps={{ error: true }} onChange={e => filePathInputFieldRef.current = e.target.value} onKeyDown={e => handleKeyDown(e)}/>
                        <Divider variant={'fullWidth'} orientation={"horizontal"} sx={{ paddingTop: '10px', marginBottom: '10px', fontSize: '14px'}}>Authentication (Optional)</Divider>
                        <TextField sx={{marginBottom: '16px'}} defaultValue={usernameFieldRef.current} variant="outlined" label='Username' id='username' fullWidth color={'secondary'} onChange={e => usernameFieldRef.current = e.target.value} onKeyDown={e => handleKeyDown(e)}/>
                        <TextField defaultValue={passwordFieldRef.current} variant="outlined" label='Password' id='password' fullWidth color={'secondary'} onChange={e => passwordFieldRef.current = e.target.value} onKeyDown={e => handleKeyDown(e)}/>
                        {!isAddressInputValid && 
                            <Box marginTop={'12px'}>
                                <Alert color="error" severity="error">
                                    <AlertTitle>API Request Error!</AlertTitle>
                                    <pre style={{whiteSpace: 'pre-wrap'}}>
                                        {"Unable to build a successful response from address:\n"+dnsInputFieldRef.current+apiBaseEndPoint+listDirEndPoint+"\n\nReason: "+errorReason}
                                    </pre>
                                </Alert>
                            </Box>
                        }
                    </Box>
                </DialogContent>
                <Box display={'inline-flex'} flexDirection={'row'} alignContent={'center'} justifyContent={'center'} marginBottom={'12px'}>
                    <Button endIcon={<CancelPresentationIcon/>} variant="contained" sx={{marginRight: '6px'}} onClick={() => props.setIsConnectSessionOpen(false)}>Cancel</Button>
                    <Button endIcon={<LaptopIcon/>} variant="contained" sx={{marginLeft: '6px'}} onClick={handleConnectSessionClick}>Connect</Button>
                </Box>
            </Dialog>
        </>
    )
}

export default ConnectSessionForm