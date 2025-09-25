import { BaseComponent } from './BaseComponent.js';

export class SettingsPanel extends BaseComponent {
    constructor(element, options = {}) {
        super(element, options);
        this.gameState = options.gameState;
        this.settings = {};
        this.activeCategory = 'racing';
    }

    static generateSettingsHTML(gameState) {
        const categories = {
            racing: {
                title: 'Racing & Performance',
                icon: '🏁',
                settings: [
                    'racerProperties.speedBase',
                    'racerProperties.speedMultiplier',
                    'racerProperties.enduranceBase',
                    'racerProperties.formVariationBase',
                    'racerProperties.boostPowerBase',
                    'racerProperties.boostDurationBase'
                ]
            },
            betting: {
                title: 'Betting & Odds',
                icon: '💰',
                settings: [
                    'bettingProperties.minOdds',
                    'bettingProperties.maxOdds',
                    'bettingProperties.winningCalculationModifier'
                ]
            },
            tracks: {
                title: 'Track Generation',
                icon: '🛤️',
                settings: [
                    'trackProperties.minSectionsPerTrack',
                    'trackProperties.maxSectionsPerTrack',
                    'trackProperties.segmentsPerSection',
                    'trackProperties.numberOfLanes'
                ]
            },
            raceWeek: {
                title: 'Race Week',
                icon: '📅',
                settings: [
                    'weekProperties.numberOfRaces',
                    'weekProperties.uniqueTracksMin',
                    'weekProperties.uniqueTracksMax',
                    'weekProperties.uniqueRacersMin',
                    'weekProperties.uniqueRacersMax'
                ]
            },
            conditions: {
                title: 'Weather & Ground',
                icon: '🌤️',
                settings: [
                    'weatherProperties.sunnyBase',
                    'weatherProperties.rainyBase',
                    'groundProperties.asphaltBase',
                    'groundProperties.grassBase',
                    'groundProperties.gravelBase'
                ]
            },
            camera: {
                title: 'Camera & View',
                icon: '📷',
                settings: [
                    'render.camera.smoothing',
                    'render.camera.zoomMin',
                    'render.camera.zoomMax'
                ]
            },
            testing: {
                title: 'Testing & Debug',
                icon: '🐛',
                settings: [
                    'racerProperties.stumbleChanceBase',
                    'racerProperties.stumbleDurationBase',
                    'racerProperties.exhaustionMultiplierBase',
                    'compensationThreshold',
                    'render.debug'
                ]
            }
        };

        let html = `
            <div class="settings-tabs">
                ${Object.entries(categories).map(([key, category]) => `
                    <button class="settings-tab ${key === 'racing' ? 'active' : ''}" data-category="${key}">
                        <span class="tab-icon">${category.icon}</span>
                        <span class="tab-title">${category.title}</span>
                    </button>
                `).join('')}
            </div>
            <div class="settings-content">
        `;

        Object.entries(categories).forEach(([key, category]) => {
            html += `<div class="settings-category ${key === 'racing' ? 'active' : ''}" data-category="${key}">`;
            html += `<h4>${category.title}</h4>`;
            
            category.settings.forEach(settingPath => {
                const value = settingPath.split('.').reduce((obj, key) => obj?.[key], gameState.settings);
                const label = settingPath.split('.').pop();
                const displayLabel = label.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                
                html += `
                    <div class="settings-item">
                        <label for="${settingPath}" title="${settingPath}">${displayLabel}</label>
                        <input class="settings-input" type="number" id="${settingPath}" value="${value}" step="0.01" autocomplete="off">
                    </div>
                `;
            });
            
            html += '</div>';
        });

        html += '</div>';
        return html;
    }

    static refresh(gameState) {
        if (!gameState) {
            console.error("SettingsPanel.refresh requires gameState.");
            return;
        }
        const settingsContainer = document.getElementById('introSettings');
        if (settingsContainer) {
            settingsContainer.innerHTML = SettingsPanel.generateSettingsHTML(gameState);
            SettingsPanel.bindTabEvents();
        }
    }

    static bindTabEvents() {
        const tabButtons = document.querySelectorAll('.settings-tab');
        const categoryPanels = document.querySelectorAll('.settings-category');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const category = button.dataset.category;
                
                // Update active states
                tabButtons.forEach(btn => btn.classList.remove('active'));
                categoryPanels.forEach(panel => panel.classList.remove('active'));
                
                button.classList.add('active');
                const targetPanel = document.querySelector(`.settings-category[data-category="${category}"]`);
                if (targetPanel) {
                    targetPanel.classList.add('active');
                }
            });
        });
    }
}

// Legacy compatibility
window.SettingsPanel = SettingsPanel;