import { TextField, FormControl, InputLabel, Select, MenuItem, Drawer, Box, IconButton, Typography, Button } from "@mui/material"
import { useRef, useState } from "react"
import IlineChartSeries from "../interfaces/IlineChartSeries";
import CloseIcon from '@mui/icons-material/Close';
import ApiIcon from '@mui/icons-material/Api';
import GreenPlusIcon from '../assets/plus-circle-green.svg'
import validateAPI from "../utils/validateAPI";
import IsnackbarProperties from "../interfaces/IsnackbarProperties";

interface APISubmitFormDetails {
    addNewSeries(dataObject: IlineChartSeries[]): void;
    displayMethod: IlineChartSeries['curve'];
    toggleStageState(ids: number[], stage: IlineChartSeries['stage']): void;
    createSnackbarRequest(props: IsnackbarProperties): void;
}

function APISubmitForm (props: APISubmitFormDetails): JSX.Element {

    const [apiInputField, setAPIInputField] = useState<string>('')
    const [apiInterval, setAPIInterval]= useState<string>('')
    const [isDrawerOpen, setIsDrawerOpen]= useState<boolean>(false)
    const [isAPIInputValid, setIsAPIInputValid] = useState<boolean>(true)
    const apiSeriesCountIdRef = useRef<number>(3)

    async function handleAPISubmit(): Promise<void> {
        if (validateAPIInput()){
            apiSeriesCountIdRef.current++
            props.addNewSeries([{id: apiSeriesCountIdRef.current, area: false, curve: props.displayMethod, data: [], label: apiSeriesCountIdRef.current.toString(), state: true, stage: 'Validating', address: apiInputField, interval: parseInt(apiInterval)*1000, visible: true}])
            setIsDrawerOpen(false)
            setAPIInputField('')
            setAPIInterval('')
            setIsAPIInputValid(true)
            const currentId = apiSeriesCountIdRef.current
            const currentAddress = apiInputField
            if (await validateAPIUrl()) {
                props.toggleStageState([currentId], 'Active')
                props.createSnackbarRequest({message: 'Valiated API request for '+currentId+' - '+currentAddress, severity: 'success'})
            } else {
                props.toggleStageState([currentId], 'Failed')
                props.createSnackbarRequest({message: 'Failed API Validation for '+currentId+' - '+currentAddress, severity: 'error'})
            }
        }
    }

    function handleAPICancel(): void {
        setAPIInputField('')
        setAPIInterval('')
        setIsDrawerOpen(false)
        setIsAPIInputValid(true)
    }

    function validateAPIInput(): boolean {
        try {
            new URL(apiInputField)
            return true
        } catch (error) {
            setIsAPIInputValid(false)
            return false
        }
    }

    async function validateAPIUrl(): Promise<boolean> {
        try {
            if (await validateAPI(new URL(apiInputField))) {
                return true
            }
            return false
        } catch (error) {
            return false
        }
    }

    console.log('Updated form')

    return (
        <>
            <Drawer anchor='right' open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
                <Box width='300px' height={'100%'} role='presentation' display={'flex'} flexDirection='column' bgcolor={'background.default'}>
                    <Box marginBottom={'6px'} p={1} width={'100%'} display={'inline-flex'} justifyContent={'space-between'} alignItems={'center'} height='64px' bgcolor='primary.dark' boxShadow={4}>
                        <Box display={'inline-flex'} alignItems={'center'} sx={{ paddingLeft: '8px' }}>
                            <IconButton size='large' edge='start' sx={{ "&:hover":{backgroundColor: 'transparent'}, cursor: 'auto' }}>
                                <ApiIcon />
                            </IconButton>
                            <Typography component='div'>
                                Add New API Address
                            </Typography>
                        </Box>
                        <Box>
                            <IconButton size='large' onClick={() => setIsDrawerOpen(false)}>
                                <CloseIcon />
                            </IconButton>
                        </Box>
                    </Box>
                    <Box width={'100%'} paddingLeft={'12px'} paddingRight={'12px'} marginTop={'12px'} marginBottom={'12px'}>
                        <TextField value={apiInputField} variant='outlined' label='api end point' id='api-end-point-input' fullWidth required type={"url"} multiline color={'secondary'} error={!isAPIInputValid} helperText={!isAPIInputValid && 'Invalid API String'} FormHelperTextProps={{ error: true }} onChange={e => setAPIInputField(e.target.value)} />
                    </Box>
                    <Box width={'100%'} paddingLeft={'12px'} paddingRight={'12px'} marginBottom={'12px'}>
                        <FormControl fullWidth>
                            <InputLabel id='select-api-duration' color="secondary">API Interval (s)</InputLabel>
                            <Select value={apiInterval} labelId='select-api-duration-label' id='select-api-duration-id' label='api duration' required color="secondary" onChange={e => setAPIInterval(e.target.value)}>
                                <MenuItem value={1}>1</MenuItem>
                                <MenuItem value={10}>10</MenuItem>
                                <MenuItem value={30}>30</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                    <Box marginTop={'auto'} width={'100%'}>
                        <Button sx={{ width: '50%', borderRadius: 0, height: '60px', backgroundColor: 'custom.cancel.dark', "&:hover":{backgroundColor: 'custom.cancel.main'} }} onClick={(handleAPICancel)}>Cancel</Button>
                        <Button sx={{ width: '50%', borderRadius: 0, height: '60px', backgroundColor: 'custom.confirm.dark', "&:hover":{backgroundColor: 'custom.confirm.main'} }} disabled={(apiInputField == '' || apiInterval == '')} onClick={(handleAPISubmit)}>Confirm</Button>
                    </Box>
                </Box>
            </Drawer>
            <Box sx={{ display: 'inline-flex', flexDirection: 'row' }}>
                <Button startIcon={<img style={{ height: '16px' }} src={GreenPlusIcon}/>} variant="contained" onClick={() => setIsDrawerOpen(true)} sx={{ textTransform: 'none', marginRight: '10px' }}>New API</Button>
            </Box>
            
        </>
)}

export default APISubmitForm