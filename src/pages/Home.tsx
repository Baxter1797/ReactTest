import { Box } from '@mui/material';
import APIPerformanceChart from '../components/Home/APIPerformanceChart.tsx';

function Home(): JSX.Element {

    //console.log('Refreshed Home!')

    return (
    <>  
        <Box boxShadow={8} borderRadius={'10px'} p={1}>
            <Box display={'flex'} width={'100%'} minHeight={'300px'}>
                <APIPerformanceChart />
            </Box>
        </Box>
    </>    
    )
}

export default Home;