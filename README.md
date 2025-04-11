# Paul Graham Essay Chatbot

This project is a chatbot that answers questions based on Paul Graham's essays. It utilizes Retrieval-Augmented Generation (RAG) to provide contextually relevant answers sourced directly from the essays.

## Features

- **Conversational Interface:** Chat with a bot knowledgeable about Paul Graham's writings.
- **Retrieval-Augmented Generation (RAG):** Uses OpenAI embeddings and a pgvector Postgres database to find relevant essay snippets before generating an answer.
- **Source Display:** Shows the specific essays used to generate the response, linking directly to the source.
- **Vercel AI SDK:** Leverages the Vercel AI SDK for seamless AI integration and UI components (like streaming responses and source data).

## Tech Stack

- [Next.js](https://nextjs.org) 14 (App Router)
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- [OpenAI](https://openai.com) (GPT-4o-mini for generation, text-embedding-ada-002 for embeddings)
- [Drizzle ORM](https://orm.drizzle.team)
- [Postgres](https://www.postgresql.org/) with [pgvector](https://github.com/pgvector/pgvector)
- [shadcn-ui](https://ui.shadcn.com) and [TailwindCSS](https://tailwindcss.com) for styling

## Setup and Running

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```
2.  **Install dependencies:**
    ```bash
        pnpm install
    ```
3.  **Set up environment variables:**
    Create a `.env.local` file in the root directory and add your database connection string and OpenAI API key:
    ```env
    DATABASE_URL="postgresql://user:password@host:port/database"
    OPENAI_API_KEY="your-openai-api-key"
    ```
4.  **Set up the database:**
    Ensure you have a Postgres database with the pgvector extension enabled. Run the database migrations:
    ```bash
    npm run db:migrate
    ```
5.  **Scrape and embed essays:**
    *   Make sure Python and necessary libraries (`requests`, `beautifulsoup4`, `psycopg2-binary`, `python-dotenv`, `nanoid`) are installed.
    *   Run the scraper script (ensure the `DATABASE_URL` in `.env.local` is correct):
        ```bash
        python scrapper/main.py
        ```
    *   Generate embeddings for the scraped content:
        ```bash
        bun run lib/db/generate_embeddings.ts 
        ``` 
        *(Note: This script might need adjustments depending on its final implementation, e.g., running via `npm run db:generate-embeddings` if added to package.json)*

6.  **Run the development server:**
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) in your browser to interact with the chatbot.
