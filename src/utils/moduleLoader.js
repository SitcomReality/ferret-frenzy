/**
 * ModuleLoader - Handles dynamic loading of ES6 modules with fallback support
 */
export class ModuleLoader {
  constructor() {
    this.modules = new Map();
    this.loadedModules = new Set();
    this.moduleCache = new Map();
    this.fallbackModules = new Map();
    this.loadingPromises = new Map();
  }

  /**
   * Check if the browser supports ES6 modules
   */
  static supportsModules() {
    return 'noModule' in HTMLScriptElement.prototype;
  }

  /**
   * Dynamically import a module with fallback support
   */
  async loadModule(modulePath) {
    if (this.loadedModules.has(modulePath)) {
      return this.moduleCache.get(modulePath);
    }

    if (this.loadingPromises.has(modulePath)) {
      return this.loadingPromises.get(modulePath);
    }

    const loadingPromise = this._loadModuleInternal(modulePath);
    this.loadingPromises.set(modulePath, loadingPromise);

    try {
      const module = await loadingPromise;
      this.loadedModules.add(modulePath);
      this.moduleCache.set(modulePath, module);
      this.loadingPromises.delete(modulePath);
      return module;
    } catch (error) {
      this.loadingPromises.delete(modulePath);
      throw error;
    }
  }

  async _loadModuleInternal(modulePath) {
    try {
      // Try ES6 dynamic import first
      const module = await import(modulePath);
      return module;
    } catch (error) {
      console.warn(`Failed to load module ${modulePath} via dynamic import:`, error);
      return this.loadModuleViaScript(modulePath);
    }
  }

  /**
   * Load module using script tag (fallback for older browsers)
   */
  loadModuleViaScript(modulePath) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = modulePath;

      script.onload = () => {
        const moduleName = this.extractModuleName(modulePath);
        const module = window[moduleName];
        if (module) {
          resolve(module);
        } else {
          reject(new Error(`Module ${moduleName} not found on window object`));
        }
      };

      script.onerror = () => {
        reject(new Error(`Failed to load module: ${modulePath}`));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Load multiple modules in parallel
   */
  async loadModules(modulePaths) {
    if (!modulePaths) {
      return this.loadDefaultModules();
    }

    const loadPromises = modulePaths.map(path => this.loadModule(path));
    return Promise.all(loadPromises);
  }

  /**
   * Load default application modules
   */
  async loadDefaultModules() {
    const coreModules = [
      './core/GameState.js',
      './core/EventBus.js',
      './game/RaceManager.js',
      './game/betting/BettingManager.js',
      './game/progression/ProgressionManager.js'
    ];

    try {
      const results = await this.loadModules(coreModules);
      console.log('Core modules loaded successfully');
      return results;
    } catch (error) {
      console.error('Failed to load core modules:', error);
      throw error;
    }
  }

  /**
   * Extract module name from path
   */
  extractModuleName(modulePath) {
    const parts = modulePath.split('/');
    const fileName = parts[parts.length - 1];
    return fileName.replace('.js', '').replace(/-/g, '');
  }

  /**
   * Check if a module is loaded
   */
  isLoaded(modulePath) {
    return this.loadedModules.has(modulePath);
  }

  /**
   * Get a loaded module
   */
  getModule(modulePath) {
    return this.moduleCache.get(modulePath);
  }

  /**
   * Add fallback module for offline support
   */
  addFallbackModule(modulePath, moduleContent) {
    this.fallbackModules.set(modulePath, moduleContent);
  }

  /**
   * Clear module cache
   */
  clearCache() {
    this.loadedModules.clear();
    this.moduleCache.clear();
    this.loadingPromises.clear();
  }
}