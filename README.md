# Active Learning Activity 1 (ALA-1): Cloud Service Deployment

**Institution:** Gokul Global University / Faculty of Engineering & Technology (GMIU)  
**Subject:** Cloud Computing  
**Activity:** ALA-1 - Cloud Service Deployment (Marks: 10)  
**Project Name:** CloudVault - Multi-Tier Cloud Application & Compute Telemetry Dashboard  

---

## 📌 1. Project Overview

CloudVault is a full-stack, cloud-native web application designed to demonstrate the core tenets of cloud computing:
1. **Compute Services:** Virtual machine / PaaS Container execution, telemetry monitoring (CPU cores, memory usage, heap, load average, uptime).
2. **Storage Services:** Multi-tier storage architecture including:
   - **Document / Database Store (Structured Data):** RESTful CRUD operations for cloud infrastructure and application records.
   - **Blob / Object Storage (Unstructured Data):** Cloud file vault capable of storing, managing, and streaming assets.
3. **Networking & Public Accessibility:** Hosted on a high-availability cloud platform with reverse proxy, SSL/TLS termination, and internet accessibility.

---

## 🛠️ 2. Tech Stack & Architecture

- **Backend / Compute Engine:** Node.js & Express.js (Runs inside cloud container / app service)
- **Frontend / Client UI:** Responsive HTML5, Tailwind CSS, FontAwesome
- **Storage Layer:**
  - In-Memory / Cloud JSON Record Store
  - Object/Blob Storage Engine (Multer / Cloud S3 / Blob Compatible)
- **Cloud Hosting Platform (Recommended Free Tier):** [Render.com](https://render.com) or [Vercel](https://vercel.com) / [Railway.app](https://railway.app) / [AWS App Runner](https://aws.amazon.com/)

---

## 🚀 3. Quick Local Setup & Testing

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm or yarn

### Steps
1. Open terminal in the project directory:
   ```bash
   cd "c:\Users\krish\ALA\C.C. ALA\ALA-1"
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the application:
   ```bash
   npm start
   ```
4. Open your browser and navigate to:
   `http://localhost:3000`

---

## 🌐 4. Free 5-Minute Cloud Deployment Guide (Render.com)

To make your application accessible globally over the internet (as required for ALA-1):

### Method 1: Deploying to Render (Zero Cost, 1-Click)
1. Push this folder to your **GitHub** account (e.g., repository named `ala1-cloud-deployment`).
2. Go to **[https://render.com](https://render.com)** and sign up / log in with GitHub.
3. Click **New +** -> **Web Service**.
4. Connect your GitHub repository.
5. Configure the service:
   - **Name:** `cloudvault-ala1` (or your student name/roll number)
   - **Language / Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Instance Type:** `Free`
6. Click **Create Web Service**.
7. In ~2 minutes, Render will provide a public live URL:  
   `https://cloudvault-ala1.onrender.com`

---

## 📝 5. API Endpoints for Cloud Verification

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Cloud health check & uptime probe |
| `GET` | `/api/compute-info` | Real-time VM/Container CPU & RAM telemetry |
| `GET` | `/api/records` | Read all cloud records from database |
| `POST` | `/api/records` | Create a new record in cloud database |
| `DELETE`| `/api/records/:id` | Remove a record from database |
| `GET` | `/api/files` | List objects stored in Blob Storage |
| `POST` | `/api/files/upload`| Upload object into Cloud Blob container |
| `DELETE`| `/api/files/:id` | Delete object from Cloud Blob container |
