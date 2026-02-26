import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";

@Entity("matches")
@Index(["status"])
@Index(["gameType"])
export class Match {
  @PrimaryColumn("uuid")
  id!: string;

  @Column({ name: "game_type", type: "varchar" })
  gameType!: string;

  @Column({ name: "player_x_id", type: "uuid" })
  playerXId!: string;

  @Column({ name: "player_o_id", type: "uuid", nullable: true })
  playerOId!: string | null;

  @Column({ type: "varchar", default: "waiting" })
  status!: string;

  @Column({ name: "winner_id", type: "uuid", nullable: true })
  winnerId!: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @Column({ name: "finished_at", type: "timestamp", nullable: true })
  finishedAt!: Date | null;

  @ManyToOne("User")
  @JoinColumn({ name: "player_x_id" })
  playerX?: import("./User.js").User;

  @ManyToOne("User")
  @JoinColumn({ name: "player_o_id" })
  playerO?: import("./User.js").User | null;

  @OneToMany("Move", "match")
  moves?: import("./Move.js").Move[];
}
