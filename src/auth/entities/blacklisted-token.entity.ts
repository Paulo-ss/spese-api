import { IUser } from 'src/users/interfaces/user.interface';
import { IBlacklistedToken } from '../interfaces/blacklisted-token.interface';
import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { VersionedEntityBase } from '../../common/entities/versioned-base.entity';

@Entity({ name: 'blacklisted_tokens' })
export class BlacklistedToken
    extends VersionedEntityBase
    implements IBlacklistedToken
{
    @PrimaryColumn({ type: 'uuid' })
    public tokenId: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    public user: IUser;
}
