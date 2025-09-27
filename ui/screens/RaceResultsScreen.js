ui/screens/RaceResultsScreen.js
import { RacerCardComponent } from '../components/RacerCardComponent.js';

/**
 * RaceResultsScreen - Displays race results with colorful, bold Memphis design
 */
export class RaceResultsScreen {
  constructor() {
    this.eventBus = null;
  }

  initialize(eventBus) {
    this.eventBus = eventBus;
    this.create();
  }

  create() {
    this.el = document.createElement('div');
    this.el.id = 'raceResultsScreen';
    this.el.innerHTML = `
      <div class="ui gui-container">
        <h3>Race Results</h3>
        <ol id="resultsList"></ol>
        <div class="d-flex" style="gap:8px">
          <button id="rrNext" class="btn btn-primary">Next Race</button>
          <button id="rrWeek" class="btn btn-outline">Week Summary</button>
        </div>
      </div>
    `;
    this.el.querySelector('#rrNext').addEventListener('click', () => this.eventBus.emit('race:setup'));
    this.el.querySelector('#rrWeek').addEventListener('click', () => this.eventBus.emit('race:weekEnded', {}));
  }

  show({ container, gameState }) {
    (container||document.getElementById('app')).appendChild(this.el);
    const cl = this.el.querySelector('#resultsList'); cl.innerHTML = '';
    
    // Get the most recent race results from history
    const lastRace = gameState?.raceHistory?.[gameState.raceHistory.length-1];
    const res = lastRace?.results || [];
    
    const maxRacesInWeek = gameState.raceWeek?.races?.length || 0;
    const currentRaceIndex = gameState?.currentRaceIndex || 0;

    res.forEach((rid, i) => { 
        const racer = gameState.racers.find(x => x.id === rid);
        const racerCard = new RacerCardComponent(racer, { index: i, showPlacing: true, compact: false });
        cl.appendChild(racerCard.createElement());
    });
    
    // Update button visibility based on if this was the last race of the week
    const isLastRace = currentRaceIndex >= maxRacesInWeek;
    this.el.querySelector('#rrNext').style.display = isLastRace ? 'none' : 'block';
    this.el.querySelector('#rrWeek').style.display = isLastRace ? 'block' : 'none';
  }

  hide() { 
    this.el?.parentNode?.removeChild(this.el); 
  }
}