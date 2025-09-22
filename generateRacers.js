function generateNewRacers(numberToGenerate) {
	const racers = [];
	const namePrefixNumber = generateUniqueNumbers(0, racerNamePrefixes.length, numberToGenerate);
	const nameSuffixNumber = generateUniqueNumbers(0, racerNameSuffixes.length, numberToGenerate);
	for (let i = 0; i < numberToGenerate; i++) {
        const name = [namePrefixNumber[i],nameSuffixNumber[i]];
		const colors = [
			Math.floor(Math.random() * 31),
			Math.floor(Math.random() * 31),
			Math.floor(Math.random() * 31),
		];
		racers.push(new Racer(i, name, colors));
	}
	return racers;
}

