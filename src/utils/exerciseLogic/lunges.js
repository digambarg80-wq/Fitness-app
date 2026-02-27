/**
 * LUNGE DETECTOR
 * Counts reps and checks form for lunges
 */

import { BaseDetector } from './baseDetector';
import { calculateAngle } from '../angleCalculator';

export class LungeDetector extends BaseDetector {
    constructor() {
        super('lunges');
        this.state = 'STANDING';
        this.repCount = 0;
        this.lastLeadingLeg = null;
        this.thresholds = {
            frontKneeTarget: 90,   // Ideal front knee angle
            backKneeMax: 150,       // Max back knee angle (should be bent)
            torsoUpright: 70        // Min torso angle (should be upright)
        };
    }
    
    analyze(landmarks) {
        const angles = this.calculateAngles(landmarks);
        this.lastAngles = angles;
        
        // Determine which leg is forward
        const leadingLeg = this.detectLeadingLeg(landmarks);
        
        this.formIssues = this.checkForm(angles, leadingLeg);
        this.updateStateMachine(angles, leadingLeg);
        
        return {
            repCount: this.repCount,
            state: this.state,
            formIssues: this.formIssues,
            angles: angles,
            leadingLeg: leadingLeg
        };
    }
    
    calculateAngles(landmarks) {
        // Knee angles
        const leftKnee = calculateAngle(
            landmarks[23], // left hip
            landmarks[25], // left knee
            landmarks[27]  // left ankle
        );
        
        const rightKnee = calculateAngle(
            landmarks[24], // right hip
            landmarks[26], // right knee
            landmarks[28]  // right ankle
        );
        
        // Hip angles
        const leftHip = calculateAngle(
            landmarks[11], // left shoulder
            landmarks[23], // left hip
            landmarks[25]  // left knee
        );
        
        const rightHip = calculateAngle(
            landmarks[12], // right shoulder
            landmarks[24], // right hip
            landmarks[26]  // right knee
        );
        
        // Torso angle
        const torsoAngle = calculateAngle(
            landmarks[11], // left shoulder
            landmarks[23], // left hip
            landmarks[25]  // left knee
        );
        
        return {
            leftKnee,
            rightKnee,
            leftHip,
            rightHip,
            torsoAngle
        };
    }
    
    detectLeadingLeg(landmarks) {
        // Compare ankle x positions to see which foot is forward
        const leftAnkleX = landmarks[27].x;
        const rightAnkleX = landmarks[28].x;
        
        // Calculate the difference
        const diff = Math.abs(leftAnkleX - rightAnkleX);
        
        // If feet are close together, not in lunge
        if (diff < 0.1) {
            return null; // Standing, feet together
        }
        
        // In screen coordinates, smaller x is left side of screen
        // But we just need relative position
        if (leftAnkleX < rightAnkleX - 0.05) {
            return 'LEFT';
        } else if (rightAnkleX < leftAnkleX - 0.05) {
            return 'RIGHT';
        } else {
            return null;
        }
    }
    
    checkForm(angles, leadingLeg) {
        const issues = [];
        
        if (!leadingLeg) return issues;
        
        const frontKnee = leadingLeg === 'LEFT' ? angles.leftKnee : angles.rightKnee;
        const backKnee = leadingLeg === 'LEFT' ? angles.rightKnee : angles.leftKnee;
        const frontHip = leadingLeg === 'LEFT' ? angles.leftHip : angles.rightHip;
        
        // Check front knee angle
        if (frontKnee > this.thresholds.frontKneeTarget + 15) {
            issues.push("Front knee not bent enough - lunge deeper");
        } else if (frontKnee < this.thresholds.frontKneeTarget - 15) {
            issues.push("Front knee bent too much - not as deep");
        }
        
        // Check back knee bend
        if (backKnee > this.thresholds.backKneeMax) {
            issues.push("Back leg too straight - bend back knee");
        }
        
        // Check torso upright
        if (angles.torsoAngle < this.thresholds.torsoUpright) {
            issues.push("Leaning forward - keep torso upright");
        }
        
        // Check front knee doesn't go past toes (approximate)
        if (frontHip < 60) {
            issues.push("Knee past toes - shift weight back");
        }
        
        return issues;
    }
    
    updateStateMachine(angles, leadingLeg) {
        if (!leadingLeg) {
            this.state = 'STANDING';
            return;
        }
        
        const frontKnee = leadingLeg === 'LEFT' ? angles.leftKnee : angles.rightKnee;
        
        switch(this.state) {
            case 'STANDING':
                if (leadingLeg && frontKnee < 120) {
                    this.updateState('LUNGING');
                }
                break;
                
            case 'LUNGING':
                if (frontKnee < 100) {
                    this.updateState('BOTTOM');
                }
                break;
                
            case 'BOTTOM':
                if (frontKnee > 140) {
                    this.updateState('STANDING');
                    
                    // Count a rep when returning to standing
                    // Alternate legs count as one full rep
                    if (this.lastLeadingLeg && this.lastLeadingLeg !== leadingLeg) {
                        this.repCount++;
                    }
                    this.lastLeadingLeg = leadingLeg;
                }
                break;
        }
    }
}