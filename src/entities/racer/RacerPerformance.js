/**
 * RacerPerformance - Handles speed calculation, endurance, boost logic
 */
export class RacerPerformance {
  constructor(racer, config) {
    this.racer = racer;
    this.config = config;
    this.remainingEndurance = 0;
    this.remainingBoost = 0;
    this.isExhausted = false;
    this.isBoosting = false;
    this.speedThisRace = [];
  }

  initialize() {
    // Fix: Use direct stats access instead of getStat method
    const stats = this.racer.getComponent('stats');
    if (stats && stats.stats) {
      this.remainingEndurance = stats.stats.endurance || 2000;
      this.remainingBoost = stats.stats.boostDuration || 600;
    } else {
      // Fallback to config values
      this.remainingEndurance = this.config.racerProperties.enduranceBase || 2000;
      this.remainingBoost = this.config.racerProperties.boostDurationBase || 600;
    }
  }

  calculateSpeed(racerForm, percentRaceComplete, groundType, weatherType) {
    let returnSpeed = this.config.racerProperties.speedBase;
    returnSpeed *= this.racer.stats.getStat(`ground.${groundType}`) || 1;
    returnSpeed *= this.racer.stats.getStat(`weather.${weatherType}`) || 1;
    
    const currentThird = percentRaceComplete < 34 ? 1 : percentRaceComplete > 66 ? 3 : 2;
    let thirdName = "one";
    if (currentThird === 2) { thirdName = "two" }
    if (currentThird === 3) { thirdName = "three" }
    
    returnSpeed *= this.racer.stats.getStat(`third.${thirdName}`);
    returnSpeed *= racerForm;
    
    if (this.isExhausted) {
      returnSpeed *= this.racer.stats.getStat('exhaustionMultiplier');
    }
    
    if (this.isBoosting) {
      returnSpeed += this.racer.stats.getStat('boostPower');
    }
    
    returnSpeed = Math.trunc(returnSpeed * this.config.racerProperties.speedMultiplier, 4);
    
    if (this.speedThisRace[this.speedThisRace.length - 1] !== returnSpeed) {
      this.speedThisRace.push(returnSpeed);
    }
    
    return returnSpeed;
  }

  getAverageSpeed() {
    if (this.speedThisRace.length === 0) return 0;
    const totalSpeed = this.speedThisRace.reduce((accumulator, speed) => accumulator + speed, 0);
    return totalSpeed / this.speedThisRace.length;
  }

  activateBoost() {
    this.isBoosting = true;
  }

  deactivateBoost() {
    this.isBoosting = false;
  }

  reduceRemainingBoost(reduction) {
    this.remainingBoost = Math.max(0, this.remainingBoost - reduction);
  }

  reduceRemainingEndurance(reduction) {
    this.remainingEndurance = Math.max(0, this.remainingEndurance - reduction);
  }

  makeExhausted() {
    this.remainingEndurance = 0;
    this.isExhausted = true;
  }

  serialize() {
    return {
      remainingEndurance: this.remainingEndurance,
      remainingBoost: this.remainingBoost,
      isExhausted: this.isExhausted,
      isBoosting: this.isBoosting,
      speedThisRace: [...this.speedThisRace]
    };
  }

  reset() {
    this.remainingEndurance = this.racer.stats.getStat('endurance');
    this.remainingBoost = this.racer.stats.getStat('boostDuration');
    this.isBoosting = false;
    this.isExhausted = false;
    this.speedThisRace = [];
  }
}