import { z } from "zod";

const emailNormalized = z.string().trim().toLowerCase().email();
const usernameNormalized = z
  .string()
  .trim()
  .toLowerCase()
  .min(2)
  .max(32)
  .regex(/^[a-z0-9_]+$/, "Username must be lowercase letters, numbers and underscore only");
const passwordTrimmed = z.string().trim().min(8).max(128);

export const registerSchema = z.object({
  email: emailNormalized,
  username: usernameNormalized,
  password: passwordTrimmed,
});

export const loginSchema = z.object({
  login: z.string().trim().min(1),
  password: z.string().min(1),
});

export const inviteFriendSchema = z.object({
  username: z.string().min(1).optional(),
  userId: z.string().uuid().optional(),
}).refine((data) => data.username ?? data.userId, { message: "Provide username or userId" });

export const createTicTacToeMatchSchema = z.object({
  opponentUserId: z.string().uuid().optional(),
});

export const listMatchesQuerySchema = z.object({
  status: z.enum(["waiting", "in_progress", "finished", "abandoned"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const leaderboardQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
});

export type RegisterBody = z.infer<typeof registerSchema>;
export type LoginBody = z.infer<typeof loginSchema>;
export type InviteFriendBody = z.infer<typeof inviteFriendSchema>;
export type CreateTicTacToeMatchBody = z.infer<typeof createTicTacToeMatchSchema>;
export type ListMatchesQuery = z.infer<typeof listMatchesQuerySchema>;
export type LeaderboardQuery = z.infer<typeof leaderboardQuerySchema>;
