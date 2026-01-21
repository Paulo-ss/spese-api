import { IVersionedEntityBase } from '../../common/interfaces/versioned-entity-base.interface';

export interface IUser extends IVersionedEntityBase {
    id: number;
    name: string;
    username: string;
    email: string;
    password: string;
    confirmed: boolean;
    accountSetup: boolean;
}
