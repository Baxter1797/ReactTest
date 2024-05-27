import { Box, Button, Menu, MenuItem, ListItemIcon, ListItemText, SvgIconTypeMap, IconButton } from "@mui/material"
import { DataGrid, GridColDef, GridRowSelectionModel } from "@mui/x-data-grid"
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import { useEffect, useState } from "react";
import IlineChartSeries from "../../interfaces/IlineChartSeries";
import { OverridableComponent } from "@mui/material/OverridableComponent";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import SsidChartIcon from '@mui/icons-material/SsidChart';
import InsightsIcon from '@mui/icons-material/Insights';

interface APIGridDataProps {
    dataObject: IlineChartSeries[];
    setCheckedRowsRef(checkedList: IlineChartSeries[]): void;
    checkedRowsRef: React.MutableRefObject<IlineChartSeries[]>;
    apiGraphDisplayTypeIndexRef: React.MutableRefObject<number>;
    setGraphDisplayTypeRef(index: number): void;
    handleEditAPIWindow(): void;
    handleRemoveSeries(ids: number[]): void;
    handleToggleVisible(ids: number[], state: boolean): void;
    handleStageStateSeries(ids: number[], stage: IlineChartSeries['stage']): void;
    handleDisplayMethodChange(displayMethod: IlineChartSeries['curve']): void;
}

const columns: GridColDef[] = [
    {field: 'id', headerName: 'ID', width: 1},
    {field: 'address', headerName: 'Address', flex: 1, minWidth: 200},
    {field: 'stage', headerName: 'Stage', width: 90},
    {field: 'visible', headerName: 'Visible', width: 70}
]

const gridAPIActionOptions: { itemName: string, action: string, icon: OverridableComponent<SvgIconTypeMap<object, "svg">> & { muiName: string;} }[] = [
    {itemName: 'Delete', action: 'delete', icon: DeleteIcon},
    {itemName: 'Hide', action: 'hide', icon: VisibilityOffIcon},
    {itemName: 'Show', action: 'show', icon: VisibilityIcon},
    {itemName: 'Pause', action: 'pause', icon: PauseCircleIcon},
    {itemName: 'Resume', action: 'resume', icon: PlayCircleIcon},
];

function APIDataGrid(props: APIGridDataProps): JSX.Element {

    const gridAPIGraphOptions: {itemName: string, icon: OverridableComponent<SvgIconTypeMap<object, "svg">> & { muiName: string;}, handleOnClick(displayMethod: string): void}[] = [
        {itemName: 'catmullRom', icon: InsightsIcon, handleOnClick: props.handleDisplayMethodChange},
        {itemName: 'linear', icon: InsightsIcon, handleOnClick: props.handleDisplayMethodChange},
        {itemName: 'monotoneX', icon: InsightsIcon, handleOnClick: props.handleDisplayMethodChange},
        {itemName: 'monotoneY', icon: InsightsIcon, handleOnClick: props.handleDisplayMethodChange},
        {itemName: 'natural', icon: InsightsIcon, handleOnClick: props.handleDisplayMethodChange},
        {itemName: 'step', icon: InsightsIcon, handleOnClick: props.handleDisplayMethodChange},
        {itemName: 'stepBefore', icon: InsightsIcon, handleOnClick: props.handleDisplayMethodChange},
        {itemName: 'stepAfter', icon: InsightsIcon, handleOnClick: props.handleDisplayMethodChange},
    ]

    const [checkedGridAPIRows, setCheckedGridAPIRows] = useState<number[]>([])
    const [isAPIMenuOpen, setAPIMenuOpen] = useState<boolean>(false)
    const [isAPIOptionMenuOpen, setAPIOptionMenuOpen] = useState<boolean>(false)
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [disableActionOptionsFlag, setDisableActionOptionsFlag] = useState<boolean>(false)
    const [selectedGraphOptionIndex, setSelectedGraphOptionIndex] = useState<number>(4)

    useEffect(() => {
        handleRowSelection(props.checkedRowsRef.current);
        setSelectedGraphOptionIndex(props.apiGraphDisplayTypeIndexRef.current)
      }, []);

    function onRowsSelectionHandler(ids: GridRowSelectionModel): void {
        handleRowSelection(ids.map((id) => props.dataObject.find((row) => row?.id === id)))
    }

    function handleRowSelection(selectedObjects: IlineChartSeries[]): void {
        let shouldSetFlagTo = false
        for (let i = 0; i < selectedObjects!.length; ++i) {
            if (!(selectedObjects[i].stage == 'Active' || selectedObjects[i].stage == 'Paused')) {
                shouldSetFlagTo = true
                break
            }
        }

        setCheckedGridAPIRows(selectedObjects.map((r) => r!.id))

        if (shouldSetFlagTo != disableActionOptionsFlag) {
            setDisableActionOptionsFlag(shouldSetFlagTo)
        }

        props.setCheckedRowsRef(selectedObjects)
    }
    
    function handleAPIActionMenuClose(): void {
        setAnchorEl(null);
        setAPIMenuOpen(false);
    }

    function handleAPIActionMenuClick(event: React.MouseEvent<HTMLButtonElement>): void {
        setAnchorEl(event.currentTarget);
        setAPIMenuOpen(true);
    }

    function handleAPIGraphOptionMenuClick(event: React.MouseEvent<HTMLButtonElement>): void {
        setAnchorEl(event.currentTarget)
        setAPIOptionMenuOpen(true)
    }

    function handleAPIGraphOptionMenuClose(): void {
        setAnchorEl(null)
        setAPIOptionMenuOpen(false)
    }

    function handleAPIActionMenuRequest(index: number): void {
        handleAPIActionMenuClose()
        switch(index) {
            case 0:
                props.handleRemoveSeries(checkedGridAPIRows)
                break
            case 1:
                props.handleToggleVisible(checkedGridAPIRows, false)
                break
            case 2:
                props.handleToggleVisible(checkedGridAPIRows, true)
                break
            case 3:
                props.handleStageStateSeries(checkedGridAPIRows, 'Paused')
                break
            case 4:
                props.handleStageStateSeries(checkedGridAPIRows, 'Active')
                break
        }
        setCheckedGridAPIRows([])
    }

    function handleAPIOptionMenuRequest(index: number, displayOption: string): void {
        handleAPIGraphOptionMenuClose()
        gridAPIGraphOptions[index].handleOnClick(displayOption)
        setSelectedGraphOptionIndex(index)
        props.setGraphDisplayTypeRef(index)
    }

    //console.log('Refreshed APIDataGrid')

    return (
        <>
        <Box display={'inline-flex'} flexDirection={'row-reverse'} width={'100%'}>
            <IconButton sx={{ backgroundColor: 'primary.main', marginBottom: '6px', marginLeft: '6px', borderRadius: '10%'}} onClick={props.handleEditAPIWindow}>
                <ExitToAppIcon />
            </IconButton>
            <Button variant="contained" endIcon={<ArrowDropDownIcon />} disabled={checkedGridAPIRows.length === 0} sx={{ textTransform: 'none', marginLeft: '6px', marginBottom: '6px' }} onClick={handleAPIActionMenuClick}>Actions</Button>
            <Button variant="contained" startIcon={<SsidChartIcon />} endIcon={<ArrowDropDownIcon />} sx={{ textTransform: 'none', marginBottom: '6px' }} onClick={handleAPIGraphOptionMenuClick}>Options</Button>
        </Box>
        <Menu id="basic-menu" anchorEl={anchorEl} open={isAPIMenuOpen} onClose={handleAPIActionMenuClose}>
            {gridAPIActionOptions.map((value, i) => (
                    <MenuItem key={i} onClick={() => handleAPIActionMenuRequest(i)} disabled={(value.itemName == 'Pause' || value.itemName == 'Resume') && disableActionOptionsFlag}>
                        <ListItemIcon>
                            {<value.icon fontSize='small'/>}
                        </ListItemIcon>
                        <ListItemText sx={{ height: '20px' }} primaryTypographyProps={{ fontSize: '14px' }}>{value.itemName}</ListItemText>
                    </MenuItem>
                ))}
        </Menu>
        <Menu id="basic-menu" anchorEl={anchorEl} open={isAPIOptionMenuOpen} onClose={handleAPIGraphOptionMenuClose}>
            {gridAPIGraphOptions.map((value, i) => (
                    <MenuItem key={i} onClick={() => handleAPIOptionMenuRequest(i, value.itemName)} sx={ i==selectedGraphOptionIndex? { backgroundColor: 'primary.light' } : {} }>
                        <Box sx={ i==selectedGraphOptionIndex? { position: "absolute", left: '0px', width: '4px', height: '100%', backgroundColor: 'secondary.main'} : {} }></Box>
                        <ListItemIcon>
                            {<value.icon fontSize='small'/>}
                        </ListItemIcon>
                        <ListItemText sx={{ height: '20px' }} primaryTypographyProps={{ fontSize: '14px' }}>{value.itemName}</ListItemText>
                    </MenuItem>
                ))}
        </Menu>
        <DataGrid rows={props.dataObject.map(({ id, stage, address, visible }) => ({ id, stage, address, visible }) )} columns={columns} 
            density='compact'
            checkboxSelection
            onRowSelectionModelChange={(ids) => onRowsSelectionHandler(ids)} 
            rowSelectionModel={checkedGridAPIRows}
            />
        </>
    )
}

export default APIDataGrid