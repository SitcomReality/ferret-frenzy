function generateRacers(total) {
	const racers = [];
	const rprops = gameState.settings.racerProperties;
	let speedMax = rprops.speedBaseMax;
	let speedMin = rprops.speedBaseMin;
	
    for (let i = 0; i < total; i++) {

        racers.push({
            id: i,
            name: `${racerNamePrefixes[Math.floor(Math.random() * racerNamePrefixes.length)]} ${racerNameSuffixes[Math.floor(Math.random() * racerNameSuffixes.length)]}`,
            colors: [
                racerColors[Math.floor(Math.random() * racerColors.length)],
                racerColors[Math.floor(Math.random() * racerColors.length)],
                racerColors[Math.floor(Math.random() * racerColors.length)]
            ],
            speed: {
				q: [
					(Math.random() * (rprops.speedVariationPerQuarterMax - rprops.speedVariationPerQuarterMin) + rprops.speedVariationPerQuarterMin).toFixed(1),
					(Math.random() * (rprops.speedVariationPerQuarterMax - rprops.speedVariationPerQuarterMin) + rprops.speedVariationPerQuarterMin).toFixed(1),
					(Math.random() * (rprops.speedVariationPerQuarterMax - rprops.speedVariationPerQuarterMin) + rprops.speedVariationPerQuarterMin).toFixed(1),
					(Math.random() * (rprops.speedVariationPerQuarterMax - rprops.speedVariationPerQuarterMin) + rprops.speedVariationPerQuarterMin).toFixed(1),
				],
                grass: (Math.random() * (speedMax - speedMin) + speedMin).toFixed(1),
                water: (Math.random() * (speedMax - speedMin) + speedMin).toFixed(1),
                rocks: (Math.random() * (speedMax - speedMin) + speedMin).toFixed(1),
                ice: (Math.random() * (speedMax - speedMin) + speedMin).toFixed(1),
				lava: (Math.random() * (speedMax - speedMin) + speedMin).toFixed(1),
                tar: (Math.random() * (speedMax - speedMin) + speedMin).toFixed(1),
            },
            history: [],
        });
    }
    return racers;
}

function generateNewRacers(numberToGenerate) {
	const racers = [];
	// Safely reference global name lists; fallback to simple placeholders if missing
	const namePrefixes = (typeof racerNamePrefixes !== 'undefined') ? racerNamePrefixes : Array.from({length:100}, (_,i)=>"Name"+(i+1));
	const nameSuffixes = (typeof racerNameSuffixes !== 'undefined') ? racerNameSuffixes : Array.from({length:100}, (_,i)=>"Suf"+(i+1));
	const namePrefixNumber = generateUniqueNumbers(0, namePrefixes.length - 1, numberToGenerate);
	const nameSuffixNumber = generateUniqueNumbers(0, nameSuffixes.length - 1, numberToGenerate);
	for (let i = 0; i < numberToGenerate; i++) {
        const name = [namePrefixNumber[i],nameSuffixNumber[i]];
		//const name = `${racerNamePrefixes[Math.floor(Math.random() * racerNamePrefixes.length)]} ${racerNameSuffixes[Math.floor(Math.random() * racerNameSuffixes.length)]}`;
		const colors = [
			Math.floor(Math.random() * 31),
			Math.floor(Math.random() * 31),
			Math.floor(Math.random() * 31),
		];
		racers.push(new Racer(i, name, colors));
	}
	return racers;
}