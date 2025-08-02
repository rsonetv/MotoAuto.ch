import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
import sys

# Load environment variables from .env.local
if not os.path.exists('.env.local'):
    print("Error: .env.local file not found.", file=sys.stderr)
    sys.exit(1)

load_dotenv(dotenv_path='.env.local')

# Get the database URL from environment variables
db_url = os.getenv("DATABASE_URL")

if not db_url:
    print("Error: DATABASE_URL not found in .env.local file.", file=sys.stderr)
    sys.exit(1)

print(f"Attempting to connect with URL: {db_url.replace(os.getenv('POSTGRES_PASSWORD', 'SECRET'), '********')}")

try:
    # Create a new SQLAlchemy engine
    engine = create_engine(db_url)

    # Connect to the database and execute a simple query
    with engine.connect() as connection:
        print("Successfully connected to the database.")
        result = connection.execute(text("SELECT 1"))
        for row in result:
            print("Test query result:", row[0])
    print("Connection test successful!")

except Exception as e:
    print(f"An error occurred while connecting to the database: {e}", file=sys.stderr)
    sys.exit(1)