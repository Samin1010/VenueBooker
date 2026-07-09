import type { SuitabilityType } from "@admin-shared/types";
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from "typeorm";
import { UserAccount } from "./UserAccount";
import { VenueApplication } from "./VenueApplication";
import { BookedTime } from "./BookedTime";

@Entity({ name: "venue" })
export class VenueProperty {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: "varchar",
    length: 50,
    nullable: false,
  })
  name: string;

  @Column({
    type: "varchar",
    length: 50,
    nullable: false,
  })
  location: string;

  @Column({
    type: "smallint",
    nullable: false,
  })
  capacity: number;

  @Column({
    type: "decimal",
    precision: 18,
    scale: 2,
    nullable: false,
  })
  price: number;

  @Column({
    type: "decimal",
    precision: 18,
    scale: 2,
    nullable: true,
  })
  original_price: number | null;

  @Column({
    type: "varchar",
    nullable: true,
  })
  image: string;

  @Column({
    type: "varchar",
    length: 100,
    nullable: false,
  })
  description: string;

  @Column({
    type: "bit",
    nullable: false,
    default: false,
  })
  is_featured: boolean;

  @Column({
    type: "decimal",
    nullable: true,
  })
  rating: number | null;

  @Column({
    type: "decimal",
    nullable: false,
    default: 0,
  })
  discounted_percentage: number;

  @Column({
    type: "int",
    nullable: false,
  })
  num_ratings: number;

  @Column({
    type: "simple-json",
    default: "[]",
  })
  suitabilities: SuitabilityType[];

  @ManyToOne(() => UserAccount, (user: UserAccount) => user.venues, {
    eager: true,
    nullable: false,
  })
  @JoinColumn({ name: "userId" })
  user: UserAccount;

  @RelationId((venue: VenueProperty) => venue.user)
  userId: number;

  @OneToMany(
    () => VenueApplication,
    (application: VenueApplication) => application.venue,
    { eager: true, cascade: true },
  )
  applications: VenueApplication[];

  @OneToMany(() => BookedTime, (bookedTime: BookedTime) => bookedTime.venue, {
    cascade: true,
  })
  bookedTimes: BookedTime[];

  @CreateDateColumn({ type: "datetime" })
  createdAt: string;

  @UpdateDateColumn({ type: "datetime" })
  updatedAt: string;
}
