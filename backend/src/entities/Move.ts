import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  Unique,
  ManyToOne,
  JoinColumn,
} from "typeorm";

@Entity("moves")
@Unique(["matchId", "position"])
export class Move {
  @PrimaryColumn("uuid")
  id!: string;

  @Column({ name: "match_id", type: "uuid" })
  matchId!: string;

  @Column({ name: "player_id", type: "uuid" })
  playerId!: string;

  @Column({ type: "int" })
  position!: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @ManyToOne("Match")
  @JoinColumn({ name: "match_id" })
  match?: import("./Match.js").Match;
}
