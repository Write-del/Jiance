// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 显示初始加载动画
    showPageLoadingState();
    
    // 初始化图表配置
    setupChartDefaults();
    
    // 根据当前页面加载相应的图表
    initializeChartsByPage().then(() => {
        // 隐藏加载动画
        hidePageLoadingState();
        // 显示成功提示
        showNotification('系统加载完成', 'success');
    }).catch(error => {
        console.error('图表初始化失败:', error);
        showNotification('图表加载失败，请刷新页面重试', 'error');
    });

    // 添加筛选事件监听器
    document.getElementById('applyFilter').addEventListener('click', function() {
        // 在实际应用中，这里应该发送请求获取筛选后的数据
        // 这里模拟更新图表
        updateChartsWithFilteredData();
    });
    
    // 添加数据导出功能
    if (document.getElementById('exportData')) {
        document.getElementById('exportData').addEventListener('click', exportFilteredData);
    }

    // 添加导航栏激活状态处理
    handleNavigation();
    
    // 添加数据缓存清理定时器
    setInterval(clearOldCache, 30 * 60 * 1000); // 30分钟清理一次缓存
});

// 根据当前页面初始化相应的图表
function initializeChartsByPage() {
    return new Promise(async (resolve, reject) => {
        try {
            // 获取当前页面路径
            const currentPath = window.location.pathname;
            const pageName = currentPath.split('/').pop();
            
            // 初始化promises数组
            const initPromises = [];
            
            // 根据页面路径加载相应的图表
            if (pageName === 'index.html' || pageName === '' || pageName === '/') {
                // 首页只加载概览图表
                initPromises.push(initDashboardCharts());
            } else if (pageName === 'population.html') {
                // 人口与背景页面
                initPromises.push(initPopulationCharts());
                initPromises.push(initPopulationExtraCharts());
            } else if (pageName === 'growth.html') {
                // 生长发育页面
                initPromises.push(initGrowthCharts());
                initPromises.push(initGrowthExtraCharts());
            } else if (pageName === 'nutrition.html') {
                // 营养状况页面
                initPromises.push(initNutritionCharts());
            } else if (pageName === 'immunity.html') {
                // 免疫与疾病页面
                initPromises.push(initImmunityCharts());
            } else if (pageName === 'development.html') {
                // 发展与心理页面
                initPromises.push(initDevelopmentCharts());
            } else if (pageName === 'services.html') {
                // 服务可及页面
                initPromises.push(initServiceCharts());
            } else {
                // 首页默认加载
                initPromises.push(initDashboardCharts());
            }
            
            // 等待所有图表初始化完成
            await Promise.all(initPromises);
            resolve();
        } catch (error) {
            console.error('初始化图表失败:', error);
            reject(error);
        }
    });
}

// 设置图表默认配置
function setupChartDefaults() {
    Chart.defaults.font.family = '"Microsoft YaHei", "PingFang SC", sans-serif';
    Chart.defaults.color = '#495057';
    Chart.defaults.responsive = true;
    Chart.defaults.maintainAspectRatio = true;
    
    // 添加自定义插件：悬停提示增强
    Chart.register({
        id: 'enhancedTooltips',
        beforeTooltipDraw: function(chart) {
            if (chart.tooltip._active && chart.tooltip._active.length) {
                const ctx = chart.ctx;
                const activePoint = chart.tooltip._active[0];
                const x = activePoint.element.x;
                const topY = chart.scales.y.top;
                const bottomY = chart.scales.y.bottom;
                
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(x, topY);
                ctx.lineTo(x, bottomY);
                ctx.lineWidth = 1;
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
                ctx.stroke();
                ctx.restore();
            }
        }
    });
}

// 处理导航栏激活状态
function handleNavigation() {
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navLinks.forEach(item => item.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // 滚动监听
    window.addEventListener('scroll', throttle(function() {
        let current = '';
        const sections = document.querySelectorAll('section');
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (pageYOffset >= sectionTop - 100) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }, 100));
}

// 节流函数
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// 模拟筛选数据更新图表
function updateChartsWithFilteredData() {
    const ageGroup = document.getElementById('ageGroup').value;
    const healthStatus = document.getElementById('healthStatus').value;
    const region = document.getElementById('region').value;
    const timeRange = document.getElementById('timeRange').value;
    
    // 检查是否有缓存数据
    const cacheKey = `data_${ageGroup}_${healthStatus}_${region}_${timeRange}`;
    const cachedData = sessionStorage.getItem(cacheKey);
    
    // 显示加载状态
    showLoadingState();
    
    if (cachedData) {
        try {
            // 使用缓存数据
            const data = JSON.parse(cachedData);
            updateChartsWithData(data);
            hideLoadingState();
            showNotification('已加载筛选数据', 'info');
        } catch (error) {
            console.error('缓存数据解析错误:', error);
            fetchFilteredData();
        }
    } else {
        // 没有缓存，模拟API请求
        fetchFilteredData();
    }
    
    // 模拟从服务器获取筛选后的数据
    function fetchFilteredData() {
        // 模拟API请求延迟
        setTimeout(() => {
            try {
                // 根据筛选条件更新图表
                // 模拟获取到的数据
                const data = {
                    dashboardData: generateDashboardData(),
                    sectionData: generateSectionData()
                };
                
                // 更新图表
                updateChartsWithData(data);
                
                // 缓存数据
                sessionStorage.setItem(cacheKey, JSON.stringify(data));
                
                // 隐藏加载状态
                hideLoadingState();
                
                // 显示筛选成功提示
                showNotification('数据筛选已应用', 'success');
            } catch (error) {
                console.error('更新图表失败:', error);
                hideLoadingState();
                showNotification('数据更新失败，请重试', 'error');
            }
        }, 1200);
    }
    
    // 生成仪表板数据
    function generateDashboardData() {
        let healthData, ageData;
        
        if (ageGroup === '0-1') {
            healthData = [85.2, 9.1, 4.3, 1.4];
        } else if (ageGroup === '12-18') {
            healthData = [72.1, 12.4, 12.7, 2.8];
        } else {
            healthData = [78.5, 10.8, 8.2, 2.5];
        }
        
        if (region === 'urban') {
            ageData = [1850, 2620, 3540, 4880, 2848];
        } else if (region === 'rural') {
            ageData = [1000, 1500, 1800, 2800, 1700];
        } else {
            ageData = [2850, 4120, 5340, 7680, 4548];
        }
        
        return {
            healthStatusData: healthData,
            ageDistributionData: ageData
        };
    }
    
    // 生成各部分数据
    function generateSectionData() {
        // 这里应该根据筛选条件生成真实数据
        // 简化处理，返回基于初始值的随机变化数据
        const data = {};
        const allCharts = [
            'populationDistributionChart', 
            'growthChart', 
            'nutritionChart', 
            'immunizationChart', 
            'diseaseChart', 
            'developmentChart', 
            'healthServiceChart'
        ];
        
        allCharts.forEach(chartId => {
            const chart = Chart.getChart(chartId);
            if (chart && chart.data && chart.data.datasets) {
                const initialData = initialChartData[chartId];
                if (initialData) {
                    const datasetsCopy = JSON.parse(JSON.stringify(initialData.datasets));
                    
                    datasetsCopy.forEach(dataset => {
                        if (Array.isArray(dataset.data)) {
                            dataset.data = dataset.data.map(value => {
                                // 生成基于初始值的随机变化（±5%）
                                const change = value * (Math.random() * 0.1 - 0.05);
                                return Number((value + change).toFixed(1));
                            });
                        }
                    });
                    
                    data[chartId] = {
                        datasets: datasetsCopy
                    };
                }
            }
        });
        
        return data;
    }
}

// 使用获取的数据更新图表
function updateChartsWithData(data) {
    // 更新仪表板图表
    updateDashboardCharts(data.dashboardData);
    
    // 更新其他部分图表
    updateSectionCharts(data.sectionData);
}

// 显示页面整体加载状态
function showPageLoadingState() {
    // 创建加载遮罩
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = `
        <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">加载中...</span>
        </div>
        <p class="mt-2">系统初始化中...</p>
    `;
    document.body.appendChild(loadingOverlay);
    document.body.classList.add('loading');
}

// 隐藏页面整体加载状态
function hidePageLoadingState() {
    const loadingOverlay = document.querySelector('.loading-overlay');
    if (loadingOverlay) {
        // 添加淡出效果
        loadingOverlay.classList.add('fade-out');
        setTimeout(() => {
            loadingOverlay.remove();
            document.body.classList.remove('loading');
        }, 500);
    }
}

// 显示加载状态
function showLoadingState() {
    const chartContainers = document.querySelectorAll('.chart-container');
    chartContainers.forEach(container => {
        // 添加加载指示器
        const loadingIndicator = document.createElement('div');
        loadingIndicator.className = 'chart-loading-indicator';
        loadingIndicator.innerHTML = `
            <div class="spinner-border spinner-border-sm text-primary" role="status">
                <span class="visually-hidden">加载中...</span>
            </div>
            <span class="ms-2">数据加载中...</span>
        `;
        container.appendChild(loadingIndicator);
        container.classList.add('loading');
    });
}

// 隐藏加载状态
function hideLoadingState() {
    const chartContainers = document.querySelectorAll('.chart-container');
    chartContainers.forEach(container => {
        const loadingIndicator = container.querySelector('.chart-loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.remove();
        }
        container.classList.remove('loading');
    });
}

// 显示通知消息
function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-icon">
            ${type === 'success' ? '<i class="bi bi-check-circle-fill"></i>' : 
              type === 'error' ? '<i class="bi bi-exclamation-circle-fill"></i>' : 
              '<i class="bi bi-info-circle-fill"></i>'}
        </div>
        <div class="notification-message">${message}</div>
    `;
    
    // 添加到文档
    const notificationsContainer = document.querySelector('.notifications-container');
    if (!notificationsContainer) {
        const container = document.createElement('div');
        container.className = 'notifications-container';
        document.body.appendChild(container);
        container.appendChild(notification);
    } else {
        notificationsContainer.appendChild(notification);
    }
    
    // 自动移除
    setTimeout(() => {
        notification.classList.add('hide');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// 导出筛选后的数据
function exportFilteredData() {
    // 获取当前筛选条件
    const ageGroup = document.getElementById('ageGroup').value;
    const healthStatus = document.getElementById('healthStatus').value;
    const region = document.getElementById('region').value;
    const timeRange = document.getElementById('timeRange').value;
    
    // 显示加载状态
    showNotification('正在准备导出数据...', 'info');
    
    // 收集所有图表数据
    const exportData = {
        exportTime: new Date().toLocaleString(),
        filterCriteria: {
            ageGroup,
            healthStatus,
            region,
            timeRange
        },
        dashboardData: {},
        sectionData: {}
    };
    
    // 收集仪表板数据
    ['healthStatusChart', 'ageDistributionChart'].forEach(chartId => {
        const chart = Chart.getChart(chartId);
        if (chart) {
            exportData.dashboardData[chartId] = {
                labels: chart.data.labels,
                datasets: chart.data.datasets.map(ds => ({
                    label: ds.label,
                    data: ds.data
                }))
            };
        }
    });
    
    // 收集其他部分数据
    [
        'populationDistributionChart', 
        'growthChart', 
        'nutritionChart', 
        'immunizationChart', 
        'diseaseChart', 
        'developmentChart', 
        'healthServiceChart'
    ].forEach(chartId => {
        const chart = Chart.getChart(chartId);
        if (chart) {
            exportData.sectionData[chartId] = {
                labels: chart.data.labels,
                datasets: chart.data.datasets.map(ds => ({
                    label: ds.label,
                    data: ds.data
                }))
            };
        }
    });
    
    // 将数据转换为CSV格式
    let csvContent = "数据类型,标签,";
    
    // 添加图表名称作为列标题
    Object.keys(exportData.dashboardData).forEach(chartId => {
        exportData.dashboardData[chartId].datasets.forEach(ds => {
            csvContent += (ds.label || chartId) + ",";
        });
    });
    
    Object.keys(exportData.sectionData).forEach(chartId => {
        exportData.sectionData[chartId].datasets.forEach(ds => {
            csvContent += (ds.label || chartId) + ",";
        });
    });
    
    csvContent += "\n";
    
    // 添加数据行
    // 简化处理，仅导出标签和对应的第一个数据集的值
    const allChartLabels = new Set();
    
    // 收集所有标签
    Object.values(exportData.dashboardData).forEach(chart => {
        chart.labels.forEach(label => allChartLabels.add(label));
    });
    
    Object.values(exportData.sectionData).forEach(chart => {
        chart.labels.forEach(label => allChartLabels.add(label));
    });
    
    // 为每个标签创建一行
    allChartLabels.forEach(label => {
        let row = "健康指标," + label + ",";
        
        // 添加仪表板数据
        Object.values(exportData.dashboardData).forEach(chart => {
            const labelIndex = chart.labels.indexOf(label);
            chart.datasets.forEach(ds => {
                row += (labelIndex >= 0 ? ds.data[labelIndex] : "") + ",";
            });
        });
        
        // 添加其他部分数据
        Object.values(exportData.sectionData).forEach(chart => {
            const labelIndex = chart.labels.indexOf(label);
            chart.datasets.forEach(ds => {
                row += (labelIndex >= 0 ? ds.data[labelIndex] : "") + ",";
            });
        });
        
        csvContent += row + "\n";
    });
    
    // 创建下载链接
    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `儿童健康监测数据_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    
    // 触发下载
    setTimeout(() => {
        link.click();
        document.body.removeChild(link);
        showNotification('数据导出成功', 'success');
    }, 1000);
}

// 清理旧缓存
function clearOldCache() {
    const currentTime = new Date().getTime();
    const cacheExpiry = 2 * 60 * 60 * 1000; // 2小时过期
    
    for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key.startsWith('data_')) {
            try {
                const cacheTimeKey = `time_${key}`;
                const cacheTime = parseInt(sessionStorage.getItem(cacheTimeKey) || '0');
                
                if (currentTime - cacheTime > cacheExpiry) {
                    sessionStorage.removeItem(key);
                    sessionStorage.removeItem(cacheTimeKey);
                    console.log(`已清理过期缓存: ${key}`);
                }
            } catch (e) {
                console.error('缓存清理错误:', e);
            }
        }
    }
}

// 存储图表的初始数据
let initialChartData = {};

// 初始化仪表板图表
function initDashboardCharts() {
    return new Promise((resolve, reject) => {
        try {
            // 健康状况分布饼图
            const healthStatusCtx = document.getElementById('healthStatusChart').getContext('2d');
            const healthStatusChart = new Chart(healthStatusCtx, {
                type: 'pie',
                data: {
                    labels: ['健康', '存在风险', '慢性疾病', '残障'],
                    datasets: [{
                        data: [78.5, 10.8, 8.2, 2.5],
                        backgroundColor: [
                            '#28a745',
                            '#ffc107',
                            '#fd7e14',
                            '#dc3545'
                        ],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    aspectRatio: 1.5,
                    plugins: {
                        legend: {
                            position: 'right'
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.raw || 0;
                                    return `${label}: ${value}% (${Math.round(value * 245.38)}人)`;
                                }
                            }
                        }
                    }
                }
            });
            
            // 保存初始数据
            initialChartData['healthStatusChart'] = JSON.parse(JSON.stringify(healthStatusChart.data));
            
            // 年龄段分布条形图
            const ageDistributionCtx = document.getElementById('ageDistributionChart').getContext('2d');
            const ageDistributionChart = new Chart(ageDistributionCtx, {
                type: 'bar',
                data: {
                    labels: ['0-1岁', '1-3岁', '3-6岁', '6-12岁', '12-18岁'],
                    datasets: [{
                        label: '儿童数量',
                        data: [2850, 4120, 5340, 7680, 4548],
                        backgroundColor: '#0d6efd',
                        borderWidth: 0,
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    aspectRatio: 1.5,
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: '人数'
                            },
                            ticks: {
                                callback: function(value) {
                                    return value >= 1000 ? value/1000 + 'k' : value;
                                }
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: '年龄段'
                            }
                        }
                    },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.dataset.label || '';
                                    const value = context.raw || 0;
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = Math.round((value / total) * 100);
                                    return `${label}: ${value.toLocaleString()}人 (${percentage}%)`;
                                }
                            }
                        }
                    }
                }
            });
            
            // 保存初始数据
            initialChartData['ageDistributionChart'] = JSON.parse(JSON.stringify(ageDistributionChart.data));
            
            resolve();
        } catch (error) {
            console.error('初始化仪表板图表失败:', error);
            reject(error);
        }
    });
}

// 初始化人口统计图表
function initPopulationCharts() {
    const populationCtx = document.getElementById('populationDistributionChart').getContext('2d');
    const populationChart = new Chart(populationCtx, {
        type: 'doughnut',
        data: {
            labels: ['城市', '农村', '城乡结合部'],
            datasets: [{
                data: [62, 31, 7],
                backgroundColor: [
                    '#0d6efd',
                    '#20c997',
                    '#6f42c1'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1.5,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
    
    // 保存初始数据
    initialChartData['populationDistributionChart'] = JSON.parse(JSON.stringify(populationChart.data));
}

// 初始化生长发育图表
function initGrowthCharts() {
    const growthCtx = document.getElementById('growthChart').getContext('2d');
    const growthChart = new Chart(growthCtx, {
        type: 'line',
        data: {
            labels: ['0-1岁', '1-3岁', '3-6岁', '6-12岁', '12-18岁'],
            datasets: [
                {
                    label: '身高标准',
                    data: [75, 92, 110, 140, 165],
                    borderColor: '#0d6efd',
                    backgroundColor: 'rgba(13, 110, 253, 0.1)',
                    fill: false,
                    tension: 0.4
                },
                {
                    label: '体重标准',
                    data: [9.5, 14, 19, 35, 55],
                    borderColor: '#198754',
                    backgroundColor: 'rgba(25, 135, 84, 0.1)',
                    fill: false,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1.5,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
    
    // 保存初始数据
    initialChartData['growthChart'] = JSON.parse(JSON.stringify(growthChart.data));
}

// 初始化营养状况图表
function initNutritionCharts() {
    const nutritionCtx = document.getElementById('nutritionChart').getContext('2d');
    const nutritionChart = new Chart(nutritionCtx, {
        type: 'radar',
        data: {
            labels: ['合理饮食', '营养平衡', '肥胖', '消瘦', '缺铁性贫血', '维生素D缺乏'],
            datasets: [
                {
                    label: '当前状况',
                    data: [68, 72, 15.6, 7.2, 12.3, 18.7],
                    backgroundColor: 'rgba(13, 110, 253, 0.2)',
                    borderColor: 'rgba(13, 110, 253, 1)',
                    pointBackgroundColor: 'rgba(13, 110, 253, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(13, 110, 253, 1)'
                },
                {
                    label: '目标状况',
                    data: [85, 90, 5, 3, 5, 8],
                    backgroundColor: 'rgba(25, 135, 84, 0.2)',
                    borderColor: 'rgba(25, 135, 84, 1)',
                    pointBackgroundColor: 'rgba(25, 135, 84, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(25, 135, 84, 1)'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1.5,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
    
    // 保存初始数据
    initialChartData['nutritionChart'] = JSON.parse(JSON.stringify(nutritionChart.data));
}

// 初始化免疫与疾病图表
function initImmunityCharts() {
    // 免疫接种情况
    const immunizationCtx = document.getElementById('immunizationChart').getContext('2d');
    const immunizationChart = new Chart(immunizationCtx, {
        type: 'bar',
        data: {
            labels: ['卡介苗', '乙肝疫苗', '脊灰疫苗', '百白破疫苗', '麻风疫苗', '流感疫苗'],
            datasets: [{
                label: '接种率 (%)',
                data: [99.1, 95.8, 98.3, 94.6, 96.2, 45.7],
                backgroundColor: '#0d6efd',
                borderWidth: 0,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1.5,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
    
    // 保存初始数据
    initialChartData['immunizationChart'] = JSON.parse(JSON.stringify(immunizationChart.data));
    
    // 疾病患病率
    const diseaseCtx = document.getElementById('diseaseChart').getContext('2d');
    const diseaseChart = new Chart(diseaseCtx, {
        type: 'polarArea',
        data: {
            labels: ['呼吸道疾病', '过敏性疾病', '龋齿', '视力不良', '消化系统疾病', '心理健康问题'],
            datasets: [{
                data: [32.4, 18.5, 43.2, 56.7, 12.8, 20.7],
                backgroundColor: [
                    'rgba(13, 110, 253, 0.7)',
                    'rgba(255, 193, 7, 0.7)',
                    'rgba(220, 53, 69, 0.7)',
                    'rgba(111, 66, 193, 0.7)',
                    'rgba(32, 201, 151, 0.7)',
                    'rgba(253, 126, 20, 0.7)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1.5,
            scales: {
                r: {
                    max: 60,
                    beginAtZero: true
                }
            }
        }
    });
    
    // 保存初始数据
    initialChartData['diseaseChart'] = JSON.parse(JSON.stringify(diseaseChart.data));
}

// 初始化发展与心理图表
function initDevelopmentCharts() {
    const developmentCtx = document.getElementById('developmentChart').getContext('2d');
    const developmentChart = new Chart(developmentCtx, {
        type: 'radar',
        data: {
            labels: ['身体发展', '认知发展', '语言发展', '情感发展', '社交发展', '心理健康'],
            datasets: [
                {
                    label: '0-3岁',
                    data: [92, 90, 87, 85, 89, 88],
                    fill: true,
                    backgroundColor: 'rgba(255, 193, 7, 0.2)',
                    borderColor: 'rgb(255, 193, 7)',
                    pointBackgroundColor: 'rgb(255, 193, 7)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgb(255, 193, 7)'
                },
                {
                    label: '3-6岁',
                    data: [88, 86, 85, 82, 86, 84],
                    fill: true,
                    backgroundColor: 'rgba(13, 110, 253, 0.2)',
                    borderColor: 'rgb(13, 110, 253)',
                    pointBackgroundColor: 'rgb(13, 110, 253)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgb(13, 110, 253)'
                },
                {
                    label: '6-12岁',
                    data: [85, 82, 83, 79, 80, 78],
                    fill: true,
                    backgroundColor: 'rgba(25, 135, 84, 0.2)',
                    borderColor: 'rgb(25, 135, 84)',
                    pointBackgroundColor: 'rgb(25, 135, 84)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgb(25, 135, 84)'
                },
                {
                    label: '12-18岁',
                    data: [83, 80, 81, 73, 76, 72],
                    fill: true,
                    backgroundColor: 'rgba(220, 53, 69, 0.2)',
                    borderColor: 'rgb(220, 53, 69)',
                    pointBackgroundColor: 'rgb(220, 53, 69)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgb(220, 53, 69)'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1.5,
            elements: {
                line: {
                    borderWidth: 3
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
    
    // 保存初始数据
    initialChartData['developmentChart'] = JSON.parse(JSON.stringify(developmentChart.data));
}

// 初始化服务可及图表
function initServiceCharts() {
    const serviceCtx = document.getElementById('healthServiceChart').getContext('2d');
    const serviceChart = new Chart(serviceCtx, {
        type: 'bar',
        data: {
            labels: ['城市', '县城', '乡镇', '偏远农村'],
            datasets: [
                {
                    label: '基础医疗服务可及性',
                    data: [96.5, 92.3, 85.6, 72.8],
                    backgroundColor: 'rgba(13, 110, 253, 0.7)',
                    borderWidth: 0,
                    borderRadius: 4
                },
                {
                    label: '专科医疗服务可及性',
                    data: [92.1, 84.5, 65.7, 42.3],
                    backgroundColor: 'rgba(220, 53, 69, 0.7)',
                    borderWidth: 0,
                    borderRadius: 4
                },
                {
                    label: '康复服务可及性',
                    data: [87.6, 76.3, 58.2, 35.1],
                    backgroundColor: 'rgba(25, 135, 84, 0.7)',
                    borderWidth: 0,
                    borderRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 1.5,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: '百分比 (%)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: '地区类型'
                    }
                }
            }
        }
    });
    
    // 保存初始数据
    initialChartData['healthServiceChart'] = JSON.parse(JSON.stringify(serviceChart.data));
}

// 根据筛选条件更新仪表板图表
function updateDashboardCharts(dashboardData) {
    // 更新健康状况分布饼图
    const healthStatusChart = Chart.getChart('healthStatusChart');
    if (healthStatusChart && dashboardData.healthStatusData) {
        healthStatusChart.data.datasets[0].data = dashboardData.healthStatusData;
        healthStatusChart.update();
    }
    
    // 更新年龄分布图
    const ageDistributionChart = Chart.getChart('ageDistributionChart');
    if (ageDistributionChart && dashboardData.ageDistributionData) {
        ageDistributionChart.data.datasets[0].data = dashboardData.ageDistributionData;
        ageDistributionChart.update();
    }
    
    // 更新仪表板摘要数据
    updateDashboardSummary(dashboardData);
}

// 更新仪表板摘要数据
function updateDashboardSummary(dashboardData) {
    if (!dashboardData) return;
    
    // 计算总人数
    const totalChildren = dashboardData.ageDistributionData ? 
        dashboardData.ageDistributionData.reduce((sum, val) => sum + val, 0) : 0;
    
    // 更新总人数显示
    const totalChildrenElement = document.getElementById('totalChildren');
    if (totalChildrenElement) {
        totalChildrenElement.textContent = totalChildren.toLocaleString();
    }
    
    // 计算健康儿童比例
    const healthyPercentage = dashboardData.healthStatusData ? 
        dashboardData.healthStatusData[0] : 0;
    
    // 更新健康儿童比例显示
    const healthyPercentageElement = document.getElementById('healthyPercentage');
    if (healthyPercentageElement) {
        healthyPercentageElement.textContent = `${healthyPercentage}%`;
    }
    
    // 更新其他摘要数据
    // ...
}

// 根据筛选条件更新各部分图表
function updateSectionCharts(sectionData) {
    if (!sectionData) return;
    
    Object.keys(sectionData).forEach(chartId => {
        const chart = Chart.getChart(chartId);
        if (chart && sectionData[chartId]) {
            // 更新数据集
            sectionData[chartId].datasets.forEach((newDataset, datasetIndex) => {
                if (chart.data.datasets[datasetIndex] && Array.isArray(newDataset.data)) {
                    chart.data.datasets[datasetIndex].data = newDataset.data;
                }
            });
            
            // 更新图表
            chart.update();
        }
    });
}

// 初始化人口与背景页面额外的图表
function initPopulationExtraCharts() {
    return new Promise((resolve, reject) => {
        try {
            // 人口趋势分析图表
            if (document.getElementById('populationTrendChart')) {
                const populationTrendCtx = document.getElementById('populationTrendChart').getContext('2d');
                const populationTrendChart = new Chart(populationTrendCtx, {
                    type: 'line',
                    data: {
                        labels: ['2018', '2019', '2020', '2021', '2022', '2023'],
                        datasets: [{
                            label: '儿童总数',
                            data: [26120, 25840, 25390, 25010, 24780, 24538],
                            borderColor: '#0d6efd',
                            backgroundColor: 'rgba(13, 110, 253, 0.1)',
                            tension: 0.3,
                            fill: true
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: true,
                        aspectRatio: 2.5,
                        scales: {
                            y: {
                                beginAtZero: false,
                                title: {
                                    display: true,
                                    text: '人数'
                                }
                            },
                            x: {
                                title: {
                                    display: true,
                                    text: '年份'
                                }
                            }
                        }
                    }
                });
                initialChartData['populationTrendChart'] = JSON.parse(JSON.stringify(populationTrendChart.data));
            }
            
            // 家庭结构分析图表
            if (document.getElementById('familyStructureChart')) {
                const familyStructureCtx = document.getElementById('familyStructureChart').getContext('2d');
                const familyStructureChart = new Chart(familyStructureCtx, {
                    type: 'pie',
                    data: {
                        labels: ['核心家庭', '大家庭', '单亲家庭', '重组家庭', '其他'],
                        datasets: [{
                            data: [65.7, 12.8, 15.3, 4.2, 2.0],
                            backgroundColor: [
                                '#0d6efd',
                                '#20c997',
                                '#fd7e14',
                                '#6f42c1',
                                '#adb5bd'
                            ],
                            borderWidth: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: true,
                        aspectRatio: 1.5,
                        plugins: {
                            legend: {
                                position: 'right'
                            }
                        }
                    }
                });
                initialChartData['familyStructureChart'] = JSON.parse(JSON.stringify(familyStructureChart.data));
            }
            
            // 区域分布热点图表（用柱状图替代热图）
            if (document.getElementById('regionHeatmapChart')) {
                const regionHeatmapCtx = document.getElementById('regionHeatmapChart').getContext('2d');
                const regionHeatmapChart = new Chart(regionHeatmapCtx, {
                    type: 'bar',
                    data: {
                        labels: ['城市中心区', '城市郊区', '县城', '中心镇', '普通乡镇', '偏远地区'],
                        datasets: [{
                            label: '儿童人口密度',
                            data: [38.4, 29.5, 14.2, 9.6, 5.8, 2.5],
                            backgroundColor: '#0d6efd',
                            borderWidth: 0,
                            borderRadius: 4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: true,
                        aspectRatio: 1.5,
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: {
                                    display: true,
                                    text: '百分比 (%)'
                                }
                            }
                        }
                    }
                });
                initialChartData['regionHeatmapChart'] = JSON.parse(JSON.stringify(regionHeatmapChart.data));
            }
            
            resolve();
        } catch (error) {
            console.error('初始化人口与背景额外图表失败:', error);
            reject(error);
        }
    });
}

// 初始化生长发育页面额外的图表
function initGrowthExtraCharts() {
    return new Promise((resolve, reject) => {
        try {
            // 生长发育趋势图表
            if (document.getElementById('growthTrendChart')) {
                const growthTrendCtx = document.getElementById('growthTrendChart').getContext('2d');
                const growthTrendChart = new Chart(growthTrendCtx, {
                    type: 'line',
                    data: {
                        labels: ['2018', '2019', '2020', '2021', '2022', '2023'],
                        datasets: [
                            {
                                label: '身高达标率',
                                data: [87.8, 88.3, 88.9, 89.2, 89.5, 89.7],
                                borderColor: '#0d6efd',
                                backgroundColor: 'transparent',
                                tension: 0.3
                            },
                            {
                                label: '体重达标率',
                                data: [83.5, 84.1, 84.8, 85.3, 85.9, 86.4],
                                borderColor: '#20c997',
                                backgroundColor: 'transparent',
                                tension: 0.3
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: true,
                        aspectRatio: 2.5,
                        scales: {
                            y: {
                                beginAtZero: false,
                                min: 80,
                                max: 100,
                                title: {
                                    display: true,
                                    text: '百分比 (%)'
                                }
                            },
                            x: {
                                title: {
                                    display: true,
                                    text: '年份'
                                }
                            }
                        }
                    }
                });
                initialChartData['growthTrendChart'] = JSON.parse(JSON.stringify(growthTrendChart.data));
            }
            
            // 身高百分位曲线
            if (document.getElementById('heightPercentileChart')) {
                const heightPercentileCtx = document.getElementById('heightPercentileChart').getContext('2d');
                const heightPercentileChart = new Chart(heightPercentileCtx, {
                    type: 'line',
                    data: {
                        labels: ['0岁', '1岁', '2岁', '3岁', '4岁', '5岁', '6岁', '7岁'],
                        datasets: [
                            {
                                label: '3%',
                                data: [45, 70, 80, 90, 95, 100, 105, 110],
                                borderColor: '#dc3545',
                                backgroundColor: 'transparent',
                                borderWidth: 1,
                                borderDash: [5, 5]
                            },
                            {
                                label: '50%',
                                data: [50, 75, 85, 95, 103, 110, 116, 122],
                                borderColor: '#0d6efd',
                                backgroundColor: 'transparent',
                                borderWidth: 2
                            },
                            {
                                label: '97%',
                                data: [55, 80, 92, 102, 110, 118, 125, 132],
                                borderColor: '#dc3545',
                                backgroundColor: 'transparent',
                                borderWidth: 1,
                                borderDash: [5, 5]
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: true,
                        aspectRatio: 1.5,
                        scales: {
                            y: {
                                title: {
                                    display: true,
                                    text: '身高 (cm)'
                                }
                            }
                        }
                    }
                });
                initialChartData['heightPercentileChart'] = JSON.parse(JSON.stringify(heightPercentileChart.data));
            }
            
            // 体重百分位曲线
            if (document.getElementById('weightPercentileChart')) {
                const weightPercentileCtx = document.getElementById('weightPercentileChart').getContext('2d');
                const weightPercentileChart = new Chart(weightPercentileCtx, {
                    type: 'line',
                    data: {
                        labels: ['0岁', '1岁', '2岁', '3岁', '4岁', '5岁', '6岁', '7岁'],
                        datasets: [
                            {
                                label: '3%',
                                data: [2.5, 7.5, 9.5, 11.5, 13, 14.5, 16, 17.5],
                                borderColor: '#dc3545',
                                backgroundColor: 'transparent',
                                borderWidth: 1,
                                borderDash: [5, 5]
                            },
                            {
                                label: '50%',
                                data: [3.5, 9, 11.5, 14, 16, 18, 20, 22],
                                borderColor: '#0d6efd',
                                backgroundColor: 'transparent',
                                borderWidth: 2
                            },
                            {
                                label: '97%',
                                data: [4.5, 11, 14, 17, 20, 23, 26, 29],
                                borderColor: '#dc3545',
                                backgroundColor: 'transparent',
                                borderWidth: 1,
                                borderDash: [5, 5]
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: true,
                        aspectRatio: 1.5,
                        scales: {
                            y: {
                                title: {
                                    display: true,
                                    text: '体重 (kg)'
                                }
                            }
                        }
                    }
                });
                initialChartData['weightPercentileChart'] = JSON.parse(JSON.stringify(weightPercentileChart.data));
            }
            
            // 城乡生长发育差异
            if (document.getElementById('urbanRuralGrowthChart')) {
                const urbanRuralGrowthCtx = document.getElementById('urbanRuralGrowthChart').getContext('2d');
                const urbanRuralGrowthChart = new Chart(urbanRuralGrowthCtx, {
                    type: 'bar',
                    data: {
                        labels: ['身高达标率', '体重达标率', 'BMI正常率', '头围正常率'],
                        datasets: [
                            {
                                label: '城市',
                                data: [91.2, 87.8, 84.5, 96.3],
                                backgroundColor: '#0d6efd',
                                borderWidth: 0,
                                borderRadius: 4
                            },
                            {
                                label: '农村',
                                data: [87.5, 84.2, 79.3, 94.8],
                                backgroundColor: '#20c997',
                                borderWidth: 0,
                                borderRadius: 4
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: true,
                        aspectRatio: 1.5,
                        scales: {
                            y: {
                                beginAtZero: true,
                                max: 100,
                                title: {
                                    display: true,
                                    text: '百分比 (%)'
                                }
                            }
                        }
                    }
                });
                initialChartData['urbanRuralGrowthChart'] = JSON.parse(JSON.stringify(urbanRuralGrowthChart.data));
            }
            
            // BMI分布情况
            if (document.getElementById('bmiDistributionChart')) {
                const bmiDistributionCtx = document.getElementById('bmiDistributionChart').getContext('2d');
                const bmiDistributionChart = new Chart(bmiDistributionCtx, {
                    type: 'pie',
                    data: {
                        labels: ['消瘦', '正常', '超重', '肥胖'],
                        datasets: [{
                            data: [7.2, 75.1, 12.3, 5.4],
                            backgroundColor: [
                                '#fd7e14',
                                '#20c997',
                                '#ffc107',
                                '#dc3545'
                            ],
                            borderWidth: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: true,
                        aspectRatio: 1.5,
                        plugins: {
                            legend: {
                                position: 'right'
                            }
                        }
                    }
                });
                initialChartData['bmiDistributionChart'] = JSON.parse(JSON.stringify(bmiDistributionChart.data));
            }
            
            resolve();
        } catch (error) {
            console.error('初始化生长发育额外图表失败:', error);
            reject(error);
        }
    });
}