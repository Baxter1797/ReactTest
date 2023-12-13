import ToggleTheme from "./ToggleTheme.tsx";

function NavBar(): JSX.Element {
    return (
        <div className="navbar">
            <ToggleTheme />
        </div>
    );
}

export default NavBar;