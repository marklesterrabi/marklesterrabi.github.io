// Replace the mockCNNClassification function with this updated version:

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
    
    // YOUR 3 SPECIFIC CORN VARIETIES ONLY
    const varieties = ["Waxy Corn", "Sweet Corn", "Hybrid Yellow"];
    const qualities = ["High Quality", "Moderate Quality", "Low Quality"];
    
    // More controlled distribution - can adjust weights if needed
    // This ensures all 3 varieties appear naturally
    const varietyIndex = Math.abs(hash % 3);  // Will always be 0, 1, or 2
    const qualityIndex = Math.abs(Math.floor(hash / 7) % 3);
    
    // Calculate confidence based on hash consistency
    const confidence = 75 + (Math.abs(hash % 20));
    
    // Performance score calculation based on variety and quality
    let performanceScore = 0;
    if (qualityIndex === 0) {
        // High quality
        if (varietyIndex === 0) performanceScore = 88 + (hash % 8);  // Waxy: 88-95
        else if (varietyIndex === 1) performanceScore = 85 + (hash % 10); // Sweet: 85-94
        else performanceScore = 82 + (hash % 12); // Hybrid Yellow: 82-93
    } else if (qualityIndex === 1) {
        // Moderate quality
        if (varietyIndex === 0) performanceScore = 68 + (hash % 10);  // Waxy: 68-77
        else if (varietyIndex === 1) performanceScore = 65 + (hash % 12); // Sweet: 65-76
        else performanceScore = 62 + (hash % 14); // Hybrid Yellow: 62-75
    } else {
        // Low quality
        if (varietyIndex === 0) performanceScore = 45 + (hash % 12);  // Waxy: 45-56
        else if (varietyIndex === 1) performanceScore = 42 + (hash % 14); // Sweet: 42-55
        else performanceScore = 40 + (hash % 15); // Hybrid Yellow: 40-54
    }
    performanceScore = Math.min(98, Math.max(30, Math.round(performanceScore)));
    
    // Germination potential
    const germinationPotential = Math.min(95, Math.max(40, performanceScore - 5 + (Math.abs(hash % 10))));
    
    // Market value index based on variety
    let marketValueIndex = qualityIndex === 0 ? 90 : (qualityIndex === 1 ? 70 : 50);
    if (varietyIndex === 0) marketValueIndex += 5;  // Waxy premium
    if (varietyIndex === 1) marketValueIndex += 0;  // Sweet standard
    
    // Detailed traits for your 3 varieties
    const traits = {
        "Waxy Corn": "Chewy glutinous texture, high amylopectin starch. Excellent for Asian cuisine, industrial starch, and specialty food products. High market demand in premium segments.",
        "Sweet Corn": "High sugar content, tender kernels, bright yellow color. Ideal for fresh consumption, canning, and frozen food industry. Superior eating quality.",
        "Hybrid Yellow": "High-yielding hybrid variety with excellent kernel uniformity. Balanced starch content, disease resistant, suitable for both processing and animal feed."
    };
    
    // Visual characteristics for each variety
    const visualTraits = {
        "Waxy Corn": "Pearlescent white to pale yellow kernels, waxy appearance, uniform size",
        "Sweet Corn": "Bright golden-yellow kernels, plump and juicy appearance, slight translucency",
        "Hybrid Yellow": "Deep yellow to orange kernels, uniform shape, robust texture"
    };
    
    // Disease detection (mock)
    const diseases = ["None detected", "Minor surface blemishes", "Potential fungal spots", "Insect damage visible"];
    const diseaseIndex = Math.abs(Math.floor(hash / 13) % 4);
    
    // Quality description based on grade
    const qualityDescriptions = {
        "High Quality": "Superior seed with excellent characteristics. Optimal size, color, and texture. No defects visible.",
        "Moderate Quality": "Good quality seed with minor imperfections. Suitable for most applications.",
        "Low Quality": "Significant defects present. Limited applications. Consider for processing only."
    };
    
    return {
        variety: varieties[varietyIndex],
        quality: qualities[qualityIndex],
        qualityDescription: qualityDescriptions[qualities[qualityIndex]],
        confidence: Math.round(confidence),
        performanceScore: performanceScore,
        germinationPotential: Math.round(germinationPotential),
        marketValueIndex: marketValueIndex,
        traits: traits[varieties[varietyIndex]],
        visualTraits: visualTraits[varieties[varietyIndex]],
        diseaseDetection: diseases[diseaseIndex],
        varietyIndex: varietyIndex,
        qualityIndex: qualityIndex,
        timestamp: Date.now(),
        date: new Date().toLocaleString()
    };
}
