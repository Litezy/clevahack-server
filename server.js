const express = require('express');
const app = express();
require('dotenv').config();
const glob = require('glob');
const path = require('path');
const fileUpload = require('express-fileupload');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const cloudinary = require('cloudinary').v2;
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const port = process.env.PORT || 5004;
const server = http.createServer(app);
const io = new Server(server);

// CORS configuration
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174','http://localhost:5004'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    credentials: true
}));

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Middleware
app.use(express.json());
app.use(fileUpload());
const isProd = process.env.NODE_ENV === 'production';
if (!isProd) {
    app.use(express.static('public'));
}

// Look in routes folder and subfolders
const routeFiles = glob.sync('**/*.js', {
    cwd: path.join(__dirname, 'routes'),
    absolute: true
});

// Swagger configuration with Bearer Auth
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: `ClevaHack API's`,
            version: '1.0.0',
            description: 'API documentation for the ClevaHack backend',
        },
        servers: [
            { url: `http://localhost:${port}` },
            { url: 'https://educonnect.pinerockcreditunion.com' } // Replace with prod URL
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT', // Indicates it’s a JWT token
                }
            }
        },
    },
    apis: routeFiles, // Path to your route files
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Serve Swagger UI with custom options
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
    swaggerOptions: {
        persistAuthorization: true
    }
}));

// Routes
app.use('/api/v1', require('./routes/userRoutes'));
app.use('/api/v1/chat', require('./routes/chatRoutes'));

// Socket.IO connection
io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

// Start server
server.listen(port, () => console.log(`Server running on http://localhost:${port}`));