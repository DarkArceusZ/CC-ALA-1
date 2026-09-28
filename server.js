const express = require('express');
const cors = require('cors');
const path = require('path');
const os = require('os');
const fs = require('fs');
const multer = require('multer');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const START_TIME = Date.now();

// ---------------- Database Schema & Initialization ----------------
let dbStatus = "In-Memory Fallback";
let useMongo = false;

const RecordSchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: { type: String, default: 'General' },
    description: { type: String, required: true },
    storageType: { type: String, default: 'MongoDB Atlas Cloud' },
    status: { type: String, default: 'Active' },
    timestamp: { type: Date, default: Date.now }
});

const Record = mongoose.model('Record', RecordSchema);

// In-Memory Cloud Storage Record Store (Fallback)
let inMemoryRecords = [
    {
        id: "rec-101",
        title: "Compute Instance Config",
        category: "Infrastructure",
        description: "Primary Web App Service instance running Linux Node.js runtime with automatic scaling enabled.",
        storageType: "App Service (Compute)",
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        status: "Active"
    },
    {
        id: "rec-102",
        title: "Object Storage Bucket Setup",
        category: "Storage",
        description: "Standard S3/Blob storage container allocated for user file uploads with encryption at rest.",
        storageType: "Blob Storage",
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        status: "Mounted"
    },
    {
        id: "rec-103",
        title: "MongoDB Atlas Cluster",
        category: "Database",
        description: "Managed Document Cloud Database cluster replicated across primary availability zones.",
        storageType: "MongoDB Atlas",
        timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
        status: "Connected"
    }
];

if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000
    }).then(() => {
        dbStatus = "Connected to MongoDB Atlas (Cloud Database)";
        useMongo = true;
        console.log("✅ Successfully connected to MongoDB Atlas Cloud Database");
    }).catch(err => {
        dbStatus = "MongoDB Atlas Disconnected (Fallback active)";
        console.warn("⚠️ MongoDB Atlas connection error. Falling back to local storage:", err.message);
    });
} else {
    dbStatus = "In-Memory Cloud Store (Add MONGODB_URI to .env for Atlas)";
}

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_'));
    }
});
const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(uploadDir));

let uploadedFiles = [];

// ================= API ENDPOINTS =================

// 1. Health Check Endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        database: dbStatus,
        uptimeSeconds: Math.floor((Date.now() - START_TIME) / 1000),
        timestamp: new Date().toISOString(),
        message: 'Cloud Web Service is healthy and operational.'
    });
});

// 2. Real-time Compute Resource Telemetry Endpoint
app.get('/api/compute-info', (req, res) => {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memoryUsage = process.memoryUsage();
    const cpus = os.cpus();
    const loadAvg = os.loadavg();

    res.json({
        cloudProvider: process.env.CLOUD_PROVIDER || 'Cloud Platform (PaaS/IaaS)',
        environment: process.env.NODE_ENV || 'production',
        databaseStatus: dbStatus,
        serverTime: new Date().toISOString(),
        uptimeSeconds: Math.floor((Date.now() - START_TIME) / 1000),
        hostname: os.hostname(),
        platform: os.platform(),
        arch: os.arch(),
        release: os.release(),
        cpuCores: cpus.length,
        cpuModel: cpus[0] ? cpus[0].model : 'Virtual CPU Core',
        loadAverage1m: loadAvg[0].toFixed(2),
        loadAverage5m: loadAvg[1].toFixed(2),
        memory: {
            totalMB: (totalMem / (1024 * 1024)).toFixed(1),
            usedMB: (usedMem / (1024 * 1024)).toFixed(1),
            freeMB: (freeMem / (1024 * 1024)).toFixed(1),
            usagePercent: ((usedMem / totalMem) * 100).toFixed(1),
            processHeapUsedMB: (memoryUsage.heapUsed / (1024 * 1024)).toFixed(2),
            processRssMB: (memoryUsage.rss / (1024 * 1024)).toFixed(2)
        }
    });
});

// 3. Cloud Database Records (CRUD)
app.get('/api/records', async (req, res) => {
    try {
        if (useMongo && mongoose.connection.readyState === 1) {
            const records = await Record.find().sort({ timestamp: -1 });
            const formatted = records.map(r => ({
                id: r._id.toString(),
                title: r.title,
                category: r.category,
                description: r.description,
                storageType: r.storageType,
                timestamp: r.timestamp.toISOString(),
                status: r.status
            }));
            return res.json({ success: true, database: 'MongoDB Atlas', count: formatted.length, data: formatted });
        }
        res.json({ success: true, database: 'In-Memory Store', count: inMemoryRecords.length, data: inMemoryRecords });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.post('/api/records', async (req, res) => {
    const { title, category, description, storageType } = req.body;
    if (!title || !description) {
        return res.status(400).json({ success: false, message: 'Title and description are required.' });
    }

    try {
        if (useMongo && mongoose.connection.readyState === 1) {
            const newDoc = await Record.create({
                title,
                category: category || 'General',
                description,
                storageType: storageType || 'MongoDB Atlas'
            });
            return res.status(201).json({
                success: true,
                message: 'Record created in MongoDB Atlas Cloud Database.',
                data: {
                    id: newDoc._id.toString(),
                    title: newDoc.title,
                    category: newDoc.category,
                    description: newDoc.description,
                    storageType: newDoc.storageType,
                    timestamp: newDoc.timestamp.toISOString(),
                    status: newDoc.status
                }
            });
        }

        const newRecord = {
            id: 'rec-' + Date.now().toString(36),
            title,
            category: category || 'General',
            description,
            storageType: storageType || 'Cloud Storage',
            timestamp: new Date().toISOString(),
            status: 'Active'
        };
        inMemoryRecords.unshift(newRecord);
        res.status(201).json({ success: true, message: 'Record created in Cloud Store.', data: newRecord });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

app.delete('/api/records/:id', async (req, res) => {
    const id = req.params.id;
    try {
        if (useMongo && mongoose.connection.readyState === 1) {
            await Record.findByIdAndDelete(id);
            return res.json({ success: true, message: `Record ${id} removed from MongoDB Atlas.` });
        }

        inMemoryRecords = inMemoryRecords.filter(r => r.id !== id);
        res.json({ success: true, message: `Record ${id} deleted successfully.` });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// 4. Cloud Object / File Storage Endpoints
app.get('/api/files', (req, res) => {
    res.json({ success: true, count: uploadedFiles.length, data: uploadedFiles });
});

app.post('/api/files/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    const fileMeta = {
        id: 'file-' + Date.now().toString(36),
        originalName: req.file.originalname,
        storedName: req.file.filename,
        sizeKB: (req.file.size / 1024).toFixed(1),
        mimeType: req.file.mimetype,
        url: `/uploads/${req.file.filename}`,
        uploadedAt: new Date().toISOString(),
        storageTier: 'Hot Cloud Blob Storage'
    };

    uploadedFiles.unshift(fileMeta);
    res.status(201).json({
        success: true,
        message: 'File successfully stored into Cloud Storage Bucket.',
        file: fileMeta
    });
});

app.delete('/api/files/:id', (req, res) => {
    const file = uploadedFiles.find(f => f.id === req.params.id);
    if (!file) {
        return res.status(404).json({ success: false, message: 'File not found.' });
    }

    const filePath = path.join(uploadDir, file.storedName);
    if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) { console.error(e); }
    }

    uploadedFiles = uploadedFiles.filter(f => f.id !== req.params.id);
    res.json({ success: true, message: 'File removed from Cloud Storage.' });
});

// Serve frontend SPA fallback
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Server Initialization
app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 ALA-1 Cloud Web Application Online`);
    console.log(`📡 Local Access URL: http://localhost:${PORT}`);
    console.log(`📊 Health Endpoint:   http://localhost:${PORT}/health`);
    console.log(`💻 Compute Telemetry: http://localhost:${PORT}/api/compute-info`);
    console.log(`🗄️ Database Status:   ${dbStatus}`);
    console.log(`=======================================================`);
});
