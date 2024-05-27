import { Tooltip, IconButton, SvgIconTypeMap } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import TextIncreaseIcon from '@mui/icons-material/TextIncrease';
import TextDecreaseIcon from '@mui/icons-material/TextDecrease';
import LockIcon from '@mui/icons-material/Lock';
import { OverridableComponent } from "@mui/material/OverridableComponent";
import { useContext, useState } from "react";
import { FileAttributesContext } from "../../contexts/FileAttributesContext";
import { useSnackbar } from "../../contexts/SnackbarContext";

const fileContentDisplayToolBar: {title: string, icon: OverridableComponent<SvgIconTypeMap<object, "svg">> & { muiName: string;}}[] = ([
    {title: 'Decrease Font Size', icon: TextDecreaseIcon},
    {title: 'Increase Font Size', icon: TextIncreaseIcon},
    {title: 'Lock File', icon: LockIcon},
    {title: 'Edit File', icon: EditIcon}
])

export default function FileAccessibilityOptions(): JSX.Element {
    const fileAttributesContext = useContext(FileAttributesContext)

    if ( !fileAttributesContext) {
        throw new Error('Appropriate contexts must be supplied!')
    }
    
    const { fontSize, setFontSize, isFileContentReadOnly, setIsFileContentReadOnly, isFileActive } = fileAttributesContext

    const { openSnackbar } = useSnackbar();
    const [selectedFileContentDisplayToolBarIndex, setSelectedFileContentDisplayToolBarIndex] = useState<number>(2)

    function handleFileContentToolbarClick(item: string, i: number): void {
        // handle each action with the appropriate additional screen or API call.
        switch(item) {
            case 'Increase Font Size':
                setFontSize((prev) => prev+2)
                break;
            case 'Decrease Font Size':
                if (fontSize > 2) {
                    setFontSize((prev) => prev-2)
                } else {
                    openSnackbar('How can you read the text if it has no positive size! :)', 'info')
                }
                break;
            case 'Edit File':
                if (isFileContentReadOnly) {
                    setSelectedFileContentDisplayToolBarIndex(i)
                    setIsFileContentReadOnly(false)
                    openSnackbar('Editing file on local machine, remember to save if you want changes to persist', 'info')
                }
                break;
            case 'Lock File':
                if (!isFileContentReadOnly) {
                    setSelectedFileContentDisplayToolBarIndex(i)
                    setIsFileContentReadOnly(true)
                    openSnackbar('Content is now locked in current state for read only', 'info')
                }
                break;
        }
    }

    //console.log('Refreshed File Accessibility Options!')

    return (
        <>
            {fileContentDisplayToolBar.map((item, i) => (
                <Tooltip title={item.title} key={i}>
                    <IconButton size="small" onClick={() => handleFileContentToolbarClick(item.title, i)} disabled={!isFileActive} sx={ i==selectedFileContentDisplayToolBarIndex ? { backgroundColor: 'primary.light' } : {}}>
                        {<item.icon/>}
                    </IconButton>
                </Tooltip>
            ))}
        </>
    )
}