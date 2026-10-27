// Countries Renewable Energy Ranking
// Source: IRENA Renewable Capacity Statistics 2024 (Total installed GW)
const countriesData = [
    { rank: 1,  flag: '🇨🇳', name: 'Çin',          total: 3850, solar: 1640, wind: 1050, hydro: 420, other: 740 },
    { rank: 2,  flag: '🇺🇸', name: 'ABD',           total: 1430, solar: 430,  wind: 150,  hydro: 103, other: 747 },
    { rank: 3,  flag: '🇧🇷', name: 'Brezilya',      total: 260,  solar: 40,   wind: 28,   hydro: 109, other: 83  },
    { rank: 4,  flag: '🇩🇪', name: 'Almanya',       total: 250,  solar: 88,   wind: 69,   hydro: 5,   other: 88  },
    { rank: 5,  flag: '🇮🇳', name: 'Hindistan',     total: 238,  solar: 90,   wind: 45,   hydro: 47,  other: 56  },
    { rank: 6,  flag: '🇬🇧', name: 'İngiltere',     total: 168,  solar: 16,   wind: 30,   hydro: 2,   other: 120 },
    { rank: 7,  flag: '🇪🇸', name: 'İspanya',       total: 157,  solar: 28,   wind: 30,   hydro: 17,  other: 82  },
    { rank: 8,  flag: '🇫🇷', name: 'Fransa',        total: 130,  solar: 22,   wind: 22,   hydro: 25,  other: 61  },
    { rank: 9,  flag: '🇦🇺', name: 'Avustralya',    total: 115,  solar: 40,   wind: 12,   hydro: 9,   other: 54  },
    { rank: 10, flag: '🇯🇵', name: 'Japonya',       total: 108,  solar: 85,   wind: 5,    hydro: 10,  other: 8   },
    { rank: 11, flag: '🇮🇹', name: 'İtalya',        total: 104,  solar: 30,   wind: 12,   hydro: 22,  other: 40  },
    { rank: 12, flag: '🇨🇦', name: 'Kanada',        total: 102,  solar: 6,    wind: 15,   hydro: 81,  other: 0   },
    { rank: 13, flag: '🇰🇷', name: 'Güney Kore',    total: 85,   solar: 26,   wind: 2,    hydro: 2,   other: 55  },
    { rank: 14, flag: '🇳🇱', name: 'Hollanda',      total: 78,   solar: 24,   wind: 10,   hydro: 0,   other: 44  },
    { rank: 15, flag: '🇻🇳', name: 'Vietnam',       total: 76,   solar: 21,   wind: 5,    hydro: 22,  other: 28  },
    { rank: 16, flag: '🇲🇽', name: 'Meksika',       total: 70,   solar: 10,   wind: 8,    hydro: 14,  other: 38  },
    { rank: 17, flag: '🇸🇦', name: 'Suudi Arabistan', total: 66, solar: 12,  wind: 1,    hydro: 0,   other: 53  },
    { rank: 18, flag: '🇵🇱', name: 'Polonya',       total: 62,   solar: 18,   wind: 9,    hydro: 1,   other: 34  },
    { rank: 19, flag: '🇸🇪', name: 'İsveç',         total: 58,   solar: 4,    wind: 12,   hydro: 16,  other: 26  },
    { rank: 20, flag: '🇳🇴', name: 'Norveç',        total: 54,   solar: 2,    wind: 5,    hydro: 33,  other: 14  },
    { rank: 21, flag: '🇹🇷', name: 'Türkiye',       total: 52,   solar: 10,   wind: 11,   hydro: 31,  other: 0   },
    { rank: 22, flag: '🇿🇦', name: 'Güney Afrika',  total: 49,   solar: 8,    wind: 4,    hydro: 0,   other: 37  },
    { rank: 23, flag: '🇮🇩', name: 'Endonezya',     total: 46,   solar: 3,    wind: 1,    hydro: 6,   other: 36  },
    { rank: 24, flag: '🇧🇪', name: 'Belçika',       total: 44,   solar: 9,    wind: 6,    hydro: 0,   other: 29  },
    { rank: 25, flag: '🇦🇹', name: 'Avusturya',     total: 40,   solar: 8,    wind: 4,    hydro: 15,  other: 13  },
    { rank: 26, flag: '🇵🇹', name: 'Portekiz',      total: 38,   solar: 5,    wind: 7,    hydro: 8,   other: 18  },
    { rank: 27, flag: '🇩🇰', name: 'Danimarka',     total: 36,   solar: 4,    wind: 9,    hydro: 0,   other: 23  },
    { rank: 28, flag: '🇨🇱', name: 'Şili',          total: 34,   solar: 8,    wind: 4,    hydro: 7,   other: 15  },
    { rank: 29, flag: '🇬🇷', name: 'Yunanistan',    total: 32,   solar: 7,    wind: 5,    hydro: 3,   other: 17  },
    { rank: 30, flag: '🇮🇱', name: 'İsrail',        total: 30,   solar: 10,   wind: 1,    hydro: 0,   other: 19  },
];

const maxTotal = countriesData[0].total;

function showCountries(n) {
    // Update tab buttons
    [10, 20, 30].forEach(num => {
        const btn = document.getElementById('tab-' + num);
        if (!btn) return;
        if (num === n) {
            btn.className = 'px-4 py-2 rounded-xl text-sm font-bold bg-amber-500 text-dark transition-all';
        } else {
            btn.className = 'px-4 py-2 rounded-xl text-sm font-bold bg-dark-card text-gray-400 hover:text-white transition-all';
        }
    });

    const list = document.getElementById('countries-list');
    if (!list) return;

    const slice = countriesData.slice(0, n);
    list.innerHTML = slice.map(c => {
        const barPct = ((c.total / maxTotal) * 100).toFixed(1);
        const medal = c.rank === 1 ? '🥇' : c.rank === 2 ? '🥈' : c.rank === 3 ? '🥉' : `<span class="text-gray-500 font-bold text-sm w-6 inline-block text-center">${c.rank}</span>`;
        return `
        <div class="flex items-center gap-4 p-4 rounded-2xl bg-dark-card/40 hover:bg-dark-card/80 transition-all group">
            <div class="w-8 text-center text-lg flex-shrink-0">${medal}</div>
            <div class="text-2xl flex-shrink-0">${c.flag}</div>
            <div class="flex-1 min-w-0">
                <div class="flex justify-between items-center mb-1">
                    <span class="font-semibold text-white text-sm">${c.name}</span>
                    <span class="text-amber-400 font-black text-sm ml-2 flex-shrink-0">${c.total.toLocaleString()} GW</span>
                </div>
                <div class="h-2 bg-dark rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-700" style="width:${barPct}%"></div>
                </div>
                <div class="flex gap-3 mt-1 text-[10px] text-gray-600">
                    <span>☀️ ${c.solar}GW</span>
                    <span>💨 ${c.wind}GW</span>
                    <span>💧 ${c.hydro}GW</span>
                </div>
            </div>
        </div>`;
    }).join('');
}

document.addEventListener('DOMContentLoaded', () => {
    showCountries(10);
});
