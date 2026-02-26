import {
  Entity,
  PrimaryColumn,
  Column,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";

@Entity("user_game_stats")
export class UserGameStats {
  @PrimaryColumn({ name: "user_id", type: "uuid" })
  userId!: string;

  @PrimaryColumn({ name: "game_type", type: "varchar" })
  gameType!: string;

  @Column({ type: "int", default: 0 })
  wins!: number;

  @Column({ type: "int", default: 0 })
  losses!: number;

  @Column({ type: "int", default: 0 })
  draws!: number;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  @ManyToOne("User")
  @JoinColumn({ name: "user_id" })
  user?: import("./User.js").User;
}
