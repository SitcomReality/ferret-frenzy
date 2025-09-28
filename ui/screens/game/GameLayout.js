export function createGameLayout() {
  const el = document.createElement('div');
  el.id = 'gameScreen';
  el.className = 'race-screen-container';
  el.innerHTML = `
      <div class="action-lines-memphis"></div>
      <canvas id="raceCanvas"></canvas>
      <div id="race-overlay">
        <div id="liveLeaderboard" class="overlay-leaderboard">
          <h5>Leaders</h5>
          <ol id="leaderList"></ol>
        </div>
        <div id="overlayWeather" class="overlay-weather"></div>
        <button id="endRaceNow" class="btn btn-outline btn-memphis">End Race</button>
      </div>
  `;
  return el;
}

