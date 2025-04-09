import requests
from bs4 import BeautifulSoup
import psycopg2
from nanoid import generate
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Database connection details
DATABASE_URL = os.getenv("DATABASE_URL")

def get_essay_links():
    url = "https://paulgraham.com/articles.html"
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Find all table rows with 'valign' set to 'top'
    table_rows = soup.find_all('tr', {'valign': 'top'})
    essay_links = []
    
    # Iterate through the table rows to extract links
    for i in range(2, len(table_rows) - 3):  # Adjust range based on notebook logic
        try:
            link = table_rows[i].find('a')['href']
            if link.endswith('.html'):
                essay_links.append("https://paulgraham.com/" + link)
        except Exception as e:
            print(f"Error extracting link: {e}")
            continue
    
    return essay_links

def extract_essay_content(url):
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Use table row parsing to extract content
    table_rows = soup.find_all('tr', {'valign': 'top'})
    try:
        content = table_rows[1].find('font', {'face': 'verdana', 'size': '2'}).text.replace('\n', '').strip()
    except Exception as e:
        content = ""
        print(f"Error extracting content from {url}: {e}")

    # Extract the title
    try:
        img_tag = table_rows[1].find('img')
        title = img_tag['alt'] if img_tag and 'alt' in img_tag.attrs else "Unknown Title"
    except Exception as e:
        title = "Unknown Title"
        print(f"Error extracting title from {url}: {e}")

    return title, content

def save_to_database(title, content, link):
    # Generate a unique ID using nanoid
    essay_id = generate(size=21)
    
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()
    cursor.execute("INSERT INTO essays (id, title, content, link) VALUES (%s, %s, %s, %s)", (essay_id, title, content, link))
    conn.commit()
    cursor.close()
    conn.close()

def main():
    essay_links = get_essay_links()
    print(len(essay_links));

    for link in essay_links:
        title, content = extract_essay_content(link)
        save_to_database(title, content, link)

if __name__ == "__main__":
    main() 