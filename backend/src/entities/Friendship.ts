import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  Unique,
  ManyToOne,
  JoinColumn,
} from "typeorm";

@Entity("friendships")
@Unique(["userAId", "userBId"])
export class Friendship {
  @PrimaryColumn("uuid")
  id!: string;

  @Column({ name: "user_a_id", type: "uuid" })
  userAId!: string;

  @Column({ name: "user_b_id", type: "uuid" })
  userBId!: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @ManyToOne("User")
  @JoinColumn({ name: "user_a_id" })
  userA?: import("./User.js").User;

  @ManyToOne("User")
  @JoinColumn({ name: "user_b_id" })
  userB?: import("./User.js").User;
}
