import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getRepository } from '../lib/db.js';
import { Notification } from '../entities/Notification.js';
import { requireAuth } from '../lib/auth.js';

async function notificationRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', requireAuth);

  fastify.get('/api/notifications', async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.userId) return reply.status(401).send({ error: 'Unauthorized' });
    const notifications = await getRepository(Notification).find({
      where: { userId: request.userId! },
      order: { createdAt: 'DESC' },
      relations: {
        friendInvite: { fromUser: true },
        match: { playerX: true },
      },
    });
    return reply.send({
      notifications: notifications.map((n) => ({
        id: n.id,
        type: n.type,
        read: n.read,
        createdAt: n.createdAt,
        friendInvite: n.friendInvite
          ? {
              id: n.friendInvite.id,
              status: n.friendInvite.status,
              fromUser: n.friendInvite.fromUser
                ? { id: n.friendInvite.fromUser.id, username: n.friendInvite.fromUser.username }
                : undefined,
            }
          : null,
        gameInvite:
          n.type === 'game_invite' && n.match
            ? {
                matchId: n.matchId,
                fromUser: n.match.playerX
                  ? { id: n.match.playerX.id, username: n.match.playerX.username }
                  : undefined,
                gameType: 'tic_tac_toe',
              }
            : null,
      })),
    });
  });

  fastify.patch<{ Params: { id: string } }>(
    '/api/notifications/:id/read',
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      if (!request.userId) return reply.status(401).send({ error: 'Unauthorized' });
      const notification = await getRepository(Notification).findOne({
        where: { id: request.params.id },
      });
      if (!notification || notification.userId !== request.userId) {
        return reply.status(404).send({ error: 'Notification not found' });
      }
      await getRepository(Notification).update({ id: request.params.id }, { read: true });
      return reply.send({ ok: true });
    }
  );
}

export default notificationRoutes;
