import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from "typeorm";
import { UserAccount } from "./UserAccount";
import { VenueProperty } from "./VenueProperty";
import type { ApplicationStatus } from "@admin-shared/types";

@Entity({ name : "application"})
export class VenueApplication {
  @PrimaryGeneratedColumn({
    type: "int",
  })
  id: number;

  @Column({
    type: "varchar",
    length: 40,
    nullable: false,
  })
  eventName: string;

  @Column({
    type: "smallint",
    nullable: false,
  })
  expectedGuests: number;

  @Column({
    type: "date",
    nullable: false,
  })
  date: string;

  @Column({
    type: "time",
    nullable: false,
  })
  time: string;

  @Column({
    type: "smallint",
    nullable: false,
  })
  duration: number;

  @Column({
    type: "varchar",
    length: 50,
    nullable: false,
    default: "",
  })
  vendorReason: string;

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

  @ManyToOne(() => UserAccount, (user) => user.applications)
  user: UserAccount;

  @RelationId((application: VenueApplication) => application.user)
  userId: number;

  @ManyToOne(() => VenueProperty, (venue) => venue.applications, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "venueId" })
  venue: VenueProperty;

  @RelationId((application: VenueApplication) => application.venue)
  venueId: number;

}
