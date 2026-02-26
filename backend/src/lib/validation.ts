import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(2).max(32).regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const inviteFriendSchema = z.object({
  username: z.string().min(1).optional(),
  userId: z.string().cuid().optional(),
}).refine((data) => data.username ?? data.userId, { message: "Provide username or userId" });

export type RegisterBody = z.infer<typeof registerSchema>;
export type LoginBody = z.infer<typeof loginSchema>;
export type InviteFriendBody = z.infer<typeof inviteFriendSchema>;
