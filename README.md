# 6504TheIntelligentWeb
## Github Reop: https://github.com/Kity2023/6504TheIntelligentWeb
### RUN locally (without docker)
1. install MongoDB
2. enter code folder and run `npm install`
3. run server and client using `npm start`
4. open URL in browser: http://localhost:3000/
5. signup a user and then login

### RUN in docker 
(One of us meet problem in mongo db, so we use docker at early development, but later we only run docker of mongo db and run code locally.)
1. Enter code folder: `cd code`
2. Change the Mongo DB host in `/code/databases/connection.js`:
    - change `localhost` in line of `const mongoDB = 'mongodb://localhost:27017/stories,users';` to `db`
3. Build environment and run (may need `sudo`):
   - option A- run in different steps
     1. `docker compose build`
     2. `docker compose up`
   - option B- build and run together
     1. require: `/code/db_data/mongo_data` is deleted 
     2. `docker compose up --build`
4. Open browser and enter pages as said before

### Swagger
Swagger service: run the server and then open URL http://localhost:3000/api-docs

### Warning
1. Unsolved bug: There is one bug about Knowledge graph history in local client. When a user enter the chat room. He will see all knowledge graph that stored in the indexedDB listed.
2. Notice: please use different room name for different stories, unless the past annotation of last story in the room will be loaded from cache data.

