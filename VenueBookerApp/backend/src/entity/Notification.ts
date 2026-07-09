import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, RelationId, UpdateDateColumn } from "typeorm";
import { User } from "./User";
import { Application } from "./Application";
// import { Booking } from "./Booking";

export enum ApplicationStatus {
  APPROVED = "APPLICATION_APPROVED",
  REJECTED = "APPLICATION_REJECTED",
}

@Entity({name : "notification"})
export class Notification {
    @PrimaryGeneratedColumn()
    id : number

    @Column({
        type : "date",
        nullable : false
    })
    date : string

    @Column({
        type : "time",
        nullable : false
    })
    time : string
    @Column({
        type : "varchar",
        length : 30,
        nullable : false
    })
    type : ApplicationStatus

    @Column({
        type : "varchar",
        length : 40,
        nullable : false
    })
    message : string

    @Column({
        type : "bit",
        nullable : false,
        default : false
    })
    read : boolean

    @ManyToOne(() => User,(user) => user.notifications)
    @JoinColumn({ name : "userId"})
    user : User

    @RelationId((notification : Notification) => notification.user)
    userId : number

    @OneToOne(() => Application, {
        onDelete: "CASCADE",
    })
    @JoinColumn({name : "applicationId"})
    application : Application

    @RelationId((notification : Notification) => notification.application)
    applicationId : number

    @CreateDateColumn({ type: "datetime" })
    createdAt: string;

    @UpdateDateColumn({ type: "datetime" })
    updatedAt: string;
}
