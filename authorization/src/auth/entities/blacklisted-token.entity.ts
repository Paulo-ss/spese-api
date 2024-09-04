import { IUser } from 'src/users/interfaces/user.interface';
import { IBlacklistedToken } from '../interfaces/blacklisted-token.interface';
import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from 'src/users/entities/user.entity';

@Entity({ name: 'blacklisted_tokens' })
export class BlacklistedToken implements IBlacklistedToken {
  @PrimaryColumn({ type: 'uuid' })
  public tokenId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  public user: IUser;

  @Column({ name: 'created_at' })
  public createdAt: string;
}
