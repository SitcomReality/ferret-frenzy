// LEGACY EVENT HANDLERS - MARKED FOR REMOVAL
// All functionality has been migrated to:
// - Application class (game:initialize event)
// - RaceManager (race:setup, race:start events)
// - ProgressionManager (race:startWeek event)
// - Component-based event handling in UIManager

// DEPRECATED: This file will be removed after confirming all event handlers are migrated
console.warn('eventHandlers.js is deprecated. Use EventBus and component-based event handling instead.');

// Stub implementations to prevent errors during transition
class EventHandlers {
    static initializeAll() {
        console.warn('EventHandlers.initializeAll() is deprecated. Events are now handled by the EventBus system.');
    }
}

window.EventHandlers = EventHandlers;