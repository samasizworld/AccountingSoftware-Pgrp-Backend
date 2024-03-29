CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


create table "user".users(
userid serial primary key,
guid UUID DEFAULT "user".uuid_generate_v4(),
firstname varchar(255),
lastname varchar(255),
displayname varchar(255),
emailaddress varchar(255),
address varchar(255),
phonenumber varchar(15),
datecreated timestamp ,
datemodified timestamp,
datedeleted timestamp,
salt text,
password text 
);

create table "user".userroles(
userroleid serial primary key,
guid uuid default "user".uuid_generate_v4(),
name varchar(50),
isadmin boolean,
userid int references "user".users(userid),
datecreated timestamp ,
datemodified timestamp ,
datedeleted timestamp);