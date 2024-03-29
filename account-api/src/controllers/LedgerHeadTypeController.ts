const moment =require("moment");
import { Op } from "sequelize";
import LedgerHeadTypes from "../models/LedgerHeadTypes";
import { ConnectToPostgres } from "../sequelize/connection";
import { logError } from "../utils/logger";

export const LedgerHeadTypeController={
    async GetLedgerHeadTypes(req, res) {
        let sequelize = ConnectToPostgres();
        let { page, pageSize, orderBy, orderDir, search } = req.query;
        let pageno = page ? parseInt(page) : 1;
        let pagesize = pageSize ? parseInt(pageSize) : 20;
        let orderdirection = orderDir ? orderDir : 'asc';
        let orderby = orderBy ? orderBy : 'code';
        let searchtext = search ? search : '';
        let ledgerheadtype = LedgerHeadTypes(sequelize).schema('account');
        let offset = pagesize * (pageno - 1);
        let ledgerNameType = req.query.ledgerHeadType ? req.query.ledgerHeadType : '';
        try {
            let results: any;
            let whereClause: any = {};

            if (searchtext) {
                searchtext = '%' + searchtext + '%';
                whereClause.code = {
                    [Op.iLike]: searchtext
                }
            }
            if (ledgerNameType) {
                whereClause.name = ledgerNameType;
            }

            whereClause.datedeleted = null;

            if (pagesize == 0) {
                results = await ledgerheadtype.findAll({
                    where: whereClause,
                    order: [[orderby, orderdirection]]
                });
            } else {
                results = await ledgerheadtype.findAll({
                    where: whereClause,
                    limit: pagesize,
                    offset,
                    order: [[orderby, orderdirection]]
                });
            }
            let dtos = results.map(r => {
                return {
                    LedgerHeadTypeId: r.guid,
                    Code: r.code,
                }
            })
            return res.status(200).send(dtos);

        } catch (error) {
            logError(error.message, error.stack, 'GETLedgerHeadTypes', req.UserReference);
            return res.status(500).send({ message: 'Server Error' });
        }

    },
}