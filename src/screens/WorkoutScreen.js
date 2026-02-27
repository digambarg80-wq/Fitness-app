import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import VoiceCoach from '../services/VoiceCoach';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

export default function WorkoutScreen({ route, navigation }) {
  const { exerciseName, exerciseType, targetReps, unit } = route.params;
  const { darkMode } = useTheme();
  
  const [reps, setReps] = useState(0);
  const [time, setTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const [feedback, setFeedback] = useState('Ready to start');
  const [feedbackColor, setFeedbackColor] = useState('#007AFF');
  const [currentAngle, setCurrentAngle] = useState(0);
  const [formIssues, setFormIssues] = useState([]);
  const [cameraFacing, setCameraFacing] = useState('front');
  
  const cameraRef = useRef(null);
  const detectionInterval = useRef(null);

  // Timer
  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => setTime(t => t + 1), 1000);
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
      } else {
        analysis = { 
          repDetected: Math.random() > 0.9,
          feedback: 'Keep moving!',
          angle: 90 + Math.random() * 60,
          formIssues: []
        };
      }

      if (analysis.formIssues?.length > 0) {
        setFeedback(analysis.formIssues[0]);
        setFeedbackColor('#dc3545');
        setFormIssues(analysis.formIssues);
      } else {
        setFeedback(analysis.feedback || 'Good form!');
        setFeedbackColor('#28a745');
        setFormIssues([]);
      }
      
      setCurrentAngle(Math.floor(analysis.angle || 90));

      if (analysis.repDetected) {
        setReps(r => r + 1);
        VoiceCoach.speak(`${reps + 1} reps!`);
      }

    }, 1000);

    return () => clearInterval(detectionInterval.current);
  }, [isActive, exerciseType]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const toggleCamera = () => {
    setCameraFacing(prev => prev === 'front' ? 'back' : 'front');
  };

  const theme = {
    bg: darkMode ? 'bg-gray-900' : 'bg-gray-50',
    text: darkMode ? 'text-white' : 'text-gray-800',
    subText: darkMode ? 'text-gray-300' : 'text-gray-600',
    cardBg: darkMode ? 'bg-gray-800' : 'bg-white',
  };

  if (!permission) {
    return <View className={`flex-1 justify-center items-center ${theme.bg}`}>
      <Text className={theme.text}>Loading camera...</Text>
    </View>;
  }

  if (!permission.granted) {
    return (
      <View className={`flex-1 justify-center items-center p-5 ${theme.bg}`}>
        <Text className={`text-base mb-5 ${theme.text}`}>Camera permission is required</Text>
        <TouchableOpacity className="bg-primary px-8 py-4 rounded-xl" onPress={requestPermission}>
          <Text className="text-white font-bold">Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className={`flex-1 ${theme.bg}`} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View className="bg-primary pt-12 pb-4 px-5">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
            <Text className="text-3xl text-white">←</Text>
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-white">{exerciseName}</Text>
          <TouchableOpacity onPress={toggleCamera} className="p-2">
            <Text className="text-2xl text-white">🔄</Text>
          </TouchableOpacity>
        </View>

        {/* Progress bar */}
        <View className="mt-4">
          <View className="h-2 bg-white/20 rounded-full">
            <View 
              className="h-2 bg-green-400 rounded-full"
              style={{ width: `${Math.min(100, (reps / (targetReps || 10)) * 100)}%` }}
            />
          </View>
          <Text className="text-white/80 text-xs mt-1 text-right">
            {reps}/{targetReps || 10} {unit}
          </Text>
        </View>
      </View>

      {/* Large Camera View */}
      <View className="h-[400px] bg-black m-5 rounded-xl overflow-hidden">
        <CameraView
          ref={cameraRef}
          className="flex-1"
          facing={cameraFacing}
          mode="video"
          autofocus="on"
        />
        
        {/* Angle overlay */}
        <View className="absolute top-3 right-3 bg-black/60 px-3 py-1.5 rounded-full">
          <Text className="text-white font-bold">{currentAngle}°</Text>
        </View>
      </View>

      {/* Form Issues */}
      {formIssues.length > 0 && (
        <View className="bg-red-50 mx-5 p-3 rounded-xl">
          {formIssues.map((issue, i) => (
            <Text key={i} className="text-red-600 text-xs mb-1">⚠️ {issue}</Text>
          ))}
        </View>
      )}

      {/* Feedback */}
      <View className={`mx-5 mt-3 p-3 rounded-xl`} style={{ backgroundColor: feedbackColor + '20' }}>
        <Text className={`text-center font-bold`} style={{ color: feedbackColor }}>
          {feedback}
        </Text>
      </View>

      {/* Rep Counter */}
      <View className="items-center mt-5">
        <Text className="text-6xl font-bold text-primary">{reps}</Text>
        <Text className="text-xs text-gray-500">{unit?.toUpperCase()}</Text>
        <Text className="text-2xl font-mono text-gray-600 mt-2">{formatTime(time)}</Text>
      </View>

      {/* Controls */}
      <View className="flex-row justify-around px-5 mt-5">
        {!isActive ? (
          <TouchableOpacity 
            className="bg-green-500 flex-1 py-4 rounded-xl mr-2 items-center"
            onPress={() => setIsActive(true)}
          >
            <Text className="text-white font-bold">Start</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            className="bg-yellow-500 flex-1 py-4 rounded-xl mr-2 items-center"
            onPress={() => setIsActive(false)}
          >
            <Text className="text-white font-bold">Pause</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          className="bg-red-500 flex-1 py-4 rounded-xl ml-2 items-center"
          onPress={() => {
            setIsActive(false);
            setReps(0);
            setTime(0);
            setFeedback('Ready to start');
            setFeedbackColor('#007AFF');
            setFormIssues([]);
          }}
        >
          <Text className="text-white font-bold">Reset</Text>
        </TouchableOpacity>
      </View>

      {/* Voice Commands Help */}
      <View className={`${theme.cardBg} mx-5 mt-5 p-3 rounded-xl mb-8`}>
        <Text className={`text-xs font-bold ${theme.text} mb-2`}>🎤 Try saying:</Text>
        <View className="flex-row flex-wrap">
          <Text className="bg-gray-200 px-2 py-1 rounded-full text-xs mr-1 mb-1">"how many reps"</Text>
          <Text className="bg-gray-200 px-2 py-1 rounded-full text-xs mr-1 mb-1">"check my form"</Text>
          <Text className="bg-gray-200 px-2 py-1 rounded-full text-xs mr-1 mb-1">"pause"</Text>
        </View>
      </View>
    </ScrollView>
  );
}