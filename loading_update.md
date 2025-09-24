export class LoadingManager {
  constructor() {
    this.loadingPromises = new Map();
    this.loadedAssets = new Map();
    this.loadingStates = new Map();
    this.retryAttempts = 3;
    this.retryDelay = 1000;
  }

  /**
   * Load a resource with retry logic
   */
  async loadResource(key, loadFunction, retryCount = 0) {
    try {
      this.setLoadingState(key, 'loading');
      const result = await loadFunction();
      this.loadedAssets.set(key, result);
      this.setLoadingState(key, 'loaded');
      return result;
    } catch (error) {
      if (retryCount < this.retryAttempts) {
        console.warn(`Retrying load for ${key} (attempt ${retryCount + 1})`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.loadResource(key, loadFunction, retryCount + 1);
      }
      this.setLoadingState(key, 'error');
      throw new Error(`Failed to load ${key} after ${this.retryAttempts} attempts: ${error.message}`);
    }
  }

  /**
   * Load multiple resources in parallel
   */
  async loadResources(resources) {
    const promises = resources.map(({ key, loadFunction }) => 
      this.loadResource(key, loadFunction).catch(error => {
        console.error(`Failed to load ${key}:`, error);
        return null;
      })
    );
    
    return Promise.allSettled(promises);
  }

  /**
   * Get loading state
   */
  getLoadingState(key) {
    return this.loadingStates.get(key) || 'not-started';
  }

  /**
   * Set loading state
   */
  setLoadingState(key, state) {
    this.loadingStates.set(key, state);
    this.notifyLoadingStateChange(key, state);
  }

  /**
   * Notify about loading state changes
   */
  notifyLoadingStateChange(key, state) {
    window.dispatchEvent(new CustomEvent('loading-state-changed', {
      detail: { key, state }
    }));
  }

  /**
   * Check if all resources are loaded
   */
  areAllLoaded() {
    return Array.from(this.loadingStates.values()).every(state => state === 'loaded');
  }

  /**
   * Get loading progress
   */
  getProgress() {
    const states = Array.from(this.loadingStates.values());
    const loaded = states.filter(state => state === 'loaded').length;
    const total = states.length;
    return total > 0 ? loaded / total : 0;
  }

  /**
   * Reset loading manager
   */
  reset() {
    this.loadingPromises.clear();
    this.loadedAssets.clear();
    this.loadingStates.clear();
  }
}

export const loadingManager = new LoadingManager();