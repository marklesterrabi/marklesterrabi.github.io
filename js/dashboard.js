// Dashboard JavaScript

let varietyChart = null;
let qualityTrendChart = null;

// Load dashboard data
function loadDashboard() {
    const user = getCurrentUser();
    if (!user) return;
    
    const history = Storage.get(`history_${user.username}`) || [];
    
    // Update stats
    document.getElementById('totalAnalyses').textContent = history.length;
    
    // Calculate average performance
    let totalPerformance = 0;
    let highQualityCount = 0;
    let weeklyCount = 0;
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    history.forEach(item => {
        totalPerformance += item.performanceScore || 0;
        if (item.quality === 'High Quality') highQualityCount++;
        if (item.timestamp > oneWeekAgo) weeklyCount++;
    });
    
    const avgPerformance = history.length > 0 ? Math.round(totalPerformance / history.length) : 0;
    document.getElementById('avgPerformance').textContent = avgPerformance;
    document.getElementById('highQualityRate').textContent = history.length > 0 ? Math.round((highQualityCount / history.length) * 100) : 0;
    document.getElementById('weeklyAnalyses').textContent = weeklyCount;
    
    // Update charts
    updateVarietyChart(history);
    updateQualityTrendChart(history);
    
    // Update recent analyses table
    updateRecentTable(history.slice(0, 5));
}

function updateVarietyChart(history) {
    const varietyCounts = {
        'Sweet Corn': 0,
        'Flour Corn': 0,
        'Waxy Corn': 0
    };
    
    history.forEach(item => {
        if (varietyCounts[item.variety] !== undefined) {
            varietyCounts[item.variety]++;
        }
    });
    
    const ctx = document.getElementById('varietyChart').getContext('2d');
    
    if (varietyChart) {
        varietyChart.destroy();
    }
    
    varietyChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Sweet Corn', 'Flour Corn', 'Waxy Corn'],
            datasets: [{
                data: [varietyCounts['Sweet Corn'], varietyCounts['Flour Corn'], varietyCounts['Waxy Corn']],
                backgroundColor: ['#f39c12', '#f5e6ca', '#27ae60'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function updateQualityTrendChart(history) {
    // Group by date
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        last7Days.push(date.toLocaleDateString());
    }
    
    const qualityData = {
        'High Quality': new Array(7).fill(0),
        'Moderate Quality': new Array(7).fill(0),
        'Low Quality': new Array(7).fill(0)
    };
    
    history.forEach(item => {
        const itemDate = new Date(item.timestamp).toLocaleDateString();
        const dayIndex = last7Days.indexOf(itemDate);
        if (dayIndex !== -1 && qualityData[item.quality]) {
            qualityData[item.quality][dayIndex]++;
        }
    });
    
    const ctx = document.getElementById('qualityTrendChart').getContext('2d');
    
    if (qualityTrendChart) {
        qualityTrendChart.destroy();
    }
    
    qualityTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: last7Days,
            datasets: [
                {
                    label: 'High Quality',
                    data: qualityData['High Quality'],
                    borderColor: '#27ae60',
                    tension: 0.4,
                    fill: false
                },
                {
                    label: 'Moderate Quality',
                    data: qualityData['Moderate Quality'],
                    borderColor: '#f39c12',
                    tension: 0.4,
                    fill: false
                },
                {
                    label: 'Low Quality',
                    data: qualityData['Low Quality'],
                    borderColor: '#e74c3c',
                    tension: 0.4,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function updateRecentTable(analyses) {
    const tbody = document.getElementById('recentAnalysesBody');
    if (!tbody) return;
    
    if (analyses.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No analyses yet. Start by analyzing a seed!</td></tr>';
        return;
    }
    
    tbody.innerHTML = analyses.map(analysis => `
        <tr>
            <td>${formatDate(analysis.timestamp)}</td>
            <td><span class="variety-tag">${analysis.variety}</span></td>
            <td><span class="quality-badge ${analysis.quality.toLowerCase().replace(' ', '-')}">${analysis.quality}</span></td>
            <td><strong>${analysis.performanceScore}</strong>/100</td>
            <td><button class="btn-outline-small view-details" data-id="${analysis.timestamp}">View</button></td>
        </tr>
    `).join('');
}

// Dark mode toggle
function initDarkMode() {
    const toggle = document.getElementById('darkModeToggle');
    if (toggle) {
        toggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isDark);
            toggle.querySelector('i').classList.toggle('fa-moon');
            toggle.querySelector('i').classList.toggle('fa-sun');
        });
        
        const savedDarkMode = localStorage.getItem('darkMode') === 'true';
        if (savedDarkMode) {
            document.body.classList.add('dark-mode');
            toggle.querySelector('i').classList.remove('fa-moon');
            toggle.querySelector('i').classList.add('fa-sun');
        }
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();
    initDarkMode();
    
    // Refresh data periodically
    setInterval(loadDashboard, 30000);
});