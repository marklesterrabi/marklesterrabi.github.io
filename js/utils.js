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
            currentUser = JSON.parse(stored);
        } else {
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

// ================================================
// IMPROVED CNN CLASSIFICATION FOR 3 VARIETIES
// ================================================

function mockCNNClassification(imageDataURL) {
    if (!imageDataURL) {
        return getDefaultResult();
    }
    
    // Extract image features from the data URL
    const features = extractImageFeatures(imageDataURL);
    
    // Determine variety based on extracted features
    const variety = determineVariety(features);
    const quality = determineQuality(features);
    const confidence = calculateConfidence(features, variety);
    const performanceScore = calculatePerformance(variety, quality);
    
    // Get detailed traits
    const traits = getVarietyTraits(variety);
    const visualTraits = getVisualTraits(variety);
    const qualityCriteria = getQualityCriteria(quality, variety);
    
    return {
        variety: variety,
        quality: quality,
        qualityDescription: qualityCriteria.general,
        confidence: Math.round(confidence),
        performanceScore: Math.round(performanceScore),
        germinationPotential: Math.min(95, Math.round(performanceScore - 5 + (Math.random() * 10))),
        marketValueIndex: calculateMarketValue(variety, quality),
        traits: traits,
        visualTraits: visualTraits,
        diseaseDetection: detectDisease(features),
        varietyIndex: ['Waxy Corn', 'Sweet Corn', 'Hybrid Yellow'].indexOf(variety),
        qualityIndex: ['High Quality', 'Moderate Quality', 'Low Quality'].indexOf(quality),
        timestamp: Date.now(),
        date: new Date().toLocaleString()
    };
}

// ================================================
// ADVANCED FEATURE EXTRACTION
// ================================================

function extractImageFeatures(imageDataURL) {
    // Extract more detailed features from the image data
    let hash = 0;
    const dataString = imageDataURL.substring(0, 3000);
    
    for (let i = 0; i < dataString.length; i++) {
        hash = ((hash << 5) - hash) + dataString.charCodeAt(i);
        hash = hash & hash;
    }
    
    // Create a more detailed feature set
    const features = {
        // Color features - using different parts of the hash
        colorR: Math.abs(hash % 256),
        colorG: Math.abs((hash >> 4) % 256),
        colorB: Math.abs((hash >> 8) % 256),
        
        // Enhanced color analysis
        brightness: Math.abs((hash % 200) / 200),
        saturation: 0.3 + (Math.abs((hash >> 3) % 140) / 200),
        hue: Math.abs((hash >> 6) % 360),
        
        // Texture features
        textureScore: Math.abs((hash % 100) / 100),
        smoothness: 0.3 + (Math.abs((hash >> 4) % 70) / 100),
        roughness: Math.abs((hash >> 8) % 100) / 100,
        
        // Shape features
        roundness: 0.5 + (Math.abs(hash % 50) / 100),
        sizeScore: 0.4 + (Math.abs((hash >> 2) % 60) / 100),
        elongation: 0.2 + (Math.abs((hash >> 5) % 80) / 100),
        
        // Pattern features
        patternDensity: Math.abs((hash % 100) / 100),
        translucency: 0.2 + (Math.abs((hash >> 4) % 80) / 100),
        opacity: 0.2 + (Math.abs((hash >> 8) % 80) / 100),
        
        // Surface features
        surfaceDefects: Math.abs((hash >> 10) % 100) / 100,
        uniformity: 0.4 + (Math.abs((hash >> 12) % 60) / 100),
        
        // Additional color characteristics
        warmth: 0.3 + (Math.abs((hash >> 14) % 70) / 100),
        coolness: 0.3 + (Math.abs((hash >> 16) % 70) / 100),
        
        // Image complexity
        imageComplexity: Math.min(1, (imageDataURL.length % 1000) / 1000),
        colorVariance: 0.2 + (Math.abs((hash >> 20) % 80) / 100),
        
        // Raw hash for consistency
        hash: Math.abs(hash)
    };
    
    // Calculate additional derived features
    features.avgColor = (features.colorR + features.colorG + features.colorB) / 3;
    features.colorContrast = Math.abs(features.colorR - features.colorB) + Math.abs(features.colorG - features.colorB);
    features.goldenRatio = features.colorR > 180 && features.colorG > 150 && features.colorB < 120;
    features.creamyRatio = features.colorR > 200 && features.colorG > 190 && features.colorB < 180;
    features.deepYellowRatio = features.colorR > 170 && features.colorG > 150 && features.colorB > 80 && features.colorB < 150;
    
    return features;
}

// ================================================
// ENHANCED VARIETY DETECTION
// ================================================

function determineVariety(features) {
    const hash = features.hash;
    
    // Extract key features
    const colorR = features.colorR;
    const colorG = features.colorG;
    const colorB = features.colorB;
    const textureScore = features.textureScore;
    const translucency = features.translucency;
    const patternDensity = features.patternDensity;
    const smoothness = features.smoothness;
    const uniformity = features.uniformity;
    const brightness = features.brightness;
    const saturation = features.saturation;
    const warmth = features.warmth;
    const opacity = features.opacity;
    
    // ============================
    // WAXY CORN DETECTION
    // Pale/cream color, waxy appearance, translucent
    // ============================
    let waxyScore = 0;
    
    // Color: Pale/cream (high R, high G, low B)
    if (colorR > 200) waxyScore += 10;
    if (colorG > 180) waxyScore += 8;
    if (colorB < 200) waxyScore += 8;
    if (colorR > colorG && colorG > colorB) waxyScore += 5;
    
    // Waxy appearance: Translucent, smooth
    if (translucency > 0.5) waxyScore += 12;
    if (smoothness > 0.6) waxyScore += 8;
    if (opacity < 0.6) waxyScore += 8;
    
    // Pattern: Even, uniform
    if (patternDensity < 0.4) waxyScore += 10;
    if (uniformity > 0.6) waxyScore += 8;
    if (textureScore < 0.6) waxyScore += 5;
    
    // Temperature: Cool/neutral
    if (warmth < 0.6) waxyScore += 5;
    if (saturation < 0.5) waxyScore += 8;
    if (brightness > 0.5) waxyScore += 5;
    
    // Special: Creamy ratio
    if (features.creamyRatio) waxyScore += 15;
    if (features.goldenRatio === false) waxyScore += 10;
    
    // ============================
    // SWEET CORN DETECTION
    // Golden yellow, plump, bright
    // ============================
    let sweetScore = 0;
    
    // Color: Golden yellow (high R, high G, low B)
    if (colorR > 200) sweetScore += 10;
    if (colorG > 150) sweetScore += 10;
    if (colorB < 120) sweetScore += 8;
    if (colorR > colorG && colorG > colorB) sweetScore += 5;
    
    // Sweet appearance: Bright, plump
    if (translucency > 0.3 && translucency < 0.6) sweetScore += 8;
    if (smoothness > 0.5) sweetScore += 8;
    if (brightness > 0.4) sweetScore += 10;
    if (saturation > 0.4) sweetScore += 8;
    
    // Pattern: Moderate density
    if (patternDensity > 0.2 && patternDensity < 0.6) sweetScore += 10;
    if (uniformity > 0.5) sweetScore += 8;
    if (textureScore > 0.3 && textureScore < 0.7) sweetScore += 5;
    
    // Temperature: Warm
    if (warmth > 0.5) sweetScore += 8;
    if (warmth > 0.6) sweetScore += 5;
    if (saturation > 0.4) sweetScore += 5;
    
    // Special: Golden ratio
    if (features.goldenRatio) sweetScore += 20;
    if (features.creamyRatio === false) sweetScore += 10;
    if (features.deepYellowRatio) sweetScore += 12;
    
    // ============================
    // HYBRID YELLOW DETECTION
    // Deep yellow/orange, opaque, robust
    // ============================
    let hybridScore = 0;
    
    // Color: Deep yellow/orange (high R, high G, medium B)
    if (colorR > 170) hybridScore += 10;
    if (colorG > 150) hybridScore += 8;
    if (colorB > 80 && colorB < 150) hybridScore += 10;
    if (colorR > colorG && colorG < colorB) hybridScore += 5;
    
    // Hybrid appearance: Opaque, dense
    if (opacity > 0.4) hybridScore += 12;
    if (translucency < 0.5) hybridScore += 8;
    if (smoothness > 0.4 && smoothness < 0.7) hybridScore += 8;
    
    // Pattern: Dense, uniform
    if (patternDensity > 0.4) hybridScore += 10;
    if (uniformity > 0.6) hybridScore += 12;
    if (textureScore > 0.4) hybridScore += 5;
    
    // Temperature: Warm
    if (warmth > 0.4) hybridScore += 8;
    if (saturation > 0.3) hybridScore += 8;
    if (brightness > 0.3 && brightness < 0.7) hybridScore += 5;
    
    // Special: Deep yellow ratio
    if (features.deepYellowRatio) hybridScore += 18;
    if (features.goldenRatio && features.creamyRatio === false) hybridScore += 12;
    
    // ============================
    // ADD HASH-BASED VARIATION (for different images)
    // ============================
    const randomFactor1 = (hash % 30) / 100;
    const randomFactor2 = ((hash >> 3) % 30) / 100;
    const randomFactor3 = ((hash >> 6) % 30) / 100;
    
    waxyScore += randomFactor1 * 5;
    sweetScore += randomFactor2 * 5;
    hybridScore += randomFactor3 * 5;
    
    // ============================
    // LOG SCORES FOR DEBUGGING
    // ============================
    console.log('=== Variety Detection Scores ===');
    console.log('Waxy Corn Score:', waxyScore);
    console.log('Sweet Corn Score:', sweetScore);
    console.log('Hybrid Yellow Score:', hybridScore);
    console.log('Features:', {
        colorR, colorG, colorB,
        translucency, smoothness, patternDensity,
        uniformity, brightness, saturation,
        creamyRatio: features.creamyRatio,
        goldenRatio: features.goldenRatio,
        deepYellowRatio: features.deepYellowRatio
    });
    console.log('===============================');
    
    // ============================
    // DETERMINE WINNER
    // ============================
    let variety = 'Waxy Corn';
    let maxScore = waxyScore;
    
    if (sweetScore > maxScore) {
        variety = 'Sweet Corn';
        maxScore = sweetScore;
    }
    if (hybridScore > maxScore) {
        variety = 'Hybrid Yellow';
        maxScore = hybridScore;
    }
    
    // If scores are very close, use hash to break ties
    const scoreDiff = Math.max(waxyScore, sweetScore, hybridScore) - Math.min(waxyScore, sweetScore, hybridScore);
    if (scoreDiff < 8) {
        const tieBreaker = hash % 3;
        if (tieBreaker === 0) variety = 'Waxy Corn';
        else if (tieBreaker === 1) variety = 'Sweet Corn';
        else variety = 'Hybrid Yellow';
        console.log('Tie break applied, selected:', variety);
    }
    
    return variety;
}

function determineQuality(features) {
    const hash = features.hash;
    
    let qualityScore = 0;
    qualityScore += features.uniformity * 30;
    qualityScore += (1 - features.surfaceDefects) * 25;
    qualityScore += (1 - features.colorVariance) * 20;
    qualityScore += features.smoothness * 15;
    qualityScore += ((hash % 10) / 10) * 10;
    
    if (qualityScore > 75) {
        return 'High Quality';
    } else if (qualityScore > 50) {
        return 'Moderate Quality';
    } else {
        return 'Low Quality';
    }
}

function calculateConfidence(features, variety) {
    let baseConfidence = 75 + (Math.abs(features.hash % 20));
    const consistency = 1 - features.colorVariance;
    baseConfidence += consistency * 10;
    baseConfidence += (features.hash % 15);
    return Math.min(98, Math.max(70, baseConfidence));
}

function calculatePerformance(variety, quality) {
    let baseScore = 0;
    switch(variety) {
        case 'Waxy Corn': baseScore = 80; break;
        case 'Sweet Corn': baseScore = 78; break;
        case 'Hybrid Yellow': baseScore = 75; break;
        default: baseScore = 75;
    }
    
    if (quality === 'High Quality') baseScore += 15;
    else if (quality === 'Moderate Quality') baseScore += 5;
    else baseScore -= 10;
    
    baseScore += Math.floor(Math.random() * 10);
    return Math.min(98, Math.max(30, baseScore));
}

function calculateMarketValue(variety, quality) {
    let baseValue = 0;
    switch(variety) {
        case 'Waxy Corn': baseValue = 85; break;
        case 'Sweet Corn': baseValue = 80; break;
        case 'Hybrid Yellow': baseValue = 70; break;
        default: baseValue = 75;
    }
    
    if (quality === 'High Quality') baseValue += 10;
    else if (quality === 'Moderate Quality') baseValue += 0;
    else baseValue -= 15;
    
    return Math.min(100, Math.max(40, baseValue));
}

function detectDisease(features) {
    const diseaseScore = features.surfaceDefects * 100;
    
    if (diseaseScore < 20) {
        return 'None detected';
    } else if (diseaseScore < 40) {
        return 'Minor surface blemishes';
    } else if (diseaseScore < 60) {
        return 'Potential fungal spots';
    } else {
        return 'Insect damage visible';
    }
}

function getVarietyTraits(variety) {
    const traits = {
        "Waxy Corn": "Chewy glutinous texture, high amylopectin starch. Excellent for Asian cuisine, industrial starch, and specialty food products. High market demand in premium segments.",
        "Sweet Corn": "High sugar content, tender kernels, bright yellow color. Ideal for fresh consumption, canning, and frozen food industry. Superior eating quality.",
        "Hybrid Yellow": "High-yielding hybrid variety with excellent kernel uniformity. Balanced starch content, disease resistant, suitable for both processing and animal feed."
    };
    return traits[variety] || traits["Hybrid Yellow"];
}

function getVisualTraits(variety) {
    const visualTraits = {
        "Waxy Corn": "Pearlescent white to pale yellow kernels, waxy appearance, uniform size, translucent when fresh",
        "Sweet Corn": "Bright golden-yellow kernels, plump and juicy appearance, slight translucency, sweet aroma",
        "Hybrid Yellow": "Deep yellow to orange kernels, uniform shape, robust texture, dense kernel fill"
    };
    return visualTraits[variety] || visualTraits["Hybrid Yellow"];
}

// ================================================
// QUALITY CRITERIA
// ================================================

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
    
    const recommendations = quality === "High Quality" 
        ? "✓ Premium market pricing recommended\n✓ Suitable for seed saving\n✓ Ideal for direct consumption"
        : (quality === "Moderate Quality" 
            ? "• Good for processing\n• Suitable for animal feed\n• Consider for secondary markets"
            : "⚠ Limited market value\n⚠ Processing only recommended\n⚠ Not suitable for seed saving");
    
    return {
        ...criteria[quality],
        varietySpecific: varietyComments[variety]?.[quality] || "",
        recommendations: recommendations
    };
}

function getDefaultResult() {
    return {
        variety: 'Sweet Corn',
        quality: 'Moderate Quality',
        qualityDescription: 'Default analysis result',
        confidence: 85,
        performanceScore: 75,
        germinationPotential: 70,
        marketValueIndex: 75,
        traits: 'Standard corn variety characteristics',
        visualTraits: 'Standard visual characteristics',
        diseaseDetection: 'None detected',
        varietyIndex: 1,
        qualityIndex: 1,
        timestamp: Date.now(),
        date: new Date().toLocaleString()
    };
}

// ================================================
// OTHER UTILITY FUNCTIONS
// ================================================

function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
}

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

function generateQRCode(data) {
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(data)}`;
}

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
    
    if (type === 'success') notification.style.borderLeft = `4px solid #27ae60`;
    if (type === 'error') notification.style.borderLeft = `4px solid #e74c3c`;
    if (type === 'info') notification.style.borderLeft = `4px solid #3498db`;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

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

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function checkPasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]+/)) strength++;
    if (password.match(/[A-Z]+/)) strength++;
    if (password.match(/[0-9]+/)) strength++;
    if (password.match(/[$@#&!]+/)) strength++;
    return strength;
}

// Inject animation styles
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
