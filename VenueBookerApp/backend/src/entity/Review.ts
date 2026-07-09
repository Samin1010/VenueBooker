import {Column, Entity,JoinColumn,OneToOne, PrimaryGeneratedColumn, RelationId} from "typeorm"
import { Application } from "./Application";

@Entity({name : "review"})
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "decimal", precision: 2, scale: 1 })
  rating: number;

  @OneToOne(() => Application,{
    nullable : false,
    onDelete: "CASCADE",
  })
  @JoinColumn({name : "applicationId"})
  application: Application;

  @RelationId((review : Review) => review.application)
  applicationId : number
}
