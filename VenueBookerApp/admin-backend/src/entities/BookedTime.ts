import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from "typeorm";
import { VenueProperty } from "./VenueProperty";

@Entity({ name: "booked_time" })
export class BookedTime {
  @PrimaryGeneratedColumn({
    type: "int",
  })
  id: number;

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

  @ManyToOne(() => VenueProperty, (venue) => venue.bookedTimes, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "venueId" })
  venue: VenueProperty;

  @RelationId((bookedTime: BookedTime) => bookedTime.venue)
  venueId: number;
}
