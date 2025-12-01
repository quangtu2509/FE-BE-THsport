const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'TH Sport API Documentation',
      version: '1.0.0',
      description: 'API documentation cho backend e-commerce TH Sport',
      contact: {
        name: 'API Support',
        email: 'support@thsport.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Development server - Port 5000'
      },
      {
        url: 'https://api.thsport.com/api',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.js', './src/models/*.js'] // Đường dẫn tới các file chứa annotations
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
