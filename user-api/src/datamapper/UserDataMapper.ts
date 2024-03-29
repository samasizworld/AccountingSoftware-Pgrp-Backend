import { UtilityObject } from '../utils/utils';
import * as uuid from 'uuid';
export function BodyObjectToModelForUpsert(bodyData: any) {

  let model: any = {
    guid: UtilityObject.isGuid(bodyData.UserId) == false || bodyData.UserId == undefined ? uuid.v4() : bodyData.UserId,
    firstname: bodyData.FirstName,
    lastname: bodyData.LastName,
    displayname: bodyData.FirstName+' '+bodyData.LastName,
    emailaddress: bodyData.EmailAddress,
    address: bodyData.Address,
    phonenumber: bodyData.PhoneNumber && bodyData.PhoneNumber.length === 10 ? bodyData.PhoneNumber : "",

  };
  if (bodyData.Password) {
    model.salt = UtilityObject.generateSaltKey();
    model.password = UtilityObject.hashPassword(bodyData.Password, model.salt);
  }
  return model;
}
export function UserProfileMapper(dto: any) {
  let model: any = {
    guid: UtilityObject.isGuid(dto.UserId) == false || dto.UserId == undefined ? uuid.v4() : dto.UserId
  };
 
    model.firstname = dto.FirstName
  
 
    model.lastname = dto.LastName
 
 
    model.emailaddress = dto.EmailAddress

 
    model.phonenumber = dto.PhoneNumber
 
  
    model.address = dto.Address
  
  if (dto.Password) {
    model.salt = UtilityObject.generateSaltKey();
    model.password = UtilityObject.hashPassword(dto.Password, model.salt);
  }
  return model;
}
