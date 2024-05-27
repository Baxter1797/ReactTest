interface ISnackbarProperties {
    message: string
    severity: 'error' | 'info' | 'success' | 'warning';
    key: number
}

export default ISnackbarProperties