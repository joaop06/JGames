import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getRepository } from '../lib/db.js';
import { User } from '../entities/User.js';
import { requireAuth } from '../lib/auth.js';
import { checkUsernameQuerySchema, updateProfileSchema } from '../lib/validation.js';

async function userRoutes(fastify: FastifyInstance) {
  fastify.get<{ Querystring: unknown }>(
    '/api/users/check-username',
    async (request: FastifyRequest<{ Querystring: unknown }>, reply: FastifyReply) => {
      const parsed = checkUsernameQuerySchema.safeParse(request.query);
      const normalized = parsed.success ? parsed.data.username : '';
      if (normalized.length < 2 || normalized.length > 32 || !/^[a-z0-9]+$/.test(normalized)) {
        return reply.send({ exists: false });
      }
      const user = await getRepository(User).findOne({ where: { username: normalized } });
      return reply.send({ exists: !!user });
    }
  );

  fastify.get(
    '/api/users/me',
    { preHandler: requireAuth },
    async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.userId) return reply.status(401).send({ error: 'Unauthorized' });
      const user = await getRepository(User).findOne({
        where: { id: request.userId! },
        select: { id: true, username: true, name: true, email: true, createdAt: true, updatedAt: true },
      });
      if (!user) return reply.status(404).send({ error: 'User not found' });
      return reply.send(user);
    }
  );

  fastify.patch<{
    Body: unknown;
  }>(
    '/api/users/me',
    { preHandler: requireAuth },
    async (request: FastifyRequest<{ Body: unknown }>, reply: FastifyReply) => {
      if (!request.userId) return reply.status(401).send({ error: 'Unauthorized' });
      const parsed = updateProfileSchema.safeParse(request.body ?? {});
      if (!parsed.success) {
        const flattened = parsed.error.flatten();
        const firstFieldError =
          Object.values(flattened.fieldErrors).flat().find(Boolean) ?? flattened.formErrors[0];
        const errorMessage =
          typeof firstFieldError === 'string' ? firstFieldError : 'Validation failed';
        return reply.status(400).send({ error: errorMessage, details: flattened });
      }
      const { username, name, email } = parsed.data;

      if (username !== undefined) {
        const existing = await getRepository(User).findOne({ where: { username } });
        if (existing && existing.id !== request.userId) {
          return reply.status(409).send({ error: 'Username already in use' });
        }
      }

      if (email) {
        const existingEmail = await getRepository(User).findOne({ where: { email } });
        if (existingEmail && existingEmail.id !== request.userId) {
          return reply.status(409).send({ error: 'Email already in use' });
        }
      }

      const updatePayload: Partial<User> = {};
      if (username !== undefined) updatePayload.username = username;
      if (name !== undefined) updatePayload.name = name;
      if (email !== undefined) updatePayload.email = email ?? null;

      if (Object.keys(updatePayload).length > 0) {
        await getRepository(User).update({ id: request.userId! }, updatePayload);
      }

      const user = await getRepository(User).findOne({
        where: { id: request.userId! },
        select: { id: true, username: true, name: true, email: true, createdAt: true, updatedAt: true },
      });
      return reply.send(user!);
    }
  );
}

export default userRoutes;
