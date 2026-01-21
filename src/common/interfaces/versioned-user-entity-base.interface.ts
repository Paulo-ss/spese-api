import { IVersionedEntityBase } from './versioned-entity-base.interface';

export interface IVersionedUserEntityBase extends IVersionedEntityBase {
    userId: number;
}
