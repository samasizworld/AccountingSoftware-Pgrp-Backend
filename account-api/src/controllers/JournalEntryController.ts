import { ConnectToPostgres } from "../sequelize/connection";
import { logInfo } from "../utils/logger";
import xlsx from 'xlsx';
import { Sequelize, QueryTypes, Op, Transaction, where } from "sequelize";
import JournalEntry from "../models/JournalEntry";
import Ledger from "../models/Ledger";
let filePath = '/pggroup/files/'
import path from 'path';
import moment from "moment";
import { UtilityObject } from "../utils/utilityFunction";
import * as uuid from 'uuid';
import { JournalEntryService } from "../services/JournalService";
import { compileTemplate, pdfGenerateByHtml } from "../utils/pdfGenerator";
import { emailSender } from "../utils/emailSender";
import { UserService } from "../services/UserService";

export const JournalEntryController = {
    // PostJournal: async (req, res) => {
    //     let sequelize = ConnectToPostgres();
    //     console.log(path.resolve(filePath));
    //     let fullFilePath = filePath + req.file.filename;
    //     try {
    //         let result = xlsx.readFile(fullFilePath);
    //         const dataJson: any = xlsx.utils.sheet_to_json(result.Sheets[result.SheetNames[0]]);

    //         let data: any = [];
    //         let props: any;
    //         async function JSONValidatorForExcelFile(dataJson: any) {
    //             for (let datum of dataJson) {
    //                 let pascalcase: any = {};
    //                 let keys = Object.keys(datum);
    //                 for (let key of keys) {
    //                     props = [key.split('')[0].toUpperCase(), ...key.split('').splice(1, key.length - 1).join('').toLowerCase()].join('');
    //                     if (typeof datum[key] == 'number') {
    //                         pascalcase[props] = parseFloat(datum[key]);
    //                     }
    //                     if (typeof datum[key] == 'string') {
    //                         pascalcase[props] = datum[key].toUpperCase();
    //                     }
    //                 }
    //                 data.push(pascalcase);
    //             }
    //         }
    //         await JSONValidatorForExcelFile(dataJson);
    //         // const dataArr: any = xlsx.utils.sheet_to_json(result.Sheets[result.SheetNames[0]], { header: 1, blankrows: false });
    //         // let columnNames: any = dataArr[0];
    //         await sequelize.query('Select  account.upsert_journalentries(:json)', {
    //             replacements: {
    //                 json: JSON.stringify(data)
    //             }
    //         })
    //         return res.status(200).send(data);
    //     } catch (error) {
    //         logInfo(error.message, error.stack, 'PostJournal', req.UserReference);
    //         return res.status(500).send({ message: 'Server Error' });
    //     }
    // },
    async GetJournals(req, res) {
        let sequelize = ConnectToPostgres();
        const fileRead = !req.get('X-File') ? 'normalresponse' : 'fileresponse';
        const token = req.get('X-Token');
        let { page, pageSize, orderBy, orderDir, search } = req.query;
        let pageno = page ? parseInt(page) : 1;
        let pagesize = pageSize ? parseInt(pageSize) : 20;
        let orderdirection = orderDir ? orderDir : 'asc';
        let orderby = orderBy ? orderBy : 'name';
        let searchtext = search ? search : '';
        let offset = pagesize * (pageno - 1);
        let start = req.query.start ? moment(req.query.start).format() : '';
        let end = req.query.end ? moment(req.query.end).format() : '';
        let createddate = req.query.datecreated ? moment(req.query.datecreated).format('YYYY-MM-DD') : ''
        let journal = JournalEntry(sequelize).schema('account');
        journal.belongsTo(Ledger(sequelize).schema('account'),
            {
                as: 'ledger',
                foreignKey: 'ledgerheadid'
            });

        try {
            const whereClause: any = {
                datedeleted: null
            };
            if (start && end) {
                whereClause.datecreated = { [Op.between]: [start, end] }
            }
            let results = await journal.findAll(
                {
                    where: whereClause,
                    include: [
                        {
                            association: 'ledger',
                            required: true,
                            where: {
                                datedeleted: null
                            }
                        }
                    ],
                    order: [['journalentryid', 'asc']]
                });
            function JournalMapper(results) {
                let dtos = results.map(r => {
                    let dto: any = {};
                    dto.JournalEntryId = r.guid;
                    dto.LedgerName = r.ledger.name;
                    dto.UserId = r.userreference;
                    dto.DateCreated = moment(r.datecreated).format('YYYY-MM-DD');
                    dto.LedgerId = r.ledger.guid;
                    dto.Description = r.description;
                    if (r.isdebit) {
                        dto.IsDebit = r.moneytransaction;
                        // if (dto.IsDebit == null && r.fine) {
                        //     dto.IsDebit = r.fine;
                        // }

                        // if (r.interest && dto.IsDebit == null) {
                        //     dto.IsDebit = r.interest;
                        // }
                    }
                    if (r.iscredit) {
                        dto.IsCredit = r.moneytransaction;
                        // if (dto.IsCredit == null && r.fine) {
                        //     dto.IsCredit = r.fine;
                        // }

                        // if (r.interest && dto.IsCredit == null) {
                        //     dto.IsCredit = r.interest;
                        // }
                    }

                    return dto;
                })
                return dtos;
            }
            let dtos = JournalMapper(results);
            const Dr = dtos.map(d => d.IsDebit).filter(d => d != undefined).reduce((a, b) => a + b, 0);
            const Cr = dtos.map(d => d.IsCredit).filter(d => d != undefined).reduce((a, b) => a + b, 0);
            if (fileRead == 'fileresponse') {
                const Diff = Dr - Cr;
                // make downloadable here
                dtos = { Cr, Dr, dtos, Diff };
                const template = await compileTemplate('journaltable', dtos);
                const pdf = await pdfGenerateByHtml(template);
                let userEmails = await UserService.GetUsers(token);
                userEmails = userEmails.map(ue => ue.EmailAddress);
                // await emailSender.emailSender(userEmails,pdf);

                return res.status(200).send({ message: 'Email Sent' })
            }
            return res.status(200).send(dtos);

        } catch (error) {
            logInfo(error.message, error.stack, 'GETJournals', req.UserReference);
            return res.status(500).send({ message: 'Server Error' });
        }
    },
    async UpsertJournal(req, res) {
        let sequelize = ConnectToPostgres();
        let journal = JournalEntry(sequelize).schema('account');
        let journalBody = req.body;
        try {
            let models: any = journalBody.map(jb => {
                return {
                    guid: UtilityObject.isGuid(jb.JournalEntryId) == false ? uuid.v4() : jb.JournalEntryId,
                    isdebit: jb.IsDebit,
                    iscredit: jb.IsCredit,
                    LedgerId: jb.LedgerId,
                    moneytransaction: jb.Fund,
                    //interest: jb.Interest,
                    //fine: jb.Fine,
                    description: jb.Description,
                    //userreference:jb.UserId
                };

            });
            const t: any = await sequelize.transaction({ isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED });
            try {
                for (let model of models) {
                    let ledger: any = await Ledger(sequelize).schema('account').findOne({ where: { datedeleted: null, guid: model.LedgerId } });
                    model.ledgerheadid = ledger.ledgerheadid;
                    // model.userreference = ledger.userreference;
                    let result = await journal.findOne({ where: { datedeleted: null, guid: model.guid } });
                    if (result) {
                        await journal.update(model, { where: { datedeleted: null, guid: model.guid }, transaction: t });
                    } else {
                        await journal.create(model, { transaction: t })
                    }
                }
                t.commit();
                return res.status(201).send({ message: 'Created' });
            } catch (error) {
                t.rollback();
                throw error;
            }

        } catch (error) {
            logInfo(error.message, error.stack, 'UpsertJournal', req.UserReference);
            return res.status(500).send({ message: 'Server Error' });
        }
    },
    async MapJournalDataFromFile(req, res) {
        let sequelize = ConnectToPostgres();
        let fullFilePath = filePath + req.file.filename;
        try {
            let result = xlsx.readFile(fullFilePath);
            const dataJson: any = xlsx.utils.sheet_to_json(result.Sheets[result.SheetNames[0]]);

            let data: any = [];
            let props: any;
            function JSONValidatorForExcelFile(dataJson: any) {
                for (let datum of dataJson) {
                    let pascalcase: any = {};
                    let keys = Object.keys(datum);
                    for (let key of keys) {
                        props = [key.split('')[0].toUpperCase(), ...key.split('').splice(1, key.length - 1).join('').toLowerCase()].join('');
                        if (typeof datum[key] == 'number') {
                            pascalcase[props] = parseFloat(datum[key]);
                        }
                        if (typeof datum[key] == 'string') {
                            const postionOfWS = datum[key].split('').indexOf(' ');
                            let nameArray: any;
                            if (postionOfWS != -1) {
                                nameArray = datum[key].split(' ');
                                pascalcase[props] = [nameArray[0].split('')[0].toUpperCase(), ...nameArray[0].split('').splice(1, nameArray[0].length - 1).join('').toLowerCase()].join('') + ' ' + [nameArray[1].split('')[0].toUpperCase(), ...nameArray[1].split('').splice(1, nameArray[1].length - 1).join('').toLowerCase()].join('');
                            } else {
                                pascalcase[props] = [datum[key].split('')[0].toUpperCase(), ...datum[key].split('').splice(1, datum[key].length - 1).join('').toLowerCase()].join('')
                            }
                        }
                    }
                    data.push(pascalcase);
                }
            }
            JSONValidatorForExcelFile(dataJson);
            let a = await JournalEntryService.MapJournalBodyFromFile(data, sequelize);
            return res.status(200).send(a);

        } catch (error) {
            logInfo(error.message, error.stack, 'UpsertJournal', req.UserReference);
            return res.status(500).send({ message: 'Server Error' });
        }
    }
};