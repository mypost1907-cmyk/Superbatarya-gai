// Renewable Energy Dashboard Component - Embedded Section Version
class RenewableEnergyDashboard {
    constructor() {
        this.energyData = [];
        this.viewMode = 'combined'; // 'solar', 'wind', or 'combined'
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
            <div id="renewable-dashboard" class="w-full font-sans" style="font-family: 'Plus Jakarta Sans', sans-serif;">
                <div id="dashboard-panel" class="bg-dark border border-amber-500/20 rounded-3xl p-6 lg:p-10 shadow-2xl overflow-hidden">
                    <!-- Header -->
                    <div class="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-white/5 gap-4">
                        <div class="flex items-center gap-3">
                            <span class="text-3xl">🌍</span>
                            <div>
                                <h3 class="text-white font-display font-bold text-xl lg:text-2xl">Dünya Lideri Ülkeler</h3>
                                <p class="text-amber-500/80 text-xs font-semibold uppercase tracking-wider">En Büyük 20 Ülkenin Yenilenebilir Enerji Kapasitesi</p>
                            </div>
                        </div>

                        <!-- Controls -->
                        <div class="flex flex-wrap items-center gap-2">
                            <div class="flex bg-dark-card border border-white/10 rounded-xl p-1 gap-1">
                                <button data-view="combined" class="view-btn px-4 py-1.5 rounded-lg text-xs font-bold transition-all bg-amber-500 text-dark shadow-lg">Tümü</button>
                                <button data-view="solar" class="view-btn px-4 py-1.5 rounded-lg text-xs font-bold transition-all bg-transparent text-gray-400 hover:text-white">☀️ Güneş</button>
                                <button data-view="wind" class="view-btn px-4 py-1.5 rounded-lg text-xs font-bold transition-all bg-transparent text-gray-400 hover:text-white">💨 Rüzgar</button>
                            </div>
                            <button id="toggle-top10" class="px-4 py-1.5 text-xs font-semibold rounded-xl border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 transition-colors">İlk 10'u Göster</button>
                            <span id="last-updated" class="text-xs text-gray-500 font-mono ml-2">⟳ ${this.formatTime(this.lastUpdated)}</span>
                        </div>
                    </div>

                    <!-- Country List Grid -->
                    <div id="country-list" class="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2 mt-6"></div>

                    <!-- Footer -->
                    <div class="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-500">
                        <p>Anlık kurulu güç ve üretim verileri • <span id="country-count" class="text-amber-400 font-bold">20</span> ülke izleniyor</p>
                        <p class="text-[10px]">Kaynak: IRENA & Uluslararası Enerji Ajansı (IEA)</p>
                    </div>
                </div>
            </div>
        `;

        const mount = document.getElementById('renewable-dashboard-mount');
        if (mount) {
            mount.innerHTML = dashboardHTML;
        } else {
            const dashboardSection = document.getElementById('energy-dashboard');
            if (dashboardSection) {
                const container = dashboardSection.querySelector('.max-w-7xl') || dashboardSection;
                container.insertAdjacentHTML('beforeend', dashboardHTML);
            } else {
                document.body.insertAdjacentHTML('beforeend', dashboardHTML);
            }
        }

        this.attachEventListeners();
    }

    attachEventListeners() {
        // View mode buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.viewMode = e.target.dataset.view;
                this.updateViewButtons();
                this.renderCountries();
            });
        });

        // Top 10 toggle
        const toggleBtn = document.getElementById('toggle-top10');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.showTop10Only = !this.showTop10Only;
                toggleBtn.textContent = this.showTop10Only ? 'Tümünü Göster (20)' : 'İlk 10\'u Göster';
                this.renderCountries();
            });
        }
    }

    updateViewButtons() {
        document.querySelectorAll('.view-btn').forEach(btn => {
            const view = btn.dataset.view;
            if (view === this.viewMode) {
                btn.className = 'view-btn px-4 py-1.5 rounded-lg text-xs font-bold transition-all bg-amber-500 text-dark shadow-lg';
            } else {
                btn.className = 'view-btn px-4 py-1.5 rounded-lg text-xs font-bold transition-all bg-transparent text-gray-400 hover:text-white';
            }
        });
    }

    updateData() {
        if (typeof renewableEnergyData !== 'undefined' && renewableEnergyData.getEnergyData) {
            this.energyData = renewableEnergyData.getEnergyData();
        }
        this.lastUpdated = new Date();
        const updatedEl = document.getElementById('last-updated');
        if (updatedEl) {
            updatedEl.textContent = `⟳ ${this.formatTime(this.lastUpdated)}`;
        }
        this.renderCountries();
    }

    renderCountries() {
        if (!this.energyData || this.energyData.length === 0) return;

        const displayData = this.showTop10Only ? this.energyData.slice(0, 10) : this.energyData;
        const countryList = document.getElementById('country-list');
        if (!countryList) return;

        const maxSolar = Math.max(...this.energyData.map(d => d.solar.capacity));
        const maxWind = Math.max(...this.energyData.map(d => d.wind.capacity));

        countryList.innerHTML = displayData.map((country, index) => {
            const solarPercent = (country.solar.capacity / maxSolar) * 100;
            const windPercent = (country.wind.capacity / maxWind) * 100;

            let content = `
                <div class="bg-dark-card border border-white/5 hover:border-amber-500/30 rounded-2xl p-4 transition-all duration-300">
                    <div class="flex items-center justify-between mb-3">
                        <div class="flex items-center gap-2.5">
                            <span class="text-2xl">${country.flag}</span>
                            <span class="font-bold text-sm text-white">${country.country}</span>
                        </div>
                        <span class="text-xs font-black bg-amber-500/10 text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-500/20">#${country.rank}</span>
                    </div>
            `;

            if (this.viewMode === 'combined' || this.viewMode === 'solar') {
                content += `
                    <div class="mb-2.5">
                        <div class="flex items-center justify-between text-xs mb-1">
                            <span class="text-amber-400/90 font-medium flex items-center gap-1">☀️ Güneş</span>
                            <span class="font-mono font-bold text-amber-300">${renewableEnergyData.formatCapacity(country.solar.capacity, 'solar')}</span>
                        </div>
                        <div class="w-full bg-dark/60 rounded-full h-2 overflow-hidden border border-white/5">
                            <div class="h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]" style="width: ${solarPercent}%"></div>
                        </div>
                    </div>
                `;
            }

            if (this.viewMode === 'combined' || this.viewMode === 'wind') {
                content += `
                    <div>
                        <div class="flex items-center justify-between text-xs mb-1">
                            <span class="text-cyan-400/90 font-medium flex items-center gap-1">💨 Rüzgar</span>
                            <span class="font-mono font-bold text-cyan-300">${renewableEnergyData.formatCapacity(country.wind.capacity, 'wind')}</span>
                        </div>
                        <div class="w-full bg-dark/60 rounded-full h-2 overflow-hidden border border-white/5">
                            <div class="h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-cyan-600 to-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]" style="width: ${windPercent}%"></div>
                        </div>
                    </div>
                `;
            }

            content += '</div>';
            return content;
        }).join('');

        const countEl = document.getElementById('country-count');
        if (countEl) countEl.textContent = displayData.length;
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
