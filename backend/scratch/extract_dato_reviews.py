import re
import json

sql_file = 'backend/backups/orbitrip_db_2026-04-07.sql'

def extract_dato_reviews():
    try:
        with open(sql_file, 'r', encoding='utf-8') as f:
            content = f.read()
            
            # The SQL dump uses COPY or INSERT. Let's look for 'drv-dato-aqua'
            # Typically it's a tab-separated line in COPY format
            # Let's search for the line containing the ID
            lines = content.split('\n')
            for line in lines:
                if 'drv-dato-aqua' in line:
                    parts = line.split('\t')
                    # I need to find which part is 'reviews'
                    # Based on the schema: id, name, email, password, phone, city, status, price_per_km, base_price, daily_salary, expense_per_100km, fuel_type, debt, photo_url, car_photo_url, car_model, vehicle_type, car_photos, languages, features, max_passengers, rating, reviews...
                    # Let's just print the line to see the structure
                    print(f"Found line for Dato: {line[:500]}...")
                    # Usually reviews is one of the last columns
                    for i, p in enumerate(parts):
                        if '[' in p and '{' in p and 'author' in p:
                            print(f"Column {i} looks like reviews: {p[:100]}...")
                            return p
    except Exception as e:
        print(f"Error: {e}")
    return None

reviews_json = extract_dato_reviews()
if reviews_json:
    with open('dato_reviews_extracted.json', 'w', encoding='utf-8') as f:
        f.write(reviews_json)
    print("Extracted reviews to dato_reviews_extracted.json")
else:
    print("Could not find reviews for Dato in SQL.")
