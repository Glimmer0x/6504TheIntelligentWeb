# 6504TheIntelligentWeb
## Github Repo: https://github.com/Kity2023/6504TheIntelligentWeb
### RUN locally (without docker)
1. install MongoDB
2. enter code folder and run `npm install`
3. run server and client using `npm start`
4. open URL in browser: http://localhost:3000/
5. signup a user and then login

### RUN in docker 
(One of us meet a problem in mongo DB, so we use docker at early development, but later we only run docker of mongo DB and run code locally.)
1. Enter code folder: `cd code`
2. Change the Mongo DB host in `/code/databases/connection.js`:
    - change `localhost` in line of `const MongoDB = 'mongodb://localhost:27017/stories,users';` to `DB`
3. Build environment and run (may need `sudo`):
   - option A- run in different steps
     1. `docker compose build`
     2. `docker compose up`
   - option B- build and run together
     1. require: `/code/db_data/mongo_data` is deleted 
     2. `docker compose up --build`
4. Open the browser and enter pages as said before

### Swagger
Swagger service: run the server and then open URL http://localhost:3000/api-docs

### Warning
1. Unsolved bug: There is one bug about Knowledge graph history in the local client. When a user enters the chat room, he will see all knowledge graphs stored in the indexedDB listed.
2. Notice: please use different room names for different stories, otherwise the past annotation of the last story in the room will be loaded from cache data.

