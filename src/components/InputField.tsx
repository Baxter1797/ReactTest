type userInput = {
    label: string;
    placeholder: string;
    id: string;
}

function InputField(props: userInput): JSX.Element {
    return (
        <>
            <label>{props.label}</label><br/>
            <input type="text" placeholder={props.placeholder} id={props.id} />
        </>
    )
}

export default InputField