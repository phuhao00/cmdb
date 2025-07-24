const express = require('express');
const path = require('path');
const http = require('http');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;
const BACKEND_HOST = process.env.BACKEND_HOST || 'localhost';
const BACKEND_PORT = process.env.BACKEND_PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, 'frontend')));

// API health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});

// Proxy API requests to the backend
app.use('/api/v1', (req, res) => {
    const options = {
        hostname: BACKEND_HOST,
        port: BACKEND_PORT,
        path: req.url,
        method: req.method,
        headers: {
            'Content-Type': 'application/json',
        }
    };

    const proxyReq = http.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
    });

    proxyReq.on('error', (error) => {
        console.error('Proxy request error:', error);
        res.status(500).json({ error: 'Backend service unavailable' });
    });

    if (req.body) {
        proxyReq.write(JSON.stringify(req.body));
    }
    
    proxyReq.end();
});

// Route for the main page and client-side routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`CMDB Website server running on port ${PORT}`);
    console.log(`Access the website at: http://localhost:${PORT}`);
});
