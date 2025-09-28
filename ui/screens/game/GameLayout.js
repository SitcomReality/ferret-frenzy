export function createGameLayout() {
  const el = document.createElement('div');
  el.id = 'gameScreen';
  el.innerHTML = `
      <div id="header" class="ui gui-container">
        <div class="header-left"><div class="logo">RACER-X</div></div>
        <div class="header-center">
          <div class="ui-item"><button id="startRaceWeek" class="btn btn-primary">Start Race Week</button></div>
          <div class="ui-item"><button id="setupRace" disabled class="btn btn-secondary">Setup Race</button></div>
          <div class="ui-item"><button id="startRace" disabled class="btn btn-primary">Start Race</button></div>
          <div class="ui-item"><button id="endRaceNow" disabled class="btn btn-outline">End Race Now</button></div>
        </div>
        <div class="header-right">
          <div class="ui-item stat"><span id="playerBalanceLabel">Player Balance:</span> <span id="playerBalance">$1000</span></div>
          <div class="ui-section raceNumbers" id="raceNumbers">
            <div class="ui-item">
              <div class="raceNumbersInfo">Race Week <span id="raceWeekNumber">-1</span></div>
              <div class="raceNumbersInfo">Race <span id="raceNumberThisWeek">-1</span> (<span id="raceNumber">-1</span>)</div>
            </div>
          </div>
        </div>
      </div>
      <div id="hud" class="ui gui-container">
        <div class="hud-steps">
          <div class="step" data-step="1"><span class="num">1</span> New Game</div>
          <div class="step" data-step="2"><span class="num">2</span> Start Race Week</div>
          <div class="step" data-step="3"><span class="num">3</span> Setup Race</div>
          <div class="step" data-step="4"><span class="num">4</span> Start Race</div>
        </div>
        <div id="statusText" class="hud-status">Welcome! Click "New Game" to begin.</div>
      </div>
      <main id="game-container">
        <div id="left-panel">
          <div class="ui gui-container tabs" id="sidebarTabs">
            <div class="tab-buttons">
              <button class="tab-button active" data-tab="raceweek">Race Week</button>
              <button class="tab-button" data-tab="betting">Betting</button>
              <button class="tab-button" data-tab="history">History</button>
              <button class="tab-button" data-tab="settings">Settings</button>
            </div>
            <div class="tab-content">
              <div class="tab-panel active" data-tab-panel="raceweek">
                <div id="raceWeekPanel" class="ui gui-container">
                  <h4>Race Week Info</h4>
                  <div id="raceWeekRacesContainer">Press "Start Race Week" to see races.</div>
                </div>
              </div>
              <div class="tab-panel" data-tab-panel="betting">
                <div id="bettingPanel" class="ui gui-container"></div>
              </div>
              <div class="tab-panel" data-tab-panel="history">
                <div id="raceHistory" class="ui gui-container">
                  <h4>Race History</h4>
                  <ul id="historyList"></ul>
                </div>
              </div>
              <div class="tab-panel" data-tab-panel="settings">
                <div id="settings" class="ui gui-container debugui">
                  <div class="ui-section"><h4>Settings</h4></div>
                  <div class="ui-item"><button id="endRace" class="btn btn-outline">End Race</button></div>
                  <div class="ui-item">
                    <label for="speedMultiplier">speedMultiplier</label>
                    <input type="range" min="0.01" max="1.5" step="0.01" id="speedMultiplier" name="speedMultiplier" class="form-control">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div id="right-panel">
          <div class="track track-container" id="raceTrack">
            <canvas id="raceCanvas"></canvas>
            <div id="liveLeaderboard" class="overlay-leaderboard">
              <h5>Leaders</h5>
              <ol id="leaderList"></ol>
            </div>
            <div id="overlayWeather" class="overlay-weather"></div>
          </div>
        </div>
      </main>
  `;
  return el;
}

