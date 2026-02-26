import {
  Entity,
  PrimaryColumn,
  Column,
  UpdateDateColumn,
} from "typeorm";

@Entity("friend_game_records")
export class FriendGameRecord {
  @PrimaryColumn({ name: "user_a_id", type: "uuid" })
  userAId!: string;

  @PrimaryColumn({ name: "user_b_id", type: "uuid" })
  userBId!: string;

  @PrimaryColumn({ name: "game_type", type: "varchar" })
  gameType!: string;

  @Column({ name: "wins_a", type: "int", default: 0 })
  winsA!: number;

  @Column({ name: "wins_b", type: "int", default: 0 })
  winsB!: number;

  @Column({ type: "int", default: 0 })
  draws!: number;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
