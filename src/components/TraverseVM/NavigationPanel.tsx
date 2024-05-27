import { Box } from "@mui/material";
import ITraverseDir from "../../interfaces/ITraverseDir";
import ConnectionHeader from "./ConnectionHeader";
import TVM_RenderTree from "./TVM_RenderTree";
import { FileAttributesUpdateContext } from "../../contexts/FileAttributesContext";
import { useContext } from "react";
import APIConnectionContext from "../../contexts/APIConnectionContext";
import IApiOptions from "../../interfaces/IApiOptions";
import ApiRequest from "../../utils/apiRequest";
import { useSnackbar } from "../../contexts/SnackbarContext";
import { z } from 'zod'
import { useConnectSession } from "../../contexts/ConnectSessionContext";

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

export default function NavigationPanel(): JSX.Element {
    const apiConnectionContext = useContext(APIConnectionContext)
    const fileAttributesUpdateContext = useContext(FileAttributesUpdateContext)

    if (!apiConnectionContext || !fileAttributesUpdateContext) {
        throw new Error('Appropriate contexts must be supplied!')
    }

    const { activeDNSRef, usernameRef, passwordRef, apiBaseEndPoint, listDirEndPoint } = apiConnectionContext
    const { updateCurrentFileAttributes, updateIsFileActive, updateFileContent, updateIsFileLoading } = fileAttributesUpdateContext

    const { openSnackbar } = useSnackbar();
    const { isActiveSession } = useConnectSession();

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

    async function handleFileClick(node: ITraverseDir): Promise<void> {
        try {
            updateIsFileLoading(true)
            updateIsFileActive(true)
            const data = await fetchFileData(node.path)
            updateFileContent(data.fileContents)
            updateCurrentFileAttributes(node)
            updateIsFileLoading(false)
        } catch (error) {
            updateIsFileLoading(false)
            updateFileContent("Error Fetching content for the file: "+node.path)
            console.log("Error fetching and setting clicked file!")
        }

    }

    //console.log('Navigation Panel Refreshed!')

    return (
        <Box sx={{backgroundColor: 'background.default', marginTop: '10px'}} height={'100%'} overflow={'auto'} whiteSpace={'nowrap'}>
            <ConnectionHeader />
            { isActiveSession && <TVM_RenderTree handleFileClick={handleFileClick} updateContext/> }
        </Box>
    )
}