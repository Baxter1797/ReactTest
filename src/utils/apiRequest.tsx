import axios, { AxiosResponse } from "axios";
import IApiOptions from "../interfaces/IApiOptions";

async function ApiRequest(options: IApiOptions): Promise<AxiosResponse> {
    try {
        return await axios.request(options)
    } catch (error) {
        throw new Error(error)
    }
}

export default ApiRequest