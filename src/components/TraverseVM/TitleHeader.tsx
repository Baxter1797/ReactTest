import { Box, Typography, Tooltip, IconButton } from "@mui/material";
import LaptopIcon from '@mui/icons-material/Laptop';
import { useConnectSession } from "../../contexts/ConnectSessionContext";

export default function TitleHeader(): JSX.Element {
    const { openConnectSession } = useConnectSession()

    //console.log('Title Header has refreshed!')

    return (
        <Box height={'36px'} display={'flex'} flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'} marginBottom={'4px'}>
            <Typography fontSize={'18px'}>Traverse VM 2.1</Typography>
            <Tooltip title={'Connect Session'}>
                <IconButton size="small" onClick={openConnectSession}>
                    <LaptopIcon />
                </IconButton>
            </Tooltip>
        </Box>
    )
}