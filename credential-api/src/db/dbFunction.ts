import { dbFunctionsInterface } from "./dbFunctionInterface";
const moment = require("moment");

export const Repository = (sequelize: any) => {

    let dbFunctions: dbFunctionsInterface<any> = {
        async insert(item: any, ...[transaction]: any) {
            let t = transaction ? transaction : null;
            return await sequelize.create(item, { transaction: t });
        },
        async update(updateClause: any, whereClause: any, ...[transaction]: any) {
            let t = transaction ? transaction : null;
            var updatedItem: any = await sequelize.update(updateClause, {
                where: whereClause,
                returning: true,
                transaction: t,
            });

            let updated = updatedItem[1];
            return [updated];

        },
        async delete(whereClause: any, ...[tr]: any) {
            let t = tr ? tr : null;
            var updateClause = {
                datedeleted: moment().format(),
            };

            var deletedItem = await sequelize.update(updateClause, {
                where: whereClause,
                returning: true,
                transaction: t,
            });
            let del = deletedItem[1];
            return [del];
        },
        async loadAll(whereClause) {
            return await sequelize.findAll({ where: whereClause });
        },
        async loadAllOffset(
            start: number,
            pageSize: number,
            orderBy: string,
            orderDir: string,
            whereClause: any,
            includeClause: any
        ) {
            if (pageSize == 0) {
               
                var result = await sequelize.findAll({
                    where: whereClause,
                    include: includeClause,
                    order: [[orderBy, orderDir]],
                });

                return result;
            } else {
                var result = await sequelize.findAll({
                    where: whereClause,
                    offset: start,
                    limit: pageSize,
                    include: includeClause,
                    order: [[orderBy, orderDir]],
                });

                return result;
            }
        },

        async loadbyGuid(guid: string) {
            return await sequelize.findOne({ where: { guid, datedeleted: null } });
        },
        async loadOneWithAttribute(attribute, whereClause) {
            return await sequelize.findOne({
                attributes: attribute,
                where: whereClause,
            });
        },
        async count(whereClause) {
            return await sequelize.count(whereClause);
        },

        async upsert(items: any) {
            let result = await sequelize.upsert(items);
            return result[0];
        },
        async loadAllWithAttribute(attributes, whereClause) {
            return await sequelize.findAll({
                attributes,
                where: whereClause,
                order: ["datecreated"],
            });
        }
    }
    return dbFunctions;
}
