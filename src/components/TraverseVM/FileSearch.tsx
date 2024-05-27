import { TextField } from "@mui/material";
import { useConnectSession } from "../../contexts/ConnectSessionContext";
import { useSnackbar } from "../../contexts/SnackbarContext";
import { useContext, useRef } from "react";
import { FileAttributesUpdateContext } from "../../contexts/FileAttributesContext";
import {z} from 'zod'
import ApiRequest from "../../utils/apiRequest";
import IApiOptions from "../../interfaces/IApiOptions";
import APIConnectionContext from "../../contexts/APIConnectionContext";

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

export default function FileSearch(): JSX.Element {
    const fileAttributesUpdateContext = useContext(FileAttributesUpdateContext)
    const apiConnectionContext = useContext(APIConnectionContext)

    if (!apiConnectionContext || !fileAttributesUpdateContext) {
        throw new Error('Appropriate contexts must be supplied!')
    }

    const { updateCurrentFileAttributes, updateIsContentReadOnly, updateIsFileActive, updateFileContent, updateIsFileLoading } = fileAttributesUpdateContext
    const { activeDNSRef, usernameRef, passwordRef, apiBaseEndPoint, listDirEndPoint } = apiConnectionContext

    const { openSnackbar } = useSnackbar();
    const { isActiveSession } = useConnectSession();
    const searchFilePath = useRef<string>('')

    async function handleSearchFile(e: string): Promise<void> {
        if (e === 'Enter') {
            let newURL = ''
            newURL = searchFilePath.current
            try {
                updateIsFileLoading(true)
                updateIsFileActive(true)
                const data = await fetchFileData(newURL)
                updateFileContent(data.fileContents)
                updateCurrentFileAttributes({path: searchFilePath.current, ...data})
                updateIsContentReadOnly(true)
                openSnackbar('Fetched data for: '+searchFilePath.current, 'success')
                updateIsFileLoading(false)
            } catch (error) {
                updateIsFileLoading(false)
                updateFileContent("Error Fetching content for the file: "+searchFilePath.current)
                return
            }
        }
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

    //console.log('File Search has refreshed!')

    return (
        <TextField placeholder="/search/directly/for/file" disabled={!isActiveSession} size={"small"} InputProps={{style: {fontSize: 18}, disableUnderline: true}} sx={{marginLeft: '12px', marginRight: '12px'}} variant="standard" fullWidth onKeyDown={e => handleSearchFile(e.key)} onChange={e => searchFilePath.current = e.target.value}/>
    )
}