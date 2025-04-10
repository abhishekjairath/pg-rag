import { openai } from '@ai-sdk/openai';
import { embedMany } from 'ai';
import { db } from '../../lib/db';
import { essays } from '../../lib/db/schema/essays';
import { embeddings as embeddingsTable } from './schema/embeddings';

// Initialize OpenAI embedding model
const embeddingModel = openai.embedding('text-embedding-ada-002');

// Split content into sentence chunks
const generateChunks = (input: string): string[] => {
    const chunkSize = 150; // Adjust as needed
    const chunks = [];
    for (let i = 0; i < input.length; i += chunkSize) {
      chunks.push(input.slice(i, i + chunkSize));
    }
    return chunks.filter(chunk => chunk.trim() !== '');
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

// Process a batch of essays in parallel
async function processEssayBatch(essayBatch: { id: string; content: string }[]) {
    const promises = essayBatch.map(async essay => {
      const { id: essayId, content } = essay;
  
      // Generate embeddings
      const embeddings = await generateEmbeddings(content);
      if (!embeddings.length) {
        console.log(`No embeddings generated for essay ID: ${essayId}`);
        return;
      }
  
      // Insert embeddings into the table
      await db.insert(embeddingsTable).values(
        embeddings.map(embedding => ({
          essayId,
          content: embedding.content,
          embedding: embedding.embedding, // No content column if schema updated
        }))
      );
  
      console.log(`Stored ${embeddings.length} embeddings for essay ID: ${essayId}`);
    });
  
    await Promise.all(promises);
  }
  
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
  
      // Clear existing embeddings
      await db.delete(embeddingsTable);
  
      // Process essays in batches (e.g., 10 at a time)
      const batchSize = 25; // Adjust based on API/db limits
      for (let i = 0; i < essayRecords.length; i += batchSize) {
        const batch = essayRecords.slice(i, i + batchSize);
        console.log(`Processing batch ${i / batchSize + 1} of ${Math.ceil(essayRecords.length / batchSize)}`);
        await processEssayBatch(batch);
      }
  
      console.log('All embeddings generated and stored successfully!');
    } catch (error) {
      console.error('Error in processing:', error);
    } finally {
      console.log('Script completed.');
      // If db needs closure: await db.destroy();
    }
  }

generateAndStoreEmbeddings();