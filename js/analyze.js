// Analyze Page JavaScript - Updated for async analysis

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
    
    // Drag and drop
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
    
    // Run analysis - Updated for async
    if (runBtn) {
        runBtn.addEventListener('click', async () => {
            if (!currentImagePreview) {
                showNotification('Please upload an image first', 'error');
                return;
            }
            
            runBtn.disabled = true;
            runBtn.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> Processing...';
            resultsArea.innerHTML = `
                <div class="analysis-loading">
                    <i class="fas fa-brain"></i>
                    <p>Analyzing image...</p>
                    <div class="progress-bar"><div class="progress-fill" style="width: 0%"></div></div>
                </div>
            `;
            
            let progress = 0;
            const interval = setInterval(() => {
                progress += 10;
                const fill = resultsArea.querySelector('.progress-fill');
                if (fill) fill.style.width = `${Math.min(progress, 90)}%`;
            }, 150);
            
            try {
                // Run the async classification
                const result = await mockCNNClassification(currentImagePreview);
                const qualityCriteria = getQualityCriteria(result.quality, result.variety);
                
                // Complete progress
                clearInterval(interval);
                const fill = resultsArea.querySelector('.progress-fill');
                if (fill) fill.style.width = '100%';
                
                // ===== SAVE TO HISTORY =====
                const currentUser = getCurrentUser();
                console.log('Current user:', currentUser);
                
                if (currentUser && currentUser.username) {
                    const historyKey = `history_${currentUser.username}`;
                    let existingHistory = localStorage.getItem(historyKey);
                    let history = existingHistory ? JSON.parse(existingHistory) : [];
                    
                    const newAnalysis = {
                        variety: result.variety,
                        quality: result.quality,
                        confidence: result.confidence,
                        performanceScore: result.performanceScore,
                        traits: result.traits,
                        previewUrl: currentImagePreview,
                        timestamp: Date.now(),
                        date: new Date().toLocaleString()
                    };
                    
                    history.unshift(newAnalysis);
                    localStorage.setItem(historyKey, JSON.stringify(history));
                    
                    console.log('✅ Saved to history:', newAnalysis);
                    console.log('Total history items:', history.length);
                    console.log('Storage key:', historyKey);
                } else {
                    console.error('❌ No user logged in! Cannot save to history.');
                }
                // ============================================
                
                const qualityClass = result.quality.toLowerCase().replace(' ', '-');
                
                // Display results
                resultsArea.innerHTML = `
                    <div class="result-card">
                        <div class="result-item-full">
                            <div class="result-label">VARIETY</div>
                            <div class="result-value-large ${result.variety.toLowerCase().replace(' ', '-')}">
                                ${result.variety}
                            </div>
                        </div>
                        
                        <div class="result-item-full">
                            <div class="result-label">QUALITY GRADE</div>
                            <div class="result-value-large quality-${qualityClass}">
                                ${result.quality} ${result.confidence}%
                            </div>
                        </div>
                        
                        <div class="quality-criteria ${qualityClass}">
                            <h4><i class="fas fa-clipboard-list"></i> Quality Assessment Criteria</h4>
                            
                            <div class="criteria-section">
                                <strong>📊 Quality Summary:</strong>
                                <p>${qualityCriteria.general}</p>
                            </div>
                            
                            <div class="criteria-section">
                                <strong>👁️ Visual Indicators Observed:</strong>
                                <pre>${qualityCriteria.visual}</pre>
                            </div>
                            
                            <div class="criteria-section">
                                <strong>📏 Quality Standards Met:</strong>
                                <pre>${qualityCriteria.standards}</pre>
                            </div>
                            
                            <div class="why-explanation">
                                <strong><i class="fas fa-question-circle"></i> Why ${result.quality}?:</strong><br>
                                ${qualityCriteria.why}
                            </div>
                            
                            ${qualityCriteria.varietySpecific ? `
                            <div class="criteria-section">
                                <strong>🌽 ${result.variety}-Specific Notes:</strong>
                                <p>${qualityCriteria.varietySpecific}</p>
                            </div>
                            ` : ''}
                            
                            <div class="recommendations-box ${qualityClass}">
                                <strong><i class="fas fa-lightbulb"></i> Recommendations:</strong><br>
                                ${qualityCriteria.recommendations}
                            </div>
                        </div>
                        
                        <div class="result-actions" style="margin-top: 1.5rem; text-align: center;">
                            <div style="background: #e8f5e9; padding: 0.75rem; border-radius: 0.5rem; color: #2e7d32; margin-bottom: 0.75rem;">
                                <i class="fas fa-check-circle"></i> Analysis automatically saved to history!
                            </div>
                            <button class="btn-primary view-history-btn" style="margin-top: 0.75rem;">
                                <i class="fas fa-history"></i> View in History
                            </button>
                        </div>
                    </div>
                `;
                
                const viewHistoryBtn = resultsArea.querySelector('.view-history-btn');
                if (viewHistoryBtn) {
                    viewHistoryBtn.addEventListener('click', () => {
                        window.location.href = 'history.html';
                    });
                }
                
                showNotification('✅ Analysis completed and saved to history!', 'success');
                
            } catch (error) {
                console.error('Analysis error:', error);
                clearInterval(interval);
                resultsArea.innerHTML = `
                    <div class="error-result" style="text-align: center; padding: 2rem;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #e74c3c; margin-bottom: 1rem;"></i>
                        <p style="color: #e74c3c; font-weight: 600;">Error analyzing image</p>
                        <p style="color: #666;">${error.message || 'Please try again with a different image.'}</p>
                        <button class="btn-outline" style="margin-top: 1rem;" onclick="location.reload()">
                            <i class="fas fa-sync-alt"></i> Try Again
                        </button>
                    </div>
                `;
                showNotification('Error analyzing image. Please try again.', 'error');
            }
            
            runBtn.disabled = false;
            runBtn.innerHTML = '<i class="fas fa-brain"></i> Run CNN Classification';
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
                        file: file,
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
                btn.addEventListener('click', (e) => {
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
    
    // Process batch - Updated for async
    if (processBtn) {
        processBtn.addEventListener('click', async () => {
            if (batchQueue.length === 0) {
                showNotification('No images in batch queue', 'error');
                return;
            }
            
            const progressDiv = document.getElementById('batchProgress');
            const progressFill = progressDiv.querySelector('.progress-fill');
            const progressText = document.getElementById('progressText');
            
            progressDiv.classList.remove('hidden');
            processBtn.disabled = true;
            processBtn.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> Processing...';
            
            const currentUser = getCurrentUser();
            let completedCount = 0;
            
            for (let i = 0; i < batchQueue.length; i++) {
                const item = batchQueue[i];
                const progress = ((i + 1) / batchQueue.length) * 100;
                progressFill.style.width = `${progress}%`;
                progressText.textContent = `${i + 1}/${batchQueue.length}`;
                
                try {
                    // Process each image
                    await new Promise(resolve => setTimeout(resolve, 800));
                    item.result = await mockCNNClassification(item.preview);
                    
                    // Save each result to history
                    if (currentUser && currentUser.username && item.result) {
                        const historyKey = `history_${currentUser.username}`;
                        let existingHistory = localStorage.getItem(historyKey);
                        let history = existingHistory ? JSON.parse(existingHistory) : [];
                        
                        history.unshift({
                            variety: item.result.variety,
                            quality: item.result.quality,
                            confidence: item.result.confidence,
                            performanceScore: item.result.performanceScore,
                            traits: item.result.traits,
                            previewUrl: item.preview,
                            timestamp: Date.now() - (batchQueue.length - i) * 2000,
                            date: new Date().toLocaleString()
                        });
                        localStorage.setItem(historyKey, JSON.stringify(history));
                    }
                    completedCount++;
                } catch (error) {
                    console.error(`Error processing item ${i + 1}:`, error);
                    item.result = {
                        variety: 'Error',
                        quality: 'Analysis Failed',
                        confidence: 0,
                        performanceScore: 0,
                        traits: 'Error processing image'
                    };
                }
                
                updateBatchPreview();
            }
            
            progressFill.style.width = '100%';
            progressText.textContent = `Complete! ${completedCount}/${batchQueue.length} processed`;
            
            showNotification(`✅ Batch complete! ${completedCount} images analyzed and saved to history.`, 'success');
            
            if (exportBtn) {
                exportBtn.disabled = false;
                exportBtn.addEventListener('click', () => {
                    const results = batchQueue.map(item => item.result).filter(r => r && r.variety !== 'Error');
                    if (results.length > 0) {
                        exportToCSV(results, `batch_analysis_${Date.now()}.csv`);
                        showNotification(`Exported ${results.length} results`, 'success');
                    } else {
                        showNotification('No valid results to export', 'error');
                    }
                });
            }
            
            processBtn.disabled = false;
            processBtn.innerHTML = '<i class="fas fa-play"></i> Process All';
        });
    }
}
