import { Box, Skeleton, TextField } from "@mui/material";
import { useContext } from "react";
import { FileAttributesContext } from "../../contexts/FileAttributesContext";

export default function FileContentArea(): JSX.Element {
    const fileAttributesContext = useContext(FileAttributesContext)
    if (!fileAttributesContext) {
        throw new Error('Appropriate contexts must be supplied!')
    }
    const { fileContentRef, fileInputRef, isFileContentReadOnly, fontSize, isFileLoading } = fileAttributesContext

    //console.log('File Content Area has been refreshed!')

    function renderSkeleton(): JSX.Element {
        const skeletonArray = []

        for (let i = 0; i < 10; i++) {
            const randomNumber = Math.floor(Math.random() * (100 - 20 + 1) + 20)
            skeletonArray.push(<Skeleton variant="text" animation={'wave'} width={randomNumber+'%'}/>)
        }
        return (
            skeletonArray.map((value) => (
                value
            ))
        )
    }

    return (
        <Box onClick={() => document.getElementById('file-content')?.focus()} marginBottom={'6px'} height={'100%'} overflow={'auto'} sx={{backgroundColor: 'background.consoleBlack', cursor: 'text'}} borderRadius={'10px'} p={1}>
            {isFileLoading? renderSkeleton()
            :
            <TextField id='file-content' sx={{overflow: 'auto', flex: 1}} variant="standard" InputProps={{style: {fontSize: fontSize}, readOnly: isFileContentReadOnly, disableUnderline: true}} size={"small"} defaultValue={fileContentRef.current} inputRef={fileInputRef} fullWidth multiline onChange={e => fileContentRef.current = e.target.value}/>
            }
        </Box>
    )
}