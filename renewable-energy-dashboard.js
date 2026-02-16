// Renewable Energy Dashboard Component
class RenewableEnergyDashboard {
    constructor() {
        this.energyData = [];
        this.viewMode = 'combined'; // 'solar', 'wind', or 'combined'
        this.isExpanded = true;
        this.showTop10Only = false;
        this.lastUpdated = new Date();
        this.updateInterval = null;

        this.init();
    }

    init() {
        this.createDashboard();
        this.updateData();
        this.startAutoRefresh();
    }

    createDashboard() {
        const dashboardHTML = `
            <div id="renewable-dashboard" class="fixed top-8 left-1/2 -translate-x-1/2 z-50 font-sans" style="font-family: 'Plus Jakarta Sans', sans-serif;">
                <!-- Compact Header when collapsed -->
                <button id="dashboard-expand-btn" class="hidden bg-gradient-to-r from-amber-600 to-amber-500 text-white px-4 py-2 rounded-lg shadow-2xl hover:shadow-amber-500/50 transition-all duration-300 flex items-center gap-2 group">
                    <span class="text-xl">🌍</span>
                    <span class="font-semibold">Yenilenebilir Enerji</span>
                    <span class="text-xs opacity-75 group-hover:opacity-100">Göster▼</span>
                </button>

                <!-- Expanded Dashboard -->
                <div id="dashboard-panel" class="bg-gradient-to-br from-slate-900/50 to-slate-800/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-amber-500/20 overflow-hidden max-w-md" style="animation: slideIn 0.3s ease-out;">
                    <!-- Header -->
                    <div class="bg-gradient-to-r from-amber-600 to-amber-500 px-4 py-3 flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <span class="text-2xl">🌍</span>
                            <div>
                                <h3 class="text-white font-bold text-sm">Yenilenebilir Enerji</h3>
                                <p class="text-amber-100 text-xs">En Büyük 20 Ülke</p>
                            </div>
                        </div>
                        <button id="dashboard-collapse-btn" class="text-white hover:bg-white/20 rounded-lg p-1 transition-colors">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <!-- Controls -->
                    <div class="px-4 py-3 bg-slate-800/20 border-b border-slate-700/20">
                        <div class="flex flex-wrap gap-2 mb-2">
                            <button data-view="combined" class="view-btn px-3 py-1 rounded-lg text-xs font-medium transition-all bg-amber-600 text-white shadow-lg">Tümü</button>
                            <button data-view="solar" class="view-btn px-3 py-1 rounded-lg text-xs font-medium transition-all bg-slate-700 text-slate-300 hover:bg-slate-600">☀️ Güneş</button>
                            <button data-view="wind" class="view-btn px-3 py-1 rounded-lg text-xs font-medium transition-all bg-slate-700 text-slate-300 hover:bg-slate-600">💨 Rüzgar</button>
                        </div>
                        <div class="flex items-center justify-between">
                            <button id="toggle-top10" class="text-xs text-amber-400 hover:text-amber-300 transition-colors">İlk 10'u Göster</button>
                            <span id="last-updated" class="text-xs text-slate-400">⟳ ${this.formatTime(this.lastUpdated)}</span>
                        </div>
                    </div>

                    <!-- Country List -->
                    <div id="country-list" class="max-h-96 overflow-y-auto custom-scrollbar px-4 py-2 space-y-2"></div>

                    <!-- Footer -->
                    <div class="px-4 py-2 bg-slate-800/20 border-t border-slate-700/20">
                        <p class="text-xs text-slate-400 text-center">Anlık veriler • <span id="country-count">20</span> ülke izleniyor</p>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', dashboardHTML);
        this.attachEventListeners();
    }

    attachEventListeners() {
        // Collapse/Expand
        document.getElementById('dashboard-collapse-btn').addEventListener('click', () => this.collapse());
        document.getElementById('dashboard-expand-btn').addEventListener('click', () => this.expand());

        // View mode buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.viewMode = e.target.dataset.view;
                this.updateViewButtons();
                this.renderCountries();
            });
        });

        // Top 10 toggle
        document.getElementById('toggle-top10').addEventListener('click', () => {
            this.showTop10Only = !this.showTop10Only;
            document.getElementById('toggle-top10').textContent =
                this.showTop10Only ? 'Tümünü Göster (20)' : 'İlk 10\'u Göster';
            this.renderCountries();
        });
    }

    collapse() {
        document.getElementById('dashboard-panel').classList.add('hidden');
        document.getElementById('dashboard-expand-btn').classList.remove('hidden');
        this.isExpanded = false;
    }

    expand() {
        document.getElementById('dashboard-panel').classList.remove('hidden');
        document.getElementById('dashboard-expand-btn').classList.add('hidden');
        this.isExpanded = true;
    }

    updateViewButtons() {
        document.querySelectorAll('.view-btn').forEach(btn => {
            const view = btn.dataset.view;
            if (view === this.viewMode) {
                btn.className = 'view-btn px-3 py-1 rounded-lg text-xs font-medium transition-all';
                if (view === 'solar') {
                    btn.className += ' bg-yellow-600 text-white shadow-lg';
                } else if (view === 'wind') {
                    btn.className += ' bg-blue-600 text-white shadow-lg';
                } else {
                    btn.className += ' bg-amber-600 text-white shadow-lg';
                }
            } else {
                btn.className = 'view-btn px-3 py-1 rounded-lg text-xs font-medium transition-all bg-slate-700 text-slate-300 hover:bg-slate-600';
            }
        });
    }

    updateData() {
        this.energyData = renewableEnergyData.getEnergyData();
        this.lastUpdated = new Date();
        document.getElementById('last-updated').textContent = `⟳ ${this.formatTime(this.lastUpdated)}`;
        this.renderCountries();
    }

    renderCountries() {
        const displayData = this.showTop10Only ? this.energyData.slice(0, 10) : this.energyData;
        const countryList = document.getElementById('country-list');

        const maxSolar = Math.max(...this.energyData.map(d => d.solar.capacity));
        const maxWind = Math.max(...this.energyData.map(d => d.wind.capacity));

        countryList.innerHTML = displayData.map((country, index) => {
            const solarPercent = (country.solar.capacity / maxSolar) * 100;
            const windPercent = (country.wind.capacity / maxWind) * 100;

            let content = `
                <div class="bg-slate-800/10 hover:bg-slate-700/30 rounded-lg p-3 transition-all duration-300 border border-slate-700/10 hover:border-amber-500/30" style="animation: fadeIn 0.3s ease-out ${index * 0.03}s backwards;">
                    <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center gap-2">
                            <span class="text-lg">${country.flag}</span>
                            <span class="font-semibold text-sm text-white">${country.country}</span>
                            <span class="text-xs bg-amber-600/30 text-amber-300 px-1.5 py-0.5 rounded">#${country.rank}</span>
                        </div>
                    </div>
            `;

            if (this.viewMode === 'combined' || this.viewMode === 'solar') {
                content += `
                    <div class="mb-2">
                        <div class="flex items-center justify-between mb-1">
                            <span class="text-xs text-yellow-400 flex items-center gap-1">☀️ Güneş</span>
                            <span class="text-xs font-mono text-yellow-300">${renewableEnergyData.formatCapacity(country.solar.capacity, 'solar')}</span>
                        </div>
                        <div class="w-full bg-slate-800/50 rounded-full h-2 overflow-hidden">
                            <div class="h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-yellow-500 to-orange-500" style="width: ${solarPercent}%"></div>
                        </div>
                    </div>
                `;
            }

            if (this.viewMode === 'combined' || this.viewMode === 'wind') {
                content += `
                    <div>
                        <div class="flex items-center justify-between mb-1">
                            <span class="text-xs text-blue-400 flex items-center gap-1">💨 Rüzgar</span>
                            <span class="text-xs font-mono text-blue-300">${renewableEnergyData.formatCapacity(country.wind.capacity, 'wind')}</span>
                        </div>
                        <div class="w-full bg-slate-800/50 rounded-full h-2 overflow-hidden">
                            <div class="h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-blue-500 to-cyan-500" style="width: ${windPercent}%"></div>
                        </div>
                    </div>
                `;
            }

            content += '</div>';
            return content;
        }).join('');

        document.getElementById('country-count').textContent = displayData.length;
    }

    startAutoRefresh() {
        this.updateInterval = setInterval(() => {
            this.updateData();
        }, 45000); // Update every 45 seconds
    }

    formatTime(date) {
        return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    }
}

// Initialize dashboard after DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new RenewableEnergyDashboard();
    });
} else {
    new RenewableEnergyDashboard();
}
