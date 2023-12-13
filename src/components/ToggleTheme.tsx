import Button from "./Button"

function ToggleTheme(): JSX.Element {
    /*
    const setDarkMode = (): void => {
        document.querySelector("body").setAttribute('data-theme', 'dark');
        localStorage.setItem("selectedTheme", "dark");
    }

    const setLightMode = (): void => {
        document.querySelector("body").setAttribute('data-theme', 'light');
        localStorage.setItem("selectedTheme", "light");
    }

    if (localStorage.getItem("selectedTheme") === "dark") {
        setDarkMode();
    } else {
        setLightMode();
    }
    
    const ToggleTheme = (): void => {
        if (document.querySelector("body").getAttribute('data-theme') === "light") {
            setDarkMode();
        } else {
            setLightMode();
        }
    }
    */
   console.log("You pressed the theme button!!");
    return (
        <Button 
            label="ToggleTheme"
            handleClick={() => ToggleTheme()}
        />
    )
}

export default ToggleTheme;