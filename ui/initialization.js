class DOMInitializer {
  static initialize() {
    // Wait for wordlists to be loaded
    function waitForWordlists() {
      if (!window.racerNamePrefixes || !window.racerNameSuffixes) {
        setTimeout(waitForWordlists, 100);
        return;
      }
      
      // Initialize UI components
      if (window.SettingsPanel) {
        SettingsPanel.refresh();
      }
      if (window.Tabs) {
        Tabs.initialize();
      }
      if (window.EventHandlers) {
        EventHandlers.initializeAll();
      }

      // Hide the no-js message and show the game interface
      const noJsDiv = document.getElementById('no-js');
      if (noJsDiv) {
        noJsDiv.style.display = 'none';
      }

      // Show the intro screen with settings
      const introScreen = document.getElementById('introScreen');
      if (introScreen) {
        introScreen.style.display = 'block';
      }
    }
    
    waitForWordlists();
  }

  static initializeUI() {
    if (window.SettingsPanel) {
      SettingsPanel.refresh();
    }
    if (window.Tabs) {
      Tabs.initialize();
    }
    if (window.EventHandlers) {
      EventHandlers.initializeAll();
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    DOMInitializer.initialize();
  });
} else {
  DOMInitializer.initialize();
}

window.initializeUI = DOMInitializer.initializeUI;