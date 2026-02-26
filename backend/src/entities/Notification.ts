import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from "typeorm";

@Entity("notifications")
@Index(["userId"])
export class Notification {
  @PrimaryColumn("uuid")
  id!: string;

  @Column({ name: "user_id", type: "uuid" })
  userId!: string;

  @Column({ type: "varchar" })
  type!: string;

  @Column({ name: "friend_invite_id", type: "uuid", nullable: true })
  friendInviteId!: string | null;

  @Column({ name: "match_id", type: "uuid", nullable: true })
  matchId!: string | null;

  @Column({ type: "boolean", default: false })
  read!: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @ManyToOne("FriendInvite", { nullable: true })
  @JoinColumn({ name: "friend_invite_id" })
  friendInvite?: import("./FriendInvite.js").FriendInvite | null;

  @ManyToOne("Match", { nullable: true })
  @JoinColumn({ name: "match_id" })
  match?: import("./Match.js").Match | null;
}
