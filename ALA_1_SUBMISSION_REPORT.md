# ACTIVE LEARNING ACTIVITY (ALA-1) REPORT
## SUBJECT: CLOUD COMPUTING
### TOPIC: CLOUD SERVICE DEPLOYMENT & RESOURCE MANAGEMENT

---

### **Student Information**
- **Student Name:** ________________________
- **Enrollment No / Roll No:** ________________________
- **Branch / Semester:** Computer Engineering / IT (Semester ____)
- **Academic Year:** 2026 - 2027
- **Submission Portal:** GMIU Academic Portal
- **Marks Allocated:** 10 Marks

---

## 1. OBJECTIVE & PROBLEM STATEMENT

The primary objective of this Active Learning Activity (ALA-1) is to design, develop, configure, and deploy a multi-tier web application to a modern cloud computing platform. Through this practical exercise, we demonstrate:
1. **Compute Service Configuration:** Provisioning and running application processes on virtualized cloud compute instances / PaaS containers.
2. **Storage Service Configuration:** Implementing dual-tier storage including structured database records (MongoDB Atlas Cloud NoSQL) and unstructured object/blob storage.
3. **Cloud Accessibility & Networking:** Public routing over the internet with SSL/TLS encryption and automatic health checks.
4. **Basic Resource Management:** Monitoring system compute resources such as CPU load, memory usage, heap allocation, and uptime telemetry in real time.

---

## 2. SYSTEM ARCHITECTURE & CLOUD SERVICE MAPPING

```
                           +------------------------------------+
                           |        CLIENT WEB BROWSER          |
                           |   (Desktop / Mobile / Tablet)      |
                           +-----------------+------------------+
                                             |
                                    HTTPS Request (Port 443)
                                             |
                                             v
                           +-----------------+------------------+
                           |  CLOUD LOAD BALANCER & CDN LAYER   |
                           |    (SSL/TLS Termination, Proxy)    |
                           +-----------------+------------------+
                                             |
                                             v
+-----------------------------------------------------------------------------------------+
|                               CLOUD COMPUTE ENVIRONMENT                                 |
|                                                                                         |
|   +---------------------------------------------------------------------------------+   |
|   |                       NODE.JS / EXPRESS APP SERVICE ENGINE                      |   |
|   |  - Static Assets Delivery (/public)                                             |   |
|   |  - Health & Telemetry Microservice (/health, /api/compute-info)                 |   |
|   |  - Storage & Records Controller (/api/records, /api/files)                      |   |
|   +-----------------------+---------------------------------+-----------------------+   |
|                           |                                 |                           |
+---------------------------|---------------------------------|---------------------------+
                            |                                 |
                            v                                 v
+------------------------------------+     +------------------------------------+
|       CLOUD DATABASE STORE         |     |     CLOUD OBJECT / BLOB STORE      |
|  - MongoDB Atlas Cloud Database    |     |  - User Uploads & Media Files      |
|  - Real-time CRUD Operations       |     |  - Hot Storage Tier Container      |
+------------------------------------+     +------------------------------------+
```

### Cloud Services Classification:
| Cloud Component | Service Type | Role in Project |
|---|---|---|
| **Render Web Service (PaaS)** | Compute | Hosts the Node.js runtime, handles incoming HTTP/S traffic, calculates CPU & memory telemetry. |
| **MongoDB Atlas (M0 Sandbox)** | Database Storage | Managed cloud database storing structured application records, task configurations, and metadata. |
| **Blob / Object Storage**| File Storage | Stores multi-format user attachments with unique identifiers and metadata. |
| **Reverse Proxy & DNS** | Networking | Directs public domain traffic securely to container endpoints. |

---

## 3. COMPUTE & STORAGE SERVICES CONFIGURATION

### A. Compute Service Configuration
- **Runtime Environment:** Node.js v18+ (Linux-based PaaS container)
- **Virtual Core Allocation:** Dynamic multi-core virtual CPU
- **Memory Allocation:** Standard heap space with dynamic garbage collection
- **Process Telemetry:** Exposed via `/api/compute-info` utilizing the OS subsystem:
  - `os.cpus()` for core counts and architecture detection
  - `os.totalmem()` and `os.freemem()` for real-time RAM utilization tracking
  - `process.memoryUsage()` for application heap inspection
  - Process uptime counter for availability reporting

### B. Storage Service Configuration
- **Structured Database Tier (MongoDB Atlas):**
  - M0 Free-tier cluster hosted in region `ap-south-1` (Mumbai).
  - Schema attributes: Record ID, Title, Category, Description, Status, Storage Tier, and Timestamp.
  - CRUD operations exposed via REST endpoints (`/api/records`).
- **Unstructured Object Storage Tier:**
  - Dedicated storage container `/uploads` with disk & cloud blob sync.
  - Multipart form upload pipeline (`multer`) with max payload safeguard (10MB).
  - Asset metadata tracking (File Name, Size in KB, MIME Type, Storage Tier).

---

## 4. STEP-BY-STEP DEPLOYMENT DETAILS

### Step 1: Version Control (Git & GitHub)
1. Initialized repository with complete backend (`server.js`) and responsive frontend (`public/`).
2. Configured `.gitignore` to protect environment secrets (`.env`).
3. Created GitHub repository and pushed code to `main` branch.

### Step 2: Database Provisioning (MongoDB Atlas)
1. Deployed an M0 Free Cluster on MongoDB Atlas in AWS `ap-south-1`.
2. Created a dedicated database user credentials.
3. Whitelisted IP `0.0.0.0/0` under Network Access to allow global cloud connections.

### Step 3: Cloud Web Service Deployment (Render.com)
1. Created a new Web Service on Render and linked the GitHub repository.
2. Configured build command (`npm install`) and start command (`node server.js`).
3. Added the `MONGODB_URI` environment variable in the Render console.
4. Triggered deployment to obtain the live public URL.

---

## 5. RESULTS & DEMONSTRATION

### Live Deployment URL:
- **Public URL:** `https://________________________.onrender.com`
- **Health Check URL:** `https://________________________.onrender.com/health`

---

### Application Screenshots

#### 1. Compute Telemetry & Resource Management Dashboard
*(Insert screenshot showing CPU Cores, Memory Bar, Host OS, and Uptime)*

```
+--------------------------------------------------------------------+
|                                                                    |
|               [ PASTE SCREENSHOT 1: DASHBOARD & METRICS ]          |
|                                                                    |
+--------------------------------------------------------------------+
```

#### 2. MongoDB Atlas Cloud Database Records Management (CRUD)
*(Insert screenshot showing records added to MongoDB Atlas via the web interface)*

```
+--------------------------------------------------------------------+
|                                                                    |
|               [ PASTE SCREENSHOT 2: DATABASE RECORDS ]             |
|                                                                    |
+--------------------------------------------------------------------+
```

#### 3. Cloud Object Storage / File Vault
*(Insert screenshot showing uploaded files in the Blob Storage section)*

```
+--------------------------------------------------------------------+
|                                                                    |
|               [ PASTE SCREENSHOT 3: OBJECT STORAGE VAULT ]         |
|                                                                    |
+--------------------------------------------------------------------+
```

---

## 6. KEY LEARNING OUTCOMES

1. Gained practical experience configuring and running cloud compute services.
2. Learned how cloud platforms monitor and allocate resources (vCPUs, RAM, Disk).
3. Configured and connected a live cloud database (MongoDB Atlas) using environment variables.
4. Understood dual-tier storage (structured NoSQL database vs unstructured object blob storage).
5. Successfully hosted a web application on the public internet with HTTPS security.

---

**Signature of Student:** ___________________________  
**Date:** ____ / ____ / 2026
