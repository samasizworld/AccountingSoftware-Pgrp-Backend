let moment = require("moment");
import { Op, UUID, where } from "sequelize";
import JournalEntry from "../models/JournalEntry";
import Ledger from "../models/Ledger";
import { ConnectToPostgres } from "../sequelize/connection";
import { logError, logInfo } from "../utils/logger";
import { UtilityObject } from "../utils/utilityFunction";
import * as uuid from 'uuid';
import { UserService } from "../services/UserService";
import { compileTemplate, pdfGenerateByHtml } from "../utils/pdfGenerator";
import { emailSender } from "../utils/emailSender";
import LedgerHeadTypes from "../models/LedgerHeadTypes";


export const LedgerController = {
    async GetLedgers(req, res) {
        let sequelize = ConnectToPostgres();
        let { page, pageSize, orderBy, orderDir, search } = req.query;
        let pageno = page ? parseInt(page) : 1;
        let pagesize = pageSize ? parseInt(pageSize) : 20;
        let orderdirection = orderDir ? orderDir : 'asc';
        let orderby = orderBy ? orderBy : 'name';
        let searchtext = search ? search : '';
        let ledger = Ledger(sequelize).schema('account');
        let offset = pagesize * (pageno - 1);
        let ledgerName = req.query.ledgerName ? req.query.ledgerName : '';
        try {
            let results: any;
            let whereClause: any = {};

            if (searchtext) {
                searchtext = '%' + searchtext + '%';
                whereClause.name = {
                    [Op.iLike]: searchtext
                }
            }
            if (ledgerName) {
                whereClause.name = ledgerName;
            }

            whereClause.datedeleted = null;
            let count;
            if (pagesize == 0) {
                results = await ledger.findAll({
                    where: whereClause,
                    order: [[orderby, orderdirection]]
                });
                count = results.length;
            } else {
                const r = await ledger.findAll({
                    where: whereClause,
                    order: [[orderby, orderdirection]]
                });
                count = r.length;
                results = await ledger.findAll({
                    where: whereClause,
                    limit: pagesize,
                    offset,
                    order: [[orderby, orderdirection]]
                });
            }


            let dtos = await Promise.all(results.map(async r => {
                let parent: any;
                if (r.parentid) {
                    parent = await ledger.findOne({ where: { ledgerheadid: r.parentid, datedeleted: null } });
                }
                return {
                    LedgerId: r.guid,
                    LedgerName: r.name,
                    UserId: r.userreference,
                    LedgerHeadType: r.ledgerheadtypeid ? (await LedgerHeadTypes(sequelize).schema('account').findOne({ where: { ledgerheadtypeid: r.ledgerheadtypeid, datedeleted: null } }) as any).code : null,
                    ParentName: r.parentid ? parent.name : '',
                    DateCreated: moment(r.datecreated).tz("Asia/Kathmandu").format('YYYY-MM-DD HH:mm:ss')
                }
            }))
            res.header('x-count', count || 0)
            return res.status(200).send(dtos);

        } catch (error) {
            logError(error.message, error.stack, 'GETLedgers', req.UserReference);
            return res.status(500).send({ message: 'Server Error' });
        }

    },
    GetLedger: async (req, res) => {
        let sequelize = ConnectToPostgres();
        let ledger = Ledger(sequelize).schema('account');
        let legderId = req.params.ledgerid;
        ledger.hasMany(JournalEntry(sequelize).schema('account'), { as: 'transactions', foreignKey: 'ledgerheadid' });
        try {
            // let ledgersss = await ledger.findOne({ where: { datedeleted: null, guid: legderId } });
            // if (!ledgersss) {
            //     return res.status(404).send({ message: 'No Resources Found' });
            // }
            let [result]: any = await ledger.findAll({ where: { datedeleted: null, guid: legderId }, include: [{ association: 'transactions', where: { datedeleted: null }, required: false }] });
            async function ledgerDetailMapper(result) {
                let dto: any = {};
                dto.LedgerName = result.name;
                dto.LedgerId = result.guid;
                dto.UserId = result.userreference;
                dto.DateCreated = moment(result.datecreated).format('MMMM Do,YYYY');
                dto.Transactions = result.transactions.map(t => {
                    let d: any = {};
                    d.JournalEntryId = t.guid;
                    // d.UserId=t.userreference;
                    if (t.isdebit == true) {
                        d.IsDebit = t.moneytransaction;
                    }
                    if (t.iscredit == true) {
                        d.IsCredit = t.moneytransaction;
                    }
                    // d.Fine=t.fine?t.fine:0;
                    d.Description = t.description;
                    d.DateCreated = moment(t.datecreated).format('YYYY-MM-DD');
                    return d;
                });
                return dto;
            };

            let dto = await ledgerDetailMapper(result);
            const Dr = dto.Transactions.map(t => t.IsDebit).filter(t => t != undefined).reduce((prev, cur) => prev + cur, 0);
            const Cr = dto.Transactions.map(t => t.IsCredit).filter(t => t != undefined).reduce((prev, cur) => prev + cur, 0);
            const Diff = Math.abs(Dr - Cr);
            await ledger.update({ amount: Diff }, { where: { guid: dto.LedgerId, datedeleted: null }, returning: true });
            return res.status(200).send(dto);

        } catch (error) {
            logError(error.message, error.stack, 'GETLedger', req.UserReference);
            return res.status(500).send({ message: 'Server Error' });
        }
    },

    async PostLedger(req, res) {
        let ledgerData = req.body;
        let sequelize = ConnectToPostgres();
        let ledger = Ledger(sequelize).schema('account');
        const ledgerheadtype = LedgerHeadTypes(sequelize).schema('account');
        try {
            if (ledgerData && !ledgerData.LedgerName) {
                return res.status(400).send({ message: 'Invalid Body Request' });
            }
            const { LedgerId, LedgerName, UserId, ParentId, LedgerHeadTypeId } = ledgerData;
            const ledgertype: any = await ledgerheadtype.findOne({ where: { guid: LedgerHeadTypeId, datedeleted: null } });
            let model: any = {
                guid: UtilityObject.isGuid(LedgerId) == false ? uuid.v4() : LedgerId,
                name: LedgerName,
                userreference: UserId,
                parentid: ParentId,
                ledgerheadtypeid: ledgertype.ledgerheadtypeid
            };

            let result: any;
            let parentLedger: any;
            if (model.parentid) {
                parentLedger = await ledger.findOne({ where: { guid: model.parentid, datedeleted: null } });
                model.parentid = parentLedger.ledgerheadid;
            } else {
                model.parentid = null;
            };
            let isLedgerExists = await ledger.findOne({ where: { guid: model.guid, datedeleted: null } });
            // name validation here
            let ledgerNames: any = await ledger.findAll({ where: { datedeleted: null } });

            ledgerNames = ledgerNames.map(l => l.name.replace(/\s/g, '').toLowerCase());


            if (isLedgerExists) {

                const existedName = isLedgerExists.name.replace(/\s/g, '').toLowerCase();
                ledgerNames = ledgerNames.filter(l => l != existedName);

            }
            if (ledgerNames.includes(model.name.replace(/\s/g, '').toLowerCase())) {
                return res.status(400).send({ message: 'Record Already Exists' })
            }
            // end here
            // if(ParentId){
            //     await ledger.update({parentid:ParentId},{where:{datedeleted:null,guid:model.guid}});
            // }

            if (isLedgerExists) {
                // let users = await UserService.GetUsers(model.name.split(' ')[0] || model.name.split(" ")[1]);
                // model.userreference = users && users.length == 0 ? null : users[0].UserId;
                let [no, results] = await ledger.update(model, { where: { guid: model.guid, datedeleted: null }, returning: true });
                result = results[0];

            }
            else {
                result = await ledger.create(model);

            }
            return res.status(201).send({ LedgerId: result.guid });

        } catch (error) {
            logError(error.message, error.stack, 'PostLedger', req.UserReference);
            return res.status(500).send({ message: 'Server Error' });
        }
    },
    sendLedger: async (req, res) => {
        let sequelize = ConnectToPostgres();
        let ledger = Ledger(sequelize).schema('account');
        const token = req.get('X-Token');
        let legderId = req.params.ledgerid;
        ledger.hasMany(JournalEntry(sequelize).schema('account'), { as: 'transactions', foreignKey: 'ledgerheadid' });
        try {
            // let ledgersss = await ledger.findOne({ where: { datedeleted: null, guid: legderId } });
            // if (!ledgersss) {
            //     return res.status(404).send({ message: 'No Resources Found' });
            // }
            let [result]: any = await ledger.findAll({ where: { datedeleted: null, guid: legderId }, include: [{ association: 'transactions', where: { datedeleted: null }, required: true }] });
            async function ledgerDetailMapper(result) {
                let dto: any = {};
                dto.LedgerName = result.name;
                dto.LedgerId = result.guid;
                dto.UserId = result.userreference;
                dto.DateCreated = moment(result.datecreated).format('MMMM Do,YYYY');
                dto.Transactions = result.transactions.map(t => {
                    let d: any = {};
                    d.JournalEntryId = t.guid;
                    // d.UserId=t.userreference;
                    if (t.isdebit == true) {
                        d.IsDebit = t.moneytransaction;
                    }
                    if (t.iscredit == true) {
                        d.IsCredit = t.moneytransaction;
                    }
                    // d.Fine=t.fine?t.fine:0;
                    d.Description = t.description;
                    d.DateCreated = moment(t.datecreated).format('YYYY-MM-DD');
                    return d;
                });
                return dto;
            };
            let dto = await ledgerDetailMapper(result);
            const Dr = dto.Transactions.map(t => t.IsDebit).filter(t => t != undefined).reduce((a, b) => a + b, 0);
            const Cr = dto.Transactions.map(t => t.IsCredit).filter(t => t != undefined).reduce((a, b) => a + b, 0);
            const diff = Dr - Cr;
            let creditBalance: any;
            let debitBalance: any;
            if (diff < 0) {
                creditBalance = Math.abs(diff);
            } else {
                debitBalance = Math.abs(diff);
            }
            if (creditBalance) {
                dto = { ...dto, Cr, Dr, creditBalance };
            } else {
                dto = { ...dto, Cr, Dr, debitBalance }
            }
            const template = await compileTemplate('ledgertable', dto);
            const pdf = await pdfGenerateByHtml(template);
            if (dto.LedgerName != 'Bank' || dto.LedgerName != 'Fine' || dto.LedgerName != 'Interest') {
                // const user:any= await UserService.GetUser(token,dto.UserId);
                // await emailSender.emailSender(user.EmailAddress,pdf);
            }
            return res.status(200).send({ message: 'Email Sent' });

        } catch (error) {
            logError(error.message, error.stack, 'GETLedger', req.UserReference);
            return res.status(500).send({ message: 'Server Error' });
        }
    },
    // async LinkLedgerToUser(req, res) {
    //     const sequelize = ConnectToPostgres();
    //     const token=req.get('X-Token');
    //     let ledger = Ledger(sequelize).schema('account');
    //     let name = req.query.ledgername ? req.query.ledgername.split(' ')[0].toString() : '';
    //     try {
    //         let users = await UserService.GetUsers(name,token);
    //         if (users && users.length > 1) {
    //             return res.status(403).send({ message: 'Not Allowed' });
    //         }
    //         let ledgers = await ledger.findAll({ where: { name: req.query.ledgername.toUpperCase(), datedeleted: null } });
    //         if (ledgers && ledgers.length > 1) {
    //             return res.status(403).send({ message: 'Not Allowed' });
    //         }
    //         let [no, [result]] = await ledger.update({ userreference: users[0].UserId }, { where: { datedeleted: null, name: req.query.ledgername.toUpperCase() }, returning: true });
    //         return res.status(201).send({ LedgerId: result.guid });
    //     } catch (error) {
    //         logError(error.message, error.stack, 'LinkLedger', req.UserReference);
    //         return res.status(500).send({ message: 'Server Error' });
    //     }
    // }
}