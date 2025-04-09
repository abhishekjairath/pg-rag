# Paul Graham Essay Scraper

This script scrapes essays from Paul Graham's website and saves them to a database.

## Prerequisites

- Python 3.x
- Required Python packages: `requests`, `beautifulsoup4`, `psycopg2`, `nanoid`
- A PostgreSQL database to store the scraped data

## Setup

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd <repository-directory>/scrapper
   ```

2. **Install Required Packages**
   ```bash
   pip install requests beautifulsoup4 psycopg2 nanoid python-dotenv
   ```

3. **Configure Database**
   - Create a `.env` file in the `scrapper` directory with the following content:
     ```
     DATABASE_URL=your_database_url_here
     ```
   - Replace `your_database_url_here` with your actual PostgreSQL database connection URL.

## Running the Scraper

1. **Execute the Script**
   ```bash
   python scraper.py
   ```

   This will scrape the essays from Paul Graham's website and save them to the configured database.

## Notes

- Ensure your database is running and accessible before executing the script.
- The script currently saves all essays listed on the articles page. 