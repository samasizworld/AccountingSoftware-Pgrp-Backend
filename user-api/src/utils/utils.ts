import * as crypto from 'crypto';
export const UtilityObject = {
    generateSaltKey: () => {
        let string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+';
        let randomNumber = Math.ceil(Math.random() * 100);
        let newArr = new Array(randomNumber);
        let arr = [...newArr]
        return arr.reduce(a => a + string[~~(Math.random() * string.length)], '')
    },
    hashPassword: function (password, salt) {
        for (let s of salt) {
            password = password + salt.substring(0, salt.indexOf(s))
            // password = Buffer.from(password).toString('base64')
            password = this.createHashUsingSHA256(password)
        }
        return password;
    },
    isGuid: (guid: string) => {

        var regexGuid = /^(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}$/gi;
        return regexGuid.test(guid);
    },
    createHashUsingSHA256: (password) => {
        let bufferDataOfPassword = Buffer.from(password);
        let decrypt = crypto.createHash('sha256');
        decrypt.update(bufferDataOfPassword);
        let hexPasswordString = decrypt.digest('hex')
        return hexPasswordString;
    }
}