import { CredentialService } from "../modelservices/CredentialService"

export const authorize = async (req, res, next) => {
    const token = req.get('X-Token');
    let path: any = "/" + req.originalUrl.split("/")[1];
    let action = req.method;
    try {
        if (!token) {
            throw 'No Token';
        }
        if (path.includes('?')) {
            path = path.split('?')[0];
        }
        let results: any = await CredentialService.Authorize(token, path, action);
        if (results) {
            req.IsSystemAdmin = results.IsSystemAdmin;
            req.IsAuthorized = results.IsAuthorized;
            next();
        }
    } catch (error) {
        if (error == 'No Token') { return res.status(400).send({ message: 'No AuthKey' }) }
        return res.status(error.status).send(error.data);
    }
}
export async function authenticate(req, res, next) {
    const token = req.get("X-Token");
    try {
        if (!token) {
            throw 'No Token';
        }
        let results = await CredentialService.Authenticate(token);
        if (results) {
            req.UserReference = results.UserReference;
            next();
        }
    } catch (error) {
        if (error == 'No Token') { return res.status(400).send({ message: 'No AuthKey' }) }
        if (error == undefined) {
            return res.status(500).send({ message: 'No Connection' })
        }
        return res.status(error.status).send(error.data);
    }
}

