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
    localStorage.setItem('currentUser', JSON.stringify(user));
}

function getCurrentUser() {
    if (!currentUser) {
        const stored = localStorage.getItem('currentUser');
        if (stored) {
            try {
                currentUser = JSON.parse(stored);
            } catch (e) {
                currentUser = null;
            }
        }
        if (!currentUser) {
            currentUser = Storage.get('currentUser');
        }
    }
    return currentUser;
}

function logout() {
    currentUser = null;
    Storage.remove('currentUser');
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// ===== IMAGE ANALYSIS FUNCTIONS =====

// Analyze image and extract color features
function analyzeImageColor(imageDataURL) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Sample pixels from the image
            const sampleSize = 100; // Number of pixels to sample
            const step = Math.floor(Math.min(img.width, img.height) / 10);
            
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            let r = 0, g = 0, b = 0;
            let sampleCount = 0;
            
            // Sample pixels from different areas of the image
            for (let y = 0; y < img.height && sampleCount < sampleSize; y += step) {
                for (let x = 0; x < img.width && sampleCount < sampleSize; x += step) {
                    const pixel = ctx.getImageData(x, y, 1, 1).data;
                    r += pixel[0];
                    g += pixel[1];
                    b += pixel[2];
                    sampleCount++;
                }
            }
            
            // Calculate average RGB
            const avgR = Math.round(r / sampleCount);
            const avgG = Math.round(g / sampleCount);
            const avgB = Math.round(b / sampleCount);
            
            // Calculate brightness and color characteristics
            const brightness = (avgR + avgG + avgB) / 3;
            const isWhite = avgR > 200 && avgG > 180 && avgB > 150;
            const isYellow = avgR > 200 && avgG > 150 && avgB < 100;
            const isPaleYellow = avgR > 190 && avgG > 170 && avgB > 120 && avgR < 230;
            
            resolve({
                r: avgR,
                g: avgG,
                b: avgB,
                brightness: brightness,
                isWhite: isWhite,
                isYellow: isYellow,
                isPaleYellow: isPaleYellow,
                // Variety detection based on color
                detectedVariety: isWhite ? 'Waxy Corn' : 
                               (isPaleYellow ? 'Waxy Corn' : 
                               (isYellow ? 'Sweet Corn' : 'Hybrid Yellow'))
            });
        };
        img.src = imageDataURL;
    });
}

// Mock CNN Classification - Now with actual image analysis!
async function mockCNNClassification(imageDataURL, forceVariety = null) {
    // First, analyze the actual image
    let colorAnalysis = null;
    try {
        colorAnalysis = await analyzeImageColor(imageDataURL);
    } catch (e) {
        console.warn('Color analysis failed, using fallback', e);
    }
    
    // If we have a forced variety, use it
    if (forceVariety !== null && forceVariety >= 0 && forceVariety < 3) {
        const varieties = ["Waxy Corn", "Sweet Corn", "Hybrid Yellow"];
        const varietyIndex = forceVariety;
        return generateResult(varieties[varietyIndex], imageDataURL);
    }
    
    // Determine variety based on image color analysis
    let varietyIndex = 1; // Default to Sweet Corn
    let confidence = 70;
    
    if (colorAnalysis) {
        console.log('Color Analysis:', colorAnalysis);
        
        // Waxy Corn: White to pale yellow, pearlescent
        if (colorAnalysis.isWhite || colorAnalysis.isPaleYellow) {
            varietyIndex = 0; // Waxy Corn
            confidence = 80 + Math.floor(Math.random() * 15);
            console.log('🔍 Detected Waxy Corn (white/pale yellow)');
        }
        // Sweet Corn: Bright golden yellow
        else if (colorAnalysis.isYellow) {
            varietyIndex = 1; // Sweet Corn
            confidence = 85 + Math.floor(Math.random() * 10);
            console.log('🔍 Detected Sweet Corn (golden yellow)');
        }
        // Hybrid Yellow: Deep yellow to orange
        else {
            varietyIndex = 2; // Hybrid Yellow
            confidence = 78 + Math.floor(Math.random() * 15);
            console.log('🔍 Detected Hybrid Yellow (deep yellow/orange)');
        }
    } else {
        // Fallback: use hash if color analysis failed
        let hash = 0;
        if (imageDataURL) {
            for (let i = 0; i < Math.min(imageDataURL.length, 1000); i++) {
                hash = ((hash << 5) - hash) + imageDataURL.charCodeAt(i);
                hash |= 0;
            }
        } else {
            hash = Date.now();
        }
        varietyIndex = Math.abs(hash % 3);
        console.log('⚠️ Using fallback hash-based variety detection');
    }
    
    const varieties = ["Waxy Corn", "Sweet Corn", "Hybrid Yellow"];
    return generateResult(varieties[varietyIndex], imageDataURL, confidence);
}

// Helper function to generate result with quality
function generateResult(variety, imageDataURL, confidence = null) {
    // Determine quality based on variety and some randomness
    const qualities = ["High Quality", "Moderate Quality", "Low Quality"];
    
    // Simulate quality based on variety (with some randomness)
    let qualityIndex;
    const rand = Math.random();
    if (rand < 0.4) qualityIndex = 0; // High Quality
    else if (rand < 0.75) qualityIndex = 1; // Moderate Quality
    else qualityIndex = 2; // Low Quality
    
    // Adjust quality for variety (give slightly better scores to Sweet Corn)
    if (variety === 'Sweet Corn' && qualityIndex > 0 && Math.random() < 0.3) {
        qualityIndex = 0; // Sometimes upgrade Sweet Corn
    }
    
    // Calculate confidence if not provided
    if (!confidence) {
        confidence = 75 + Math.floor(Math.random() * 20);
    }
    
    // Performance score based on variety and quality
    let performanceScore = 0;
    if (qualityIndex === 0) {
        if (variety === 'Waxy Corn') performanceScore = 88 + Math.floor(Math.random() * 8);
        else if (variety === 'Sweet Corn') performanceScore = 85 + Math.floor(Math.random() * 10);
        else performanceScore = 82 + Math.floor(Math.random() * 12);
    } else if (qualityIndex === 1) {
        if (variety === 'Waxy Corn') performanceScore = 68 + Math.floor(Math.random() * 10);
        else if (variety === 'Sweet Corn') performanceScore = 65 + Math.floor(Math.random() * 12);
        else performanceScore = 62 + Math.floor(Math.random() * 14);
    } else {
        if (variety === 'Waxy Corn') performanceScore = 45 + Math.floor(Math.random() * 12);
        else if (variety === 'Sweet Corn') performanceScore = 42 + Math.floor(Math.random() * 14);
        else performanceScore = 40 + Math.floor(Math.random() * 15);
    }
    performanceScore = Math.min(98, Math.max(30, Math.round(performanceScore)));
    
    // Traits for each variety
    const traits = {
        "Waxy Corn": "Chewy glutinous texture, high amylopectin starch. Excellent for Asian cuisine, industrial starch, and specialty food products.",
        "Sweet Corn": "High sugar content, tender kernels, bright yellow color. Ideal for fresh consumption, canning, and frozen food industry.",
        "Hybrid Yellow": "High-yielding hybrid variety with excellent kernel uniformity. Balanced starch content, disease resistant."
    };
    
    // Visual characteristics
    const visualTraits = {
        "Waxy Corn": "Pearlescent white to pale yellow kernels, waxy appearance, uniform size",
        "Sweet Corn": "Bright golden-yellow kernels, plump and juicy appearance, slight translucency",
        "Hybrid Yellow": "Deep yellow to orange kernels, uniform shape, robust texture"
    };
    
    // Disease detection (mock)
    const diseases = ["None detected", "Minor surface blemishes", "Potential fungal spots", "Insect damage visible"];
    const diseaseIndex = Math.floor(Math.random() * 4);
    
    // Quality descriptions
    const qualityDescriptions = {
        "High Quality": "Superior seed with excellent characteristics. Optimal size, color, and texture.",
        "Moderate Quality": "Good quality seed with minor imperfections.",
        "Low Quality": "Significant defects present. Limited applications."
    };
    
    return {
        variety: variety,
        quality: qualities[qualityIndex],
        qualityDescription: qualityDescriptions[qualities[qualityIndex]],
        confidence: Math.round(confidence),
        performanceScore: performanceScore,
        germinationPotential: Math.min(95, Math.max(40, performanceScore - 5 + Math.floor(Math.random() * 10))),
        marketValueIndex: qualityIndex === 0 ? 90 : (qualityIndex === 1 ? 70 : 50),
        traits: traits[variety],
        visualTraits: visualTraits[variety],
        diseaseDetection: diseases[diseaseIndex],
        varietyIndex: ["Waxy Corn", "Sweet Corn", "Hybrid Yellow"].indexOf(variety),
        qualityIndex: qualityIndex,
        timestamp: Date.now(),
        date: new Date().toLocaleString()
    };
}

// Quality criteria descriptions based on visual features
function getQualityCriteria(quality, variety) {
    const criteria = {
        "High Quality": {
            general: "Superior seed characteristics meeting all quality standards",
            visual: "• Uniform kernel size and shape\n• Vibrant, consistent coloration\n• No visible defects or damage\n• Intact pericarp (seed coat)",
            standards: "• 90-100% uniformity score\n• Optimal moisture content\n• No disease symptoms\n• Excellent germination potential",
            why: "This seed exhibits exceptional visual characteristics with perfect uniformity, ideal color development, and zero defects, indicating optimal growing conditions and proper harvest timing."
        },
        "Moderate Quality": {
            general: "Acceptable quality with minor imperfections",
            visual: "• Slight size or shape variation\n• Minor color inconsistencies\n• Small surface blemishes present\n• Generally intact seed coat",
            standards: "• 70-89% uniformity score\n• Slightly suboptimal moisture\n• Minor surface irregularities\n• Good germination potential",
            why: "This seed shows good overall structure but has minor imperfections such as slight size variation or small blemishes, which may result from suboptimal growing conditions or minor mechanical damage during harvest."
        },
        "Low Quality": {
            general: "Significant defects affecting seed value",
            visual: "• Notable size or shape irregularities\n• Discoloration present\n• Visible cracks or damage\n• Compromised seed coat integrity",
            standards: "• Below 70% uniformity score\n• Potential moisture issues\n• Visible disease or damage\n• Reduced germination potential",
            why: "This seed exhibits significant quality issues including visible damage, discoloration, or irregular development, likely due to disease pressure, pest damage, environmental stress, or improper handling/storage."
        }
    };
    
    // Variety-specific comments
    const varietyComments = {
        "Waxy Corn": {
            "High Quality": "Excellent pearlescent appearance with ideal waxy texture characteristics.",
            "Moderate Quality": "Acceptable waxy characteristics with minor variations in translucency.",
            "Low Quality": "Compromised waxy starch properties visible through kernel abnormalities."
        },
        "Sweet Corn": {
            "High Quality": "Superior sugar development indicated by bright, uniform golden color.",
            "Moderate Quality": "Good sugar content with slight variations in kernel plumpness.",
            "Low Quality": "Reduced sugar content indicated by dull coloring and kernel shriveling."
        },
        "Hybrid Yellow": {
            "High Quality": "Excellent hybrid characteristics with robust, uniform kernel development.",
            "Moderate Quality": "Good hybrid traits with minor uniformity variations.",
            "Low Quality": "Compromised hybrid vigor visible through inconsistent kernel fill."
        }
    };
    
    return {
        ...criteria[quality],
        varietySpecific: varietyComments[variety]?.[quality] || "",
        recommendations: quality === "High Quality" 
            ? "✓ Premium market pricing recommended\n✓ Suitable for seed saving\n✓ Ideal for direct consumption"
            : (quality === "Moderate Quality" 
                ? "• Good for processing\n• Suitable for animal feed\n• Consider for secondary markets"
                : "⚠ Limited market value\n⚠ Processing only recommended\n⚠ Not suitable for seed saving")
    };
}

// Force variety for testing
let forcedVariety = null;

function forceVariety(index) {
    if (index >= 0 && index <= 2) {
        forcedVariety = index;
        console.log(`✅ Forced variety: ${["Waxy Corn", "Sweet Corn", "Hybrid Yellow"][index]}`);
        showNotification(`Forced variety: ${["Waxy Corn", "Sweet Corn", "Hybrid Yellow"][index]}`, 'info');
    } else {
        forcedVariety = null;
        console.log('✅ Variety forcing disabled');
        showNotification('Variety forcing disabled', 'info');
    }
}

// Format date for display
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
}

// Export to CSV
function exportToCSV(data, filename) {
    if (!data || data.length === 0) {
        showNotification('No data to export', 'error');
        return;
    }
    
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

// Generate QR Code
function generateQRCode(data) {
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(data)}`;
}

// Show notification
function showNotification(message, type = 'info') {
    const existing = document.querySelectorAll('.notification');
    existing.forEach(el => el.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    let icon = 'fa-info-circle';
    let color = '#3498db';
    if (type === 'success') {
        icon = 'fa-check-circle';
        color = '#27ae60';
    } else if (type === 'error') {
        icon = 'fa-exclamation-circle';
        color = '#e74c3c';
    }
    
    notification.innerHTML = `
        <i class="fas ${icon}" style="color: ${color};"></i>
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
        border-left: 4px solid ${color};
        max-width: 400px;
        font-family: 'Inter', sans-serif;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Debounce function
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
