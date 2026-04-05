import os
import json
import time
from dotenv import load_dotenv
from pymongo import MongoClient
from google import genai
from google.genai import types

# Load env variables
load_dotenv('.env')

MONGO_URI = os.getenv("MONGO_URI") or os.getenv("MONGO_URL")
if not MONGO_URI:
    print("Error: No MONGO_URI found in .env")
    exit(1)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    print("Error: No GEMINI_API_KEY found in .env")
    exit(1)

# Connect to MongoDB
try:
    print(f"Connecting to MongoDB...")
    client = MongoClient(MONGO_URI)
    db = client.get_database("folklore") # from DB_NAME or default
    stories_collection = db["Folklore"]
    print("Connected successfully. Current story count:", stories_collection.count_documents({}))
except Exception as e:
    print(f"MongoDB connection error: {e}")
    exit(1)

# Setup Gemini Client
genai_client = genai.Client(api_key=GEMINI_API_KEY)

# Define target cultures
CULTURES = [
    # Indian Subcontinent (Very Detailed for India as requested)
    {"culture": "Indian", "region": "Kerala", "language": "Malayalam"},
    {"culture": "Indian", "region": "Punjab", "language": "Punjabi"},
    {"culture": "Indian", "region": "Tamil Nadu", "language": "Tamil"},
    {"culture": "Indian", "region": "Rajasthan", "language": "Hindi"},
    {"culture": "Indian", "region": "Bengal", "language": "Bengali"},
    {"culture": "Indian", "region": "Maharashtra", "language": "Marathi"},
    {"culture": "Indian", "region": "Gujarat", "language": "Gujarati"},
    {"culture": "Indian", "region": "Odisha", "language": "Odia"},
    # Asia
    {"culture": "Chinese", "region": "Han", "language": "Mandarin"},
    {"culture": "Japanese", "region": "Honshu", "language": "Japanese"},
    {"culture": "Korean", "region": "Joseon", "language": "Korean"},
    {"culture": "Persian", "region": "Iran", "language": "Farsi"},
    # Europe
    {"culture": "Norse", "region": "Scandinavia", "language": "Old Norse"},
    {"culture": "Celtic", "region": "Ireland", "language": "Gaelic"},
    {"culture": "Greek", "region": "Athens", "language": "Greek"},
    {"culture": "Slavic", "region": "Russia", "language": "Russian"},
    # Africa
    {"culture": "Yoruba", "region": "Nigeria", "language": "Yoruba"},
    {"culture": "Zulu", "region": "South Africa", "language": "isiZulu"},
    {"culture": "Egyptian", "region": "North Africa", "language": "Arabic"},
    {"culture": "Swahili", "region": "East Africa", "language": "Swahili"},
    # Americas
    {"culture": "Native American", "region": "Navajo", "language": "Navajo"},
    {"culture": "Mayan", "region": "Mesoamerica", "language": "Yucatec Maya"},
    {"culture": "Inca", "region": "Andes", "language": "Quechua"},
    {"culture": "Caribbean", "region": "Jamaica", "language": "Patois"},
    # Oceania
    {"culture": "Aboriginal", "region": "Australia", "language": "Pitjantjatjara"},
    {"culture": "Maori", "region": "New Zealand", "language": "Te Reo"},
]

def generate_stories_for_culture(culture_info):
    culture = culture_info["culture"]
    region = culture_info["region"]
    language = culture_info["language"]
    
    print(f"\nGenerating stories for {culture} ({region})...")
    
    prompt = f"""
    You are an expert folklorist and storyteller.
    Generate 2 authentic, culturally accurate folktales or myths from the {culture} culture, specific to the {region} region.
    The stories should be rich, engaging, and traditionally accurate. Do not make up fake modern stories; retell actual classical folklore or myths from this culture.
    
    Respond STRICTLY with a valid JSON array containing EXACTLY 2 story objects. Do not use Markdown backticks. 
    Each object must have the following keys:
    - "title" (string)
    - "category" (string like 'Folk Tale', 'Mythology', 'Fable')
    - "ageGroup" (string like 'All Ages', 'Children', 'Teens')
    - "difficulty" (string like 'Easy', 'Medium', 'Hard')
    - "description" (string, a short 2-sentence summary)
    - "storyText" (string, the full story text, at least 3-4 paragraphs)
    - "moral" (string, the lesson of the story)
    - "tags" (array of 4 string keywords)
    """
    
    try:
        response = genai_client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.7
            )
        )
        
        stories_data = json.loads(response.text)
        
        inserted_count = 0
        for s in stories_data:
            # Build the MongoDB document
            doc = {
                "title": s.get("title", f"Unknown {culture} Tale"),
                "culture": culture,
                "language": language,
                "region": region,
                "category": s.get("category", "Folk Tale"),
                "ageGroup": s.get("ageGroup", "All Ages"),
                "difficulty": s.get("difficulty", "Medium"),
                "description": s.get("description", "A traditional story."),
                "storyText": s.get("storyText", ""),
                "moral": s.get("moral", ""),
                "narrator": f"Traditional {culture} Storyteller",
                "tags": s.get("tags", []),
                "submitterName": "Folklore AI Historian",
                "submitterEmail": "ai.historian@folkloregpt.com",
                "permissions": True,
                "attribution": True,
                "respectfulUse": True,
                "status": "approved",
                "submissionType": "text",
                "audioFiles": [],
                "imageFiles": [],
                "culturalContext": f"A traditional story originating from {region}, passed down through the {culture} culture."
            }
            
            # Avoid dupes
            if not stories_collection.find_one({"title": doc["title"], "culture": culture}):
                stories_collection.insert_one(doc)
                inserted_count += 1
            else:
                print(f"  Skipped duplicate: {doc['title']}")
            
        print(f"✅ Successfully inserted {inserted_count} {culture} stories.")
        return inserted_count
        
    except Exception as e:
        print(f"❌ Failed to generate/insert {culture} stories: {e}")
        return 0

def main():
    print("==================================================")
    print("🌍 Starting Global Folklore Database Population")
    print("==================================================")
    print(f"Targeting {len(CULTURES)} distinct cultural regions.")
    
    total_inserted = 0
    start_time = time.time()
    
    for i, culture_info in enumerate(CULTURES):
        count = generate_stories_for_culture(culture_info)
        total_inserted += count
        
        # Small delay to avoid API rate limits (15 RPM for free tier gemini usually)
        if i < len(CULTURES) - 1:
            time.sleep(3)
            
    elapsed = round(time.time() - start_time, 1)
    print("==================================================")
    print(f"🎉 Database Population Complete! Inserted {total_inserted} new stories in {elapsed}s.")
    print("==================================================")

if __name__ == "__main__":
    main()
