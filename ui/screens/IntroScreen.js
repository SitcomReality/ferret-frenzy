/** 
 * IntroScreen - Game introduction and settings screen
 */
export class IntroScreen {
  constructor() {
    this.element = null;
    this.eventBus = null;
  }

  initialize(eventBus) {
    this.eventBus = eventBus;
    this.createElement();
    this.bindEvents();
  }

  createElement() {
    this.element = document.createElement('div');
    this.element.id = 'introScreen';
    this.element.innerHTML = `
      <div id="introSettingsContainer">
        <div id="introSettings" class="ui-section"></div>
        <div id="initButtonContainer" class="ui-section">
          <div class="ui-item">
            <button id="initGame" class="btn btn-primary">New Game</button>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    const initButton = this.element.querySelector('#initGame');
    if (initButton) {
      initButton.addEventListener('click', () => {
        this.eventBus.emit('game:initialize');
      });
    }
  }

  show(data = {}) {
    (data?.container || document.getElementById('app') || document.body).appendChild(this.element);
    
    // Initialize settings panel if available
    if (window.SettingsPanel) {
      SettingsPanel.refresh(data.gameState);
    }
  }

  hide() {
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }

  cleanup() {
    this.element = null;
    this.eventBus = null;
  }
}