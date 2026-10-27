// Energy Dashboard - World Daily Renewable Energy Production
// Based on IEA/IRENA 2025 annual data scaled to daily estimates

(function() {
    // 2025 Global Renewable Energy Annual Data (TWh/year) - IEA World Energy Outlook estimates
    const annualData = {
        solar: 2300,    // ~2,300 TWh/year (2025 est.)
        wind: 2600,     // ~2,600 TWh/year
        hydro: 4400,    // ~4,400 TWh/year
        bio: 800        // ~800 TWh/year (biomass, geothermal, etc.)
    };

    // Convert to daily (divide by 365) with slight randomness for "live" feel
    function getDailyData() {
        const jitter = () => 0.95 + Math.random() * 0.1; // ±5% variation
        return {
            solar: (annualData.solar / 365 * jitter()).toFixed(1),
            wind: (annualData.wind / 365 * jitter()).toFixed(1),
            hydro: (annualData.hydro / 365 * jitter()).toFixed(1),
            bio: (annualData.bio / 365 * jitter()).toFixed(1)
        };
    }

    function updateDashboard() {
        const data = getDailyData();
        const total = (parseFloat(data.solar) + parseFloat(data.wind) + parseFloat(data.hydro) + parseFloat(data.bio)).toFixed(1);

        // Cards
        const solarEl = document.getElementById('solar-output');
        const windEl = document.getElementById('wind-output');
        const hydroEl = document.getElementById('hydro-output');
        const totalEl = document.getElementById('total-output');

        if (solarEl) solarEl.textContent = data.solar;
        if (windEl) windEl.textContent = data.wind;
        if (hydroEl) hydroEl.textContent = data.hydro;
        if (totalEl) totalEl.textContent = total;

        // Percentages
        const solarPct = ((parseFloat(data.solar) / total) * 100).toFixed(1);
        const windPct = ((parseFloat(data.wind) / total) * 100).toFixed(1);
        const hydroPct = ((parseFloat(data.hydro) / total) * 100).toFixed(1);
        const bioPct = ((parseFloat(data.bio) / total) * 100).toFixed(1);

        const sPct = document.getElementById('solar-pct');
        const wPct = document.getElementById('wind-pct');
        const hPct = document.getElementById('hydro-pct');
        const bPct = document.getElementById('bio-pct');

        if (sPct) sPct.textContent = solarPct + '%';
        if (wPct) wPct.textContent = windPct + '%';
        if (hPct) hPct.textContent = hydroPct + '%';
        if (bPct) bPct.textContent = bioPct + '%';

        // Bars
        const sBar = document.getElementById('solar-bar');
        const wBar = document.getElementById('wind-bar');
        const hBar = document.getElementById('hydro-bar');
        const bBar = document.getElementById('bio-bar');

        if (sBar) sBar.style.width = solarPct + '%';
        if (wBar) wBar.style.width = windPct + '%';
        if (hBar) hBar.style.width = hydroPct + '%';
        if (bBar) bBar.style.width = bioPct + '%';

        // Date
        const dateEl = document.getElementById('dashboard-date');
        if (dateEl) {
            const now = new Date();
            const options = { day: 'numeric', month: 'long', year: 'numeric' };
            dateEl.textContent = now.toLocaleDateString('tr-TR', options);
        }
    }

    // Run on load
    document.addEventListener('DOMContentLoaded', () => {
        // Small delay for animation effect
        setTimeout(updateDashboard, 500);

        // Refresh every 30 seconds for "live" feel
        setInterval(updateDashboard, 30000);
    });
})();
