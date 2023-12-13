// Libraries
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

// Components
import HelloWorld from '../components/HelloWorld.tsx';
import InputField from '../components/InputField.tsx';
import Button from '../components/Button.tsx';

// Types
import userDetails from '../types/userDetails.tsx';
import HelloWorld2 from '../components/HelloWorld2.tsx';

function handleSetName(handleEvent: React.Dispatch<React.SetStateAction<userDetails>>): void {
    const userInfo: userDetails = {
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

    const [userDetails, setUserDetails] = useState<userDetails>({
        firstname: "",
        lastname: "",
    });

    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else {
            handleConsoleLog("useEffect Executed...");
        }
       // handleConsoleLog("useEffect Executed...");
    },[userDetails.firstname, userDetails.lastname]);

    return (
    <>
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