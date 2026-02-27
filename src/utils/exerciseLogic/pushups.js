/**
 * PUSH-UP DETECTOR
 * Counts reps and checks form for push-ups
 */

import { BaseDetector } from './baseDetector';
import { calculateAngle } from '../angleCalculator';

export class PushupDetector extends BaseDetector {
    constructor() {
        super('pushups');
        this.state = 'UP';
        this.thresholds = {
            upAngle: 160,      // Elbow angle when arms straight
            downAngle: 90,     // Elbow angle at bottom
            torsoMin: 170,     // Minimum straight back angle
            torsoMax: 185,     // Maximum straight back angle
            shoulderMin: 70    // Minimum shoulder angle (to prevent flaring)
        };
    }
    
    analyze(landmarks) {
        // Calculate angles
        const angles = this.calculateAngles(landmarks);
        this.lastAngles = angles;
        
        // Check form
        this.formIssues = this.checkForm(angles);
        
        // Update state machine for rep counting
        this.updateStateMachine(angles.avgElbow);
        
        return {
            repCount: this.repCount,
            state: this.state,
            formIssues: this.formIssues,
            angles: angles
        };
    }
    
    calculateAngles(landmarks) {
        // Elbow angles
        const leftElbow = calculateAngle(
            landmarks[11], // left shoulder
            landmarks[13], // left elbow
            landmarks[15]  // left wrist
        );
        
        const rightElbow = calculateAngle(
            landmarks[12], // right shoulder
            landmarks[14], // right elbow
            landmarks[16]  // right wrist
        );
        
        // Torso angle (shoulder to hip to knee)
        const torsoAngle = calculateAngle(
            landmarks[11], // left shoulder
            landmarks[23], // left hip
            landmarks[25]  // left knee
        );
        
        // Shoulder angle (hip to shoulder to elbow)
        const leftShoulderAngle = calculateAngle(
            landmarks[23], // left hip
            landmarks[11], // left shoulder
            landmarks[13]  // left elbow
        );
        
        const rightShoulderAngle = calculateAngle(
            landmarks[24], // right hip
            landmarks[12], // right shoulder
            landmarks[14]  // right elbow
        );
        
        return {
            leftElbow,
            rightElbow,
            avgElbow: (leftElbow + rightElbow) / 2,
            torsoAngle,
            leftShoulderAngle,
            rightShoulderAngle,
            avgShoulder: (leftShoulderAngle + rightShoulderAngle) / 2
        };
    }
    
    checkForm(angles) {
        const issues = [];
        
        // Check back straightness
        if (angles.torsoAngle < this.thresholds.torsoMin) {
            issues.push("Back is sagging - tighten your core");
        } else if (angles.torsoAngle > this.thresholds.torsoMax) {
            issues.push("Hips too high - lower your hips");
        }
        
        // Check depth at bottom
        if (this.state === 'DOWN' && angles.avgElbow > 100) {
            issues.push("Not going low enough - chest should接近 floor");
        }
        
        // Check elbow flare (shoulder angle)
        if (angles.avgShoulder < this.thresholds.shoulderMin) {
            issues.push("Elbows flaring out - tuck them closer to body");
        }
        
        // Check asymmetry
        if (Math.abs(angles.leftElbow - angles.rightElbow) > 15) {
            issues.push("Uneven arms - one side is lower than the other");
        }
        
        return issues;
    }
    
    updateStateMachine(elbowAngle) {
        switch(this.state) {
            case 'UP':
                if (elbowAngle < 100) {
                    this.updateState('GOING_DOWN');
                }
                break;
                
            case 'GOING_DOWN':
                if (elbowAngle < this.thresholds.downAngle + 5) {
                    this.updateState('DOWN');
                }
                break;
                
            case 'DOWN':
                if (elbowAngle > this.thresholds.upAngle - 10) {
                    this.updateState('UP');
                    this.repCount++;
                }
                break;
        }
    }
}