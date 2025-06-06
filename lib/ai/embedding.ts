import { embed, embedMany } from 'ai';
import { openai } from '@ai-sdk/openai';
import { db } from '../db';
import { cosineDistance, desc, eq, gt, sql } from 'drizzle-orm';
import { embeddings } from '../db/schema/embeddings';
import { essays } from '../db/schema/essays';

const embeddingModel = openai.embedding('text-embedding-ada-002');

export const generateEmbedding = async (value: string): Promise<number[]> => {
  const input = value.replaceAll('\\n', ' ');
  const { embedding } = await embed({
    model: embeddingModel,
    value: input,
  });
  return embedding;
};

export const findRelevantContent = async (userQuery: string) => {
  const userQueryEmbedded = await generateEmbedding(userQuery);
  const similarity = sql<number>`1 - (${cosineDistance(
    embeddings.embedding,
    userQueryEmbedded,
  )})`;
  const similarGuides = await db
    .select({
      name: embeddings.content,
      similarity,
      title: essays.title,
      link: essays.link,
    })
    .from(embeddings)
    .where(gt(similarity, 0.8))
    .orderBy(t => desc(t.similarity))
    .innerJoin(essays, eq(embeddings.essayId, essays.id))
    .limit(5);
  return similarGuides;
};