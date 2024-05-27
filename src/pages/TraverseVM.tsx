import TitleHeader from "../components/TraverseVM/TitleHeader";
import NavigationPanel from "../components/TraverseVM/NavigationPanel";
import FileToolbar from "../components/TraverseVM/FileToolbar";
import FileContentPanel from "../components/TraverseVM/FileContentPanel";
import { Box } from "@mui/material";
import { ConnectSessionProvider } from "../providers/ConnectSessionProvider";
import { TVM_APIConnectionProvider } from "../providers/TVM_APIConnectionProvider";
import { TVM_FileAttributesProvider } from "../providers/TVM_FileAttributesProvider";
import { TVM_TreeViewProvider } from "../providers/TVM_TreeViewProvider";

function TraverseVM(): JSX.Element {
    
    //console.log('TraverseVM has been refreshed!')

    return (
            <TVM_TreeViewProvider>
            <TVM_APIConnectionProvider>
            <TVM_FileAttributesProvider>
            <ConnectSessionProvider>
                <Box boxShadow={8} borderRadius={'10px'} p={1} top={0} bottom={0} display={'inline-flex'} flexDirection={'row'} width={'100%'} height={'calc(100vh - 104px)'} position={'relative'} >
                    <Box height={'100%'} width={'20%'} display={'flex'} flexDirection={'column'} sx={{resize: "horizontal"}} overflow={'auto'}>
                        <TitleHeader />
                        <NavigationPanel />
                    </Box>
                    <Box height={'100%'} width={'100%'} display={'flex'} flexDirection={'column'}>
                        <FileToolbar />
                        <FileContentPanel />
                    </Box>
                </Box>
            </ConnectSessionProvider>
            </TVM_FileAttributesProvider>
            </TVM_APIConnectionProvider>
            </TVM_TreeViewProvider>
    )
}

export default TraverseVM;