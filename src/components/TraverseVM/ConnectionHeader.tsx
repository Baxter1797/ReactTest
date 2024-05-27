import { Box, Typography, Button } from "@mui/material";
import { useConnectSession } from "../../contexts/ConnectSessionContext";
import LaptopIcon from '@mui/icons-material/Laptop';
import { useContext } from "react";
import APIConnectionContext from "../../contexts/APIConnectionContext";

export default function ConnectionHeader(): JSX.Element {
    const apiConnectionContext = useContext(APIConnectionContext)

    if (!apiConnectionContext ) {
        throw new Error('Appropriate contexts must be supplied!')
    }

    const { activeDNSRef } = apiConnectionContext
    const { isActiveSession } = useConnectSession();

    //console.log('ConnectionHeader refreshed!')

    return (
            isActiveSession &&
                <Box display={"inline-flex"} flexDirection={'row'} alignContent={'center'} alignItems={'center'} height={'40px'} sx={{width: '100%'}} paddingLeft={'4px'} paddingRight={'4px'}>
                    <LaptopIcon sx={{marginRight: '12px'}}/>
                    <Typography fontSize={'16px'}>{activeDNSRef.current}</Typography>
                </Box>
    )
}