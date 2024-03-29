import multer from 'multer';
import moment from 'moment';
import { UtilityObject } from '../utils/utilityFunction';



export const multiFormMiddleware = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, '/pggroup/files/')
        },
        filename: (req, file, cb) => {
            cb(null, file.originalname.split('.')[0] + '-' + moment().format('YYYYMMDDHHmmss') +
                '-' + UtilityObject.generateSaltKey().substring(0, 5) + '.' + file.fieldname)
        }
    }),
    fileFilter: function (req, file: any, cb: any) {
        const extname = file.fieldname;
        if (extname == 'xlsx') {
            return cb(null, true);
        } else {
            cb('XLSX only!');
        }
    },
    limits: {
        fileSize: 1024 * 1024 * 5
    },
});