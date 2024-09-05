import { Column, Entity, PrimaryColumn } from 'typeorm';

enum DataKeys {
  FAQ = 'faq',
}

export enum DataLanguages {
  RUSSIAN = 'ru',
}

@Entity()
export class DataEntity {
  @PrimaryColumn('enum', { enum: DataKeys, unique: true })
  key: DataKeys | string;

  @PrimaryColumn('enum', {
    enum: DataLanguages,
    default: DataLanguages.RUSSIAN,
  })
  language?: DataLanguages | string;

  @Column()
  value: string;
}
