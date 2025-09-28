import { RenderManager } from '../../render/RenderManager.js';
import { createGameLayout } from './game/GameLayout.js';

/** 
 * GameScreen - Main game screen for live race viewing
 */
export class GameScreen {
  constructor(gameState = null) {
    this.element = null;
    this.eventBus = null;
    this.renderManager = null;
    this.gameState = gameState;
  }

  initialize(eventBus) {
    this.eventBus = eventBus;
    this.createElement();
    
    this.renderManager = new RenderManager(this.element.querySelector('#raceCanvas'), this.gameState);
    this.renderManager.initialize();
    
    this.bindEvents();

    this.eventBus.on('race:start', (data) => this.onRaceStart(data));
    this.eventBus.on('race:finish', (raceData) => this.onRaceFinish(raceData));
    this.eventBus.on('race:countdownStarted', (data) => this.onCountdownStarted(data));
  }

  createElement() {
    this.element = createGameLayout();
  }

  bindEvents() {
    const endNowBtn = this.element.querySelector('#endRaceNow');

    if (endNowBtn) {
      endNowBtn.addEventListener('click', () => {
        this.eventBus.emit('race:endNow');
        endNowBtn.disabled = true;
      });
    }
  }
  
  setupRaceFromState() {
    const race = this.gameState.currentRace;
    if (!race) {
        console.warn("GameScreen: No current race data in gameState.");
        return;
    }

    this.renderManager.setRace(race, { numberOfLanes: race.racers.length });
    // Reset countdown and camera for fresh race setup
    this.renderManager.raceEndCountdown = null;
    const dims = this.renderManager.canvasAdapter.getDimensions();
    const baselineZoom = this.renderManager.camera.director.cameraCalculator.getTrackBasedZoom(dims, race);
    this.renderManager.camera.target.x = 0;
    this.renderManager.camera.zoom = baselineZoom;
    const weatherDisplay = this.element.querySelector("#overlayWeather");
    if(weatherDisplay) {
        weatherDisplay.textContent = `Weather: ${race.weather}`;
    }

    // Initial render of the track and racers at starting line
    this.renderManager.renderOnce();
  }

  onRaceStart(data) {
    this.renderManager.start();
    const endNowBtn = this.element.querySelector('#endRaceNow');
    if (endNowBtn) endNowBtn.disabled = false;
  }
  
  onCountdownStarted(data) {
    this.renderManager.raceEndCountdown = data.countdown;
  }
  
  onRaceFinish(raceData) {
    this.renderManager.stop();
  }

  show(data = {}) {
    this.gameState = data.gameState; // Make sure we have the latest game state
    (data?.container || document.getElementById('app') || document.body).appendChild(this.element);
    
    // Resize canvas after it's added to the DOM
    if (this.renderManager) {
        this.renderManager.resizeToContainer();
    }

    this.setupRaceFromState();
  }

  hide() {
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.renderManager.stop();
  }

  cleanup() {
    this.renderManager?.cleanup();
    this.element = null;
    this.eventBus = null;
  }
}