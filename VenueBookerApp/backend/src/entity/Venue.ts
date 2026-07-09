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
import { User } from "./User";
import { Application } from "./Application";
import { BookedTime } from "./BookedTime";
import { UserPreference } from "./UserPreference";
import type { SuitabilityType } from "@shared/types";

@Entity({ name: "venue" })
export class Venue {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: "varchar",
    length: 40,
    nullable: false,
  })
  name: string;

  @Column({
    type: "varchar",
    length: 40,
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
    type: "int",
    nullable: false,
  })
  num_ratings: number;

  @Column({
    type: "simple-json",
    default: "[]",
  })
  suitabilities: SuitabilityType[];

  @Column({
    type: "decimal",
    nullable: false,
    default: 0,
  })
  discounted_percentage: number;

  @CreateDateColumn({ type: "datetime" })
  createdAt: string;

  @UpdateDateColumn({ type: "datetime" })
  updatedAt: string;

  @ManyToOne(() => User, (user) => user.venues, { nullable: false })
  @JoinColumn({ name: "userId" })
  user: User;

  @RelationId((venue: Venue) => venue.user)
  userId: number;

  @OneToMany(() => Application, (application) => application.venue, {
    cascade: true,
  })
  applications: Application[];

  @OneToMany(() => BookedTime, (bookedtime) => bookedtime.venue, {
    cascade: true,
  })
  bookedTimes: BookedTime[];

  @OneToMany(() => UserPreference, (preference) => preference.venue, {
    cascade: true,
  })
  preferences: UserPreference[];
}
