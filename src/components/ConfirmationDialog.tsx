import { Dialog, Typography, DialogContent, Box, DialogContentText, Button } from "@mui/material"
import CancelPresentationIcon from '@mui/icons-material/CancelPresentation';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
interface IConfirmationDialog {
    onConfirmAction(): void
    confirmationDialogMessage: string
    isConfirmationDialogOpen: boolean
    setIsConfirmationDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
}

function ExecuteFileForm(props: IConfirmationDialog): JSX.Element {

    const confirmationDialogMessage = props.confirmationDialogMessage
    const isConfirmationDialogOpen = props.isConfirmationDialogOpen

    async function handleExecuteFileClick(): Promise<void> {
        props.onConfirmAction()
        handleClose()
    }

    function handleClose(): void {
        props.setIsConfirmationDialogOpen(false)
    }

    console.log('Confirmation Dialog Refreshed!')

    return (
        <>
            <Dialog open={isConfirmationDialogOpen} onClose={handleClose}>
                <Typography alignSelf={'center'} marginTop={'8px'}>Confirmation Dialog</Typography>
                <DialogContent>
                    <Box sx={{backgroundColor: 'background.default', backdropFilter: 'blur(10px)'}} padding={2} borderRadius={1}>
                        <DialogContentText marginBottom={'16px'} whiteSpace={'break-spaces'}>
                            {confirmationDialogMessage}
                        </DialogContentText>
                    </Box>
                </DialogContent>
                <Box display={'inline-flex'} flexDirection={'row'} alignContent={'center'} justifyContent={'center'} marginBottom={'12px'}>
                    <Button endIcon={<CancelPresentationIcon/>} variant="contained" sx={{marginRight: '6px'}} onClick={handleClose}>Cancel</Button>
                    <Button endIcon={<KeyboardArrowUpIcon/>} variant="contained" sx={{marginLeft: '6px'}} onClick={handleExecuteFileClick}>Confirm</Button>
                </Box>
            </Dialog>
        </>
    )
}

export default ExecuteFileForm