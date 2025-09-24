/**
 * RacerHistory - Handles race history tracking and analysis
 */
export class RacerHistory {
  constructor(racer) {
    this.racer = racer;
    this.history = [];
    this.performance = {};
    this.performanceHistory = [];
    this.speedHistory = [];
    this.wins = 0;
  }

  updateRacerHistory(raceid, finishingPosition) {
    this.history.push([raceid, finishingPosition]);
  }

  getAverageFinishingPosition(numberOfRaces) {
    let sum = 0;
    let count = 0;
    const racesToConsider = Math.min(numberOfRaces, this.history.length);

    for (let i = 0; i < racesToConsider; i++) {
      sum += this.history[i][1];  // the finishing position is the second element
      count++;
    }

    const averageFinishingPosition = count > 0 ? sum / count : 0;
    return averageFinishingPosition;
  }

  getFavoredConditions() {
    let favorite = { condition: null, winRate: 0 };

    for (let condition in this.performance) {
      let stats = this.performance[condition];
      let winRate = stats.wins / stats.races;

      if (favorite.condition === null || winRate > favorite.winRate) {
        favorite = { condition, winRate };
      }
    }

    return favorite.condition;
  }

  getFormGuide() {
    let favoredCondition = this.getFavoredConditions();
    let averageSpeed = this.speedHistory.reduce((a, b) => a + b, 0) / this.speedHistory.length;
    return {
      name: this.racer.name,
      totalWins: this.wins,
      averageSpeed: averageSpeed.toFixed(2),
      favoredCondition: favoredCondition
    };
  }

  compareToBaseline(baseline) {
    const guide = this.getFormGuide();
    return {
      ...guide,
      aboveAverageWins: guide.totalWins > baseline.averageWins,
      aboveAverageSpeed: guide.averageSpeed > baseline.averageSpeed
    };
  }

  addRaceResult(condition, speed, result) {
    if (!this.performance[condition]) {
      this.performance[condition] = {
        totalSpeed: 0,
        races: 0,
        wins: 0,
        dnfs: 0
      }
    }

    this.performance[condition].totalSpeed += speed;
    this.performance[condition].races += 1;

    if (result === 'win') {
      this.performance[condition].wins += 1;
      this.wins += 1;
    } else if (result === 'dnf') {
      this.performance[condition].dnfs += 1;
    }

    this.performanceHistory.push({ condition, speed, result });
    this.speedHistory.push(speed);
  }

  serialize() {
    return {
      history: [...this.history],
      performance: JSON.parse(JSON.stringify(this.performance)),
      performanceHistory: [...this.performanceHistory],
      speedHistory: [...this.speedHistory],
      wins: this.wins
    };
  }

  reset() {
    this.history = [];
    this.performance = {};
    this.performanceHistory = [];
    this.speedHistory = [];
    this.wins = 0;
  }
}