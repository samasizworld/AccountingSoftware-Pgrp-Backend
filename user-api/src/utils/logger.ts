import fs, { createWriteStream } from 'fs';
let moment = require('moment');
import createFile from 'create-file';
async function fileLogger(severity: string, message: string, description: string, functionName: string, userId: string) {
    try {
        let dirPath = '/pggroup/apilogs/';
        let filePath = dirPath + 'userapi-logger-' + moment().format('YYYY-MM-DD') + '_logs.log';
        let content = '..................LogInfo.............................' + '\n' + ' UserId = ' + userId + '\n' + ' Severity= ' + severity + '\n' + ' Message= ' + message + '\n' + ' Description= ' + description + '\n'
            + ' Function/Controller: ' + functionName
            + ' LoggedDate = ' + moment().tz('Asia/Kathmandu').format('YYYY-DD-MM HH:mm:ss') + "\n\n\n";

        let filePathExists = fs.existsSync(dirPath);
        if (!filePathExists) {
            fs.mkdirSync(dirPath, { recursive: true });

        }
        if (!fs.existsSync(filePath)) {
            createFile(filePath);
        }
        let logStream = await createWriteStream(filePath, { flags: 'a' });
        logStream.write(content);
        logStream.end();

    } catch (error) {
        console.log('Error :' + error.message);
    }

}
export const logInfo = async (message, description, functionName, userId: string) => {
    await fileLogger('I', message, description, functionName, userId);
}
export const logError = async (message, description, functionName, id) => {
    await fileLogger('E', message, description, functionName, id);
}