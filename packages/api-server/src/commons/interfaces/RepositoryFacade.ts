import {
  DeepPartial,
  DeleteResult,
  EntityManager,
  FindConditions,
  FindManyOptions,
  FindOneOptions,
  ObjectID,
  UpdateResult,
} from 'typeorm';

export type Criteria<Entity> =
  | string
  | string[]
  | number
  | number[]
  | Date
  | Date[]
  | ObjectID
  | ObjectID[]
  | FindConditions<Entity>;

export interface RepositoryFacade<Entity> {
  create(entityLike: DeepPartial<Entity>): Entity;

  delete(criteria: Criteria<Entity>, transactionalEntityManager?: EntityManager): Promise<DeleteResult>;

  find(options?: FindConditions<Entity> | FindManyOptions<Entity>): Promise<Entity[]>;

  findOne(options?: FindOneOptions<Entity>): Promise<Entity>;

  save(entity: Entity, transactionalEntityManager?: EntityManager): Promise<Entity>;

  update(
    criteria: Criteria<Entity>,
    partialEntity: DeepPartial<Entity>,
    transactionalEntityManager?: EntityManager,
  ): Promise<UpdateResult>;
}
