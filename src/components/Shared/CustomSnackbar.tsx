import { Alert, Box, IconButton, Snackbar } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import SnackbarContext from "../contexts/SnackbarContext_old";
import { useContext, useState } from "react";
import React from "react";
import ISnackbarProperties from "../../interfaces/ISnackbarProperties";

export default function CustomSnackbar(): JSX.Element {
    const snackbarContext = useContext(SnackbarContext)

    if (!snackbarContext) {
        throw new Error("Haven't initialised the snackbar context correctly!")
    }

    const { snackbarProperties, setSnackbarProperties } = snackbarContext
    const [messageInfo, setMessageInfo] = useState<ISnackbarProperties | undefined>(undefined)
    const [open, setOpen] = useState<boolean>(false)

    React.useEffect(() => {
        console.log('inside use effect block for snackbar')
        if (snackbarProperties.length && !messageInfo) {
            console.log('*******ABOUT TO CREATE A SNACKBAR**********')
            setMessageInfo({ ...snackbarProperties[0] });
            setSnackbarProperties((prev) => prev.slice(1));
            setOpen(true);
        } else {
            setOpen(false)
            console.log('*******ABOUT TO CLOSE A SNACKBAR**********')
        }
    }, [snackbarProperties, messageInfo])

    function handleSnackbarClose(event?: React.SyntheticEvent | Event | React.MouseEventHandler, reason?: string): void {
        if (reason === 'clickaway'){
            return;
        }
        setOpen(false)
    }

    function handleExited(): void {
        setMessageInfo(undefined)
      }

    console.log('snackbar has been refreshed!')
    console.log(snackbarProperties)
    
    return (
        <>
            <Snackbar anchorOrigin={{vertical: 'top', horizontal: 'right'}} open={open} transitionDuration={400} autoHideDuration={5000} onClose={handleSnackbarClose} sx={{ marginTop: '64px' }} key={messageInfo ? messageInfo.key : undefined} TransitionProps={{onExited: handleExited}}>
                <Box display={'inline-flex'} flexDirection={'row'}>
                    <Alert severity={messageInfo?.severity} variant="filled" elevation={6} sx={{ alignSelf: 'center' }}>
                        <Box position={'relative'} display={'inline-flex'} flexDirection={'row'}>
                            <Box marginRight={'26px'}>
                                {messageInfo?.message}
                            </Box>
                        </Box>
                    </Alert>
                    <IconButton 
                    size="small" 
                    sx={ messageInfo?.severity == 'error'? { padding: '4px', position: 'absolute', borderRadius: '50%', right: '10px', top: '10px', color: 'white', "&:hover":{backgroundColor: 'transparent'} } 
                    : { padding: '4px', position: 'absolute', borderRadius: '50%', right: '10px', top: '10px', color: 'black', "&:hover":{backgroundColor: 'transparent'} }} 
                    onClick={() => {setOpen(false)}}>
                        <CloseIcon sx={{ height: '20px', width: '20px' }}/>
                    </IconButton>
                </Box>
            </Snackbar>
            {/*
            <Snackbar anchorOrigin={{vertical: 'top', horizontal: 'right'}} open={isSnackbarOpen} transitionDuration={400} autoHideDuration={5000} onClose={handleSnackbarClose} sx={{ marginTop: '64px' }}>
                <Box display={'inline-flex'} flexDirection={'row'}>
                    <Alert severity={props.snackbarProperties.severity} variant="filled" elevation={6} sx={{ alignSelf: 'center' }}>
                        <Box position={'relative'} display={'inline-flex'} flexDirection={'row'}>
                            <Box marginRight={'26px'}>
                                {props.snackbarProperties.message}
                            </Box>
                        </Box>
                    </Alert>
                    <IconButton 
                    size="small" 
                    sx={ props.snackbarProperties.severity == 'error'? { padding: '4px', position: 'absolute', borderRadius: '50%', right: '10px', top: '10px', color: 'white', "&:hover":{backgroundColor: 'transparent'} } 
                    : { padding: '4px', position: 'absolute', borderRadius: '50%', right: '10px', top: '10px', color: 'black', "&:hover":{backgroundColor: 'transparent'} }} 
                    onClick={() => {props.setIsSnackbarOpen(false)}}>
                        <CloseIcon sx={{ height: '20px', width: '20px' }}/>
                    </IconButton>
                </Box>
            </Snackbar>
            */}
        </>
    )
}