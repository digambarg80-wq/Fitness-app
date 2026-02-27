import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs';

let detector = null;
let lastRepState = {
  pushups: false,
  squats: false,
  lunges: false,
  planks: false
};

// Initialize pose detector
export async function initPoseDetector() {
  if (detector) return detector;
  
  await tf.ready();
  
  const model = poseDetection.SupportedModels.MoveNet;
  const detectorConfig = {
    modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
    enableSmoothing: true,
    enableTracking: true
  };
  
  detector = await poseDetection.createDetector(model, detectorConfig);
  return detector;
}

// Calculate angle between three points
export function calculateAngle(pointA, pointB, pointC) {
  if (!pointA || !pointB || !pointC) return 0;
  
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
  const angleRadians = Math.acos(Math.max(-1, Math.min(1, cosAngle)));
  return Math.round(angleRadians * (180 / Math.PI));
}

// Calculate distance between two points
export function calculateDistance(pointA, pointB) {
  if (!pointA || !pointB) return 0;
  return Math.sqrt(
    Math.pow(pointB.x - pointA.x, 2) + 
    Math.pow(pointB.y - pointA.y, 2)
  );
}

// Check if user is in correct position (60-85% rule)
export function checkPosition(pose, frameWidth, frameHeight) {
  if (!pose || !pose.keypoints) {
    return { 
      positionOk: false, 
      feedback: 'No pose detected - stand in frame' 
    };
  }
  
  // Get bounding box of visible keypoints
  let visiblePoints = pose.keypoints.filter(p => p.score > 0.3);
  
  if (visiblePoints.length < 5) {
    return { positionOk: false, feedback: 'Stand clearly in frame' };
  }
  
  let minX = 1, minY = 1, maxX = 0, maxY = 0;
  visiblePoints.forEach(point => {
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  });
  
  const bodyHeight = (maxY - minY) * 100;
  
  if (bodyHeight < 40) {
    return { 
      positionOk: false, 
      feedback: 'Too far - move closer to camera' 
    };
  }
  
  if (bodyHeight > 90) {
    return { 
      positionOk: false, 
      feedback: 'Too close - move back' 
    };
  }
  
  return { 
    positionOk: true, 
    feedback: 'Good position!',
    percentage: bodyHeight 
  };
}

// Check camera view (side view for exercises)
export function checkCameraView(pose) {
  if (!pose || !pose.keypoints) {
    return { viewOk: false, feedback: 'No pose detected' };
  }
  
  const leftShoulder = pose.keypoints[11];
  const rightShoulder = pose.keypoints[12];
  
  if (leftShoulder?.score < 0.3 || rightShoulder?.score < 0.3) {
    return { viewOk: false, feedback: 'Cannot see shoulders clearly' };
  }
  
  // Check if user is sideways (shoulders have different x positions)
  const shoulderXDiff = Math.abs(rightShoulder.x - leftShoulder.x);
  const shoulderYDiff = Math.abs(rightShoulder.y - leftShoulder.y);
  
  // If shoulders are very close in x-axis, user is facing camera (wrong)
  if (shoulderXDiff < 0.1 && shoulderYDiff < 0.1) {
    return { 
      viewOk: false, 
      feedback: 'Turn sideways for better tracking' 
    };
  }
  
  return { viewOk: true, feedback: 'Good camera angle' };
}

// PUSH-UP ANALYSIS
export function analyzePushUp(pose) {
  if (!pose || !pose.keypoints) {
    return { 
      repDetected: false, 
      feedback: 'No pose detected',
      angle: 0,
      formIssues: [],
      isDown: false,
      isUp: false
    };
  }
  
  const keypoints = pose.keypoints;
  const formIssues = [];
  
  // Get relevant keypoints
  const leftShoulder = keypoints[11];
  const leftElbow = keypoints[13];
  const leftWrist = keypoints[15];
  const rightShoulder = keypoints[12];
  const rightElbow = keypoints[14];
  const rightWrist = keypoints[16];
  const leftHip = keypoints[23];
  const leftKnee = keypoints[25];
  const leftAnkle = keypoints[27];
  
  // Check visibility
  if (leftShoulder?.score < 0.3 || leftElbow?.score < 0.3 || leftWrist?.score < 0.3) {
    return { 
      repDetected: false, 
      feedback: 'Position yourself in frame',
      angle: 0,
      formIssues: [],
      isDown: false,
      isUp: false
    };
  }
  
  // Calculate angles
  const leftElbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
  const rightElbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
  const avgElbowAngle = (leftElbowAngle + rightElbowAngle) / 2;
  
  // Check body straightness
  const bodyAngle = calculateAngle(leftShoulder, leftHip, leftKnee);
  const isBodyStraight = bodyAngle > 160 && bodyAngle < 185;
  
  // FORM FEEDBACK
  if (bodyAngle < 160) {
    formIssues.push('Hips sagging - tighten your core');
  } else if (bodyAngle > 185) {
    formIssues.push('Hips too high - lower your hips');
  }
  
  // Check depth
  if (avgElbowAngle > 110) {
    formIssues.push('Go lower - chest to floor');
  } else if (avgElbowAngle < 70) {
    formIssues.push('Too low - don\'t go that far');
  }
  
  // Check elbow flare
  const shoulderWidth = calculateDistance(leftShoulder, rightShoulder);
  const elbowWidth = calculateDistance(leftElbow, rightElbow);
  
  if (elbowWidth > shoulderWidth * 1.5) {
    formIssues.push('Elbows flaring out - tuck them in');
  }
  
  // Determine rep state (90° is bottom of push-up)
  const isDown = avgElbowAngle < 100;
  const isUp = avgElbowAngle > 150;
  
  // Count rep (transition from down to up)
  let repDetected = false;
  if (isDown && !lastRepState.pushups) {
    lastRepState.pushups = true;
  } else if (isUp && lastRepState.pushups) {
    repDetected = true;
    lastRepState.pushups = false;
  }
  
  // Generate feedback
  let feedback = '';
  if (formIssues.length > 0) {
    feedback = formIssues[0];
  } else if (isDown) {
    feedback = 'Good depth - push up!';
  } else if (isUp) {
    feedback = 'Good form - lower down';
  } else {
    feedback = 'Keep going!';
  }
  
  return {
    repDetected,
    angle: avgElbowAngle,
    feedback,
    formIssues,
    isDown,
    isUp,
    bodyAngle
  };
}

// SQUAT ANALYSIS
export function analyzeSquat(pose) {
  if (!pose || !pose.keypoints) {
    return { 
      repDetected: false, 
      feedback: 'No pose detected',
      angle: 0,
      formIssues: [],
      isDown: false,
      isUp: false
    };
  }
  
  const keypoints = pose.keypoints;
  const formIssues = [];
  
  // Get relevant keypoints
  const leftShoulder = keypoints[11];
  const leftHip = keypoints[23];
  const leftKnee = keypoints[25];
  const leftAnkle = keypoints[27];
  const rightHip = keypoints[24];
  const rightKnee = keypoints[26];
  const rightAnkle = keypoints[28];
  
  // Check visibility
  if (leftHip?.score < 0.3 || leftKnee?.score < 0.3 || leftAnkle?.score < 0.3) {
    return { 
      repDetected: false, 
      feedback: 'Position yourself in frame',
      angle: 0,
      formIssues: [],
      isDown: false,
      isUp: false
    };
  }
  
  // Calculate angles
  const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
  const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
  const avgKneeAngle = (leftKneeAngle + rightKneeAngle) / 2;
  
  // Check torso angle
  const torsoAngle = calculateAngle(leftShoulder, leftHip, leftKnee);
  const isUpright = torsoAngle > 70;
  
  // Check knee valgus (knees caving in)
  const kneeDistance = calculateDistance(leftKnee, rightKnee);
  const ankleDistance = calculateDistance(leftAnkle, rightAnkle);
  
  // FORM FEEDBACK
  if (!isUpright) {
    formIssues.push('Leaning too far forward - chest up');
  }
  
  // Check depth
  if (avgKneeAngle > 110) {
    formIssues.push('Go lower - thighs parallel to ground');
  } else if (avgKneeAngle < 70) {
    formIssues.push('Too deep - can strain knees');
  }
  
  // Check knee valgus
  if (kneeDistance < ankleDistance * 0.7) {
    formIssues.push('Knees collapsing inward - push knees out');
  }
  
  // Determine rep state (90° is bottom of squat)
  const isDown = avgKneeAngle < 100;
  const isUp = avgKneeAngle > 150;
  
  // Count rep
  let repDetected = false;
  if (isDown && !lastRepState.squats) {
    lastRepState.squats = true;
  } else if (isUp && lastRepState.squats) {
    repDetected = true;
    lastRepState.squats = false;
  }
  
  let feedback = '';
  if (formIssues.length > 0) {
    feedback = formIssues[0];
  } else if (isDown) {
    feedback = 'Good depth - stand up!';
  } else if (isUp) {
    feedback = 'Good form - lower down';
  } else {
    feedback = 'Keep going!';
  }
  
  return {
    repDetected,
    angle: avgKneeAngle,
    feedback,
    formIssues,
    isDown,
    isUp,
    torsoAngle
  };
}

// LUNGE ANALYSIS
export function analyzeLunge(pose) {
  if (!pose || !pose.keypoints) {
    return { 
      repDetected: false, 
      feedback: 'No pose detected',
      angle: 0,
      formIssues: [],
      isDown: false
    };
  }
  
  const keypoints = pose.keypoints;
  const formIssues = [];
  
  // Get keypoints
  const leftHip = keypoints[23];
  const leftKnee = keypoints[25];
  const leftAnkle = keypoints[27];
  const rightHip = keypoints[24];
  const rightKnee = keypoints[26];
  const rightAnkle = keypoints[28];
  
  // Determine which leg is forward (based on ankle x-position)
  const leftFootX = leftAnkle?.x || 0;
  const rightFootX = rightAnkle?.x || 0;
  
  let frontKnee, frontHip, frontAnkle, backKnee;
  
  if (leftFootX < rightFootX - 0.1) {
    // Left foot forward
    frontKnee = leftKnee; 
    frontHip = leftHip; 
    frontAnkle = leftAnkle;
    backKnee = rightKnee;
  } else if (rightFootX < leftFootX - 0.1) {
    // Right foot forward
    frontKnee = rightKnee; 
    frontHip = rightHip; 
    frontAnkle = rightAnkle;
    backKnee = leftKnee;
  } else {
    return { 
      repDetected: false, 
      feedback: 'Step forward into lunge',
      formIssues: [],
      angle: 0,
      isDown: false
    };
  }
  
  // Calculate angles
  const frontKneeAngle = calculateAngle(frontHip, frontKnee, frontAnkle);
  const backKneeAngle = calculateAngle(backKnee, backKnee, backKnee); // Simplified
  
  // FORM FEEDBACK
  if (frontKneeAngle > 100) {
    formIssues.push('Lunge deeper - front knee at 90°');
  } else if (frontKneeAngle < 80) {
    formIssues.push('Too deep - adjust position');
  }
  
  // Check knee over toe
  if (frontKnee && frontAnkle) {
    if (frontKnee.x < frontAnkle.x - 0.05 || frontKnee.x > frontAnkle.x + 0.05) {
      formIssues.push('Knee past toes - shift weight back');
    }
  }
  
  const isDown = frontKneeAngle < 95;
  
  // Count rep
  let repDetected = false;
  if (isDown && !lastRepState.lunges) {
    lastRepState.lunges = true;
  } else if (!isDown && lastRepState.lunges) {
    repDetected = true;
    lastRepState.lunges = false;
  }
  
  let feedback = '';
  if (formIssues.length > 0) {
    feedback = formIssues[0];
  } else if (isDown) {
    feedback = 'Good lunge - push back up!';
  } else {
    feedback = 'Lower into lunge';
  }
  
  return {
    repDetected,
    angle: frontKneeAngle,
    feedback,
    formIssues,
    isDown
  };
}

// PLANK ANALYSIS
export function analyzePlank(pose) {
  if (!pose || !pose.keypoints) {
    return { 
      isHolding: false, 
      feedback: 'No pose detected',
      formIssues: [],
      angle: 0
    };
  }
  
  const keypoints = pose.keypoints;
  const formIssues = [];
  
  // Get keypoints
  const leftShoulder = keypoints[11];
  const leftHip = keypoints[23];
  const leftKnee = keypoints[25];
  const leftAnkle = keypoints[27];
  
  if (leftShoulder?.score < 0.3 || leftHip?.score < 0.3) {
    return { 
      isHolding: false, 
      feedback: 'Position yourself in frame',
      formIssues: [],
      angle: 0
    };
  }
  
  // Calculate body angle
  const bodyAngle = calculateAngle(leftShoulder, leftHip, leftKnee);
  
  // Calculate hip height
  const hipY = leftHip.y;
  const shoulderY = leftShoulder.y;
  const ankleY = leftAnkle?.y || hipY + 0.5;
  
  const hipRatio = (hipY - shoulderY) / (ankleY - shoulderY);
  
  // FORM FEEDBACK
  if (bodyAngle < 170) {
    formIssues.push('Hips sagging - tighten core');
  } else if (bodyAngle > 185) {
    formIssues.push('Hips too high - lower hips');
  }
  
  if (hipRatio < 0.4) {
    formIssues.push('Hips too high - piking');
  } else if (hipRatio > 0.7) {
    formIssues.push('Hips too low - sagging');
  }
  
  const isHolding = bodyAngle > 165 && bodyAngle < 185 && hipRatio > 0.4 && hipRatio < 0.7;
  
  let feedback = '';
  if (formIssues.length > 0) {
    feedback = formIssues[0];
  } else if (isHolding) {
    feedback = 'Good plank position!';
  } else {
    feedback = 'Adjust your position';
  }
  
  return {
    isHolding,
    feedback,
    formIssues,
    angle: bodyAngle,
    hipRatio
  };
}

// Detect pose from image (to be used with camera)
export async function detectPoseFromImage(imageData) {
  try {
    if (!detector) {
      detector = await initPoseDetector();
    }
    
    // For now, return mock data for testing
    // In production, you'd process the actual image
    return {
      keypoints: Array(33).fill().map(() => ({
        x: 0.5 + (Math.random() - 0.5) * 0.1,
        y: 0.5 + (Math.random() - 0.5) * 0.1,
        score: 0.9
      }))
    };
  } catch (error) {
    console.log('Pose detection error:', error);
    return null;
  }
}

// Reset rep states (call when changing exercises)
export function resetRepStates() {
  lastRepState = {
    pushups: false,
    squats: false,
    lunges: false,
    planks: false
  };
}