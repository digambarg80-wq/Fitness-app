import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs';

let detector = null;

export async function initPoseDetector() {
  if (detector) return detector;
  
  // Initialize TensorFlow.js
  await tf.ready();
  
  const model = poseDetection.SupportedModels.MoveNet;
  const detectorConfig = {
    modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
    enableSmoothing: true
  };
  
  detector = await poseDetection.createDetector(model, detectorConfig);
  return detector;
}

export function calculateAngle(pointA, pointB, pointC) {
  const vectorAB = { x: pointB.x - pointA.x, y: pointB.y - pointA.y };
  const vectorBC = { x: pointC.x - pointB.x, y: pointC.y - pointB.y };
  
  const dotProduct = vectorAB.x * vectorBC.x + vectorAB.y * vectorBC.y;
  const magnitudeAB = Math.sqrt(vectorAB.x ** 2 + vectorAB.y ** 2);
  const magnitudeBC = Math.sqrt(vectorBC.x ** 2 + vectorBC.y ** 2);
  
  if (magnitudeAB === 0 || magnitudeBC === 0) return 0;
  
  const cosAngle = dotProduct / (magnitudeAB * magnitudeBC);
  const angleRadians = Math.acos(Math.max(-1, Math.min(1, cosAngle)));
  return angleRadians * (180 / Math.PI);
}

export async function detectPoseFromImage(imageData) {
  if (!detector) {
    detector = await initPoseDetector();
  }
  
  const poses = await detector.estimatePoses(imageData);
  return poses[0] || null;
}

export function analyzePushUp(pose) {
  if (!pose || !pose.keypoints) return { repDetected: false, feedback: 'No pose detected' };
  
  const keypoints = pose.keypoints;
  
  // Get relevant keypoints
  const leftShoulder = keypoints[11];
  const leftElbow = keypoints[13];
  const leftWrist = keypoints[15];
  const rightShoulder = keypoints[12];
  const rightElbow = keypoints[14];
  const rightWrist = keypoints[16];
  const leftHip = keypoints[23];
  const rightHip = keypoints[24];
  
  // Check if keypoints are visible
  if (leftShoulder.score < 0.3 || leftElbow.score < 0.3 || leftWrist.score < 0.3) {
    return { repDetected: false, feedback: 'Move to be fully visible' };
  }
  
  // Calculate angles
  const leftElbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
  const rightElbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
  const avgElbowAngle = (leftElbowAngle + rightElbowAngle) / 2;
  
  // Check body straightness
  const bodyAngle = calculateAngle(leftShoulder, leftHip, rightHip);
  const isBodyStraight = bodyAngle > 160 && bodyAngle < 180;
  
  // Detect rep
  const isDown = avgElbowAngle < 90;
  const isUp = avgElbowAngle > 150;
  
  let feedback = '';
  if (!isBodyStraight) {
    feedback = 'Keep back straight';
  } else if (isDown) {
    feedback = 'Good depth - push up!';
  } else if (isUp) {
    feedback = 'Good form - lower down';
  }
  
  return {
    repDetected: isDown, // Will be handled by state machine
    angle: avgElbowAngle,
    feedback,
    isDown,
    isUp
  };
}

export function analyzeSquat(pose) {
  if (!pose || !pose.keypoints) return { repDetected: false, feedback: 'No pose detected' };
  
  const keypoints = pose.keypoints;
  
  // Get relevant keypoints
  const leftHip = keypoints[23];
  const leftKnee = keypoints[25];
  const leftAnkle = keypoints[27];
  const rightHip = keypoints[24];
  const rightKnee = keypoints[26];
  const rightAnkle = keypoints[28];
  const leftShoulder = keypoints[11];
  
  // Check visibility
  if (leftHip.score < 0.3 || leftKnee.score < 0.3 || leftAnkle.score < 0.3) {
    return { repDetected: false, feedback: 'Move to be fully visible' };
  }
  
  // Calculate angles
  const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
  const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
  const avgKneeAngle = (leftKneeAngle + rightKneeAngle) / 2;
  
  // Check torso angle
  const torsoAngle = calculateAngle(leftShoulder, leftHip, leftKnee);
  const isUpright = torsoAngle > 70;
  
  // Detect rep
  const isDown = avgKneeAngle < 100;
  const isUp = avgKneeAngle > 150;
  
  let feedback = '';
  if (!isUpright) {
    feedback = 'Keep chest up';
  } else if (isDown) {
    feedback = 'Good depth - stand up!';
  } else if (isUp) {
    feedback = 'Good form - lower down';
  }
  
  return {
    repDetected: isDown,
    angle: avgKneeAngle,
    feedback,
    isDown,
    isUp
  };
}