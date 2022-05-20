const swaggerAutogen = require('swagger-autogen')();

const doc = {
    info: {
        "version": "1.0.0",
        "title": "StoryClub",
        "description": "User management API",
        "contact": {
            "name": "COM6504",
            "email": "lliu74@shef.ac.uk",
            "url": "https://github.com/Kity2023"
        },
        "license": {
            "name": "Apache 2.0",
            "url": "https://www.apache.org/licenses/LICENSE-2.0.html"
        }
    },
    servers: [
        {
            "url": "http://localhost:3000/",
            "description": "the only Local server of StoryClub"
        }
    ],
    host: 'localhost:3000',
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
    components: {
        schemas: {
            Story: {
                "type": "object",
                "properties": {
                    "first_name": {
                        "example": "any"
                    },
                    "family_name": {
                        "example": "any"
                    },
                    "story_title": {
                        "example": "any"
                    },
                    "story_image": {
                        "example": "any"
                    },
                    "story_description": {
                        "example": "any"
                    },
                    "date": {
                        "example": "any"
                    }
                }
            },
            "User": {
                "type": "object",
                "properties": {
                    "username": {
                        "example": "any"
                    },
                    "password": {
                        "example": "any"
                    }
                }
            }
        }
    }
};

const outputFile = './swagger/swaggerDocumentation.json';
const endpointsFiles = ['./routes/index.js', './routes/users.js', './routes/chat.js'];

/* NOTE: if you use the express Router, you must pass in the
   'endpointsFiles' only the root file where the route starts,
   such as index.js, app.js, routes.js, ... */

swaggerAutogen(outputFile, endpointsFiles, doc);