import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  uid: string;

  @Column({ nullable: true })
  first_name?: string;

  @Column({ nullable: true })
  last_name?: string;

  @Column({ nullable: true })
  username?: string;

  @Column()
  group_id: number;

  @Column({ nullable: true })
  group_name?: string;

  @Column({ default: false })
  detail_week?: boolean;

  @Column({ default: true })
  allow_mailing?: boolean;

  @Column({ default: false })
  is_inactive?: boolean;

  @Column({ nullable: true })
  inactive_reason?: string;

  @Column('enum', { default: 'directly' })
  register_source: 'directly' | 'group_link';

  @UpdateDateColumn()
  updated_at: Date;

  @CreateDateColumn()
  created_at: Date;
}
