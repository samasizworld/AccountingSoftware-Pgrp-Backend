import moment from "moment";
import { Op, QueryTypes, Sequelize } from "sequelize";
import JournalEntry from "../models/JournalEntry";
import Ledger from "../models/Ledger";
import { ConnectToPostgres } from "../sequelize/connection";
import { logError, logInfo } from "../utils/logger";
import { compileTemplate, pdfGenerateByHtml } from "../utils/pdfGenerator";
export const TrialBalanceController={
   
    async GenerateTrailBalance(req,res){
        const sequelize=ConnectToPostgres();
        const fileRead=!req.get('X-File')?'normalresponse':'fileresponse';
        const token=req.get('X-Token');
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

            let results:any=await sequelize.query(`SELECT je.isdebit,lh.name,SUM(je.moneytransaction) as fund
                FROM account.journalentries je
                JOIN account.ledgerheads lh 
                ON lh.ledgerheadid=je.ledgerheadid AND lh.datedeleted IS NULL
                WHERE je.datedeleted IS NULL GROUP BY je.isdebit,lh.name;`,{type:QueryTypes.SELECT});


               

                let dtos:any=results.map(r=>{
                    let dto:any={};
                    dto.LedgerName=r.name;
                    if(r.isdebit==false){
                        dto.IsCredit=r.fund;
                    }
                    if(r.isdebit==true){
                        dto.IsDebit=r.fund;
                    }
                    return dto;
                })
                dtos=dtos.reduce((prev,curr)=>{
                    // when prev matches current check isDebit,isCredit
                    const x=prev.find(p=>p.LedgerName==curr.LedgerName);
                   
                    if(!x){
                        prev.push(curr);
                    }else{
                        const amt=x.IsCredit-curr.IsDebit;
                        if(amt<0){
                            x.IsDebit=Math.abs(amt);
                            delete x.IsCredit;
                        }else{
                            x.IsCredit=Math.abs(amt);
                            delete x.IsDebit;
                        }
                    }
                    return prev;
                },[]);
                const Dr=dtos.map(d=>d.IsDebit).filter(f=>f!=undefined).reduce((prev,curr)=>prev+curr,0);
                const Cr=dtos.map(d=>d.IsCredit).filter(f=>f!=undefined).reduce((prev,curr)=>prev+curr,0);
                
                if(fileRead=='fileresponse'){
                    dtos={dtos,Cr,Dr};
                    const template = await compileTemplate('trialbalance',dtos);
                    const pdf=await pdfGenerateByHtml(template);
                    return res.send('Created Trial Balance');
                }
                return res.send(dtos);
            // const whereClause:any={
            //     datedeleted: null
            // };
            // if(start && end){
            //     whereClause.datecreated= { [Op.between]: [start, end] }
            // }
            // let results = await journal.findAll(
            //     {
            //         where: whereClause ,
            //         include: [
            //             {
            //                 association: 'ledger',
            //                 required: true,
            //                 where: {
            //                     datedeleted: null
            //                 }
            //             }
            //         ],
            //         order:[['journalentryid','asc']]
            //     });
            //     let dtos:any=[];
            //     dtos=results.map(r=>{
            //         let dto:any={};
            //         dto.LedgerId=r.ledger.guid;
            //         dto.LedgerName=r.ledger.name;
            //         dto.JournalEntryId=r.guid;
            //         dto.UserId=r.userreference;
            //         dto.DateCreated=moment(r.datecreated).format('MMMM Do,YYYY');
            //         if(r.iscredit==true){
            //             if(r.transactionmoney){
            //                 dto.IsCredit=r.transactionmoney
            //             }
            //             if(r.fine){
            //                 dto.IsCredit=r.fine;
            //             }
            //             if(r.interest){
            //                 dto.IsCredit=r.interest;
            //             }
            //         }
            //         if(r.isdebit==true){
            //             if(r.transactionmoney){
            //                 dto.IsDebit=r.transactionmoney
            //             }
            //             if(r.fine){
            //                 dto.IsDebit=r.fine;
            //             }
            //             if(r.interest){
            //                 dto.IsDebit=r.interest;
            //             }
            //         }
            //         return dto;
            //     });
                
            //     return res.status(200).send(dtos);
            
        } catch (error) {
            logError(error.message, error.stack, 'Generate Trail Balance', req.UserReference);
            return res.status(500).send({ message: 'Server Error' });
        }
    },
    async generateProfitandLossAccount(req,res){
        const fileRead=!req.get('X-File')?'normalresponse':'fileresponse';
        const sequelize=ConnectToPostgres();
        try {
            let result=await sequelize.query(`SELECT lht.code,json_agg(json_build_object('LedgerName',lh.name,'Amount',coalesce(lh.amount,0),'isIncome',case when lht.code='Income' then true else false end,'isExpense',case when lht.code='Expense' then true else false end)) as data 
                    FROM account.ledgerheads lh
                    JOIN account.ledgerheadtypes lht ON lht.ledgerheadtypeid=lh.ledgerheadtypeid and lht.datedeleted is null
                    WHERE lh.datedeleted IS NULL AND (lht.code='Income' OR lht.code='Expense') GROUP BY lht.code ORDER BY lht.code DESC`,{type:QueryTypes.SELECT});
                    let data= result.map(d=>{
                        let dto:any= {
                            Code:d.code=='Income'?'Income':'Expense',
                            Data:d.data && d.data.length==0?[]:d.data.map(d=>{
                                return {
                                    LedgerName:d.LedgerName,
                                    Amount:d.Amount,
                                    IsIncome:d.isIncome,
                                    IsExpense:d.isExpense
                                };
                            })
                        };
                        return dto;
                    });
            const Income= data[0] && data[0].Code && data[0].Code=='Income'? (data[0].Data && data[0].Data.length>0?data[0].Data.map(d=>d.Amount).reduce((a,b)=>a+b,0):0):0;
            const Expense=data[1] && data[1].Code && data[1].Code=='Expense'?(data[1].Data && data[1].Data.length>0?data[1].Data.map(d=>d.Amount).reduce((a,b)=>a+b,0):0):0;

            let Diff=Income-Expense;
            let NetProfit:any;
            let NetLoss:any;
            if(Diff>0){
                NetProfit=Math.abs(Diff);
            }else{
                NetLoss=Math.abs(Diff);
            }
            data={data,NetProfit,NetLoss}
            if(fileRead=='fileresponse'){
                const template = await compileTemplate('pl',data);
                const pdf=await pdfGenerateByHtml(template);
                return res.send('Created PL Account');
            }
            return res.send(data);
            
        } catch (error) {
            logError(error.message, error.stack, 'Generate PL account', req.UserReference);
            return res.status(500).send({ message: 'Server Error' });
        }
    },

    async generateBalanceSheet(req,res){
        const sequelize=ConnectToPostgres();
        const fileRead=!req.get('X-File')?'normalresponse':'fileresponse';
        try {
            let resultToCalculateNetLossNetProfit=await sequelize.query(`SELECT lht.code,json_agg(json_build_object('LedgerName',lh.name,'Amount',coalesce(lh.amount,0))) as data 
            FROM account.ledgerheads lh
            JOIN account.ledgerheadtypes lht ON lht.ledgerheadtypeid=lh.ledgerheadtypeid and lht.datedeleted is null
            WHERE lh.datedeleted IS NULL AND (lht.code='Income' OR lht.code='Expense') GROUP BY lht.code order by lht.code desc`,{type:QueryTypes.SELECT});
            let data= resultToCalculateNetLossNetProfit.map(d=>{
                let dto:any= {
                    Code:d.code=='Income'?d.code:'Expense',
                    Data:d.data && d.data.length==0?[]:d.data.map(d=>{
                        return {
                            LedgerName:d.LedgerName,
                            Amount:d.Amount
                        };
                    })
                };
                return dto;
            });
            const Income= data[0] && data[0].Code && data[0].Code=='Income'? (data[0].Data && data[0].Data.length>0?data[0].Data.map(d=>d.Amount).reduce((a,b)=>a+b,0):0):0;
            const Expense=data[1] && data[1].Code && data[1].Code=='Expense'?(data[1].Data && data[1].Data.length>0?data[1].Data.map(d=>d.Amount).reduce((a,b)=>a+b,0):0):0;

            let Diff=Income-Expense;
            let NetProfit:any;
            let NetLoss:any;
            if(Diff>=0){
                NetProfit=Math.abs(Diff);
            }else{
                NetLoss=Math.abs(Diff);
            }
           
            let result=await sequelize.query(`SELECT lht.code,json_agg(json_build_object('LedgerName',lh.name,'Amount',coalesce(lh.amount,0),'isAsset',case when lht.code='Asset' then true else false end,'isLiability',case when lht.code='Capital/Liability' then true else false end)) as data 
                    FROM account.ledgerheads lh
                    JOIN account.ledgerheadtypes lht ON lht.ledgerheadtypeid=lh.ledgerheadtypeid and lht.datedeleted is null
                    WHERE lh.datedeleted IS NULL AND lh.parentid is null AND (lht.code='Asset' OR lht.code='Capital/Liability') GROUP BY lht.code Order By lht.code desc`,{type:QueryTypes.SELECT});
            let Liability=result[0].data.filter(r=>r.LedgerName=='Capital')
            let Asset=result[1].data.filter(r=>r.LedgerName=='Bank');
            result=[...Liability,...Asset];
            Asset=Asset.map(a=>a.Amount).reduce((a,b)=>a+b,0);
            Liability=Liability.map(l=>l.Amount).reduce((a,b)=>a+b,0);
            if(NetLoss){
                Liability=Liability-NetLoss;
            }else{
                Liability=Liability+NetProfit;
            }
            result={result,NetProfit,NetLoss,Asset,Liability};
                    
                    if(fileRead=='fileresponse'){
                        const template = await compileTemplate('balancesheet',result);
                        const pdf=await pdfGenerateByHtml(template);
                        return res.send('Created Balance Sheet');
                    }
            return res.send(result);
            
        } catch (error) {
            logError(error.message, error.stack, 'Generate PL account', req.UserReference);
            return res.status(500).send({ message: 'Server Error' });
        }
    }
};