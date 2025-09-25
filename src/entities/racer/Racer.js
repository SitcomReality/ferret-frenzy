getAverageFinishingPosition(numberOfRaces) {
    const history = this.getComponent('history');
    if (history) {
        return history.getAverageFinishingPosition(numberOfRaces);
    }

    // Fallback calculation for backward compatibility
    let sum = 0;
    let count = 0;
    const racesToConsider = Math.min(numberOfRaces, this.history.length);

    for (let i = 0; i < racesToConsider; i++) {
        sum += this.history[i][1];
        count++;
    }

    return count > 0 ? sum / count : 0;
}

