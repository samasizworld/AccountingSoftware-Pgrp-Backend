export interface dbFunctionsInterface<T> {
  insert(item: any, ...[transaction]: any): Promise<T>;
  upsert(items: any): Promise<T>;
  loadOneWithAttribute(attribute: any, whereClause: any): Promise<T>;
  loadAll(whereClause: any): Promise<T[]>;
  loadbyGuid(guid: string): Promise<T>;
  update(
    updateClause: any,
    whereClause: any,
    ...[transaction]: any
  ): Promise<T>;
  delete(whereClause: any, ...[transaction]: any): Promise<string>;
  loadAllOffset(
    offset: number,
    limit: number,
    orderBy: string,
    orderDir: string,
    whereClause: any,
    includeClause: any
  ): Promise<T[]>;
  count(whereClause: any): Promise<number>;
  loadAllWithAttribute(attribute: any, whereClause: any): Promise<T[]>;
}
