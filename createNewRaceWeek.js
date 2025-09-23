        const weekHeader = document.createElement('div');
        weekHeader.className = 'race-week-header';
        weekHeader.innerHTML = `
            <h4>Race ${raceIndex + 1}: ${track.name}</h4>
            <div class="track-info">
                <span class="track-length">${track.sections.length * gameState.settings.trackProperties.segmentsPerSection} segments</span>
                <span class="ground-types">${getUniqueGroundTypes(track.sections).join(', ')}</span>
                <span class="weather-info">${DOMUtils.createWeatherIndicator(gameState.currentRace.weather).outerHTML}</span>
            </div>
        `;

