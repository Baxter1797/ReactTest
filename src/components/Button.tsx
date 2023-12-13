type buttonDetails = {
    label: string;
    handleClick(): void;
}

function Button(props: buttonDetails): JSX.Element {
    return (
        <button type="button" onClick={() => props.handleClick()} >
            {props.label}
        </button>
    )
}

export default Button