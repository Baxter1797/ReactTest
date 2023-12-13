import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import HelloWorld from '../components/HelloWorld';
import InputField from '../components/InputField';
import Button from '../components/Button';

function handleSetName(setFirstName, setLastName) {
    setFirstName(document.getElementById("input-first-name").value)
    setLastName(document.getElementById("input-last-name").value)
    console.log("You just set the name!")
  }
  
function handleConsoleLog(inputString) {
console.log(inputString)
}

function Home() {

    const [firstName, setFirstName] = useState();
    const [lastName, setLastName] = useState();

    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else {
            handleConsoleLog("useEffect Executed...");
        }
       // handleConsoleLog("useEffect Executed...");
    },[firstName, lastName]);

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
            handleClick={() => handleSetName(setFirstName,setLastName)}
        />
        <Button
            label="Log"
            handleClick={() => handleConsoleLog("You triggered console log!")}
        />
        <HelloWorld
            firstname={firstName}
            lastname={lastName}
        />
        <Link to="/about">About</Link>
    </>
    )
}

export default Home;