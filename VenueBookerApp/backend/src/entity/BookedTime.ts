import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, RelationId } from "typeorm";
import { Venue } from "./Venue";
import { Application } from "./Application";

@Entity({name : "booked_time"})
export class BookedTime {
    @PrimaryGeneratedColumn({
        type : "int"
    })
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

    // @Column({
    //     type : "varchar",
    //     length : 50,
    //     nullable : false
    // })
    // message : string

    @Column({
        type : "smallint",
        nullable : false
    })
    duration : number

    @ManyToOne(() => Venue,(venue) => venue.bookedTimes, {
        onDelete: "CASCADE",
    })
    @JoinColumn({ name : "venueId"})
    venue : Venue

    @RelationId((bookedTime : BookedTime) => bookedTime.venue)
    venueId : number

}
