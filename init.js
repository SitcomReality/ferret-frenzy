import { calculateBasePropertyAverage, generateUniqueNumbers } from './src/utils/helpers.js';
import { Racer } from './src/entities/racer/Racer.js';
import { Track } from './Track.js';

// Import locationSuffixes from the constants file
import { locationSuffixes } from './wordlist/const_locationSuffixes.js';

window.Track = Track; // for save/load compatibility

function initGame(gameState) {

