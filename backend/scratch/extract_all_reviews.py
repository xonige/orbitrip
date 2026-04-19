import sys
import os
import re
import json

SQL_FILE = r'C:\Users\xonig\Documents\app4\2026-04-05\backups\orbitrip_db_2026-04-07.sql'
OUTPUT_FILE = r'C:\Users\xonig\Documents\app4\2026-04-05\backend\scratch\all_drivers_reviews.json'

def extract_all_reviews():
    if not os.path.exists(SQL_FILE):
        print(f"Error: {SQL_FILE} not found.")
        return

    drivers_data = {}
    in_drivers_copy = False
    
    try:
        with open(SQL_FILE, 'r', encoding='utf-8') as f:
            for line in f:
                if 'COPY public.drivers' in line:
                    in_drivers_copy = True
                    continue
                
                if in_drivers_copy:
                    if line.strip() == '\\.': # End of COPY block
                        break
                    
                    parts = line.split('\t')
                    if len(parts) > 20:
                        driver_id = parts[0]
                        reviews_raw = parts[20] # Index 20 based on previous research
                        
                        # Some fields might be \N for NULL
                        if reviews_raw == '\\N':
                            continue
                            
                        try:
                            # Postgres JSON in COPY format usually handles escapes differently
                            # But for research, we just want to see if it looks like JSON
                            if reviews_raw.startswith('[') and reviews_raw.endswith(']'):
                                drivers_data[driver_id] = {
                                    'name': parts[1],
                                    'reviews': reviews_raw
                                }
                        except Exception as e:
                            print(f"Error parsing reviews for {driver_id}: {e}")

        with open(OUTPUT_FILE, 'w', encoding='utf-8') as out:
            json.dump(drivers_data, out, ensure_ascii=False, indent=2)
            
        print(f"Successfully extracted reviews for {len(drivers_data)} drivers to {OUTPUT_FILE}")

    except Exception as e:
        print(f"Fatal error during extraction: {e}")

if __name__ == "__main__":
    extract_all_reviews()
