import { openai } from '@ai-sdk/openai';
import { embedMany } from 'ai';
import { db } from '../../lib/db';
import { essays } from '../../lib/db/schema/essays';
import { embeddings as embeddingsTable } from './schema/embeddings';

// Initialize OpenAI embedding model
const embeddingModel = openai.embedding('text-embedding-ada-002');

// Split content into sentence chunks
const generateChunks = (input: string): string[] => {
  return input
    .trim()
    .split('.')
    .filter(i => i.trim() !== '')
    .map(chunk => chunk.trim() + '.'); // Re-add period for clarity
};

// Generate embeddings for chunks of a single essay
const generateEmbeddings = async (
  value: string
): Promise<Array<{ embedding: number[]; content: string }>> => {
  const chunks = generateChunks(value);
  if (!chunks.length) return [];

  try {
    const { embeddings } = await embedMany({
      model: embeddingModel,
      values: chunks,
    });
    return embeddings.map((e, i) => ({ content: chunks[i], embedding: e }));
  } catch (error) {
    console.error('Embedding generation failed:', error);
    return [];
  }
};

// Main function to process all essays
export async function generateAndStoreEmbeddings() {
  try {
    // Fetch all essays
    const essayRecords = await db
      .select({
        id: essays.id,
        content: essays.content,
      })
      .from(essays);

    if (!essayRecords.length) {
      console.log('No essays found to process.');
      return;
    }

    console.log(`Found ${essayRecords.length} essays to process.`);

    // Optional: Clear existing embeddings (uncomment if needed)
    // await db.delete(embeddingsTable);

    // Process essays sequentially
    for (const essay of essayRecords) {
      const { id: essayId, content } = essay;

      // Generate embeddings for this essay
      const embeddings = await generateEmbeddings(content);
      if (!embeddings.length) {
        console.log(`No embeddings generated for essay ID: ${essayId}`);
        continue;
      }

      // Insert embeddings into the table
      await db.insert(embeddingsTable).values(
        embeddings.map(embedding => ({
          essayId,
          content: embedding.content,
          embedding: embedding.embedding,
        }))
      );

      console.log(`Stored ${embeddings.length} embeddings for essay ID: ${essayId}`);
    }

    console.log('All embeddings generated and stored successfully!');
  } catch (error) {
    console.error('Error in processing:', error);
  } finally {
    console.log('Script completed.');
    // If db is a Pool or Client needing closure, add it here:
    // await db.destroy(); // Uncomment and adjust based on your db setup
  }
}

generateAndStoreEmbeddings();