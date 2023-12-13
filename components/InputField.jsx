function InputField({label,placeholder,id}) {
    return (
        <>
            <label>{label}</label><br/>
            <input type="text" placeholder={placeholder} id={id} />
        </>
    )
}

export default InputField