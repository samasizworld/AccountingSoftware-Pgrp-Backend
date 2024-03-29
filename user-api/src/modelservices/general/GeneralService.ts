import { Op } from "sequelize";
import { dbFunctionsInterface } from "../../db/dbFunctionInterface";
export class GeneralService<T> {
  protected dbFunction: dbFunctionsInterface<T>;

  constructor(db: dbFunctionsInterface<T>) {
    this.dbFunction = db;
  }

  async Load(modified, whereClause) {
    if (!modified) {
      whereClause.datedeleted = null;
      return await this.dbFunction.loadAll(whereClause);
    } else {
      whereClause = {
        [Op.or]: [
          {
            datemodified: null,
            datecreated: {
              [Op.gt]: modified,
            },
          },
          {
            datemodified: {
              [Op.ne]: null,
              [Op.gt]: modified,
            },
          },
          {
            datedeleted: {
              [Op.ne]: null,
              [Op.gt]: modified,
            },
          },
        ],
      };
    }
    return await this.dbFunction.loadAll(whereClause);
  }

  async LoadByID(guid: string) {
    return await this.dbFunction.loadbyGuid(guid);
  }
  async Add(model: any, ...[t]: any): Promise<T> {
    return await this.dbFunction.insert(model, t);
  }

  async Update(updateClause: any, guid: any, ...[t]: any) {
    let whereClause = {
      datedeleted: null,
      guid,
    };

    let [result]: any = await this.dbFunction.update(updateClause, whereClause, t);
    return result;
  }
  async LoadAllWithAttribute(attributes: any, whereClause: any) {
    return await this.dbFunction.loadAllWithAttribute(attributes, whereClause);
  }
  async Upsert(items: any) {
    let result: any = await this.dbFunction.upsert(items);
    return result[0];
  }
  async Delete(guid: string, ...[t]) {
    let whereClause: any = { datedeleted: null, guid };
    let [result]: any = await this.dbFunction.delete(whereClause, t);
    return result;
  }

  async LoadAllOffset(
    offset: number,
    limit: number,
    orderBy: string,
    orderDir: string,
    modified: string,
    whereClause: any,
    includeClause: any
  ): Promise<T[]> {
    whereClause.datedeleted = null;
    if (modified) {
      whereClause = {
        [Op.or]: [
          {
            datemodified: null,
            datecreated: {
              [Op.gt]: modified,
            },
          },
          {
            datemodified: {
              [Op.ne]: null,
              [Op.gt]: modified,
            },
          },
          {
            datedeleted: {
              [Op.ne]: null,
              [Op.gt]: modified,
            },
          },
        ],
      };
    }

    var results: any = await this.dbFunction.loadAllOffset(
      offset,
      limit,
      orderBy,
      orderDir,
      whereClause,
      includeClause
    );
    var count = await this.dbFunction.count(whereClause);

    results.count = count;

    return results;
  }
  async LoadOneWithAttribute(attributes, whereClause) {
    return await this.dbFunction.loadOneWithAttribute(attributes, whereClause);
  }
}
