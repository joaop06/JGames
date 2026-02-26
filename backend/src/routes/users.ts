import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../lib/db.js";
import { requireAuth } from "../lib/auth.js";

async function userRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", requireAuth);

  fastify.get("/api/users/me", async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.userId) return reply.status(401).send({ error: "Unauthorized" });
    const user = await prisma.user.findUnique({
      where: { id: request.userId },
      select: { id: true, email: true, username: true, createdAt: true, updatedAt: true },
    });
    if (!user) return reply.status(404).send({ error: "User not found" });
    return reply.send(user);
  });

  fastify.patch<{
    Body: { username?: string };
  }>("/api/users/me", async (request: FastifyRequest<{ Body: { username?: string } }>, reply: FastifyReply) => {
    if (!request.userId) return reply.status(401).send({ error: "Unauthorized" });
    const { username } = request.body ?? {};
    if (username !== undefined) {
      const trimmed = typeof username === "string" ? username.trim() : "";
      if (trimmed.length < 2 || trimmed.length > 32 || !/^[a-zA-Z0-9_]+$/.test(trimmed)) {
        return reply.status(400).send({ error: "Invalid username" });
      }
      const existing = await prisma.user.findUnique({ where: { username: trimmed } });
      if (existing && existing.id !== request.userId) {
        return reply.status(409).send({ error: "Username already in use" });
      }
      await prisma.user.update({
        where: { id: request.userId },
        data: { username: trimmed },
      });
    }
    const user = await prisma.user.findUnique({
      where: { id: request.userId },
      select: { id: true, email: true, username: true, createdAt: true, updatedAt: true },
    });
    return reply.send(user!);
  });
}

export default userRoutes;
