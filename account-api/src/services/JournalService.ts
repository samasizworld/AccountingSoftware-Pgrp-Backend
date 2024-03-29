import { LedgerController } from "../controllers/LedgerController";
import Ledger from "../models/Ledger";

export const JournalEntryService = {
    async MapJournalBodyFromFile(journalJsonFromFile, sequelize) {
        const ledgerSchema = Ledger(sequelize).schema('account');
        async function getLedgerIdByName(name) {
            let ledgerId = await ledgerSchema.findOne({ where: { datedeleted: null, name: name ? name : '' } });
            return ledgerId;
        }
        let responseData: any = [];
        for (const data of journalJsonFromFile) {

            let datum: any = {};
            // Both condition must be satisfied

            if (data.Name && data.Name != 'Bank' && data.Money) {
                // Name and Bank Relation in account
                const LedgerIdName: any = await getLedgerIdByName(data.Name);

                let ledgerId = await getLedgerIdByName('Bank');
                datum.LedgerName = LedgerIdName ? 'Bank' : null;
                datum.LedgerId = LedgerIdName ? ledgerId.guid : null;
                //datum.UserId=LedgerIdName?LedgerIdName.userreference:null;
                datum.IsDebit = LedgerIdName ? true : null;
                datum.IsCredit = LedgerIdName ? false : null;
                datum.Fund = LedgerIdName ? data.Money : null;
                responseData.push(datum);

                datum = {};
                datum.LedgerName = LedgerIdName ? data.Name : null;
                datum.LedgerId = LedgerIdName ? LedgerIdName.guid : null;
                //datum.UserId=LedgerIdName?LedgerIdName.userreference:null;
                datum.Fund = LedgerIdName ? data.Money : null;
                datum.IsCredit = LedgerIdName ? true : null;
                datum.IsDebit = LedgerIdName ? false : null;
                responseData.push(datum);

                if (data.Fine) {
                    // Bank Dr
                    // Fine Cr
                    datum = {};
                    let ledgerIds = await getLedgerIdByName('Fine');
                    datum.LedgerName = LedgerIdName ? 'Bank' : null;
                    datum.LedgerId = LedgerIdName ? ledgerId.guid : null;
                    //datum.UserId=LedgerIdName?LedgerIdName.userreference:null;
                    datum.Fund = LedgerIdName ? data.Fine : null;
                    datum.IsCredit = LedgerIdName ? false : null;
                    datum.IsDebit = LedgerIdName ? true : null;
                    responseData.push(datum);


                    datum = {};
                    datum.LedgerName = LedgerIdName ? 'Fine' : null;
                    datum.LedgerId = LedgerIdName ? ledgerIds.guid : null
                    datum.IsDebit = LedgerIdName ? false : null;
                    datum.IsCredit = LedgerIdName ? true : null;
                    datum.Fund = LedgerIdName ? data.Fine : null;
                    //datum.UserId=LedgerIdName?LedgerIdName.userreference:null;
                    responseData.push(datum);
                }
            }

        }

        return responseData.filter(rd => rd.LedgerId != null);


    }
};