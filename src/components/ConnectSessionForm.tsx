import { Dialog, Typography, DialogContent, Box, DialogContentText, TextField, Button, Alert, AlertTitle } from "@mui/material"
import LaptopIcon from '@mui/icons-material/Laptop';
import CancelPresentationIcon from '@mui/icons-material/CancelPresentation';
import { useEffect, useRef, useState } from "react";
import {z} from 'zod'
import axios from "axios";
import ITraverseDir from "../interfaces/ITraverseDir";

interface IConnectSessionForm {
    isConnectSessionOpen: boolean
    setIsConnectSessionOpen: React.Dispatch<React.SetStateAction<boolean>>
    setStageOnNewConnect(initialObject: ITraverseDir, url: string, initialPath: string, dns: string): void
}

const traverseDirModel = z.object({
    fileName: z.string(),
    type: z.string(),
})
const traversDirModels = z.array(traverseDirModel)

function ConnectSessionForm(props: IConnectSessionForm): JSX.Element {
    const [dnsInputField, setDNSInputField] = useState<string>('')
    const [endPointInputField, setEndPointInputField] = useState<string>('')
    const [filePathInputField, setFilePathInputField] = useState<string>('')
    const [isAddressInputValid, setIsAddressInputValid] = useState<boolean>(true)
    const [address, setAddress] = useState<string>('')
    const [errorReason, setErrorReason] = useState<string>('')
    const [addressOnConnect, setAddressOnConnect] = useState<string>('')
    const isConnectSessionOpenRef = useRef<boolean>(false)

    useEffect(()=>{
        setAddress(dnsInputField+endPointInputField+filePathInputField)
    }, [dnsInputField, endPointInputField, filePathInputField])
    
    isConnectSessionOpenRef.current = props.isConnectSessionOpen

    async function handleConnectSessionClick(): Promise<void> {
        console.log('connecting...')

        setAddressOnConnect(address)
        let data: ITraverseDir[] = []
        if (dnsInputField == '' || endPointInputField == '' || filePathInputField == '') {
            setIsAddressInputValid(false)
            setErrorReason('Not all fields have been set, ensure you have completed all fields before trying to connect')
            return
        }
        try {
            const url = new URL(address)
            data = await fetchData(url)
            try {
                traversDirModels.parse(data)
            } catch (error) {
                console.log('Data does not match zod schema definition')
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
        if (filePathInputField.length == 1) {
            filePathName = 'root'
        } else if (filePathInputField.charAt(filePathInputField.length -1) == '/') {
            filePathName = filePathInputField.substring(0, filePathInputField.length-1)
            filePathName = filePathName.substring(filePathName.lastIndexOf('/')+1, filePathName.length)
        } else {
            filePathName = filePathInputField.substring(filePathInputField.lastIndexOf('/')+1, filePathInputField.length)
        }

        const initialTravereseResponse: ITraverseDir = {
            id: '0',
            fileName: filePathName,
            type: 'dir',
            path: filePathInputField,
            children: []
        }

        props.setStageOnNewConnect(initialTravereseResponse, address, filePathName, dnsInputField)
        console.log(initialTravereseResponse)
    }

    async function fetchData(url: URL): Promise<unknown> {
        try {
            const response = await axios.get(url.toString())
            return await response.data
        } catch (error) {
            console.log('error getting data')
        }
    }

    function handleKeyDown(e: React.KeyboardEvent): void {
        console.log(e.key)
        if (e.key === 'Enter') {
            e.preventDefault()
            handleConnectSessionClick()
            return
        }
    }

    console.log('Connect form refreshed!')

    return (
        <>
            <Dialog open={isConnectSessionOpenRef.current} onClose={() => props.setIsConnectSessionOpen(false)}>
                <Typography alignSelf={'center'} marginTop={'8px'}>Connect Session</Typography>
                <DialogContent>
                    <Box sx={{backgroundColor: 'background.default', backdropFilter: 'blur(10px)'}} padding={2} borderRadius={1}>
                        <pre>
                            <DialogContentText marginBottom={'16px'}>
                                {"Please Provide The Connection Details. For example.\nDNS: https://mydns.com\nEnd Point: /my/api/end/point?path=\nFile Path: /File/Path"}
                            </DialogContentText>
                        </pre>
                        <TextField sx={{marginBottom: '16px'}} placeholder={'https://mydns.com'} value={dnsInputField} variant='outlined' label='DNS' id='DNS' fullWidth required type={"url"} multiline color={'secondary'} error={!isAddressInputValid} FormHelperTextProps={{ error: true }} onChange={e => setDNSInputField(e.target.value)} onKeyDown={e => handleKeyDown(e)}/>
                        <TextField sx={{marginBottom: '16px'}} placeholder={'/my/api/end/point?path='} value={endPointInputField} variant='outlined' label='End Point' id='End Point' fullWidth required type={"url"} multiline color={'secondary'} error={!isAddressInputValid} FormHelperTextProps={{ error: true }} onChange={e => setEndPointInputField(e.target.value)} onKeyDown={e => handleKeyDown(e)}/>
                        <TextField placeholder={'File / Path'} value={filePathInputField} variant='outlined' label='File Path' id='File Path' fullWidth required type={"url"} multiline color={'secondary'} error={!isAddressInputValid} FormHelperTextProps={{ error: true }} onChange={e => setFilePathInputField(e.target.value)} onKeyDown={e => handleKeyDown(e)}/>
                        {!isAddressInputValid && 
                            <Box marginTop={'12px'}>
                                <Alert color="error" severity="error">
                                    <AlertTitle>API Request Error!</AlertTitle>
                                    <pre style={{whiteSpace: 'pre-wrap'}}>
                                        {"Unable to build a successful response from address:\n"+addressOnConnect+"\n\nReason: "+errorReason}
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