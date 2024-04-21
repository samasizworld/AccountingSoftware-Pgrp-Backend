import axios from "axios"

export const LedgerService = {
    async AddLedger(token,name,userid) {
        let url = `http://p-accountapi:4000/Ledgers`;
        let data = { LedgerName: name, UserId: userid };
        // config
        let options = {
            headers: {
                "Content-Type": "application/json",
                "X-Token":token,
            },
        }
        try {
            const res = await axios.post(url, data, options);
            return res.data;
        } catch (error) {
            throw error.response;
        }
    },

}