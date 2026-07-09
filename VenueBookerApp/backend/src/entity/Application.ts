import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, RelationId, UpdateDateColumn } from "typeorm";
import { User } from "./User";
import { Venue } from "./Venue";
import type { ApplicationStatus } from "@shared/types";
import { Review } from "./Review";

export type { ApplicationStatus } from "@shared/types";

@Entity({name : "application"})
export class Application {
    @PrimaryGeneratedColumn({
        type : "int"
    })
    id : number

    @Column({
        type : "varchar",
        length : 40,
        nullable : false
    })
    eventName : string

    @Column({
        type : "smallint",
        nullable : false
    })
    expectedGuests : number

    @Column({ 
        type: 'date',
        nullable : false
    })
    date: string;

    @Column({ 
        type: 'time',
        nullable : false
    })
    time: string;

    @Column({
        type : "smallint",
        nullable : false
    })
    duration : number

    @Column({
        type : "varchar",
        length : 40,
        nullable : false,
        default : ""
    })
    vendorReason : string

    // since the @JoinColumn() is not there here so it does not create
    // additional column and it is only used for typescript orm
    @OneToOne(() => Review, (review) => review.application, {
        cascade: true,
    })
    review: Review;

    @Column({
        type: "varchar",
        length: 30,
        default: "pending",
    })
    status: ApplicationStatus;

    @CreateDateColumn({ type: "datetime" })
    createdAt: string;

    @UpdateDateColumn({ type: "datetime" })
    updatedAt: string;

    @ManyToOne(() => User,(user) => user.applications)
    user : User

    @RelationId((application : Application) => application.user)
    userId : number

    @ManyToOne(() => Venue, (venue) => venue.applications, {
        onDelete: "CASCADE",
    })
    @JoinColumn({ name : "venueId"})
    venue : Venue

    @RelationId((application : Application) => application.venue)
    venueId : number
}
