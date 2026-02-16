// Renewable Energy Data Service
const renewableEnergyData = (() => {
    // Top 20 countries by renewable energy capacity (based on 2023-2026 data)
    const baseEnergyData = [
        {
            country: 'Çin',
            countryCode: 'CN',
            flag: '🇨🇳',
            solar: { capacity: 609921, percentage: 38.5 },
            wind: { capacity: 885.87, percentage: 42.1 },
            rank: 1
        },
        {
            country: 'ABD',
            countryCode: 'US',
            flag: '🇺🇸',
            solar: { capacity: 139205, percentage: 8.8 },
            wind: { capacity: 421.14, percentage: 20.0 },
            rank: 2
        },
        {
            country: 'Almanya',
            countryCode: 'DE',
            flag: '🇩🇪',
            solar: { capacity: 81739, percentage: 5.2 },
            wind: { capacity: 137.32, percentage: 6.5 },
            rank: 3
        },
        {
            country: 'Hindistan',
            countryCode: 'IN',
            flag: '🇮🇳',
            solar: { capacity: 73109, percentage: 4.6 },
            wind: { capacity: 78.5, percentage: 3.7 },
            rank: 4
        },
        {
            country: 'Japonya',
            countryCode: 'JP',
            flag: '🇯🇵',
            solar: { capacity: 89077, percentage: 5.6 },
            wind: { capacity: 5.2, percentage: 0.2 },
            rank: 5
        },
        {
            country: 'Brezilya',
            countryCode: 'BR',
            flag: '🇧🇷',
            solar: { capacity: 32900, percentage: 2.1 },
            wind: { capacity: 95.51, percentage: 4.5 },
            rank: 6
        },
        {
            country: 'İngiltere',
            countryCode: 'GB',
            flag: '🇬🇧',
            solar: { capacity: 14911, percentage: 0.9 },
            wind: { capacity: 82.31, percentage: 3.9 },
            rank: 7
        },
        {
            country: 'İspanya',
            countryCode: 'ES',
            flag: '🇪🇸',
            solar: { capacity: 25623, percentage: 1.6 },
            wind: { capacity: 65.8, percentage: 3.1 },
            rank: 8
        },
        {
            country: 'Fransa',
            countryCode: 'FR',
            flag: '🇫🇷',
            solar: { capacity: 17432, percentage: 1.1 },
            wind: { capacity: 43.5, percentage: 2.1 },
            rank: 9
        },
        {
            country: 'Avustralya',
            countryCode: 'AU',
            flag: '🇦🇺',
            solar: { capacity: 29450, percentage: 1.9 },
            wind: { capacity: 26.8, percentage: 1.3 },
            rank: 10
        },
        {
            country: 'İtalya',
            countryCode: 'IT',
            flag: '🇮🇹',
            solar: { capacity: 25088, percentage: 1.6 },
            wind: { capacity: 22.4, percentage: 1.1 },
            rank: 11
        },
        {
            country: 'Hollanda',
            countryCode: 'NL',
            flag: '🇳🇱',
            solar: { capacity: 22698, percentage: 1.4 },
            wind: { capacity: 18.9, percentage: 0.9 },
            rank: 12
        },
        {
            country: 'Kanada',
            countryCode: 'CA',
            flag: '🇨🇦',
            solar: { capacity: 4385, percentage: 0.3 },
            wind: { capacity: 37.2, percentage: 1.8 },
            rank: 13
        },
        {
            country: 'Güney Kore',
            countryCode: 'KR',
            flag: '🇰🇷',
            solar: { capacity: 25178, percentage: 1.6 },
            wind: { capacity: 2.1, percentage: 0.1 },
            rank: 14
        },
        {
            country: 'Türkiye',
            countryCode: 'TR',
            flag: '🇹🇷',
            solar: { capacity: 11506, percentage: 0.7 },
            wind: { capacity: 32.8, percentage: 1.6 },
            rank: 15
        },
        {
            country: 'Danimarka',
            countryCode: 'DK',
            flag: '🇩🇰',
            solar: { capacity: 2873, percentage: 0.2 },
            wind: { capacity: 18.5, percentage: 0.9 },
            rank: 16
        },
        {
            country: 'Polonya',
            countryCode: 'PL',
            flag: '🇵🇱',
            solar: { capacity: 16960, percentage: 1.1 },
            wind: { capacity: 19.8, percentage: 0.9 },
            rank: 17
        },
        {
            country: 'Portekiz',
            countryCode: 'PT',
            flag: '🇵🇹',
            solar: { capacity: 3268, percentage: 0.2 },
            wind: { capacity: 14.2, percentage: 0.7 },
            rank: 18
        },
        {
            country: 'Yunanistan',
            countryCode: 'GR',
            flag: '🇬🇷',
            solar: { capacity: 6254, percentage: 0.4 },
            wind: { capacity: 10.5, percentage: 0.5 },
            rank: 19
        },
        {
            country: 'İsveç',
            countryCode: 'SE',
            flag: '🇸🇪',
            solar: { capacity: 2951, percentage: 0.2 },
            wind: { capacity: 35.4, percentage: 1.7 },
            rank: 20
        }
    ];

    // Simulate real-time updates with small random variations
    function getEnergyData() {
        return baseEnergyData.map(country => ({
            ...country,
            solar: {
                capacity: Math.round(country.solar.capacity * (1 + (Math.random() - 0.5) * 0.02)),
                percentage: country.solar.percentage
            },
            wind: {
                capacity: parseFloat((country.wind.capacity * (1 + (Math.random() - 0.5) * 0.03)).toFixed(2)),
                percentage: country.wind.percentage
            }
        }));
    }

    function formatCapacity(value, type) {
        if (type === 'solar') {
            // Solar is in MW
            if (value >= 1000) {
                return `${(value / 1000).toFixed(1)} GW`;
            }
            return `${value.toFixed(0)} MW`;
        } else {
            // Wind is in TWh
            return `${value.toFixed(1)} TWh`;
        }
    }

    return {
        getEnergyData,
        formatCapacity
    };
})();
