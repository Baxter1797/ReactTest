interface IdisplayAndClose {
    displayItem: React.Dispatch<React.SetStateAction<boolean>>;
    state: boolean;
    close: React.Dispatch<React.SetStateAction<boolean>>;
}

export default IdisplayAndClose;