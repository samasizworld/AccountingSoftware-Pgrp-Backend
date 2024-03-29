create table "usertoken".userlogininfos(
userlogininfoid serial primary key,
guid UUID DEFAULT "usertoken".uuid_generate_v4(),
usertoken text,
userreference UUID,
tokenexpiresin bigint,
datecreated timestamp default now(),
datemodified timestamp,
datedeleted timestamp
);


create table "usertoken".accesslabels(
accesslabelid serial primary key,
guid UUID DEFAULT "usertoken".uuid_generate_v4(),
name varchar(100),
uri varchar(100),
accesslabeltype varchar(100),
datecreated timestamp default now(),
datemodified timestamp,
datedeleted timestamp
);

create table "usertoken".userpermissions(
userpermissionid serial primary key,
guid UUID DEFAULT "usertoken".uuid_generate_v4(),
userrolereference UUID,
accesslabelid integer,
canread boolean,
canwrite boolean,
datecreated timestamp default now(),
datemodified timestamp,
datedeleted timestamp
);

--  data in accesslabels for userapi permission
insert into 
usertoken.accesslabels(name,uri,accesslabeltype) 
values('Permission related to UserApi','/User','permission');

-- permission for pgadmin for userapi
insert into usertoken.userpermissions
(userrolereference,accesslabelid,canread,canwrite)
values('5a886c07-941d-428e-b37b-6ab1bdf24679'::uuid,1,true,true);