//import ToggleTheme from "./ToggleTheme.tsx";
import SettingsEthernetIcon from '@mui/icons-material/SettingsEthernet';
import { AppBar, Box, Button, Divider, IconButton, ListItemIcon, ListItemText, Stack, SvgIconTypeMap, SwipeableDrawer, Toolbar, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import HomeIcon from '@mui/icons-material/Home';
import ProfilePic from '../../images/profile.jpeg'
import DashboardIcon from '@mui/icons-material/Dashboard';
import EditIcon from '@mui/icons-material/Edit';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import VerticalAlignCenterIcon from '@mui/icons-material/VerticalAlignCenter';

//interfaces
import { OverridableComponent } from '@mui/material/OverridableComponent';
import IdisplayAndClose from '../../interfaces/IdisplayAndClose';

//constants
const drawerButtonSize='48px';

function displayAndClose(displayAndClose: IdisplayAndClose): void {
    displayAndClose.close(false);
    displayAndClose.displayItem(displayAndClose.state);
}

const sidebarButtonStyles = {
    textTransform: "none", 
    borderRadius: "0px", 
    minHeight:drawerButtonSize, 
    justifyContent: "flex-start",
    paddingLeft: '24px',
}

const sideMenuItems: { itemName: string, navigatePath: string, icon: OverridableComponent<SvgIconTypeMap<object, "svg">> & { muiName: string;} }[] = [
    {itemName: 'Dashboard', navigatePath: '/', icon: DashboardIcon},
    {itemName: 'About', navigatePath: 'About', icon: HomeIcon},
    {itemName: 'Traverse VM', navigatePath: 'traverseVM', icon: HomeIcon},
];

const profileMenuItems: { itemName: string, navigatePath: string, icon: OverridableComponent<SvgIconTypeMap<object, "svg">> & { muiName: string;} }[] = [
    {itemName: 'Edit Proile', navigatePath: 'profile', icon: EditIcon},
    {itemName: 'Logout', navigatePath: 'profile', icon: LogoutIcon},
    {itemName: 'Settings', navigatePath: 'profile', icon: SettingsIcon}
];

function NavBar(): JSX.Element {
    const navigate = useNavigate();
    const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false);
    const [isShowVertLine, setIsShowVertLine] = useState<boolean>(false);
    const [selectedPageMenuIndex, setSelectedPageMenuIndex] = useState<number>(sideMenuItems.findIndex((object) => object.navigatePath === window.location.pathname))
    
    //setSelectedPageMenuIndex(sideMenuItems.findIndex((object) => object.navigatePath === window.location.pathname))

    const theme = useTheme();
    const isWindowLargerThanSmall = useMediaQuery(theme.breakpoints.up("sm"));

    const profileAdminDisplayItems: { itemName: string, icon: OverridableComponent<SvgIconTypeMap<object, "svg">> & { muiName: string;}, stateHook: React.Dispatch<React.SetStateAction<boolean>>, state: boolean }[] = [
        {itemName: 'Draw Vertical Line', icon: VerticalAlignCenterIcon, stateHook: setIsShowVertLine, state: isShowVertLine}
    ];

    const handleProfileMenuClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
        setAnchorEl(event.currentTarget);
        setIsProfileMenuOpen(true);
    };

    const handleProfileMenuClose = (): void => {
        setAnchorEl(null);
        setIsProfileMenuOpen(false);
    };

    function navigateOnly(path: string): void {
        navigate(path)
        setSelectedPageMenuIndex(sideMenuItems.findIndex((object) => object.navigatePath === window.location.pathname || '/'+object.navigatePath === window.location.pathname))
    }

    function navigateAndClose(path: string, menuType: 'Main' | 'Profile' | 'Admin'): void {
        navigate(path)
        if (menuType == 'Main') {
            setIsDrawerOpen(false)
            //console.log(sideMenuItems.findIndex((object) => object.navigatePath === window.location.pathname))
            setSelectedPageMenuIndex(sideMenuItems.findIndex((object) => object.navigatePath === window.location.pathname || '/'+object.navigatePath === window.location.pathname))
        } else if (menuType == 'Profile' || menuType == 'Admin') {
            setIsProfileMenuOpen(false)
            setSelectedPageMenuIndex(sideMenuItems.findIndex((object) => object.navigatePath === window.location.pathname || '/'+object.navigatePath === window.location.pathname))
        }
    }

    //console.log('Nav Bar has refreshed!')

    return (
        <>
            { isShowVertLine && <div style={{ border: '2px solid red', height: '100vh', position: 'absolute', left: '50%' }}></div> }
            <SwipeableDrawer anchor='left' open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} onOpen={() => setIsDrawerOpen(true)} swipeAreaWidth={20}>
                <Box width='300px' height={'100%'} role='presentation' display={'flex'} flexDirection='column' bgcolor={'background.default'}>
                    <Box marginBottom={'6px'} p={1} width={'100%'} display={'inline-flex'} justifyContent={'space-between'} alignItems={'center'} height='64px' bgcolor='primary.dark' boxShadow={4}>
                        <Box display={'inline-flex'} alignItems={'center'} sx={{ paddingLeft: '8px' }}>
                            <IconButton size='large' edge='start' sx={{ "&:hover":{backgroundColor: 'transparent'} }} onClick={() => navigateAndClose('/','Main')}>
                                <SettingsEthernetIcon />
                            </IconButton>
                            <Typography variant='h6' component='div'>
                                Admin Panel
                            </Typography>
                        </Box>
                        <Box>
                            <IconButton size='large' onClick={() => setIsDrawerOpen(false)}>
                                <CloseIcon />
                            </IconButton>
                        </Box>
                    </Box>
                    <Box height={'180px'} width={'100%'} display={'flex'} flexDirection={'column'} justifyContent={'space-between'} paddingTop={'10px'} paddingBottom={'10px'} alignItems={'center'} position={'relative'} >
                        <IconButton size='medium' sx={{ position: 'absolute', top: '0px', right: '10px' }} onClick={() => navigateAndClose('profile','Main')}>
                            <EditIcon />
                        </IconButton>
                        <Box width={'120px'} height={'120px'} borderRadius={'50%'} overflow={'hidden'}>
                            <img src={ProfilePic} />
                        </Box>
                        <Typography>SRVACCRCSA</Typography>
                    </Box>
                    {sideMenuItems.map((value, i) => (
                        <Box key={i} width={'100%'} display={'inline-flex'} alignItems={'center'} height={drawerButtonSize} position={'relative'} sx={ i==selectedPageMenuIndex? {backgroundColor: 'primary.light'} : {} }>
                            <Box sx={ i==selectedPageMenuIndex? { position: "absolute", left: '0px', width: '4px', height: '100%', backgroundColor: 'secondary.main'} : {} }></Box>
                            <Button startIcon={<value.icon sx={{ marginRight: '6px' }} />} variant='text' sx={ sidebarButtonStyles } fullWidth onClick={() => navigateAndClose(value.navigatePath,'Main')}>{value.itemName}</Button>
                        </Box>
                    ))}
                    <Box width={'100%'} display={'inline-flex'} alignItems={'center'} height={drawerButtonSize}>
                        <Button startIcon={<HomeIcon sx={{ marginRight: '6px' }} />} color='error' variant='text' sx={ sidebarButtonStyles } fullWidth onClick={() => navigateAndClose('About', 'Main')}>About</Button>
                    </Box>
                </Box>
            </SwipeableDrawer>
            <AppBar position='static' sx={{ bgcolor: 'primary.dark', backgroundBlendMode: 'color'}}>
                <Toolbar sx={{ maxHeight: '64px', minHeight: '64px', padding: '20px' }} disableGutters>
                    <IconButton size='large' edge='start' onClick={() => setIsDrawerOpen(true)}>
                        <MenuIcon />
                    </IconButton>
                    <Box p={1} sx={{ flexGrow: 1, display: 'inline-flex', alignItems: 'center' }}>
                        { isWindowLargerThanSmall && <Typography variant='h6' component={'div'} sx={{ paddingRight:'8px', cursor: 'pointer' }} onClick={() => {navigateOnly('/')}}>
                                RCSA Admin Console
                            </Typography>
                        }
                        <IconButton size='small' edge='start' sx={ isWindowLargerThanSmall ? { "&:hover":{backgroundColor: 'transparent'} } : { "&:hover":{backgroundColor: 'transparent'}, position: 'absolute', left: '50%', right: '50%'}} onClick={() => {navigateOnly('/')}}>
                            <SettingsEthernetIcon />
                        </IconButton>
                    </Box>
                    <Stack direction='row' spacing={1} alignContent={'center'} display={'inline-flex'} alignItems={'center'}>
                        <Tooltip title='Account'>
                            <Button sx={{ minWidth: '50px', minHeight: '50px'}} onClick={handleProfileMenuClick}>
                                <Box width={'30px'} height={'30px'} borderRadius={'50%'} overflow={'hidden'}>
                                    <img src={ProfilePic} />
                                </Box>
                            </Button>
                        </Tooltip>
                        <Menu id="basic-menu" anchorEl={anchorEl} open={isProfileMenuOpen} onClose={handleProfileMenuClose}>
                            {profileMenuItems.map((value, i) => (
                                    <MenuItem key={i} onClick={() => navigateAndClose(value.navigatePath, 'Profile')}>
                                        <ListItemIcon>
                                            {<value.icon fontSize='small'/>}
                                        </ListItemIcon>
                                        <ListItemText>{value.itemName}</ListItemText>
                                    </MenuItem>
                                ))}
                            <Divider />
                            {profileAdminDisplayItems.map((value, i) => (
                                <MenuItem key={i} onClick={() => {const dispAndClose: IdisplayAndClose = {displayItem: value.stateHook, state: !value.state, close: setIsProfileMenuOpen}; displayAndClose(dispAndClose)}}>
                                    <ListItemIcon>
                                        {<value.icon fontSize='small' />}
                                    </ListItemIcon>
                                    <ListItemText>{value.itemName}</ListItemText>
                                </MenuItem>
                            ))}
                        </Menu>
                    </Stack>
                </Toolbar>
            </AppBar>
        </>
    );
}

export default NavBar;