import { BodyObjectToModelForUpsert, UserProfileMapper } from "../datamapper/UserDataMapper";
import { UserService } from "../modelservices/UserService";
import { ConnectToPostgres } from "../sequelize/sequelize";
import { UtilityObject } from "../utils/utils";
import * as log from '../utils/logger';
import { LedgerService } from "../modelservices/LedgerService";

export const UserController = {
  GetUsers: async function (req, res) {
    let sequelize: any = ConnectToPostgres();
    const { pageSize, page, orderBy, orderDir, search } = req.query;
    let pagesize = pageSize ? parseInt(pageSize) : 20;
    let pageNo = page ? parseInt(page) : 1;
    let orderby = orderBy ? orderBy : 'firstname';
    let orderdir = orderDir ? orderDir : 'asc';
    let searchString = search ? search : '';
    let offset = pagesize * (pageNo - 1);
    try {
      let users: any = await new UserService(sequelize).LoadUserList(searchString, pagesize, offset, orderdir, orderby);
      res.header("X-Page", users.count ? users.count : 0);
      return res.status(200).send(users.map(user => {
        return {
          UserId: user.guid,
          FirstName: user.firstname,
          LastName: user.lastname,
          DisplayName:user.displayname,
          EmailAddress: user.emailaddress,
          Address: user.address,
          PhoneNumber: user.phonenumber
        }
      }));
    } catch (error) {
      log.logError('Error: ' + error.message, error.stack, 'GetUsers', req.UserReference);
      return res.status(500).send({ errorMessage: 'Server Error' });
    }
  },
  GetUser: async function (req, res) {
    let sequelize: any = ConnectToPostgres();
    let userId = req.params.userid;
    try {
      if (UtilityObject.isGuid(userId) == false) {
        throw 'Invalid UserId';
      }
      let [user]: any = await new UserService(sequelize).Load(null, { datedeleted: null, guid: userId });
      if (!user) {
        log.logInfo('No User', 'Error in GetUser', 'GetUser', req.UserReference);
        throw 'No User';
      }
      return res.status(200).send(
        {
          UserId: user.guid,
          FirstName: user.firstname,
          LastName: user.lastname,
          DisplayName:user.displayname,
          EmailAddress: user.emailaddress,
          Address: user.address,
          PhoneNumber: user.phonenumber
        }
      );
    } catch (error) {
      log.logError('Error: ' + error.message, error.stack, 'GetUser', req.UserReference);
      if (error == 'Invalid UserId') { return res.status(400).send({ message: 'Invalid UserId' }) };
      if (error = 'No User') { return res.status(404).send({ message: 'No User Resource Found' }) };
      return res.status(500).send({ errorMessage: 'Server Error' });
    }
  },
  UpsertUserProfile: async function (req, res) {
    let sequelize: any = ConnectToPostgres();
    const token=req.get('X-Token');
    let userData = req.body;
    try {
      if (userData && !userData.hasOwnProperty('FirstName') && !userData.hasOwnProperty('LastName')) {
        log.logError('Invalid data', 'Error in userData', 'UpsertUserProfile', req.UserReference);
        return res.status(400).send({ message: 'Bad Request' });
      };
      let model = BodyObjectToModelForUpsert(userData);
      let [user]: any = await new UserService(sequelize).Load(null, { datedeleted: null, guid: model.guid });
      let users:any=await new UserService(sequelize).Load(null,{datedeleted:null});
      // firstname validation here
      let userFirstNames=users.map(u=>u.firstname.replace(/\s/g,'').toLowerCase());
      let userEmails=users.map(u=>u.emailaddress.replace(/\s/g,'').toLowerCase());
      if(user){
        const existedUserFirstName=user.firstname.replace(/\s/g,'').toLowerCase();
        const existedUserEmailAddress=user.emailaddress.replace(/\s/g,'').toLowerCase();
        userFirstNames=userFirstNames.filter(u=>u!=existedUserFirstName);
        userEmails=userEmails.filter(u=>u!=existedUserEmailAddress);
      };
      if(userFirstNames.includes(model.firstname.replace(/\s/g,'').toLowerCase())){
        return res.status(400).send({message:'FirstName Already Exists'});
      }
      if(userFirstNames.includes(model.emailaddress.replace(/\s/g,'').toLowerCase())){
        return res.status(400).send({message:'EmailAddress Already Exists'});
      }
      // end here
      let result: any;
      if (!user) {
        result = await new UserService(sequelize).Add(model);
        await LedgerService.AddLedger(token,model.displayname,model.guid);

      } else {
        result = await new UserService(sequelize).Update(model, model.guid);
      }
      return res.status(201).send({ UserId: result.guid })

    } catch (error) {
      log.logError('Error: ' + error.message, error.stack, 'Upsert UserProfile', req.UserReference);
      return res.status(500).send({ errorMessage: 'Server Error' });
    }
  },

  // UpsertUser: async function (req, res) {
  //   let sequelize = await ConnectToPostgres();
  //   let userData: any = req.body;
  //   let result: any;
  //   let userService = new UserService(sequelize) as UserService<any>; // type assertion
  //   let model = BodyObjectToModelForUpsert(userData);
  //   try {
  //     let userExists: any = await userService.LoadOneWithAttribute(
  //       ["userid"],
  //       { datedeleted: null, guid: model.guid }
  //     );
  //     if (userExists) {
  //       result = await userService.Update(model, model.guid)
  //     }
  //     else {
  //       result = await userService.Add(model);
  //     }
  //     return res.status(201).send({ UserId: result.guid });
  //   } catch (e) {
  //     log.logError('Error: ' + e.message, e.stack, 'GetUsers', req.UserReference);
  //     return res.status(500).send({ message: "Server Error" });
  //   }
  // },
};
