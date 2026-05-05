import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 't_verseny' })
export class Competition {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text', nullable: true })
  name?: string | null;
}
