create table account.ledgerheads(
    ledgerheadid serial primary key,
    guid uuid default uuid_generate_v4(),
    name varchar(100),
    userreference uuid,
    ledgerheadtypeid int references account.ledgerheadtypes(ledgerheadtypeid),
    parentid integer,
    amount double precision,
    datecreated timestamp without time zone default now(),
    datemodified timestamp,
    datedeleted timestamp

);
create table account.journalentries(
    journalentryid serial primary key,
    guid uuid default uuid_generate_v4(),
    isdebit boolean,
    iscredit boolean,
    ledgerheadid integer references account.ledgerheads(ledgerheadid),
    moneytransaction float,
    description text,
    datecreated timestamp default now(),
    datemodified timestamp,
    datedeleted timestamp
);
-- table to hold info like income,expense,asset,capital
create table account.ledgerheadtypes(
    ledgerheadtypeid serial primary key,
    guid uuid default uuid_generate_v4(),
    code varchar(100),
    datecreated timestamp default now(),
    datemodified timestamp,
    datedeleted timestamp
);
INSERT INTO account.ledgerheadtypes(code) values ('Income'),('Capital/Liability'),('Asset'),('Expense'); 

ALter table account.ledgerheads
	add ledgerheadtypeid int references account.ledgerheadtypes(ledgerheadtypeid);