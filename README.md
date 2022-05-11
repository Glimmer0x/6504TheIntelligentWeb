# 6504TheIntelligentWeb

### RUN
1. Enter code folder: `cd code`
2. Build environment and run (may need `sudo`):
   - option A- run in different steps
     1. `docker compose build`
     2. `docker compose up`
   - option B- build and run together
     1. require: `/code/db_data/mongo_data` is deleted 
     2. `docker compose up --build`
3. Open browser and enter pages
