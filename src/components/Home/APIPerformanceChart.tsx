/* eslint-disable @typescript-eslint/no-unused-vars */
import { LineChart } from "@mui/x-charts/LineChart"
import IlineChartSeries from "../../interfaces/IlineChartSeries"
import { useRef, useState } from "react"
import { Alert, Box, Button, IconButton, Slide, Snackbar, Typography, useMediaQuery, useTheme } from "@mui/material"
import APISubmitForm from "./APISubmitForm"
import EditIcon from '@mui/icons-material/Edit';
import APIDataGrid from "./APIDataGrid"
import { DataObject } from "@mui/icons-material"
import CloseIcon from '@mui/icons-material/Close';
import IsnackbarProperties from "../../interfaces/IsnackbarProperties"

function APIPerformanceChart(): JSX.Element {

    const theme = useTheme();
    const isWindowMobile = useMediaQuery(theme.breakpoints.down('mobile'));
    const isWindowSmall = useMediaQuery(theme.breakpoints.down('sm'));
    const apiContainerRef = useRef<HTMLElement>(null)
    const checkedGridAPIRowsRef = useRef<IlineChartSeries[]>([])
    const apiGraphDisplayTypeIndexRef = useRef<number>(4)
    const [isEditApiSelected, setIsEditApiSelected] = useState<boolean>(false)
    const [apiGraphDisplayMethod, setAPIGraphDisplayMethod] = useState<IlineChartSeries['curve']>('natural')
    const [isSnackbarOpen, setIsSnackbarOpen] = useState<boolean>(false)
    const snackbarPropertiesRef = useRef<IsnackbarProperties>()

    const [apiDataObject, setAPIDataObject] = useState<IlineChartSeries[]>([
        {id: 0, area: false, curve: 'natural', data: [2,4,3,5,6,17,27,22,25,32,41], label: '0', state: false, stage: 'Killed', address: 'some string', interval: 30, visible: true},
        {id: 1, area: false, curve: 'natural', data: [4,2,6,7,9,20,32,19,15,32,38], label: '1', state: false, stage: 'Killed', address: 'some string', interval: 10, visible: true},
        {id: 2, area: false, curve: 'natural', data: [8,3,5,9,16,25,31,22,51,55,69], label: '2', state: false, stage: 'Killed', address: 'some string', interval: 10, visible: true},
        {id: 3, area: false, curve: 'natural', data: [2,3,9,5,19,18,12,16,8,11,18], label: '3', state: false, stage: 'Killed', address: 'some string', interval: 10, visible: true}
    ])
    const apiDataObjectRef = useRef<IlineChartSeries[]>(apiDataObject)
    apiDataObjectRef.current = apiDataObject
    const apiDataGraphPlots = useRef<number[]>([0,1,2,3,4,5,6,7,8,9,10])

    function setCheckedGridAPIRowsRef(checkedList: IlineChartSeries[]): void {
        checkedGridAPIRowsRef.current = checkedList
    }

    function addNewSeries(dataObject: IlineChartSeries[]): void {
        setAPIDataObject([...apiDataObject, ...dataObject])
    }

    function handleCheckedRef(ids: number[]): void {
        let newCheckedRefArray = checkedGridAPIRowsRef.current
        for (let index = 0; index < ids.length; ++index) {
            newCheckedRefArray = newCheckedRefArray.filter((item) => {return item != ids[index]})
        }
        checkedGridAPIRowsRef.current = newCheckedRefArray
    }

    function handleGraphDisplayType(index: number): void {
        apiGraphDisplayTypeIndexRef.current=index
    }

    function handleDataGraphPlots(dataObjects: IlineChartSeries[], type: 'remove' | 'add'): void {
        let highestDataPlotLength = 0

        for (let i = 0; i < dataObjects.length; ++i) {
            if (type == 'remove') {
                if (dataObjects[i].visible && dataObjects[i].data.length === apiDataGraphPlots.current.length) {
                    return
                } else {
                    if (dataObjects[i].visible && dataObjects[i].data.length > highestDataPlotLength) {
                        highestDataPlotLength = dataObjects[i].data.length
                    }
                }
            } else if (type == 'add') {
                if (dataObjects[i].visible) {
                    if (dataObjects[i].data.length > highestDataPlotLength) {
                        highestDataPlotLength = dataObjects[i].data.length
                    }
                }
            }
        }

        if (type == 'remove') {
            apiDataGraphPlots.current = apiDataGraphPlots.current.slice(0,highestDataPlotLength)
        } else {
            const difference = highestDataPlotLength - apiDataGraphPlots.current.length
            if (difference > 0) {
                for (let i = 0; i < difference; ++i) {
                    apiDataGraphPlots.current.push(apiDataGraphPlots.current.length)
                }
            } else if (difference < 0) {
                apiDataGraphPlots.current = apiDataGraphPlots.current.slice(0, difference)
            } else {
                return
            }
        }
    }

    function deleteSeries(ids: number[]): void {
        let newDataObjectArray = apiDataObject
        for (let index = 0; index < ids.length; ++index) {
            newDataObjectArray = newDataObjectArray.filter((item) => {return item.id != ids[index]})
        }
        handleCheckedRef(ids)
        handleDataGraphPlots(newDataObjectArray, 'remove')
        setAPIDataObject(newDataObjectArray)
    }

    function toggleVisibleSeries(ids: number[], state: boolean): void {
        let newDataObjectArray = apiDataObject
        const dataPlotType = state? 'add' : 'remove'
        for (let index = 0; index < ids.length; ++index) {
                newDataObjectArray = newDataObjectArray.map((object) => {
                if (object.id === ids[index]) {
                    return {...object, visible: state}
                } else {
                    return object
                }})
        }
        handleCheckedRef(ids)
        handleDataGraphPlots(newDataObjectArray, dataPlotType)
        setAPIDataObject(newDataObjectArray)
    }

    function toggleStageStateSeries(ids: number[], stage: IlineChartSeries['stage']): void {
        let newDataObjectArray = apiDataObjectRef.current
        const apiRequests: {address: string, interval: number, id: number}[] = []
        let state = false
        if (stage == 'Active') {
            state = true
        }

        for (let index = 0; index < ids.length; ++index) {
                newDataObjectArray = newDataObjectArray.map((object) => {
                if (object.id === ids[index]) {
                    if (state) {
                        apiRequests.push({address: object.address, interval: object.interval, id: object.id})
                    }
                    return {...object, state: state, stage: stage}
                } else {
                    return object
                }})
        }
        handleCheckedRef(ids)
        setAPIDataObject(newDataObjectArray)
        if (state) {
            apiRequests.map((object) => {
                apiRequest(object.address, object.interval, object.id)
            })
        }
    }

    function changeSeriesDisplayMethod(displayMethod: IlineChartSeries['curve']): void {
        setAPIGraphDisplayMethod(displayMethod)
        setAPIDataObject(apiDataObject.map((object) => {
            return {...object, curve: displayMethod}
        }))
    }

    function handleEditAPI(): void {
        setIsEditApiSelected(!isEditApiSelected)
    }

    const apiRequest = async (url: string, sleepduration: number, seriesId: number): Promise<boolean> => {
        try { 
            const timestampBeforeRequest = Date.now()
            const response = await fetch(url)
            const apiResponseTime = Date.now() - timestampBeforeRequest

            setAPIDataObject(apiDataObjectRef.current.map((object) => {
                if (object.id === seriesId) {
                    if (object.data.length === apiDataGraphPlots.current.length) {
                        for (let i = 0; i < 10; ++i) {
                            apiDataGraphPlots.current.push(apiDataGraphPlots.current.length)
                        }
                    }
                    return {...object, data: [...object.data, apiResponseTime]}
                } else {
                    return object
                }
            }))

            await new Promise(resolve => setTimeout(resolve, sleepduration))

            const index = apiDataObjectRef.current.findIndex((object) => object.id === seriesId)
            
            if (index >= 0 ) {
                if (apiDataObjectRef.current[index].state) {
                    apiRequest (url, sleepduration, seriesId)
                }
            }

            return true
        } catch (error) {
            console.log('error with req', error)
            throw error
        }
    }

    function handleSnackbarRequest(snackbarProperties: IsnackbarProperties): void {
        snackbarPropertiesRef.current = snackbarProperties
        setIsSnackbarOpen(true)
    }

    function handleSnackbarClose(event?: React.SyntheticEvent | Event, reason?: string): void {
        if (reason === 'clickaway'){
            return;
        }
        setIsSnackbarOpen(false)
    }

    console.log('refreshed API performance chart')

    return (
        <>
            <Snackbar anchorOrigin={{vertical: 'top', horizontal: 'right'}} open={isSnackbarOpen} transitionDuration={400} autoHideDuration={4000} onClose={handleSnackbarClose} sx={{ marginTop: '64px' }}>
                <Box display={'inline-flex'} flexDirection={'row'}>
                    <Alert severity={snackbarPropertiesRef.current?.severity} variant="filled" elevation={6} sx={{ alignSelf: 'center' }}>
                        <Box position={'relative'} display={'inline-flex'} flexDirection={'row'}>
                            <Box marginRight={'26px'}>
                                {snackbarPropertiesRef.current?.message}
                            </Box>
                        </Box>
                    </Alert>
                    <IconButton 
                    size="small" 
                    sx={ snackbarPropertiesRef.current?.severity == 'error'? { padding: '4px', position: 'absolute', borderRadius: '50%', right: '10px', top: '10px', color: 'white', "&:hover":{backgroundColor: 'transparent'} } 
                    : { padding: '4px', position: 'absolute', borderRadius: '50%', right: '10px', top: '10px', color: 'black', "&:hover":{backgroundColor: 'transparent'} }} 
                    onClick={() => {setIsSnackbarOpen(false)}}>
                        <CloseIcon sx={{ height: '20px', width: '20px' }}/>
                    </IconButton>
                </Box>
            </Snackbar>
            <Box display={'inline-flex'} flexDirection={'column'} width='100%' ref={apiContainerRef}>
                <Typography variant="h6">API Response Times (ms)</Typography>
                <Box display='inline-flex' flexDirection={'row'} height= '300px' width={'100%'}>
                    {(isWindowSmall && !isEditApiSelected) ?
                        <Box width={'100%'}>
                            <LineChart
                                xAxis={[{ data: apiDataGraphPlots.current }]}
                                series={apiDataObject.map(({ id, state, address, ...rest }) => rest).filter((object) => object.visible)}
                            />
                        </Box> 
                    : !isWindowSmall &&
                        <Box width={isEditApiSelected? '50%' : '100%'}>
                            <LineChart
                                xAxis={[{ data: apiDataGraphPlots.current }]}
                                series={apiDataObject.map(({ id, state, address, ...rest }) => rest).filter((object) => object.visible)}
                            />
                        </Box>
                    }
                    {isEditApiSelected &&
                    <Slide in={isEditApiSelected} container={apiContainerRef.current} direction="left">
                        <Box height={'100%'} width={isWindowSmall? '100%' : '50%'} display={'inline-flex'} flexDirection={'column'}>
                            <APIDataGrid 
                            dataObject={apiDataObject} 
                            setCheckedRowsRef={setCheckedGridAPIRowsRef} 
                            checkedRowsRef={checkedGridAPIRowsRef} 
                            apiGraphDisplayTypeIndexRef={apiGraphDisplayTypeIndexRef}
                            setGraphDisplayTypeRef={handleGraphDisplayType}
                            handleEditAPIWindow={handleEditAPI} 
                            handleRemoveSeries={deleteSeries} 
                            handleToggleVisible={toggleVisibleSeries} 
                            handleStageStateSeries={toggleStageStateSeries}
                            handleDisplayMethodChange={changeSeriesDisplayMethod} />
                        </Box>
                    </Slide>}
                </Box>
                <Box display={'inline-flex'} width={'100%'} flexDirection={'row'} alignItems={'center'} justifyContent={isWindowSmall? 'center': 'null'} marginTop={'6px'}>
                    <APISubmitForm addNewSeries={addNewSeries} displayMethod={apiGraphDisplayMethod} toggleStageState={toggleStageStateSeries} createSnackbarRequest={handleSnackbarRequest}/>
                    <Button startIcon={<EditIcon />} variant="contained" onClick={handleEditAPI} sx={{ textTransform: 'none', marginRight: '10px' }}>Edit APIs</Button>
                </Box>
            </Box>
        </>
    )
}

export default APIPerformanceChart