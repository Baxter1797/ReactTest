import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { useContext } from "react";
import { FileAttributesContext } from "../../contexts/FileAttributesContext";
import FileContentArea from "./FileContentArea";
import FileQuickActionToolbar from "./FileQuickActionToolbar";
import { useConnectSession } from "../../contexts/ConnectSessionContext";
import LaptopIcon from '@mui/icons-material/Laptop';

export default function FileContentPanel(): JSX.Element {
    const fileAttributesContext = useContext(FileAttributesContext)

    if (!fileAttributesContext) {
        throw new Error('Appropriate contexts must be supplied!')
    }

    const { currentFileAttributes, isFileActive } = fileAttributesContext
    const { isActiveSession, openConnectSession } = useConnectSession();

    function getLocalTime(epoch: number): string {
        const date = new Date(epoch)
        return date.toLocaleString()
    }

    //console.log('File Content Panel has refreshed!')

    return (
        <Box sx={{ backgroundColor: 'primary.dark', marginTop: '10px', borderRadius: '0px 0px 10px 0px', overflowY: 'hidden'}} height={'100%'} display={'flex'} flexDirection={'column'} p={1} width={'100%'} >
            {isFileActive &&
                <>
                    <Box display={'inline-flex'} flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'} flexGrow={1} width={'100%'} marginBottom={'10px'}>
                        <Typography>{currentFileAttributes.path}</Typography>
                        <FileQuickActionToolbar />
                    </Box>
                    <FileContentArea />
                    <Box display={"inline-flex"} flexDirection={'row'} justifyContent={'space-between'} sx={{width: '100%'}}>
                        <Typography>Last Modified: {getLocalTime(currentFileAttributes.lastModified)}</Typography>
                        <Typography>File Size: {currentFileAttributes.fileSize} Bytes</Typography>
                    </Box>
                </>
            }
            {!isActiveSession &&
                <Box width={'100%'} height={'100%'} display={'flex'} justifyContent={'center'} alignItems={'center'}>
                    <Tooltip title={'Connect Session'}>
                        <IconButton size="large" sx={{width: '120px', height: '120px', fontSize: '12px', display: 'inline-flex', flexDirection: 'column', transform: 'scale(1.8)'}} onClick={openConnectSession}>
                            <LaptopIcon />Connect Session
                        </IconButton>
                    </Tooltip>
                </Box>
            }
        </Box>
    )
}