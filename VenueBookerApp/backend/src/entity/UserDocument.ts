import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import type {FileType,FileExtensionType} from "@shared/types/userDocument"
import { User } from "./User";

export type { FileType, FileExtensionType } from "@shared/types/userDocument";

@Entity({name : "user_document"})
export class UserDocument{
    
    @PrimaryGeneratedColumn({
        type : "int"
    })
    id : number

    @ManyToOne(() => User,(user) => user.documents)
    @JoinColumn({ name : "userId"})
    user : User

    @Column({
        type : "int"
    })
    userId : number

    @Column({
        type: "varchar",
        length: "MAX",
        nullable: false
    })
    data : string

    @Column({
        type : "varchar",
        nullable : true,
        length : 20
    })
    file_type : FileType

    @Column({
        type : "varchar",
        nullable : true,
        length : 10
    })
    file_extension_type : FileExtensionType

    @Column({
        type : "varchar",
        nullable : true,
        length : 100
    })
    file_name : string

    @CreateDateColumn({ type: "datetime" })
    createdAt: string;

    @UpdateDateColumn({ type: "datetime" })
    updatedAt: string;
}
