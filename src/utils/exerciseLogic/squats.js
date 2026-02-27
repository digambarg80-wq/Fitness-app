/**
 * SQUAT DETECTOR
 * Counts reps and checks form for squats
 */

import { BaseDetector } from './baseDetector';
import { calculateAngle } from '../angleCalculator';

export class SquatDetector extends BaseDetector {
    constructor() {
        super('squats');
        this.state = 'STANDING';
        this.thresholds = {
            standingAngle: 160,  // Knee angle when standing
            bottomAngle: 90,      // Knee angle at bottom
            torsoMin: 45,         // Minimum torso lean (to prevent falling forward)
            hipMin: 70            // Minimum hip angle at bottom
        };
    }
    
    analyze(landmarks) {
        const angles = this.calculateAngles(landmarks);
        this.lastAngles = angles;
        
        // Check for knee valgus
        const kneeValgus = this.detectKneeValgus(landmarks);
        
        this.formIssues = this.checkForm(angles, kneeValgus);
        this.updateStateMachine(angles.avgKnee);
        
        return {
            repCount: this.repCount,
            state: this.state,
            formIssues: this.formIssues,
            angles: angles,
            kneeValgus: kneeValgus
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
        
        // Torso angle relative to vertical
        const torsoAngle = 90 - calculateAngle(
            landmarks[11], // left shoulder
            landmarks[23], // left hip
            { x: landmarks[23].x, y: landmarks[23].y - 1, z: landmarks[23].z } // point above hip
        );
        
        return {
            leftKnee,
            rightKnee,
            avgKnee: (leftKnee + rightKnee) / 2,
            leftHip,
            rightHip,
            avgHip: (leftHip + rightHip) / 2,
            torsoAngle: Math.abs(torsoAngle)
        };
    }
    
    detectKneeValgus(landmarks) {
        // Check if knees collapse inward
        const leftKneeX = landmarks[25].x;
        const leftAnkleX = landmarks[27].x;
        const rightKneeX = landmarks[26].x;
        const rightAnkleX = landmarks[28].x;
        
        const valgus = {
            left: false,
            right: false
        };
        
        // Left knee should be outside or above left ankle
        if (leftKneeX > leftAnkleX + 0.05) {
            valgus.left = true;
        }
        
        // Right knee should be outside or above right ankle
        if (rightKneeX < rightAnkleX - 0.05) {
            valgus.right = true;
        }
        
        return valgus;
    }
    
    checkForm(angles, kneeValgus) {
        const issues = [];
        
        // Check depth
        if (this.state === 'BOTTOM' && angles.avgKnee > 100) {
            issues.push("Not deep enough - go lower until thighs parallel");
        }
        
        // Check knee valgus
        if (kneeValgus.left || kneeValgus.right) {
            issues.push("Knees collapsing inward - push knees out");
        }
        
        // Check torso lean
        if (angles.torsoAngle < this.thresholds.torsoMin) {
            issues.push("Leaning too far forward - keep chest up");
        }
        
        // Check butt wink (excessive hip rotation at bottom)
        if (this.state === 'BOTTOM' && angles.avgHip < this.thresholds.hipMin) {
            issues.push("Butt tucking under - don't go as deep");
        }
        
        // Check asymmetry
        if (Math.abs(angles.leftKnee - angles.rightKnee) > 10) {
            issues.push("Uneven squat - weight shifting to one side");
        }
        
        return issues;
    }
    
    updateStateMachine(kneeAngle) {
        switch(this.state) {
            case 'STANDING':
                if (kneeAngle < 140) {
                    this.updateState('GOING_DOWN');
                }
                break;
                
            case 'GOING_DOWN':
                if (kneeAngle < this.thresholds.bottomAngle + 10) {
                    this.updateState('BOTTOM');
                }
                break;
                
            case 'BOTTOM':
                if (kneeAngle > this.thresholds.standingAngle - 10) {
                    this.updateState('STANDING');
                    this.repCount++;
                }
                break;
        }
    }
}