create or replace function  account.upsert_journalentries(
    excel json
) returns void
as $$
declare
varbank varchar(50):='';
varfine varchar(50):='';
varinterest varchar(50):='';
begin
drop table if exists excel_table;
drop table if exists join_data;
select l.name into varbank from account.ledgerheads l where l.name=UPPER('Bank') and l.datedeleted is null;
if coalesce(varbank,'')='' then
	insert into account.ledgerheads(name) values(UPPER('Bank'));
end if;
select f.name into varfine from account.ledgerheads f where f.name=UPPER('Fine') and  f.datedeleted is null;
if coalesce(varfine,'')='' then
	insert into account.ledgerheads(name) values(UPPER('Fine'));
end if;
select i.name into varinterest from account.ledgerheads i where i.name=UPPER('Interest') and i.datedeleted is null;
if coalesce(varinterest,'')='' then
	insert into account.ledgerheads(name) values(UPPER('Interest'));
end if;
create temp table excel_table("name" varchar(100),"money" float,"fine" float,"interest" float);
insert into excel_table select * from json_to_recordset($1) as t ("Name" varchar(100),"Money" float,"Fine" float,"Interest" float);
create temp table join_data ("name" varchar(100),"money" float ,"fine" float,"userid" uuid ,"ledgerid" integer,interest float);
insert into join_data select l.name,e.money,e.fine,l.userreference,l.ledgerheadid,interest from excel_table e join account.ledgerheads l on e.name=l.name and l.datedeleted is null;
insert into account.journalentries(ledgerheadid,userreference,isdebit,iscredit,transactionmoney,fine,interest) select ledgerid,userid,false,true,money,fine,interest from join_data; 
end;
$$
language plpgsql;