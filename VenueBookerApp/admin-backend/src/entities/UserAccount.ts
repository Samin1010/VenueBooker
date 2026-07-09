import type { UserRole } from "@admin-shared/types"
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm"
import { VenueProperty } from "./VenueProperty"
import { VenueApplication } from "./VenueApplication"

@Entity({name : "user"})
export class UserAccount
{
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
        nullable : false
    })
    password : string

    @Column({
        type : "varchar",
        length : 10,
        nullable : false
    })
    role : UserRole

    @OneToMany(() => VenueApplication,(application : VenueApplication) => application.user)
    applications : VenueApplication[]

    @Column({
        type : "varchar",
        length : 10,
        nullable : true
    })
    phone : string | null

    @OneToMany(() => VenueProperty,(venue : VenueProperty) => venue.user)
    venues : VenueProperty[]

    @CreateDateColumn({ type: "datetime" })
    createdAt: string;

    @UpdateDateColumn({ type: "datetime" })
    updatedAt: string;
}
