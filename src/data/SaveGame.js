/**
 * SaveGame - Handles game save/load functionality
 */
export class SaveGame {
  constructor(gameState, eventBus) {
    this.gameState = gameState;
    this.eventBus = eventBus;
    this.storageKey = 'ferretRacingGameState';
    this.backupKey = 'ferretRacingGameStateBackup';
    this.maxBackups = 3;
  }

  /**
   * Save current game state
   */
  async save(slotName = 'auto') {
    try {
      const saveData = this.serializeGameState();
      const saveSlot = {
        version: '1.0',
        timestamp: Date.now(),
        slotName: slotName,
        data: saveData
      };

      // Save to localStorage
      const key = `${this.storageKey}_${slotName}`;
      localStorage.setItem(key, JSON.stringify(saveSlot));

      // Create backup for auto saves
      if (slotName === 'auto') {
        this.createBackup(saveSlot);
      }

      this.eventBus?.emit('save:completed', { slotName, timestamp: saveSlot.timestamp });
      return true;
    } catch (error) {
      console.error('Failed to save game:', error);
      this.eventBus?.emit('save:failed', { error: error.message });
      return false;
    }
  }

  /**
   * Load game state from save slot
   */
  async load(slotName = 'auto') {
    try {
      const key = `${this.storageKey}_${slotName}`;
      const saveData = localStorage.getItem(key);

      if (!saveData) {
        throw new Error(`Save slot '${slotName}' not found`);
      }

      const saveSlot = JSON.parse(saveData);

      // Validate save data version
      if (!this.validateSaveVersion(saveSlot.version)) {
        // Try to migrate from older version
        const migratedData = this.migrateSaveData(saveSlot);
        if (migratedData) {
          saveSlot.data = migratedData;
        } else {
          throw new Error('Incompatible save version');
        }
      }

      // Deserialize game state
      this.deserializeGameState(saveSlot.data);

      this.eventBus?.emit('load:completed', { slotName, timestamp: saveSlot.timestamp });
      return true;
    } catch (error) {
      console.error('Failed to load game:', error);
      this.eventBus?.emit('load:failed', { error: error.message });
      return false;
    }
  }

  /**
   * Serialize current game state
   */
  serializeGameState() {
    return {
      gameState: this.gameState.serialize(),
      racers: this.serializeRacers(),
      tracks: this.serializeTracks(),
      raceHistory: this.gameState.raceHistory,
      settings: this.gameState.settings,
      player: this.gameState.player,
      progression: this.serializeProgression()
    };
  }

  /**
   * Deserialize game state
   */
  deserializeGameState(data) {
    // Restore game state
    if (data.gameState) {
      this.gameState.deserialize(data.gameState);
    }

    // Restore racers
    if (data.racers) {
      this.deserializeRacers(data.racers);
    }

    // Restore tracks
    if (data.tracks) {
      this.deserializeTracks(data.tracks);
    }

    // Restore other data
    if (data.raceHistory) {
      this.gameState.raceHistory = data.raceHistory;
    }

    if (data.settings) {
      this.gameState.settings = data.settings;
    }

    if (data.player) {
      this.gameState.player = data.player;
    }

    if (data.progression) {
      this.deserializeProgression(data.progression);
    }
  }

  /**
   * Serialize racers with component data
   */
  serializeRacers() {
    return this.gameState.racers.map(racer => {
      if (racer && racer.serialize) {
        return racer.serialize();
      }
      return null;
    }).filter(racer => racer !== null);
  }

  /**
   * Deserialize racers with component data
   */
  deserializeRacers(racerData) {
    this.gameState.racers = racerData.map(racerSerialized => {
      if (racerSerialized && window.Racer) {
        const racer = new window.Racer(
          racerSerialized.id,
          racerSerialized.name,
          racerSerialized.colors,
          this.gameState.settings
        );

        // Restore component data
        if (racer.deserialize) {
          racer.deserialize(racerSerialized);
        }

        return racer;
      }
      return null;
    }).filter(racer => racer !== null);
  }

  /**
   * Serialize tracks
   */
  serializeTracks() {
    return this.gameState.tracks.map(track => {
      if (track) {
        return {
          id: track.id,
          name: track.name,
          sections: track.sections
        };
      }
      return null;
    }).filter(track => track !== null);
  }

  /**
   * Deserialize tracks
   */
  deserializeTracks(trackData) {
    this.gameState.tracks = trackData.map(trackSerialized => {
      if (trackSerialized && window.Track) {
        const track = new window.Track(trackSerialized.id, trackSerialized.name);
        track.sections = trackSerialized.sections;
        return track;
      }
      return null;
    }).filter(track => track !== null);
  }

  /**
   * Serialize progression data
   */
  serializeProgression() {
    const progressionManager = this.eventBus?._progressionManager;
    if (progressionManager && progressionManager.getProgressionStats) {
      return progressionManager.getProgressionStats();
    }
    return {
      currentSeason: 1,
      weekInSeason: 1,
      totalWeeksCompleted: 0,
      racesCompleted: 0,
      achievements: []
    };
  }

  /**
   * Deserialize progression data
   */
  deserializeProgression(progressionData) {
    const progressionManager = this.eventBus?._progressionManager;
    if (progressionManager && progressionData) {
      // Restore progression state
      if (progressionData.currentSeason) {
        progressionManager.currentSeason = progressionData.currentSeason;
      }
      if (progressionData.weekInSeason) {
        progressionManager.weekInSeason = progressionData.weekInSeason;
      }
      if (progressionData.totalWeeksCompleted) {
        progressionManager.totalWeeksCompleted = progressionData.totalWeeksCompleted;
      }
      if (progressionData.achievements) {
        progressionManager.achievements = new Set(progressionData.achievements);
      }
    }
  }

  /**
   * Create backup of save data
   */
  createBackup(saveSlot) {
    const backups = this.getBackups();
    backups.push({
      ...saveSlot,
      backupId: Date.now()
    });

    // Keep only the most recent backups
    if (backups.length > this.maxBackups) {
      backups.sort((a, b) => b.backupId - a.backupId);
      backups.splice(this.maxBackups);
    }

    localStorage.setItem(this.backupKey, JSON.stringify(backups));
  }

  /**
   * Get list of backup saves
   */
  getBackups() {
    try {
      const backupData = localStorage.getItem(this.backupKey);
      return backupData ? JSON.parse(backupData) : [];
    } catch (error) {
      console.error('Failed to load backups:', error);
      return [];
    }
  }

  /**
   * Restore from backup
   */
  restoreFromBackup(backupId) {
    const backups = this.getBackups();
    const backup = backups.find(b => b.backupId === backupId);

    if (backup) {
      // Save current state as emergency backup
      const currentSave = this.serializeGameState();
      localStorage.setItem(`${this.storageKey}_emergency`, JSON.stringify({
        version: '1.0',
        timestamp: Date.now(),
        data: currentSave
      }));

      // Restore from backup
      this.deserializeGameState(backup.data);
      this.eventBus?.emit('restore:completed', { backupId, timestamp: backup.timestamp });
      return true;
    }

    return false;
  }

  /**
   * Get list of save slots
   */
  getSaveSlots() {
    const slots = [];
    const keys = Object.keys(localStorage);

    keys.forEach(key => {
      if (key.startsWith(`${this.storageKey}_`)) {
        try {
          const saveData = JSON.parse(localStorage.getItem(key));
          if (saveData && saveData.slotName) {
            slots.push({
              slotName: saveData.slotName,
              timestamp: saveData.timestamp,
              version: saveData.version
            });
          }
        } catch (error) {
          console.error(`Failed to parse save slot: ${key}`, error);
        }
      }
    });

    return slots.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Delete save slot
   */
  deleteSaveSlot(slotName) {
    try {
      const key = `${this.storageKey}_${slotName}`;
      localStorage.removeItem(key);
      this.eventBus?.emit('save:deleted', { slotName });
      return true;
    } catch (error) {
      console.error('Failed to delete save slot:', error);
      return false;
    }
  }

  /**
   * Validate save version
   */
  validateSaveVersion(version) {
    const currentVersion = '1.0';
    return version === currentVersion;
  }

  /**
   * Migrate save data from older versions
   */
  migrateSaveData(saveSlot) {
    // Handle migration from older save formats
    if (saveSlot.version === '0.9') {
      // Example migration logic
      return this.migrateFromV0_9(saveSlot.data);
    }

    return null;
  }

  /**
   * Migrate from version 0.9
   */
  migrateFromV0_9(data) {
    // Convert old format to new format
    const migrated = { ...data };

    // Example: Convert old racer format to new component-based format
    if (migrated.racers && Array.isArray(migrated.racers)) {
      migrated.racers = migrated.racers.map(racer => {
        if (racer && !racer.components) {
          // Convert old format to new component format
          return {
            id: racer.id,
            name: racer.name,
            colors: racer.colors,
            components: {
              stats: { stats: racer.stats || {} },
              performance: racer.performance || {},
              betting: racer.betting || {},
              history: racer.history || {}
            }
          };
        }
        return racer;
      });
    }

    return migrated;
  }

  /**
   * Export save data for download
   */
  exportSave(slotName = 'auto') {
    try {
      const key = `${this.storageKey}_${slotName}`;
      const saveData = localStorage.getItem(key);

      if (saveData) {
        const blob = new Blob([saveData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `ferret-racing-save-${slotName}-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);
        return true;
      }
    } catch (error) {
      console.error('Failed to export save:', error);
    }

    return false;
  }

  /**
   * Import save data from file
   */
  async importSave(file) {
    try {
      const text = await file.text();
      const saveSlot = JSON.parse(text);

      if (this.validateSaveVersion(saveSlot.version)) {
        const key = `${this.storageKey}_${saveSlot.slotName || 'imported'}`;
        localStorage.setItem(key, text);

        this.eventBus?.emit('import:completed', { slotName: saveSlot.slotName });
        return true;
      }
    } catch (error) {
      console.error('Failed to import save:', error);
    }

    return false;
  }

  /**
   * Clear all save data
   */
  clearAllSaves() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.storageKey)) {
          localStorage.removeItem(key);
        }
      });

      localStorage.removeItem(this.backupKey);

      this.eventBus?.emit('saves:cleared');
      return true;
    } catch (error) {
      console.error('Failed to clear saves:', error);
      return false;
    }
  }
}