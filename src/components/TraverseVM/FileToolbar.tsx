import { Box, Divider } from "@mui/material";
import FileAccessibilityOptions from "./FileAccessibilityOptions";
import FileSearch from "./FileSearch";
import { useContext, useState } from "react";
import TVM_ActionMenu from "./TVM_ActionMenu";
import { FileAttributesUpdateContext } from "../../contexts/FileAttributesContext";

export default function FileToolbar(): JSX.Element {
    const fileAttributesUpdateContext = useContext(FileAttributesUpdateContext)

    if (!fileAttributesUpdateContext) {
        throw new Error('Appropriate contexts must be supplied!')
    }

    const { updateFileContent, updateIsFileActive } = fileAttributesUpdateContext

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
    const [isActionMenuOpen, setIsActionMenuOpen] = useState<boolean>(false)

    function handleActionMenuClose(): void {
        setAnchorEl(null);
        setIsActionMenuOpen(false);
    }

    function handleActionMenuOpen(event: React.MouseEvent<HTMLButtonElement>): void {
        setAnchorEl(event.currentTarget);
        setIsActionMenuOpen(true);
    }

    function handleDeleteFile(): void {
        updateFileContent('')
        updateIsFileActive(false)
    }

    //console.log('File toolbar has refreshed!')
    
    return (
            <Box maxHeight={'34px'} display={'inline-flex'} flexDirection={'row'} justifyContent={'space-between'} alignItems={'center'} marginBottom={'6px'} width={'100%'}>
                <Box display={'inline-flex'} flexDirection={'row'} alignItems={'center'} height={'34px'} flexGrow={1}>
                    <FileAccessibilityOptions />
                    <Divider flexItem orientation="vertical" sx={{height:'32px', marginLeft: '6px'}}/>
                    <FileSearch />
                </Box>
                <Box display={'inline-flex'} flexDirection={'row'} alignItems={'center'}>
                    <TVM_ActionMenu anchorEl={anchorEl} handleActionMenuClose={handleActionMenuClose} handleActionMenuOpen={handleActionMenuOpen} handleDeleteFile={handleDeleteFile} isActionMenuOpen={isActionMenuOpen}/>
                </Box>
            </Box>
    )
}