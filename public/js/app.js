// Cloud Service Deployment (ALA-1) - Frontend Logic

let uptimeSec = 0;

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    fetchTelemetry();
    fetchRecords();
    fetchFiles();

    // Event Listeners
    document.getElementById('refresh-telemetry-btn').addEventListener('click', fetchTelemetry);
    document.getElementById('record-form').addEventListener('submit', handleAddRecord);
    document.getElementById('upload-form').addEventListener('submit', handleFileUpload);
    
    // File input label update
    const fileInput = document.getElementById('file-input');
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            document.getElementById('file-label').textContent = e.target.files[0].name;
        }
    });

    // Uptime tick every second
    setInterval(() => {
        uptimeSec++;
        document.getElementById('uptime-display').textContent = formatUptime(uptimeSec);
    }, 1000);

    // Auto refresh telemetry every 10 seconds
    setInterval(fetchTelemetry, 10000);
});

// Format seconds into H:M:S format
function formatUptime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
}

// 1. Fetch and render compute resource metrics
async function fetchTelemetry() {
    try {
        const res = await fetch('/api/compute-info');
        if (!res.ok) throw new Error('Failed to fetch telemetry');
        const data = await res.json();

        uptimeSec = data.uptimeSeconds;
        document.getElementById('uptime-display').textContent = formatUptime(uptimeSec);

        // Database status badge
        if (data.databaseStatus) {
            const dbBadge = document.getElementById('db-status-badge');
            if (dbBadge) {
                dbBadge.textContent = data.databaseStatus.includes('MongoDB Atlas') ? 'DB: MongoDB Atlas' : 'DB: Cloud Store';
            }
        }

        document.getElementById('metric-platform').textContent = `${data.platform.toUpperCase()} (${data.arch})`;
        document.getElementById('metric-arch').textContent = `Host: ${data.hostname} | Rel: ${data.release}`;

        document.getElementById('metric-cpu').textContent = `${data.cpuCores} vCPU Cores`;
        document.getElementById('metric-load').textContent = `Load (1m/5m): ${data.loadAverage1m} / ${data.loadAverage5m}`;

        document.getElementById('metric-memory-used').textContent = `${data.memory.usedMB} MB / ${data.memory.totalMB} MB`;
        document.getElementById('metric-memory-pct').textContent = `${data.memory.usagePercent}%`;
        document.getElementById('metric-memory-bar').style.width = `${Math.min(data.memory.usagePercent, 100)}%`;

        document.getElementById('metric-heap').textContent = `${data.memory.processHeapUsedMB} MB`;
        document.getElementById('metric-env').textContent = `Runtime: Node.js (${data.environment})`;

    } catch (err) {
        console.error('Error fetching compute telemetry:', err);
    }
}

// 2. Fetch and render Cloud Database Records
async function fetchRecords() {
    try {
        const res = await fetch('/api/records');
        const result = await res.json();
        const container = document.getElementById('records-container');
        document.getElementById('records-count').textContent = `${result.data.length} records`;

        if (!result.data || result.data.length === 0) {
            container.innerHTML = `
                <div class="p-8 text-center text-slate-500 bg-slate-900/50 rounded-xl border border-slate-800">
                    <i class="fa-solid fa-database text-2xl mb-2 text-slate-600"></i>
                    <p class="text-xs">No records provisioned yet. Add your first cloud record above.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = result.data.map(rec => `
            <div class="rounded-xl bg-slate-900/90 border border-slate-800/90 p-4 shadow-sm hover:border-slate-700 transition">
                <div class="flex justify-between items-start gap-2">
                    <div>
                        <div class="flex items-center gap-2">
                            <h4 class="text-sm font-semibold text-white">${escapeHtml(rec.title)}</h4>
                            <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">${escapeHtml(rec.category)}</span>
                        </div>
                        <p class="text-xs text-slate-300 mt-1.5 leading-relaxed">${escapeHtml(rec.description)}</p>
                    </div>
                    <button onclick="deleteRecord('${rec.id}')" class="text-slate-500 hover:text-red-400 p-1 transition" title="Delete record">
                        <i class="fa-solid fa-trash-can text-xs"></i>
                    </button>
                </div>
                <div class="flex items-center justify-between text-[11px] text-slate-500 mt-3 pt-2.5 border-t border-slate-800/80">
                    <span class="flex items-center gap-1 font-mono text-[10px]">
                        <i class="fa-solid fa-database text-slate-600"></i> ${rec.storageType || 'MongoDB Atlas'} | ID: ${rec.id.substring(0, 8)}...
                    </span>
                    <span class="text-slate-400">${new Date(rec.timestamp).toLocaleString()}</span>
                </div>
            </div>
        `).join('');

    } catch (err) {
        console.error('Error fetching records:', err);
    }
}

// Add Record
async function handleAddRecord(e) {
    e.preventDefault();
    const title = document.getElementById('rec-title').value.trim();
    const category = document.getElementById('rec-category').value;
    const description = document.getElementById('rec-description').value.trim();

    if (!title || !description) return;

    try {
        const res = await fetch('/api/records', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, category, description })
        });

        if (res.ok) {
            document.getElementById('record-form').reset();
            fetchRecords();
            fetchTelemetry();
        } else {
            alert('Failed to save record to cloud database.');
        }
    } catch (err) {
        console.error('Error adding record:', err);
    }
}

// Delete Record
async function deleteRecord(id) {
    if (!confirm('Are you sure you want to delete this cloud record?')) return;
    try {
        const res = await fetch(`/api/records/${id}`, { method: 'DELETE' });
        if (res.ok) {
            fetchRecords();
            fetchTelemetry();
        }
    } catch (err) {
        console.error('Error deleting record:', err);
    }
}

// 3. Fetch and render Cloud Blob Files
async function fetchFiles() {
    try {
        const res = await fetch('/api/files');
        const result = await res.json();
        const container = document.getElementById('files-container');
        document.getElementById('files-count').textContent = `${result.data.length} items`;

        if (!result.data || result.data.length === 0) {
            container.innerHTML = `
                <div class="py-6 text-center text-slate-500 text-xs">
                    No files stored in the object bucket yet.
                </div>
            `;
            return;
        }

        container.innerHTML = result.data.map(f => `
            <div class="flex items-center justify-between p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800 transition text-xs">
                <div class="flex items-center space-x-2.5 overflow-hidden">
                    <i class="fa-solid fa-file text-pink-400 shrink-0"></i>
                    <div class="truncate">
                        <p class="font-medium text-slate-200 truncate">${escapeHtml(f.originalName)}</p>
                        <p class="text-[10px] text-slate-500">${f.sizeKB} KB • ${f.storageTier}</p>
                    </div>
                </div>
                <div class="flex items-center space-x-2 shrink-0">
                    <a href="${f.url}" target="_blank" class="p-1 text-slate-400 hover:text-cyan-400 transition" title="View/Download">
                        <i class="fa-solid fa-arrow-up-right-from-square"></i>
                    </a>
                    <button onclick="deleteFile('${f.id}')" class="p-1 text-slate-400 hover:text-red-400 transition" title="Delete">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

    } catch (err) {
        console.error('Error fetching files:', err);
    }
}

// Upload File
async function handleFileUpload(e) {
    e.preventDefault();
    const fileInput = document.getElementById('file-input');
    if (!fileInput.files.length) return;

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    const uploadBtn = document.getElementById('upload-btn');
    uploadBtn.disabled = true;
    uploadBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Uploading...';

    try {
        const res = await fetch('/api/files/upload', {
            method: 'POST',
            body: formData
        });

        if (res.ok) {
            document.getElementById('upload-form').reset();
            document.getElementById('file-label').textContent = 'Click or drag & drop file to store';
            fetchFiles();
            fetchTelemetry();
        } else {
            alert('File upload failed.');
        }
    } catch (err) {
        console.error('Error uploading file:', err);
    } finally {
        uploadBtn.disabled = false;
        uploadBtn.innerHTML = '<i class="fa-solid fa-hard-drive"></i> Commit to Storage Bucket';
    }
}

// Delete File
async function deleteFile(id) {
    if (!confirm('Are you sure you want to remove this object from cloud storage?')) return;
    try {
        const res = await fetch(`/api/files/${id}`, { method: 'DELETE' });
        if (res.ok) {
            fetchFiles();
            fetchTelemetry();
        }
    } catch (err) {
        console.error('Error deleting file:', err);
    }
}

// Helper: Escape HTML to avoid XSS
function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
