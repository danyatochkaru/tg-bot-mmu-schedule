import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum AppEvent {
  NOTIFICATION_STARTED = 'notification/started',
  NOTIFICATION_COMPLETED = 'notification/completed',
  NOTIFICATION_CANCELLED = 'notification/cancelled',
}

@Entity()
export class WebhookEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: AppEvent,
    nullable: false,
  })
  event: AppEvent | string;

  @Column()
  url: string;

  @Column({ default: false })
  isEnabled: boolean;

  @UpdateDateColumn()
  updated_at: Date;

  @CreateDateColumn()
  created_at: Date;
}
