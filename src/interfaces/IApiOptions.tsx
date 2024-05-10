interface IApiOptions {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    url: string;
    params?: Record<string, string>;
    auth?: {
        username: string
        password: string
    }
}

export default IApiOptions