import Button from "./Button"

function ToggleTheme() {
    
    const setDarkMode = () => {
        document.querySelector("body").setAttribute('data-theme', 'dark');
        localStorage.setItem("selectedTheme", "dark");
    }

    const setLightMode = () => {
        document.querySelector("body").setAttribute('data-theme', 'light');
        localStorage.setItem("selectedTheme", "light");
    }

    if (localStorage.getItem("selectedTheme") === "dark") {
        setDarkMode();
    } else {
        setLightMode();
    }
    
    const ToggleTheme = () => {
        if (document.querySelector("body").getAttribute('data-theme') === "light") {
            setDarkMode();
        } else {
            setLightMode();
        }
    }

    return (
        <Button 
            label="ToggleTheme"
            handleClick={() => ToggleTheme()}
        />
    )
}

export default ToggleTheme;