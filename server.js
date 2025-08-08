const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const TARGET_URL = 'http://localhost:20001';


app.use(cors());


app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});


app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Proxy server is running',
        target: TARGET_URL,
        timestamp: new Date().toISOString()
    });
});


const proxyOptions = {
    target: TARGET_URL,
    changeOrigin: true,
    logLevel: 'info',
    onProxyReq: (proxyReq, req, res) => {
        console.log(`Proxying ${req.method} ${req.url} to ${TARGET_URL}`);
    },
    onProxyRes: (proxyRes, req, res) => {
        console.log(`Received response from target: ${proxyRes.statusCode}`);
    },
    onError: (err, req, res) => {
        console.error('Proxy error:', err.message);
        res.status(500).json({
            error: 'Proxy error',
            message: err.message,
            target: TARGET_URL
        });
    }
};


app.use('/', createProxyMiddleware(proxyOptions));


app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});


app.listen(PORT, () => {
    console.log(`Proxy server running on http://localhost:${PORT}`);
    console.log(`Forwarding requests to: ${TARGET_URL}`);
    console.log(`Health check available at: http://localhost:${PORT}/health`);
}); 
