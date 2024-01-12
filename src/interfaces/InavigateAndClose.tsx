import { NavigateFunction } from "react-router-dom";

interface InavigateAndClose {
    path: string;
    navigateFunction: NavigateFunction;
    close: React.Dispatch<React.SetStateAction<boolean>>;
}

export default InavigateAndClose;