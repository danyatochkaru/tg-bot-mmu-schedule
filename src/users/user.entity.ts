import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

enum RegisterSource {
  DIRECTLY = 'directly',
  GROUP_LINK = 'group_link',
}

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

  @Column({ default: false })
  hide_buildings?: boolean;

  @Column({ default: true })
  allow_mailing?: boolean;

  @Column({ default: false })
  is_inactive?: boolean;

  @Column({ nullable: true })
  inactive_reason?: string;

  @Column({
    type: 'enum',
    enum: RegisterSource,
    default: RegisterSource.DIRECTLY,
  })
  register_source: 'directly' | 'group_link';

  @Column({ default: 'ru' })
  language?: string;

  @UpdateDateColumn()
  updated_at: Date;

  @CreateDateColumn()
  created_at: Date;
}
