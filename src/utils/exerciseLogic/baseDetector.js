/**
 * BASE DETECTOR CLASS
 * All exercise detectors inherit from this
 */

export class BaseDetector {
    constructor(exerciseName) {
        this.exerciseName = exerciseName;
        this.state = 'UNKNOWN';
        this.repCount = 0;
        this.formIssues = [];
        this.lastAngles = {};
        this.stateHistory = [];
        this.consecutiveFrames = 0;
    }
    
    // Main method to be implemented by specific exercises
    analyze(landmarks) {
        throw new Error('analyze() must be implemented by subclass');
    }
    
    // Calculate angles - to be implemented by specific exercises
    calculateAngles(landmarks) {
        throw new Error('calculateAngles() must be implemented by subclass');
    }
    
    // Check form - to be implemented by specific exercises
    checkForm(angles) {
        throw new Error('checkForm() must be implemented by subclass');
    }
    
    // Update state machine - to be implemented by specific exercises
    updateStateMachine(angles) {
        throw new Error('updateStateMachine() must be implemented by subclass');
    }
    
    // Update state with history tracking
    updateState(newState) {
        this.stateHistory.push({
            state: this.state,
            timestamp: Date.now()
        });
        
        // Keep only last 20 states
        if (this.stateHistory.length > 20) {
            this.stateHistory.shift();
        }
        
        this.state = newState;
    }
    
    // Get state history
    getStateHistory() {
        return this.stateHistory;
    }
    
    // Reset detector
    reset() {
        this.state = 'UNKNOWN';
        this.repCount = 0;
        this.formIssues = [];
        this.stateHistory = [];
        this.consecutiveFrames = 0;
    }
    
    // Get current stats
    getStats() {
        return {
            exercise: this.exerciseName,
            reps: this.repCount,
            state: this.state,
            formIssues: this.formIssues,
            lastAngles: this.lastAngles
        };
    }
}