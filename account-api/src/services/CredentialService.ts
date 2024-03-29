import axios from "axios"

export const CredentialService = {
    async Authorize(token: string, uri: string, action: string) {
        let url = `http://localhost:5000/Authorize`;
        let data = { Token: token, Method: action, Path: uri };
        // config
        let options = {
            headers: {
                "Content-Type": "application/json"
            },
        }
        try {
            const res = await axios.post(url, data, options);
            return res.data;
        } catch (error) {
            throw error.response;
        }
    },
    async Authenticate(token: string) {
        let url = `http://localhost:5000/Authenticate`;
        let data = { Token: token };
        // config
        let options = {
            headers: {
                "Content-Type": "application/json"
            },
        }
        try {
            const res = await axios.post(url, data, options);
            return res.data;
        } catch (error) {
            throw error.response;
        }
    }

}