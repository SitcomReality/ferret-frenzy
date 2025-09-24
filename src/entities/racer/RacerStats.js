/**
 * RacerStats - Handles base stats generation and compensation
 */
export class RacerStats {
  constructor(racer, config) {
    this.racer = racer;
    this.config = config;
    this.stats = this.initStats();
  }

  initStats() {
    const stats = {};
    // Generate base stats
    const baseStats = ['endurance', 'exhaustionMultiplier', 'boostPower', 'boostDuration', 'boostActivationPercent', 'stumbleChance', 'stumbleDuration'];
    baseStats.forEach((statName) => {
      const base = this.config.racerProperties[`${statName}Base`];
      const variance = this.config.racerProperties[`${statName}Variance`];
      stats[statName] = this.getRandomValue(base, variance);
    });

    // Add weather stats
    stats.weather = {};
    const weatherTypes = this.config.worldProperties.weatherTypes;
    weatherTypes.forEach((weatherType) => {
      const base = this.config.weatherProperties[`${weatherType}Base`];
      const variance = this.config.weatherProperties[`${weatherType}Variance`];
      stats.weather[weatherType] = this.getRandomValue(base, variance);
    });

    // Add ground stats
    stats.ground = {};
    const groundTypes = this.config.worldProperties.groundTypes;
    groundTypes.forEach((groundType) => {
      const base = this.config.groundProperties[`${groundType}Base`];
      const variance = this.config.groundProperties[`${groundType}Variance`];
      stats.ground[groundType] = this.getRandomValue(base, variance);
    });

    stats.third = {};
    const thirdTypes = this.config.worldProperties.thirdTypes;
    thirdTypes.forEach((thirdType) => {
      const base = this.config.thirdProperties[`${thirdType}Base`];
      const variance = this.config.thirdProperties[`${thirdType}Variance`];
      stats.third[thirdType] = this.getRandomValue(base, variance);
    });

    stats.formVariation = this.getRandomValue(
      this.config.racerProperties.formVariationBase,
      this.config.racerProperties.formVariationVariance
    );

    return stats;
  }

  getRandomValue(base, variance) {
    const min = base - variance;
    const max = base + variance;
    return Math.trunc(Math.random() * (max - min) + min);
  }

  compensateStats() {
    const statsToCompensate = {
      weather: this.config.worldProperties.weatherTypes,
      ground: this.config.worldProperties.groundTypes,
      third: this.config.worldProperties.thirdTypes
    };

    this.applyCompensation(this.stats.weather, this.config.weatherProperties, statsToCompensate.weather);
    this.applyCompensation(this.stats.ground, this.config.groundProperties, statsToCompensate.ground);
    this.applyCompensation(this.stats.third, this.config.thirdProperties, statsToCompensate.third);
  }

  applyCompensation(stats, properties, statNames) {
    const compensationProbability = this.config.racerProperties.compensationStatBoostTwoStatsChance;

    statNames.forEach((statName) => {
      if (stats[statName] !== undefined) {
        const base = properties[`${statName}Base`];
        const variance = properties[`${statName}Variance`];
        const threshold = base - (variance * this.config.compensationThreshold);

        if (stats[statName] <= threshold) {
          const compensationCount = Math.random() < compensationProbability ? 2 : 1;
          const compensationStats = this.getRandomCompensationRule(stats, compensationCount);

          compensationStats.forEach(compensatedStat => {
            if (stats[compensatedStat] !== undefined) {
              const randomBoostPercentage = this.getRandomInt(
                this.config.racerProperties.compensationStatBoostMin * 100,
                this.config.racerProperties.compensationStatBoostMax * 100
              ) / 100;
              const boostAmount = Math.trunc(randomBoostPercentage * properties[`${compensatedStat}Base`]);
              stats[compensatedStat] += boostAmount;
            }
          });
        }
      }
    });
  }

  getRandomCompensationRule(stats, count = 2) {
    const statNames = Object.keys(stats).filter(statName => typeof stats[statName] === 'number');
    const randomStats = [];

    while (randomStats.length < count) {
      const randomStat = statNames[Math.floor(Math.random() * statNames.length)];
      if (!randomStats.includes(randomStat)) {
        randomStats.push(randomStat);
      }
    }
    return randomStats;
  }

  getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  getStat(path) {
    return path.split('.').reduce((obj, key) => obj?.[key], this.stats);
  }

  serialize() {
    return {
      stats: this.stats
    };
  }

  reset() {
    this.stats = this.initStats();
    this.compensateStats();
  }
}