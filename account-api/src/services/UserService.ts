import axios from "axios";
export const UserService = {
    async GetUsers(token) {
        let options = {
            headers: { "Content-Type": "application/json" ,"X-Token":token}
        };
        let url = `http://localhost:3000/User?pageSize=0`;
        try {
            let res = await axios.get(url, options);
            return res.data;
        } catch (error) {
            throw error.response.data;
        }
    },

    async GetUser(token,userId) {
        let options = {
            headers: { "Content-Type": "application/json" ,"X-Token":token}
        };
        let url = `http://localhost:3000/User/${userId}`;
        try {
            let res = await axios.get(url, options);
            return res.data;
        } catch (error) {
            throw error.response.data;
        }
    }
}