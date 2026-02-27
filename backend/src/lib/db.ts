import { AppDataSource, initDataSource } from './typeorm.js';

export { AppDataSource, initDataSource };

export function getRepository<T>(entity: new () => T) {
  return AppDataSource.getRepository(entity);
}
