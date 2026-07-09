import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn, RelationId, UpdateDateColumn } from "typeorm";
import { Venue } from "./Venue";
import { User } from "./User";

@Entity({name : "user_preference"})
export class UserPreference {
    @PrimaryGeneratedColumn()
    id : number

    @Column({
        type : "int",
        nullable : false
    })
    pref_no : number

    @ManyToOne(() => User,(user) => user.preferences)
    @JoinColumn({ name : "userId"})
    user : User

    @RelationId((user_pref : UserPreference) => user_pref.user)
    userId : number

    @ManyToOne(() => Venue, (venue) => venue.preferences, {
        onDelete: "CASCADE",
    })
    @JoinColumn({ name : "venueId"})
    venue : Venue

    @RelationId((user_pref : UserPreference) => user_pref.venue)
    venueId : number

    @CreateDateColumn({ type: "datetime" })
    createdAt: string;

    @UpdateDateColumn({ type: "datetime" })
    updatedAt: string;

}
