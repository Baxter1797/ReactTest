import { Box, Tooltip, IconButton, SvgIconTypeMap } from "@mui/material";
import SaveIcon from '@mui/icons-material/Save';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RefreshIcon from '@mui/icons-material/Refresh';
import { OverridableComponent } from "@mui/material/OverridableComponent";
import IApiOptions from "../../interfaces/IApiOptions";
import ApiRequest from "../../utils/apiRequest";
import { useContext } from "react";
import APIConnectionContext from "../../contexts/APIConnectionContext";
import { FileAttributesContext } from "../../contexts/FileAttributesContext";
import { useSnackbar } from "../../contexts/SnackbarContext";
import { z } from 'zod'

interface ITraverseFileModel {
    fileName: string
    type: string
    executable: boolean
    lastModified: number
    canWrite: boolean
    fileSize: number
    fileContents: string
}

const traverseFileModel = z.object({
    fileName: z.string(),
    type: z.string(),
    executable: z.boolean(),
    lastModified: z.number(),
    canWrite: z.boolean(),
    fileSize: z.number(),
    fileContents: z.string()
})

const fileQuickActions: {title: string, icon: OverridableComponent<SvgIconTypeMap<object, "svg">> & { muiName: string;}}[] = ([
    {title: 'Save Contents', icon: SaveIcon},
    {title: 'Refresh Contents', icon: RefreshIcon},
    {title: 'Copy Contents', icon: ContentCopyIcon}
])

export default function FileQuickActionToolbar(): JSX.Element {
    const apiConnectionContext = useContext(APIConnectionContext)
    const fileAttributesContext = useContext(FileAttributesContext)

    if (!apiConnectionContext || !fileAttributesContext) {
        throw new Error('Appropriate contexts must be supplied!')
    }

    const { activeDNSRef, usernameRef, passwordRef, apiBaseEndPoint, handleFileChangeEndPoint, listDirEndPoint } = apiConnectionContext
    const { currentFileAttributes, setCurrentFileAttributes, fileContentRef, fileInputRef, setIsFileLoading } = fileAttributesContext

    const { openSnackbar } = useSnackbar()

    function handleQuickAction(type: string): void {
        switch (type) {
            case 'Save Contents':
                handleUpdateContents()
                break;
            case 'Refresh Contents':
                handleRefreshContents()
                break;
            case 'Copy Contents':
                handleCopyContent()
                break;
        }
    }

    async function handleUpdateContents(): Promise<void> {
        const url = activeDNSRef.current+apiBaseEndPoint+handleFileChangeEndPoint
        const apiOptions: IApiOptions = {
            method: 'POST',
            url: url,
            params: {path: currentFileAttributes.path, action: 'update', content: fileContentRef.current},
            auth: {username: usernameRef.current, password: passwordRef.current}
        }
        try {
            await ApiRequest(apiOptions)
            openSnackbar('Successfully saved the file', 'success')
        } catch (error) {
            openSnackbar('Failed to save the file', 'error')
        }
    }

    async function handleRefreshContents(): Promise<void> {
        try {
            setIsFileLoading(true)
            const data = await fetchFileData(currentFileAttributes.path)
            setCurrentFileAttributes({...currentFileAttributes, canWrite: data.canWrite, executable: data.executable, fileSize: data.fileSize, lastModified: data.lastModified})
            fileContentRef.current = data.fileContents
            if (fileInputRef.current){
                fileInputRef.current.value = data.fileContents
            }
            setIsFileLoading(false)
            openSnackbar('Refreshed contents!', 'info')
        } catch (error) {
            fileContentRef.current = "Error Fetching content for the file: "+currentFileAttributes.path
            setIsFileLoading(false)
            console.log("Error fetching and setting clicked file!")
            openSnackbar('Failed to refresh contents!', 'error')
        }
    }

    function handleCopyContent(): void {
        navigator.clipboard.writeText(fileContentRef.current)
        openSnackbar('Copied File Contents To Clipboard!', 'info')
    }

    async function fetchFileData(parentPath: string): Promise<ITraverseFileModel> {
        const url = activeDNSRef.current+apiBaseEndPoint+listDirEndPoint
        try {
            const apiOptions: IApiOptions = {
                url: url,
                method: 'GET',
                params: {path: parentPath},
                auth: {username: usernameRef.current, password: passwordRef.current}
            }
            //console.log('Search data: ', apiOptions)
            const {data} = await ApiRequest(apiOptions)
            try {
                traverseFileModel.parse(data)
                return data as ITraverseFileModel
            } catch (error) {
                console.log('Error passing file data as string')
                openSnackbar('Error when parsing returned data to string. Ensure fetch is requesting a file and not a DIR', 'error')
                throw Error
            }
        } catch (error) {
            console.log("Error fetching data for the URL: "+url)
            openSnackbar('Error fetching data for the address: '+url, 'error')
            throw Error
        }
    }

    //console.log('File Quick Action Toolbar has refreshed!')

    return (
        <Box>
            {fileQuickActions.map((value, i) => (
                <Tooltip title={value.title} key={i}>
                    <IconButton onClick={() => handleQuickAction(value.title)}>
                        {<value.icon/>}
                    </IconButton>
                </Tooltip>
            ))}
        </Box>
    )
}