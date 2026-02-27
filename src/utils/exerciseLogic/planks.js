/**
 * PLANK DETECTOR
 * Tracks hold time and checks form for planks
 */

import { BaseDetector } from './baseDetector';
import { calculateAngle } from '../angleCalculator';

export class PlankDetector extends BaseDetector {
    constructor() {
        super('planks');
        this.startTime = null;
        this.holdTime = 0;
        this.thresholds = {
            torsoMin: 170,      // Minimum straight angle
            torsoMax: 185,      // Maximum straight angle
            hipRatioMin: 0.45,  // Minimum hip height ratio
            hipRatioMax: 0.65   // Maximum hip height ratio
        };
    }
    
    analyze(landmarks) {
        const angles = this.calculateAngles(landmarks);
        const positions = this.calculatePositions(landmarks);
        
        // Check if in plank position
        const isInPlank = this.detectPlankPosition(angles, positions);
        
        if (isInPlank) {
            if (!this.startTime) {
                this.startTime = Date.now();
            }
            this.holdTime = Math.floor((Date.now() - this.startTime) / 1000);
            this.formIssues = this.checkForm(angles, positions);
            this.state = 'HOLDING';
        } else {
            if (this.state === 'HOLDING') {
                // Just finished a plank
                this.state = 'FINISHED';
            } else {
                this.state = 'NOT_IN_PLANK';
            }
            this.startTime = null;
            this.holdTime = 0;
        }
        
        return {
            isInPlank,
            holdTime: this.holdTime,
            state: this.state,
            formIssues: this.formIssues,
            angles: angles
        };
    }
    
    calculateAngles(landmarks) {
        // Torso angle (shoulder to hip to knee)
        const torsoAngle = calculateAngle(
            landmarks[11], // left shoulder
            landmarks[23], // left hip
            landmarks[25]  // left knee
        );
        
        // Shoulder angle (hip to shoulder to elbow)
        const leftShoulder = calculateAngle(
            landmarks[23], // left hip
            landmarks[11], // left shoulder
            landmarks[13]  // left elbow
        );
        
        const rightShoulder = calculateAngle(
            landmarks[24], // right hip
            landmarks[12], // right shoulder
            landmarks[14]  // right elbow
        );
        
        // Elbow angles (for forearm planks)
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
        
        return {
            torsoAngle,
            leftShoulder,
            rightShoulder,
            avgShoulder: (leftShoulder + rightShoulder) / 2,
            leftElbow,
            rightElbow,
            avgElbow: (leftElbow + rightElbow) / 2
        };
    }
    
    calculatePositions(landmarks) {
        // Get average Y positions
        const shoulderY = (landmarks[11].y + landmarks[12].y) / 2;
        const hipY = (landmarks[23].y + landmarks[24].y) / 2;
        const ankleY = (landmarks[27].y + landmarks[28].y) / 2;
        
        // Calculate hip ratio (where hips are between shoulders and ankles)
        // 0 = hips at shoulders, 1 = hips at ankles
        const hipRatio = (hipY - shoulderY) / (ankleY - shoulderY);
        
        return {
            shoulderY,
            hipY,
            ankleY,
            hipRatio
        };
    }
    
    detectPlankPosition(angles, positions) {
        // Check if body is relatively straight
        if (angles.torsoAngle < this.thresholds.torsoMin || 
            angles.torsoAngle > this.thresholds.torsoMax) {
            return false;
        }
        
        // Check if hips are at reasonable height
        if (positions.hipRatio < this.thresholds.hipRatioMin || 
            positions.hipRatio > this.thresholds.hipRatioMax) {
            return false;
        }
        
        return true;
    }
    
    checkForm(angles, positions) {
        const issues = [];
        
        // Check back straightness
        if (angles.torsoAngle < this.thresholds.torsoMin) {
            issues.push("Hips sagging - tighten your core");
        } else if (angles.torsoAngle > this.thresholds.torsoMax) {
            issues.push("Hips too high - lower your hips");
        }
        
        // Check hip position
        if (positions.hipRatio < this.thresholds.hipRatioMin) {
            issues.push("Hips too high - piking position");
        } else if (positions.hipRatio > this.thresholds.hipRatioMax) {
            issues.push("Hips too low - sagging");
        }
        
        // Check shoulder alignment
        if (angles.avgShoulder < 80 || angles.avgShoulder > 100) {
            issues.push("Shoulders not stacked over elbows");
        }
        
        // Check if elbows are bent (for straight arm planks)
        if (angles.avgElbow < 160) {
            issues.push("Arms are bent - lock your elbows");
        }
        
        return issues;
    }
    
    reset() {
        super.reset();
        this.startTime = null;
        this.holdTime = 0;
    }
}