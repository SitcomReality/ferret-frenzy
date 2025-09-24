// Provide a legacy-compatible wrapper that delegates to the new system
function createNewRaceWeek() {
    // Check if wordlists are loaded, if not wait for them
    if (!window.racerNamePrefixes || !window.racerNameSuffixes) {
        console.log('Waiting for wordlists to load...');
        setTimeout(() => createNewRaceWeek(), 100);
        return;
    }

    const raceWeekInfoSection1 = document.getElementById("raceWeekInfoSection1"); 
    const raceWeekInfoSection2 = document.getElementById("raceWeekInfoSection2");
    const raceWeekInfoSection3 = document.getElementById("raceWeekInfoSection3");
    
    if (!raceWeekInfoSection1 || !raceWeekInfoSection2 || !raceWeekInfoSection3) {
        console.warn('Race week UI elements not found');
        return;
    }
    
    raceWeekInfoSection1.innerHTML = "";
    raceWeekInfoSection2.innerHTML = "";
    raceWeekInfoSection3.innerHTML = "";

    // Get race week from the new game state system
    const raceWeek = window.app?.gameState?.raceWeek;

    if (!raceWeek || !raceWeek.races || raceWeek.races.length === 0) {
        console.error("UI Update: No race week data found in gameState to display.");
        if (raceWeekInfoSection2) {
            raceWeekInfoSection2.innerHTML = "Error: Race Week data could not be generated.";
        }
        return;
    }

    // Update UI from gameState
    const raceWeekNumberElement = document.getElementById("raceWeekNumber");
    if (raceWeekNumberElement) {
        raceWeekNumberElement.innerHTML = raceWeek.id;
    }
    
    // Create UI for each race in the week
    raceWeek.races.forEach((race, raceIndex) => {
        const track = race.track;
        const weather = race.weather;
        const icon = ({sunny:'☀️',rainy:'🌧️',windy:'💨',cloudy:'☁️',dusty:'🌫️',stormy:'⛈️',snowy:'❄️',foggy:'🌁'})[weather] || '⛅';

        const weekContainer = document.createElement('div');
        weekContainer.className = 'race-week-container';

        // Highlight first race as the current one
        if (raceIndex === 0) {
            weekContainer.classList.add('current-week');
        } else {
            weekContainer.classList.add('past-week');
        }

        const weekHeader = document.createElement('div');
        weekHeader.className = 'race-week-header';
        weekHeader.innerHTML = `
            <h4>Race ${raceIndex + 1}: ${track.name}</h4>
            <div class="track-info">
                <span class="track-length">${track.sections.length * 21} segments</span>
                <span class="ground-types">${getUniqueGroundTypes(track.sections).join(', ')}</span>
                <span class="weather-badge">${icon} ${weather}</span>
            </div>
        `;

        const racersList = document.createElement('ul');
        racersList.className = 'racers-list';

        race.racers.forEach(racer => {
            const racerListItem = document.createElement('li');
            if (window.DOMUtils && typeof window.DOMUtils.createRacerGuiElement === 'function') {
                racerListItem.appendChild(window.DOMUtils.createRacerGuiElement(racer.id));
            } else if (racer.name) {
                // Fallback if DOMUtils not available
                racerListItem.textContent = `Racer ${racer.id}: ${racer.name}`;
            }
            racersList.appendChild(racerListItem);
        });

        weekContainer.appendChild(weekHeader);
        weekContainer.appendChild(racersList);
        raceWeekInfoSection1.appendChild(weekContainer);
    });
}

// Helper function to get unique ground types from track sections
function getUniqueGroundTypes(sections) {
    const groundTypes = {};
    sections.forEach(section => {
        groundTypes[section] = true;
    });
    return Object.keys(groundTypes);
}

// Export for module usage and maintain global compatibility
export { createNewRaceWeek };
window.createNewRaceWeek = createNewRaceWeek;