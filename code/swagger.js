const swaggerAutogen = require('swagger-autogen')();

const doc = {
    info: {
        title: 'My API',
        description: 'Description',
    },
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

const outputFile = './swagger-output.json';
const endpointsFiles = ['./routes/index.js', './routes/users.js'];

/* NOTE: if you use the express Router, you must pass in the
   'endpointsFiles' only the root file where the route starts,
   such as index.js, app.js, routes.js, ... */

swaggerAutogen(outputFile, endpointsFiles, doc);