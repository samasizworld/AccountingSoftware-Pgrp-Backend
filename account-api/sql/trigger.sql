create trigger trigger_journalentries
after insert or update on account.journalentries
for each row
when (pg_trigger_depth()<1)
execute procedure upsert_journalentries_trigger();

create trigger trigger_journalentries
after insert on account.journalentries
for each row
when (pg_trigger_depth()<1)
execute procedure upsert_ledgerheads();

create trigger triggerrelatedtoledger
after insert or update on account.ledgerheads
for each row
when(pg_trigger_depth()<1)
execute procedure trigger_ledger();


create or replace function account.trigger_ledger() returns trigger as
$$
begin
if TG_OP='INSERT' then
    Update account.ledgerheads set datemodified=now() where ledgerheadid = new.ledgerheadid and datedeleted is null;
    return new;
end if;
if TG_OP='UPDATE' then
    if new.datedeleted is not null then
    UPDATE account.journalentries set datedeleted =now() where ledgerheadid=new.ledgerheadid and datedeleted is null;
    return new;
    end if;
    if new.datemodified is not null then
    UPDATE account.ledgerheads set datemodified=now() where ledgerheadid = new.ledgerheadid and datedeleted is null;
    return new;
    end if;
end if;
return null;
end;
$$
language plpgsql;


create or replace function upsert_journalentries_trigger() returns trigger
 as $$
declare 
bankledgerid integer;
fineledgerid integer;
interestledgerid integer;
begin
if TG_OP ='INSERT' then
UPDATE account.journalentries set datemodified=now() where journalentryid=new.journalentryid and datedeleted is null;

select ledgerheadid into bankledgerid from account.ledgerheads b where b.name=UPPER('BANK') and b.datedeleted is null;
select f.ledgerheadid into fineledgerid from account.ledgerheads f where f.name=UPPER('FINE') and  f.datedeleted is null;
select i.ledgerheadid into interestledgerid from account.ledgerheads i where i.name=UPPER('INTEREST') and i.datedeleted is null;
    if new.transactionmoney is not null and new.datedeleted is null then
        insert into account.journalentries(ledgerheadid,userreference,isdebit,iscredit,transactionmoney) 
        values (bankledgerid,new.userreference,true,false,new.transactionmoney);
    end if;
    if new.fine is not null and new.datedeleted is null then
        insert into account.journalentries(ledgerheadid,userreference,isdebit,iscredit,transactionmoney,fine) 
        values(fineledgerid,new.userreference,false,true,null,new.fine);
    end if;
    if new.interest is not null and new.datedeleted is null then
        insert into account.journalentries(ledgerheadid,userreference,isdebit,iscredit,transactionmoney,interest) 
        values (interestledgerid,null,false,true,null,new.interest);
    end if;
	update account.journalentries set isdebit =true ,iscredit=false where new.interest is not null and new.datedeleted is null and ledgerheadid=bankledgerid;
        return new;
end if;
    if TG_OP='UPDATE' then
    if new.datemodified is not null then
    UPDATE account.journalentries set datemodified=now() where journalentryid = new.journalentryid and datedeleted is null;
    return new;
    end if;
    end if;
        return null;

    
end;
$$
language plpgsql;



create or replace function upsert_ledgerheads() returns trigger
 as $$
declare 
begin
if TG_OP ='INSERT' then

        DROP TABLE IF EXISTS trial_table;
        CREATE TEMP TABLE trial_table(isdebit float,iscredit float ,name character varying);

        DROP TABLE IF EXISTS parent_ledgerhead;
        CREATE TEMP TABLE parent_ledgerhead(name character varying,amount float);

        INSERT INTO trial_table
        SELECT CASE WHEN je.isdebit=true then SUM(je.moneytransaction) END isdebit,CASE WHEN je.iscredit=true then SUM(je.moneytransaction) END iscredit ,lh.name

                        FROM account.journalentries je
                        JOIN account.ledgerheads lh 
                        ON lh.ledgerheadid=je.ledgerheadid AND lh.datedeleted IS NULL
                        WHERE je.datedeleted IS NULL GROUP BY je.isdebit,lh.name,iscredit;
                        
                        INSERT INTO parent_ledgerhead(name,amount)
                        SELECT lh1.name,abs(sum(coalesce(tt.isdebit,0))- sum(coalesce(tt.iscredit,0))) as amount
                        from trial_table tt 
                        left join account.ledgerheads lh on lh.name=tt.name and lh.datedeleted is null 
                        JOIN account.ledgerheads lh1 on lh1.ledgerheadid=lh.parentid
                        where lh.parentid is not null group by lh1.name;
        --  for childeren 
        UPDATE account.ledgerheads lh  
        SET amount=abs(coalesce(tt.isdebit,0)-coalesce(tt.iscredit,0)) 
        FROM trial_table tt WHERE tt.name=lh.name; 

        -- for parentid
        UPDATE account.ledgerheads lh
        SET amount=plh.amount FROM parent_ledgerhead plh
        WHERE lh.name=plh.name;
    return new;
    end if;
     return null;
end;
   
$$
language plpgsql;