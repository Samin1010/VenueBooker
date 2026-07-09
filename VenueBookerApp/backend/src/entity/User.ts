import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm"
import { Venue } from "./Venue"
import { UserPreference } from "./UserPreference"
import { Application } from "./Application"
// import { Booking } from "./Booking"
import { Notification } from "./Notification"
import { UserDocument } from "./UserDocument"

export enum UserType {
    HIRER = "hirer",
    VENDOR = "vendor",
    ADMIN = "admin"
}

@Entity({name : 'user'})
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        type : "varchar",
        length : 40,
        nullable : false
    })
    first_name : string

    @Column({
        type : "varchar",
        length : 40,
        nullable : false
    })
    last_name : string

    @Column({
        type : "varchar",
        length : 40,
        nullable : false,
        unique : true
    })
    username: string

    @Column({
        type : "varchar",
        length : 40,
        nullable : false,
        unique : true
    })
    email: string

    @Column({
        type : "varchar",
        nullable : false,
        select: false
    })
    password : string

    @Column({
        type : "varchar",
        length : 10,
        nullable : false
    })
    role : UserType

    @Column({
        type : "varchar",
        length : 10,
        nullable : true
    })
    phone : string

    @CreateDateColumn({ type: "datetime" })
    createdAt: string;

    @UpdateDateColumn({ type: "datetime" })
    updatedAt: string;

    @OneToMany(() => Venue,(venue) => venue.user)
    venues : Venue[]

    @OneToMany(() => UserPreference,(user_pref) => user_pref.user)
    preferences : UserPreference[]

    @OneToMany(() => Application,(application) => application.user)
    applications : Application[]

    @OneToMany(() => UserDocument,(userDocument: UserDocument) => userDocument.user)
    documents : UserDocument[]

    // @OneToMany(() => Booking,(booking) => booking.user)
    // bookings : Booking[]

    @OneToMany(() => Notification,(notification) => notification.user)
    notifications : Notification[]

}
