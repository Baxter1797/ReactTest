import axios from "axios"

async function validateAPI(url: URL): Promise<boolean> {
    try {
        await axios.get(url.toString())
        return true
    } catch (error) {
        return false
    }
}

export default validateAPI