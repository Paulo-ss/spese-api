import { IUser } from 'src/users/interfaces/user.interface';
import { IVersionedUserEntityBase } from '../../common/interfaces/versioned-user-entity-base.interface';
import { IVersionedEntityBase } from '../../common/interfaces/versioned-entity-base.interface';

export interface IBlacklistedToken extends IVersionedEntityBase {
    tokenId: string;
    user: IUser;
}
