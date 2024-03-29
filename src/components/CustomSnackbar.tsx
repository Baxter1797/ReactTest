import { Alert, Box, IconButton, Snackbar } from "@mui/material";
import IsnackbarProperties from "../interfaces/IsnackbarProperties";
import CloseIcon from '@mui/icons-material/Close';

interface ICustomSnackbar {
    isSnackbarOpen: boolean
    setIsSnackbarOpen: React.Dispatch<React.SetStateAction<boolean>>
    snackbarProperties: IsnackbarProperties
}

function CustomSnackbar(props: ICustomSnackbar): JSX.Element {

    function handleSnackbarClose(event?: React.SyntheticEvent | Event | React.MouseEventHandler, reason?: string): void {
        if (reason === 'clickaway'){
            return;
        }
        props.setIsSnackbarOpen(false)
    }
    
    return (
        <>
            <Snackbar anchorOrigin={{vertical: 'top', horizontal: 'right'}} open={props.isSnackbarOpen} transitionDuration={400} autoHideDuration={5000} onClose={handleSnackbarClose} sx={{ marginTop: '64px' }}>
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
        </>
    )
}

export default CustomSnackbar