// Analyze Page JavaScript

let currentImageFile = null;
let currentImagePreview = null;
let batchQueue = [];

// Initialize analyze page
document.addEventListener('DOMContentLoaded', () => {
    initUploadTab();
    initBatchTab();
    initTabs();
});

function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${tabId}Tab`).classList.add('active');
        });
    });
}

// =====================
// QUALITY PERCENTAGE LOGIC
// =====================
function getQualityPercentage(quality) {
    const q = (quality || '').toLowerCase();

    if (q.includes('high')) {
        return Math.floor(Math.random() * (95 - 85 + 1)) + 85; // 85–95
    }

    if (q.includes('moderate')) {
        return Math.floor(Math.random() * (75 - 70 + 1)) + 70; // 65–75
    }

    if (q.includes('good')) {
        return Math.floor(Math.random() * (95 - 80 + 1)) + 80; // fallback good range
    }

    // low / bad fallback
    return Math.floor(Math.random() * (50 - 30 + 1)) + 30; // 30–50
}

function initUploadTab() {
    const uploadZone = document.getElementById('uploadZone');
    const fileInput = document.getElementById('imageInput');
    const selectBtn = document.getElementById('selectFileBtn');
    const runBtn = document.getElementById('runAnalysisBtn');
    const previewContainer = document.getElementById('imagePreview');
    const resultsArea = document.getElementById('analysisResults');

    if (!uploadZone) return;

    function handleFile(file) {
        if (!file) return;
        currentImageFile = file;

        const reader = new FileReader();
        reader.onload = (e) => {
            currentImagePreview = e.target.result;
            previewContainer.innerHTML = `
                <img src="${currentImagePreview}" alt="Preview" class="preview-img">
                <button class="remove-image-btn"><i class="fas fa-times"></i> Remove</button>
            `;
            previewContainer.classList.remove('hidden');
            if (runBtn) runBtn.disabled = false;

            const removeBtn = previewContainer.querySelector('.remove-image-btn');
            if (removeBtn) {
                removeBtn.addEventListener('click', () => {
                    currentImageFile = null;
                    currentImagePreview = null;
                    previewContainer.innerHTML = '';
                    previewContainer.classList.add('hidden');
                    if (runBtn) runBtn.disabled = true;
                    resultsArea.innerHTML = `
                        <div class="placeholder-results">
                            <i class="fas fa-camera-retro"></i>
                            <p>Upload an image to start analysis</p>
                        </div>
                    `;
                });
            }
        };
        reader.readAsDataURL(file);
    }

    uploadZone.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
        if (e.target.files[0]) handleFile(e.target.files[0]);
    });

    selectBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.click();
    });

    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('drag-over');
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('drag-over');
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('drag-over');
        if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    });

    // Run analysis
    if (runBtn) {
        runBtn.addEventListener('click', () => {
            if (!currentImagePreview) return;

            runBtn.disabled = true;
            runBtn.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> Processing...';

            resultsArea.innerHTML = `
                <div class="analysis-loading">
                    <i class="fas fa-brain"></i>
                    <p>CNN Model analyzing image...</p>
                    <div class="progress-bar"><div class="progress-fill" style="width: 0%"></div></div>
                </div>
            `;

            let progress = 0;
            const interval = setInterval(() => {
                progress += 10;
                const fill = resultsArea.querySelector('.progress-fill');
                if (fill) fill.style.width = `${progress}%`;
            }, 100);

            setTimeout(() => {
                clearInterval(interval);

                const result = mockCNNClassification(currentImagePreview);

                // ADD PERCENTAGE HERE
                result.qualityPercentage = getQualityPercentage(result.quality);

                const user = getCurrentUser();
                if (user) {
                    const history = Storage.get(`history_${user.username}`) || [];
                    history.unshift({
                        ...result,
                        previewUrl: currentImagePreview,
                        timestamp: Date.now()
                    });
                    Storage.set(`history_${user.username}`, history.slice(0, 100));
                }

                resultsArea.innerHTML = `
                    <div class="result-card">
                        <div class="result-grid">
                            <div class="result-item">
                                <label style="font-weight: bold">Variety</label>
                                <div class="result-value ${result.variety.toLowerCase().replace(' ', '-')}">
                                    ${result.variety}
                                </div>
                            </div>

                            <div class="result-item">
                                <label style="font-weight: bold">Quality Grade</label>
                                <div class="result-value quality-${result.quality.toLowerCase().replace(' ', '-')}">
                                    ${result.quality}
                                </div>
                            </div>

                            <div class="result-item">
                                <label style="font-weight: bold">Quality Score</label>
                                <div class="result-value">
                                    ${result.qualityPercentage}%
                                </div>
                            </div>
                        </div>

                        <div class="result-traits">
                            <strong>Key Traits:</strong>
                            <p>${result.traits}</p>
                        </div>

                        <div class="result-actions">
                            <button class="btn-outline save-result" data-result='${JSON.stringify(result)}'>
                                <i class="fas fa-save"></i> Save to Collection
                            </button>
                            <button class="btn-outline export-result">
                                <i class="fas fa-download"></i> Export Report
                            </button>
                        </div>

                        <div class="qr-code" id="qrCode"></div>
                    </div>
                `;

                runBtn.disabled = false;
                runBtn.innerHTML = '<i class="fas fa-brain"></i> Run CNN Classification';

                const qrContainer = resultsArea.querySelector('#qrCode');
                if (qrContainer) {
                    const qrUrl = generateQRCode(JSON.stringify({
                        variety: result.variety,
                        quality: result.quality,
                        score: result.qualityPercentage
                    }));
                    qrContainer.innerHTML = `<img src="${qrUrl}" alt="QR Code" style="width: 100px;">`;
                }

                const saveBtn = resultsArea.querySelector('.save-result');
                if (saveBtn) {
                    saveBtn.addEventListener('click', () => {
                        showNotification('Analysis saved to collection!', 'success');
                    });
                }

            }, 2000);
        });
    }
}

function initBatchTab() {
    const batchZone = document.getElementById('batchZone');
    const batchInput = document.getElementById('batchInput');
    const batchSelectBtn = document.getElementById('batchSelectBtn');
    const batchQueueDiv = document.getElementById('batchQueue');
    const batchPreview = document.getElementById('batchPreview');
    const processBtn = document.getElementById('processBatchBtn');
    const exportBtn = document.getElementById('exportBatchBtn');

    if (!batchZone) return;

    function addToBatch(files) {
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    batchQueue.push({
                        file,
                        preview: e.target.result,
                        name: file.name,
                        result: null
                    });
                    updateBatchPreview();
                };
                reader.readAsDataURL(file);
            }
        });
    }

    function updateBatchPreview() {
        if (batchQueue.length > 0) {
            batchQueueDiv.classList.remove('hidden');

            batchPreview.innerHTML = batchQueue.map((item, index) => `
                <div class="batch-item">
                    <img src="${item.preview}" alt="${item.name}">
                    <div class="remove-btn" data-index="${index}">
                        <i class="fas fa-times"></i>
                    </div>
                    ${item.result ? '<div class="result-badge"><i class="fas fa-check"></i></div>' : ''}
                </div>
            `).join('');

            document.getElementById('queueCount').textContent = batchQueue.length;
            processBtn.innerHTML = `<i class="fas fa-play"></i> Process All (${batchQueue.length})`;

            document.querySelectorAll('.remove-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const index = parseInt(btn.getAttribute('data-index'));
                    batchQueue.splice(index, 1);
                    updateBatchPreview();
                    if (batchQueue.length === 0) {
                        batchQueueDiv.classList.add('hidden');
                    }
                });
            });
        } else {
            batchQueueDiv.classList.add('hidden');
        }
    }

    batchZone.addEventListener('click', () => batchInput.click());

    batchSelectBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        batchInput.click();
    });

    batchInput.addEventListener('change', (e) => {
        if (e.target.files.length) addToBatch(e.target.files);
    });

    if (processBtn) {
        processBtn.addEventListener('click', async () => {
            const progressDiv = document.getElementById('batchProgress');
            const progressFill = progressDiv.querySelector('.progress-fill');
            const progressText = document.getElementById('progressText');

            progressDiv.classList.remove('hidden');

            for (let i = 0; i < batchQueue.length; i++) {
                const item = batchQueue[i];

                const progress = ((i + 1) / batchQueue.length) * 100;
                progressFill.style.width = `${progress}%`;
                progressText.textContent = `${i + 1}/${batchQueue.length}`;

                await new Promise(resolve => setTimeout(resolve, 800));

                item.result = mockCNNClassification(item.preview);

                // ADD PERCENTAGE HERE TOO
                item.result.qualityPercentage = getQualityPercentage(item.result.quality);

                updateBatchPreview();
            }

            showNotification(`Batch processing complete! ${batchQueue.length} images analyzed.`, 'success');

            if (exportBtn) {
                exportBtn.disabled = false;
                exportBtn.addEventListener('click', () => {
                    const results = batchQueue.map(item => item.result).filter(r => r);
                    exportToCSV(results, `batch_analysis_${Date.now()}.csv`);
                });
            }
        });
    }
}