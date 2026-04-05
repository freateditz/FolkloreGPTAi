import os
import json
from dotenv import load_dotenv
from pymongo import MongoClient

# Load env variables
load_dotenv('.env')

MONGO_URI = os.getenv("MONGO_URI") or os.getenv("MONGO_URL")
if not MONGO_URI:
    print("Error: No MONGO_URI found in .env")
    exit(1)

# Connect to MongoDB
try:
    print("Connecting to MongoDB...")
    client = MongoClient(MONGO_URI)
    db = client.get_database("folklore")
    stories_collection = db["Folklore"]
    print("Connected successfully. Current story count:", stories_collection.count_documents({}))
except Exception as e:
    print(f"MongoDB connection error: {e}")
    exit(1)

def seed_database():
    print("\nReading fallback_stories.json...")
    try:
        with open("fallback_stories.json", "r", encoding="utf-8") as f:
            stories = json.load(f)
    except Exception as e:
        print(f"Error reading JSON file: {e}")
        return

    inserted_count = 0
    for s in stories:
        doc = {
            "title": s["title"],
            "culture": s["culture"],
            "language": s["language"],
            "region": s["region"],
            "category": s["category"],
            "ageGroup": s["ageGroup"],
            "difficulty": s["difficulty"],
            "description": s["description"],
            "storyText": s["storyText"],
            "moral": s["moral"],
            "narrator": f"Traditional {s['culture']} Storyteller",
            "tags": s["tags"],
            "submitterName": "Folklore AI Historian",
            "submitterEmail": "ai.historian@folkloregpt.com",
            "permissions": True,
            "attribution": True,
            "respectfulUse": True,
            "status": "approved",
            "submissionType": "text",
            "audioFiles": [],
            "imageFiles": [],
            "culturalContext": f"A traditional story originating from {s['region']}, passed down through the {s['culture']} culture."
        }

        # Check for duplicates before inserting
        if not stories_collection.find_one({"title": doc["title"]}):
            stories_collection.insert_one(doc)
            inserted_count += 1
            print(f"✅ Inserted: {doc['title']}")
        else:
            print(f"⏩ Skipped duplicate: {doc['title']}")

    print("==================================================")
    print(f"🎉 Fallback Population Complete! Inserted {inserted_count} new high-quality global stories.")
    print("Refresh your website to see the new stories!")
    print("==================================================")

if __name__ == "__main__":
    seed_database()
