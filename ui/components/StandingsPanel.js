export class StandingsPanel {
  constructor() {
    this.el = null;
  }

  create() {
    this.el = document.createElement('section');
    this.el.className = 'standings-panel';
    
    this.el.innerHTML = `
      <div class="standings-wrapper">
        <div class="standings-header">
          <div class="comic-burst standings-burst">
            <span class="burst-text">STANDINGS!</span>
          </div>
          <h3 class="standings-title">RACER RANKINGS</h3>
          <div class="standings-subtitle">Season Leaders & Statistics</div>
        </div>
        
        <div class="standings-content">
          <div class="standings-table-wrapper">
            <table class="standings-table" id="standingsTable">
              <thead>
                <tr class="standings-header-row">
                  <th class="rank-col">RANK</th>
                  <th class="racer-col">RACER</th>
                  <th class="wins-col">WINS</th>
                  <th class="races-col">RACES</th>
                  <th class="win-rate-col">WIN %</th>
                  <th class="form-col">FORM</th>
                </tr>
              </thead>
              <tbody id="standingsTableBody">
                <!-- Standings rows will be populated here -->
              </tbody>
            </table>
          </div>
          
          <div class="standings-sidebar">
            <div class="stat-box championship-leader">
              <h4 class="stat-box-title">SEASON LEADER</h4>
              <div class="leader-content" id="championshipLeader">
                <div class="leader-placeholder">TBD</div>
              </div>
            </div>
            
            <div class="stat-box weekly-achievers">
              <h4 class="stat-box-title">WEEK ACHIEVERS</h4>
              <div class="achievers-list" id="weekAchievers">
                <!-- Weekly achievements will be populated here -->
              </div>
            </div>
            
            <div class="stat-box fun-stats">
              <h4 class="stat-box-title">RACING FACTS</h4>
              <div class="fun-stats-content" id="funStats">
                <!-- Fun statistics will be populated here -->
              </div>
            </div>
          </div>
        </div>
        
        <div class="standings-footer">
          <div class="memphis-decoration-line"></div>
          <div class="standings-note">
            Updated after each race • Statistics current through Week <span id="currentWeekDisplay">0</span>
          </div>
        </div>
      </div>
    `;
    
    return this.el;
  }

  populateContent(gameState) {
    const weekNumber = gameState?.raceWeekCounter ?? 0;
    const raceHistory = gameState?.raceHistory || [];
    const racers = gameState?.racers || [];
    
    this.updateCurrentWeek(weekNumber);
    this.calculateAndDisplayStandings(raceHistory, racers, weekNumber);
    this.updateChampionshipLeader(raceHistory, racers);
    this.updateWeekAchievers(raceHistory, weekNumber);
    this.updateFunStats(raceHistory, racers, weekNumber);
  }

  updateCurrentWeek(weekNumber) {
    const weekDisplay = this.el.querySelector('#currentWeekDisplay');
    if (weekDisplay) {
      weekDisplay.textContent = weekNumber;
    }
  }

  calculateAndDisplayStandings(raceHistory, racers, weekNumber) {
    const standingsData = this.calculateStandings(raceHistory, racers);
    const tableBody = this.el.querySelector('#standingsTableBody');
    
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    standingsData.forEach((racer, index) => {
      const row = document.createElement('tr');
      row.className = `standings-row ${index < 3 ? 'top-three' : ''}`;
      
      const formIndicator = this.getFormIndicator(racer.recentForm);
      const winPercentage = racer.totalRaces > 0 ?
        ((racer.totalWins / racer.totalRaces) * 100).toFixed(1) : '0.0';
      
      row.innerHTML = `
        <td class="rank-cell">
          <div class="rank-badge rank-${index + 1}">
            ${this.getRankDisplay(index + 1)}
          </div>
        </td>
        <td class="racer-cell">
          <div class="racer-name">${racer.name}</div>
          ${index < 3 ? '<div class="medal-indicator">★</div>' : ''}
        </td>
        <td class="wins-cell">
          <div class="stat-value">${racer.totalWins}</div>
        </td>
        <td class="races-cell">
          <div class="stat-value">${racer.totalRaces}</div>
        </td>
        <td class="win-rate-cell">
          <div class="stat-value">${winPercentage}%</div>
        </td>
        <td class="form-cell">
          <div class="form-indicator ${formIndicator.class}">
            ${formIndicator.display}
          </div>
        </td>
      `;
      
      tableBody.appendChild(row);
    });
  }

  calculateStandings(raceHistory, racers) {
    const racerStats = new Map();
    
    // Initialize racer stats
    racers.forEach(racer => {
      racerStats.set(racer.name, {
        name: racer.name,
        totalWins: 0,
        totalRaces: 0,
        totalPoints: 0,
        recentForm: [], // Last 5 race positions
        averagePosition: 0
      });
    });
    
    // Process race history
    raceHistory.forEach(race => {
      if (race.results && Array.isArray(race.results)) {
        race.results.forEach((result, position) => {
          const racerName = result.racer?.name;
          if (racerName && racerStats.has(racerName)) {
            const stats = racerStats.get(racerName);
            stats.totalRaces++;
            
            // Award points (1st = 10pts, 2nd = 9pts, etc.)
            const points = Math.max(0, 11 - (position + 1));
            stats.totalPoints += points;
            
            // Track wins
            if (position === 0) {
              stats.totalWins++;
            }
            
            // Update recent form (keep last 5 races)
            stats.recentForm.push(position + 1);
            if (stats.recentForm.length > 5) {
              stats.recentForm.shift();
            }
          }
        });
      }
    });
    
    // Calculate average positions and sort by total points
    const standings = Array.from(racerStats.values())
      .filter(racer => racer.totalRaces > 0)
      .map(racer => {
        racer.averagePosition = racer.totalRaces > 0 ?
          (racer.recentForm.reduce((sum, pos) => sum + pos, 0) / racer.recentForm.length).toFixed(1) :
          '0.0';
        return racer;
      })
      .sort((a, b) => {
        // Primary sort: total points
        if (b.totalPoints !== a.totalPoints) {
          return b.totalPoints - a.totalPoints;
        }
        // Secondary sort: total wins
        if (b.totalWins !== a.totalWins) {
          return b.totalWins - a.totalWins;
        }
        // Tertiary sort: win percentage
        const aWinRate = a.totalRaces > 0 ? a.totalWins / a.totalRaces : 0;
        const bWinRate = b.totalRaces > 0 ? b.totalWins / b.totalRaces : 0;
        return bWinRate - aWinRate;
      });
    
    return standings;
  }

  getRankDisplay(rank) {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  }

  getFormIndicator(recentForm) {
    if (recentForm.length === 0) {
      return { display: 'N/A', class: 'form-neutral' };
    }
    
    const averagePosition = recentForm.reduce((sum, pos) => sum + pos, 0) / recentForm.length;
    
    if (averagePosition <= 2.0) {
      return { display: '🔥', class: 'form-hot' };
    } else if (averagePosition <= 3.5) {
      return { display: '↗️', class: 'form-good' };
    } else if (averagePosition <= 5.0) {
      return { display: '→', class: 'form-neutral' };
    } else {
      return { display: '↘️', class: 'form-cold' };
    }
  }

  updateChampionshipLeader(raceHistory, racers) {
    const leaderEl = this.el.querySelector('#championshipLeader');
    if (!leaderEl) return;
    
    const standings = this.calculateStandings(raceHistory, racers);
    
    if (standings.length === 0) {
      leaderEl.innerHTML = '<div class="leader-placeholder">Season not started</div>';
      return;
    }
    
    const leader = standings[0];
    const winPercentage = leader.totalRaces > 0 ?
      ((leader.totalWins / leader.totalRaces) * 100).toFixed(1) : '0.0';
    
    leaderEl.innerHTML = `
      <div class="leader-card">
        <div class="leader-name">${leader.name}</div>
        <div class="leader-stats">
          <div class="leader-stat">
            <span class="stat-label">Points:</span>
            <span class="stat-value">${leader.totalPoints}</span>
          </div>
          <div class="leader-stat">
            <span class="stat-label">Wins:</span>
            <span class="stat-value">${leader.totalWins}/${leader.totalRaces}</span>
          </div>
          <div class="leader-stat">
            <span class="stat-label">Win Rate:</span>
            <span class="stat-value">${winPercentage}%</span>
          </div>
        </div>
        <div class="leader-crown">👑</div>
      </div>
    `;
  }

  updateWeekAchievers(raceHistory, weekNumber) {
    const achieversEl = this.el.querySelector('#weekAchievers');
    if (!achieversEl) return;
    
    const weekRaces = raceHistory.filter(h =>
      String(h.race?.id || '').startsWith(`${weekNumber}-`)
    );
    
    if (weekRaces.length === 0) {
      achieversEl.innerHTML = '<div class="no-achievers">Week not completed</div>';
      return;
    }
    
    const achievements = this.calculateWeekAchievements(weekRaces);
    
    achieversEl.innerHTML = achievements.map(achievement => `
      <div class="achievement-item">
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-content">
          <div class="achievement-title">${achievement.title}</div>
          <div class="achievement-racer">${achievement.racer}</div>
        </div>
      </div>
    `).join('');
  }

  calculateWeekAchievements(weekRaces) {
    const achievements = [];
    const racerWins = {};
    const racerParticipation = {};
    
    // Count wins and participation
    weekRaces.forEach(race => {
      if (race.winner?.name) {
        racerWins[race.winner.name] = (racerWins[race.winner.name] || 0) + 1;
      }
      
      if (race.results) {
        race.results.forEach(result => {
          const name = result.racer?.name;
          if (name) {
            racerParticipation[name] = (racerParticipation[name] || 0) + 1;
          }
        });
      }
    });
    
    // Week winner (most wins)
    const weekWinner = Object.entries(racerWins).reduce((a, b) =>
      racerWins[a[0]] > racerWins[b[0]] ? a : b, ['Unknown', 0]
    );
    
    if (weekWinner[1] > 0) {
      achievements.push({
        icon: '🏆',
        title: 'Week Champion',
        racer: weekWinner[0]
      });
    }
    
    // Most consistent (participated in most races)
    const mostConsistent = Object.entries(racerParticipation).reduce((a, b) =>
      racerParticipation[a[0]] > racerParticipation[b[0]] ? a : b, ['Unknown', 0]
    );
    
    if (mostConsistent[1] > 1) {
      achievements.push({
        icon: '⚡',
        title: 'Iron Ferret',
        racer: mostConsistent[0]
      });
    }
    
    // Perfect week (won every race they participated in)
    const perfectRacers = Object.entries(racerWins).filter(([name, wins]) =>
      wins === racerParticipation[name] && wins > 1
    );
    
    if (perfectRacers.length > 0) {
      achievements.push({
        icon: '💎',
        title: 'Perfect Week',
        racer: perfectRacers[0][0]
      });
    }
    
    return achievements.slice(0, 3); // Limit to 3 achievements
  }

  updateFunStats(raceHistory, racers, weekNumber) {
    const statsEl = this.el.querySelector('#funStats');
    if (!statsEl) return;
    
    const totalRaces = raceHistory.length;
    const totalRacers = racers.length;
    const averageRacersPerRace = totalRaces > 0 ?
      (raceHistory.reduce((sum, race) =>
        sum + (race.results?.length || 0), 0) / totalRaces).toFixed(1) : '0';
    
    const stats = [
      {
        label: 'Total Races',
        value: totalRaces,
        icon: '🏁'
      },
      {
        label: 'Active Racers',
        value: totalRacers,
        icon: '🦔'
      },
      {
        label: 'Avg Participants',
        value: averageRacersPerRace,
        icon: '📊'
      },
      {
        label: 'Season Week',
        value: weekNumber,
        icon: '📅'
      }
    ];
    
    statsEl.innerHTML = stats.map(stat => `
      <div class="fun-stat-item">
        <span class="stat-icon">${stat.icon}</span>
        <span class="stat-text">${stat.label}: <strong>${stat.value}</strong></span>
      </div>
    `).join('');
  }

  getElement() {
    return this.el;
  }

  // Public methods for external updates
  refreshStandings(gameState) {
    this.populateContent(gameState);
  }

  highlightRacer(racerName) {
    const rows = this.el.querySelectorAll('.standings-row');
    rows.forEach(row => {
      const nameEl = row.querySelector('.racer-name');
      if (nameEl && nameEl.textContent === racerName) {
        row.classList.add('highlighted');
      } else {
        row.classList.remove('highlighted');
      }
    });
  }

  setBurstText(text = 'STANDINGS!') {
    const burstEl = this.el?.querySelector('.burst-text');
    if (burstEl) {
      burstEl.textContent = text;
    }
  }

  updateTitle(title = 'RACER RANKINGS', subtitle = 'Season Leaders & Statistics') {
    const titleEl = this.el?.querySelector('.standings-title');
    const subtitleEl = this.el?.querySelector('.standings-subtitle');
    
    if (titleEl) titleEl.textContent = title;
    if (subtitleEl) subtitleEl.textContent = subtitle;
  }
}