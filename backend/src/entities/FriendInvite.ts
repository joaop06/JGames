import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  Unique,
  ManyToOne,
  JoinColumn,
} from "typeorm";

@Entity("friend_invites")
@Unique(["fromUserId", "toUserId"])
export class FriendInvite {
  @PrimaryColumn("uuid")
  id!: string;

  @Column({ name: "from_user_id", type: "uuid" })
  fromUserId!: string;

  @Column({ name: "to_user_id", type: "uuid" })
  toUserId!: string;

  @Column({ type: "varchar", default: "pending" })
  status!: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @ManyToOne("User")
  @JoinColumn({ name: "from_user_id" })
  fromUser?: import("./User.js").User;

  @ManyToOne("User")
  @JoinColumn({ name: "to_user_id" })
  toUser?: import("./User.js").User;
}
