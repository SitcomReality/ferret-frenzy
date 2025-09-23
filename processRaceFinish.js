function processRaceFinish() {
	cancelAnimationFrame(animationFrameId);
	updateRaceHistory(gameState.currentRace.results);
	if (gameState.currentRaceIndex > gameState.settings.weekProperties.numberOfRaces) {
		document.getElementById('startRaceWeek').disabled = false;
		document.getElementById('setupRace').disabled = true;
		console.log("DEBUG: the week was detected ended from beginRace()");
		HUD.setStep(4,'done'); HUD.setStep(2,'active'); HUD.setStatus('Week complete! Start a new Race Week when ready.');
	} else {
		document.getElementById('setupRace').disabled = false;
		document.getElementById('startRace').disabled = true;
		HUD.setStep(4,'done'); HUD.setStep(3,'active'); HUD.setStatus('Race finished. Setup the next race.');
	}
	if (window.canvasRenderer) window.canvasRenderer.stop();
}

