/**
 * ANGLE CALCULATOR UTILITY
 * Core math functions for all exercise detection
 */

// Calculate angle between three points (in degrees)
export function calculateAngle(pointA, pointB, pointC) {
    // Get vectors
    const vectorAB = {
        x: pointB.x - pointA.x,
        y: pointB.y - pointA.y,
        z: pointB.z - pointA.z || 0
    };
    
    const vectorBC = {
        x: pointC.x - pointB.x,
        y: pointC.y - pointB.y,
        z: pointC.z - pointB.z || 0
    };
    
    // Calculate dot product
    const dotProduct = vectorAB.x * vectorBC.x + 
                       vectorAB.y * vectorBC.y + 
                       vectorAB.z * vectorBC.z;
    
    // Calculate magnitudes
    const magnitudeAB = Math.sqrt(
        vectorAB.x ** 2 + vectorAB.y ** 2 + vectorAB.z ** 2
    );
    const magnitudeBC = Math.sqrt(
        vectorBC.x ** 2 + vectorBC.y ** 2 + vectorBC.z ** 2
    );
    
    // Avoid division by zero
    if (magnitudeAB === 0 || magnitudeBC === 0) return 0;
    
    // Calculate angle in radians, convert to degrees
    const cosAngle = dotProduct / (magnitudeAB * magnitudeBC);
    // Clamp to avoid floating point errors
    const clampedCos = Math.max(-1, Math.min(1, cosAngle));
    const angleRadians = Math.acos(clampedCos);
    const angleDegrees = angleRadians * (180 / Math.PI);
    
    return Math.round(angleDegrees * 10) / 10; // Round to 1 decimal
}

// Calculate distance between two points
export function calculateDistance(pointA, pointB) {
    return Math.sqrt(
        (pointB.x - pointA.x) ** 2 +
        (pointB.y - pointA.y) ** 2 +
        ((pointB.z - pointA.z) || 0) ** 2
    );
}

// Normalize landmarks based on torso length (for scale invariance)
export function normalizeLandmarks(landmarks) {
    if (!landmarks || landmarks.length < 33) return landmarks;
    
    // Use shoulder-to-hip distance as reference
    const leftShoulder = landmarks[11];
    const leftHip = landmarks[23];
    const referenceDistance = calculateDistance(leftShoulder, leftHip);
    
    if (referenceDistance === 0) return landmarks;
    
    // Create normalized copy
    return landmarks.map(point => ({
        x: point.x / referenceDistance,
        y: point.y / referenceDistance,
        z: (point.z || 0) / referenceDistance,
        visibility: point.visibility || 1
    }));
}

// Calculate angle in frontal plane (for knee valgus detection)
export function calculateFrontalAngle(pointA, pointB, pointC) {
    // Use only x and y coordinates (ignore depth)
    const vectorAB = { 
        x: pointB.x - pointA.x, 
        y: pointB.y - pointA.y 
    };
    
    const vectorBC = { 
        x: pointC.x - pointB.x, 
        y: pointC.y - pointB.y 
    };
    
    const dotProduct = vectorAB.x * vectorBC.x + vectorAB.y * vectorBC.y;
    const magnitudeAB = Math.sqrt(vectorAB.x ** 2 + vectorAB.y ** 2);
    const magnitudeBC = Math.sqrt(vectorBC.x ** 2 + vectorBC.y ** 2);
    
    if (magnitudeAB === 0 || magnitudeBC === 0) return 0;
    
    const cosAngle = dotProduct / (magnitudeAB * magnitudeBC);
    const clampedCos = Math.max(-1, Math.min(1, cosAngle));
    const angleRadians = Math.acos(clampedCos);
    
    return angleRadians * (180 / Math.PI);
}

// Check if a point is visible (confidence > threshold)
export function isPointVisible(landmark, threshold = 0.5) {
    return landmark.visibility && landmark.visibility > threshold;
}

// Calculate midpoint between two points
export function calculateMidpoint(pointA, pointB) {
    return {
        x: (pointA.x + pointB.x) / 2,
        y: (pointA.y + pointB.y) / 2,
        z: ((pointA.z || 0) + (pointB.z || 0)) / 2
    };
}