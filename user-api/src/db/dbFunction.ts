import { dbFunctionsInterface } from "./dbFunctionInterface";
const moment = require("moment");

export class dbFunctions<T> implements dbFunctionsInterface<T> {
  protected dbContext: any;
  constructor(context: any) {
    this.dbContext = context;
  }

  async insert(item: any, ...[transaction]: any): Promise<T> {
    let t = transaction ? transaction : null;
    return await this.dbContext.create(item, { transaction: t });
  }
  async update(updateClause: any, whereClause: any, ...[transaction]: any) {
    let t = transaction ? transaction : null;
    updateClause.datemodified = moment().format('YYYY-MM-DD HH:mm:ss')
    var updatedItem: any = await this.dbContext.update(updateClause, {
      where: whereClause,
      returning: true,
      transaction: t,
    });

    return updatedItem[1];

  }
  async delete(whereClause: any, ...[tr]: any) {
    let t = tr ? tr : null;
    var updateClause = {
      datedeleted: moment().format(),
    };

    var deletedItem = await this.dbContext.update(updateClause, {
      where: whereClause,
      returning: true,
      transaction: t,
    });
    return deletedItem[1];
  }
  async loadAll(whereClause) {
    return await this.dbContext.findAll({ where: whereClause });
  }
  async loadAllOffset(
    start: number,
    pageSize: number,
    orderBy: string,
    orderDir: string,
    whereClause: any,
    includeClause: any
  ): Promise<T[]> {
    if (pageSize == 0) {
      var result = await this.dbContext.findAll({
        where: whereClause,
        include: includeClause,
        order: [[orderBy, orderDir]],
      });

      return result;
    } else {
      var result = await this.dbContext.findAll({
        where: whereClause,
        offset: start,
        limit: pageSize,
        include: includeClause,
        order: [[orderBy, orderDir]],
      });

      return result;
    }
  }

  async loadbyGuid(guid: string) {
    return await this.dbContext.findOne({ where: { guid, datedeleted: null } });
  }
  async loadOneWithAttribute(attribute, whereClause) {
    return await this.dbContext.findOne({
      attributes: attribute,
      where: whereClause,
    });
  }
  async count(whereClause) {
    return await this.dbContext.count(whereClause);
  }

  async upsert(items: any) {
    return await this.dbContext.upsert(items);
  }
  async loadAllWithAttribute(attributes, whereClause) {
    return await this.dbContext.findAll({
      attributes,
      where: whereClause,
      order: ["datecreated"],
    });
  }
}
