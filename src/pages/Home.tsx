// Libraries
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

// Components
import HelloWorld from '../components/HelloWorld.tsx';
import InputField from '../components/InputField.tsx';
import Button from '../components/Button.tsx';

// Types
import IuserDetails from '../interfaces/IuserDetails.tsx';
import HelloWorld2 from '../components/HelloWorld2.tsx';
import { Box, TextField } from '@mui/material';
import APIPerformanceChart from '../components/APIPerformanceChart.tsx';

function handleSetName(handleEvent: React.Dispatch<React.SetStateAction<IuserDetails>>): void {
    const userInfo: IuserDetails = {
        firstname: (document.getElementById("input-first-name") as HTMLInputElement).value,
        lastname: (document.getElementById("input-last-name") as HTMLInputElement).value,
    };

    handleEvent(userInfo);
    console.log("You just set the name!")
  }
  
function handleConsoleLog(inputString: string): void {
console.log(inputString)
}

function Home(): JSX.Element {

    const [userDetails, setUserDetails] = useState<IuserDetails>({
        firstname: "",
        lastname: "",
    });

    const [test, setTest] = useState<string>()

    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else {
            handleConsoleLog("useEffect Executed...");
        }
       // handleConsoleLog("useEffect Executed...");
    },[userDetails.firstname, userDetails.lastname]);

    /*
    const { data, isLoading, isError, error, } = useQuery({
        queryKey: ['test-query'],
        queryFn: () => {
             return axios.get('https://www.boredapi.com/api/activity/');
        }
    })

    if (isLoading) {
        console.log('Loading the data.....')
    }

    console.log(data)
    */

    console.log('updated main')

    return (
    <>  
        <Box boxShadow={8} borderRadius={'10px'} p={1}>
            <Box display={'flex'} width={'100%'} minHeight={'300px'}>
                <APIPerformanceChart />
            </Box>
        </Box>
        <InputField
            label="First Name"
            placeholder=" First Name..."
            id="input-first-name"
        />
        <br/>
            <InputField
            label="Last Name"
            placeholder="Last Name..."
            id="input-last-name"
        />
        <br/>
        <TextField label="Testing" color='error' focused variant='standard' onChange={e => setTest(e.target.value)}/>
        <br/>
        <Button 
            label="Submit!"
            handleClick={() => handleSetName(setUserDetails)}
        />
        <Button
            label="Log"
            handleClick={() => handleConsoleLog("You triggered console log!")}
        />
        <HelloWorld
            firstname={userDetails.firstname}
            lastname={userDetails.lastname}
        />
        <HelloWorld2 
            {...userDetails}
        />
        <Link to="/about">About</Link>
    </>    
    )
}

export default Home;