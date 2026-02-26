import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../lib/db.js";
import { requireAuth } from "../lib/auth.js";
import { inviteFriendSchema } from "../lib/validation.js";

async function friendRoutes(fastify: FastifyInstance) {
  fastify.addHook("preHandler", requireAuth);

  fastify.get("/api/friends", async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.userId) return reply.status(401).send({ error: "Unauthorized" });
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [{ userAId: request.userId }, { userBId: request.userId }],
      },
      include: {
        userA: { select: { id: true, username: true, createdAt: true } },
        userB: { select: { id: true, username: true, createdAt: true } },
      },
    });
    const friends = friendships.map((f) =>
      f.userAId === request.userId ? f.userB : f.userA
    );
    return reply.send({ friends });
  });

  fastify.get("/api/friends/invites", async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.userId) return reply.status(401).send({ error: "Unauthorized" });
    const invites = await prisma.friendInvite.findMany({
      where: { toUserId: request.userId, status: "pending" },
      include: {
        fromUser: { select: { id: true, username: true } },
      },
    });
    return reply.send({
      invites: invites.map((i) => ({
        id: i.id,
        fromUser: i.fromUser,
        createdAt: i.createdAt,
      })),
    });
  });

  fastify.post<{ Body: unknown }>(
    "/api/friends/invite",
    async (request: FastifyRequest<{ Body: unknown }>, reply: FastifyReply) => {
      if (!request.userId) return reply.status(401).send({ error: "Unauthorized" });
      const parsed = inviteFriendSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({ error: "Validation failed", details: parsed.error.flatten() });
      }
      const { username, userId: targetUserId } = parsed.data;
      let toUserId: string;
      if (targetUserId) {
        toUserId = targetUserId;
      } else if (username) {
        const user = await prisma.user.findUnique({ where: { username: username as string } });
        if (!user) {
          return reply.status(404).send({ error: "User not found" });
        }
        toUserId = user.id;
      } else {
        return reply.status(400).send({ error: "Provide username or userId" });
      }
      if (toUserId === request.userId) {
        return reply.status(400).send({ error: "Cannot invite yourself" });
      }
      const existingFriendship = await prisma.friendship.findFirst({
        where: {
          OR: [
            { userAId: request.userId!, userBId: toUserId },
            { userAId: toUserId, userBId: request.userId! },
          ],
        },
      });
      if (existingFriendship) {
        return reply.status(409).send({ error: "Already friends" });
      }
      const existingInvite = await prisma.friendInvite.findUnique({
        where: {
          fromUserId_toUserId: { fromUserId: request.userId!, toUserId },
        },
      });
      if (existingInvite) {
        if (existingInvite.status === "pending") {
          return reply.status(409).send({ error: "Invite already sent" });
        }
      }
      const [userAId, userBId] = [request.userId!, toUserId].sort();
      const invite = await prisma.friendInvite.upsert({
        where: { fromUserId_toUserId: { fromUserId: request.userId!, toUserId } },
        create: { fromUserId: request.userId!, toUserId, status: "pending" },
        update: { status: "pending" },
        include: {
          toUser: { select: { id: true, username: true } },
        },
      });
      return reply.status(201).send({
        invite: {
          id: invite.id,
          toUser: invite.toUser,
          status: invite.status,
          createdAt: invite.createdAt,
        },
      });
    }
  );

  fastify.post<{ Params: { id: string } }>(
    "/api/friends/invites/:id/accept",
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      if (!request.userId) return reply.status(401).send({ error: "Unauthorized" });
      const invite = await prisma.friendInvite.findUnique({
        where: { id: request.params.id },
      });
      if (!invite || invite.toUserId !== request.userId) {
        return reply.status(404).send({ error: "Invite not found" });
      }
      if (invite.status !== "pending") {
        return reply.status(409).send({ error: "Invite already processed" });
      }
      const [userAId, userBId] = [invite.fromUserId, invite.toUserId].sort();
      await prisma.$transaction([
        prisma.friendInvite.update({
          where: { id: invite.id },
          data: { status: "accepted" },
        }),
        prisma.friendship.upsert({
          where: { userAId_userBId: { userAId, userBId } },
          create: { userAId, userBId },
          update: {},
        }),
      ]);
      const friend = await prisma.user.findUnique({
        where: { id: invite.fromUserId },
        select: { id: true, username: true },
      });
      return reply.send({ friend });
    }
  );

  fastify.post<{ Params: { id: string } }>(
    "/api/friends/invites/:id/reject",
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      if (!request.userId) return reply.status(401).send({ error: "Unauthorized" });
      const invite = await prisma.friendInvite.findUnique({
        where: { id: request.params.id },
      });
      if (!invite || invite.toUserId !== request.userId) {
        return reply.status(404).send({ error: "Invite not found" });
      }
      if (invite.status !== "pending") {
        return reply.status(409).send({ error: "Invite already processed" });
      }
      await prisma.friendInvite.update({
        where: { id: invite.id },
        data: { status: "rejected" },
      });
      return reply.send({ ok: true });
    }
  );
}

export default friendRoutes;
