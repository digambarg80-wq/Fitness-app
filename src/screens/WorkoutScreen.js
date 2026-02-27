import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as poseDetection from '../utils/poseDetection';

export default function WorkoutScreen({ route, navigation }) {
  const { 
    exerciseName, 
    exerciseType, 
    targetReps, 
    unit,
    currentProgress = 0,
    onProgressUpdate 
  } = route.params;
  
  const [reps, setReps] = useState(currentProgress);
  const [time, setTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [feedback, setFeedback] = useState('Ready to start');
  const [feedbackColor, setFeedbackColor] = useState('#007AFF');
  const [currentAngle, setCurrentAngle] = useState(0);
  const [formIssues, setFormIssues] = useState([]);
  
  const lastRepState = useRef(false);
  const detectionInterval = useRef(null);
  const cameraRef = useRef(null);

  // Timer
  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setTime((time) => time + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  // Simulate pose detection
  useEffect(() => {
    if (!isActive) return;

    detectionInterval.current = setInterval(() => {
      const mockPose = { keypoints: [] };
      
      let analysis;
      if (exerciseType === 'pushups') {
        analysis = poseDetection.analyzePushUp(mockPose);
      } else if (exerciseType === 'squats') {
        analysis = poseDetection.analyzeSquat(mockPose);
      } else if (exerciseType === 'lunges') {
        analysis = poseDetection.analyzeLunge(mockPose);
      } else if (exerciseType === 'planks') {
        analysis = poseDetection.analyzePlank(mockPose);
      } else {
        analysis = { 
          repDetected: Math.random() > 0.9,
          feedback: 'Keep moving!',
          angle: 90 + Math.random() * 60,
          formIssues: []
        };
      }

      // Update feedback with color coding
      if (analysis.formIssues && analysis.formIssues.length > 0) {
        setFeedback(analysis.formIssues[0]);
        setFeedbackColor('#dc3545'); // Red for wrong form
        setFormIssues(analysis.formIssues);
      } else {
        setFeedback(analysis.feedback || 'Good form!');
        setFeedbackColor('#28a745'); // Green for good form
        setFormIssues([]);
      }
      
      setCurrentAngle(Math.floor(analysis.angle || 90));

      // Count reps
      if (analysis.repDetected) {
        const newReps = reps + 1;
        setReps(newReps);
        if (onProgressUpdate) {
          onProgressUpdate(newReps);
        }
      }

    }, 1000);

    return () => clearInterval(detectionInterval.current);
  }, [isActive, exerciseType, reps, onProgressUpdate]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getProgressPercentage = () => {
    if (!targetReps) return 0;
    return Math.min(100, (reps / targetReps) * 100);
  };

  if (!permission) {
    return <View style={styles.centered}><Text>Loading camera...</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.text}>Camera permission is required</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{exerciseName}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Camera View */}
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="front"
          mode="video"
          autofocus="on"
        />
        
        {/* Angle overlay */}
        <View style={styles.angleOverlay}>
          <Text style={styles.angleText}>{currentAngle}°</Text>
        </View>

        {/* Target progress */}
        {targetReps && (
          <View style={styles.targetOverlay}>
            <Text style={styles.targetText}>
              Target: {reps}/{targetReps} {unit}
            </Text>
          </View>
        )}
      </View>

      {/* Progress bar */}
      {targetReps > 0 && (
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBar,
              { width: `${getProgressPercentage()}%` }
            ]} 
          />
        </View>
      )}

      {/* Form Issues */}
      {formIssues.length > 0 && (
        <View style={styles.issuesContainer}>
          {formIssues.map((issue, index) => (
            <Text key={index} style={styles.issueText}>⚠️ {issue}</Text>
          ))}
        </View>
      )}

      {/* Feedback */}
      <View style={[styles.feedbackContainer, { backgroundColor: feedbackColor + '20' }]}>
        <Text style={[styles.feedback, { color: feedbackColor }]}>
          {feedback}
        </Text>
      </View>

      {/* Rep counter */}
      <Text style={styles.repCount}>{reps}</Text>
      <Text style={styles.repLabel}>{unit?.toUpperCase() || 'REPS'}</Text>
      <Text style={styles.timer}>{formatTime(time)}</Text>

      {/* Controls */}
      <View style={styles.buttonRow}>
        {!isActive ? (
          <TouchableOpacity 
            style={[styles.button, styles.startButton]} 
            onPress={() => setIsActive(true)}
          >
            <Text style={styles.buttonText}>Start</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.button, styles.pauseButton]} 
            onPress={() => setIsActive(false)}
          >
            <Text style={styles.buttonText}>Pause</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={[styles.button, styles.resetButton]} 
          onPress={() => {
            setReps(0);
            setTime(0);
            setIsActive(false);
            setFeedback('Ready to start');
            setFeedbackColor('#007AFF');
            setFormIssues([]);
            if (onProgressUpdate) {
              onProgressUpdate(0);
            }
          }}
        >
          <Text style={styles.buttonText}>Reset</Text>
        </TouchableOpacity>
      </View>
      
      {targetReps && reps >= targetReps && (
        <View style={styles.congratsContainer}>
          <Text style={styles.congratsText}>🎉 Goal achieved! Great job!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  backButton: {
    padding: 10
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  },
  placeholder: {
    width: 50
  },
  cameraContainer: {
    height: 300,
    backgroundColor: '#333',
    position: 'relative'
  },
  camera: {
    flex: 1
  },
  angleOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
    borderRadius: 5
  },
  angleText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  targetOverlay: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 8,
    borderRadius: 5
  },
  targetText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold'
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 3
  },
  progressBar: {
    height: 6,
    backgroundColor: '#28a745',
    borderRadius: 3
  },
  issuesContainer: {
    backgroundColor: '#fff5f5',
    marginHorizontal: 20,
    marginTop: 15,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dc3545'
  },
  issueText: {
    color: '#dc3545',
    fontSize: 14,
    marginVertical: 2
  },
  feedbackContainer: {
    marginHorizontal: 20,
    marginTop: 15,
    padding: 15,
    borderRadius: 8
  },
  feedback: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  repCount: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
    marginTop: 20
  },
  repLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10
  },
  timer: {
    fontSize: 24,
    fontFamily: 'monospace',
    textAlign: 'center',
    marginBottom: 20
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginTop: 10
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center'
  },
  startButton: {
    backgroundColor: '#28a745'
  },
  pauseButton: {
    backgroundColor: '#ffc107'
  },
  resetButton: {
    backgroundColor: '#dc3545'
  },
  permissionButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    width: 200
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  text: {
    fontSize: 16,
    marginBottom: 20
  },
  congratsContainer: {
    backgroundColor: '#d4edda',
    margin: 20,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center'
  },
  congratsText: {
    color: '#155724',
    fontSize: 16,
    fontWeight: 'bold'
  }
});