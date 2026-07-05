// Utility functions for the entire application

// Local Storage Management
const Storage = {
    set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },
    
    get(key) {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    },
    
    remove(key) {
        localStorage.removeItem(key);
    },
    
    clear() {
        localStorage.clear();
    }
};

// User Management
let currentUser = null;

function setCurrentUser(user) {
    currentUser = user;
    Storage.set('currentUser', user);
}

function getCurrentUser() {
    if (!currentUser) {
        currentUser = Storage.get('currentUser');
    }
    return currentUser;
}

function logout() {
    currentUser = null;
    Storage.remove('currentUser');
    window.location.href = 'login.html';
}

// Mock CNN Classification
function mockCNNClassification(imageDataURL) {
    // Simulate AI processing with consistent results based on image data
    let hash = 0;
    if (imageDataURL) {
        for (let i = 0; i < Math.min(imageDataURL.length, 1000); i++) {
            hash = ((hash << 5) - hash) + imageDataURL.charCodeAt(i);
            hash |= 0;
        }
    } else {
        hash = Date.now();
    }
    
    const varieties = ["Sweet Corn", "Flour Corn", "Waxy Corn"];
    const qualities = ["High Quality", "Moderate Quality", "Low Quality"];
    
    const varietyIndex = Math.abs(hash % 3);
    const qualityIndex = Math.abs(Math.floor(hash / 7) % 3);
    
    // Calculate confidence based on hash consistency
    const confidence = 70 + (Math.abs(hash % 25));
    
    // Performance score calculation
    let performanceScore = 0;
    if (qualityIndex === 0) performanceScore = 85 + (varietyIndex * 3);
    else if (qualityIndex === 1) performanceScore = 65 + (varietyIndex * 5);
    else performanceScore = 45 + (varietyIndex * 2);
    performanceScore = Math.min(98, Math.max(30, performanceScore));
    
    // Germination potential
    const germinationPotential = performanceScore - 5 + (Math.abs(hash % 10));
    
    // Market value index
    const marketValueIndex = qualityIndex === 0 ? 90 : (qualityIndex === 1 ? 70 : 50);
    
    // Traits based on variety
    const traits = {
        "Sweet Corn": "High sugar content, tender kernels, excellent for fresh market and canning. Golden yellow color indicates optimal ripeness.",
        "Flour Corn": "Soft starch endosperm, ideal for milling and baking. White/chalky appearance indicates high starch content.",
        "Waxy Corn": "Chewy texture, waxy starch, premium for Asian cuisine and industrial starch applications."
    };
    
    // Disease detection (mock)
    const diseases = ["None detected", "Minor surface blemishes", "Potential fungal spots"];
    const diseaseIndex = Math.abs(Math.floor(hash / 13) % 3);
    
    return {
        variety: varieties[varietyIndex],
        quality: qualities[qualityIndex],
        confidence: Math.round(confidence),
        performanceScore: Math.round(performanceScore),
        germinationPotential: Math.min(95, Math.round(germinationPotential)),
        marketValueIndex: marketValueIndex,
        traits: traits[varieties[varietyIndex]],
        diseaseDetection: diseases[diseaseIndex],
        varietyIndex,
        qualityIndex,
        timestamp: Date.now(),
        date: new Date().toLocaleString()
    };
}

// Format date for display
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
}

// Export to CSV
function exportToCSV(data, filename) {
    if (!data || data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvRows = [];
    csvRows.push(headers.join(','));
    
    for (const row of data) {
        const values = headers.map(header => {
            const value = row[header] || '';
            return `"${String(value).replace(/"/g, '""')}"`;
        });
        csvRows.push(values.join(','));
    }
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Export to PDF (simplified - would use html2pdf in production)
function exportToPDF(elementId, filename) {
    alert('PDF export would use html2pdf library. In production, implement with jsPDF or html2pdf.js');
    // In production: html2pdf().from(element).save();
}

// Generate QR Code (simplified)
function generateQRCode(data) {
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(data)}`;
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : (type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle')}"></i>
        <span>${message}</span>
    `;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: white;
        border-radius: 0.5rem;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        display: flex;
        align-items: center;
        gap: 0.75rem;
    `;
    
    if (type === 'success') notification.style.borderLeft = `4px solid var(--success)`;
    if (type === 'error') notification.style.borderLeft = `4px solid var(--danger)`;
    if (type === 'info') notification.style.borderLeft = `4px solid var(--info)`;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Debounce function for search inputs
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Pagination helper
function paginate(array, pageSize, pageNumber) {
    return array.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
}

// Validate email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Password strength checker
function checkPasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]+/)) strength++;
    if (password.match(/[A-Z]+/)) strength++;
    if (password.match(/[0-9]+/)) strength++;
    if (password.match(/[$@#&!]+/)) strength++;
    return strength;
}