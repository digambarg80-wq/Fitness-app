import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';
import VoiceCoach from '../services/VoiceCoach';

export default function DashboardScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [todayProgress, setTodayProgress] = useState({
    pushups: 0,
    squats: 0,
    lunges: 0,
    planks: 0
  });
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [aiFeedback, setAiFeedback] = useState('');

  useEffect(() => {
    loadUserData();
    
    const unsubscribe = navigation.addListener('focus', () => {
      loadUserData();
    });

    return unsubscribe;
  }, [navigation]);

  const loadUserData = async () => {
    try {
      // 🔥 Pehle local storage se data load karo
      const localData = await AsyncStorage.getItem('userData');
      if (localData) {
        const parsedData = JSON.parse(localData);
        setUserData(parsedData);
        
        if (parsedData.dailyProgress) {
          setTodayProgress(parsedData.dailyProgress);
        }
      }
      
      // 🔥 Backend se latest profile fetch karo
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const response = await authAPI.getProfile();
          if (response.data.success) {
            setUserData(response.data.user);
            await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
          }
        }
      } catch (error) {
        console.log('Profile fetch error:', error);
      }
      
      setLoading(false);
    } catch (error) {
      console.log('Error loading user data:', error);
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning ☀️';
    if (hour < 17) return 'Good Afternoon ⛅';
    return 'Good Evening 🌙';
  };

  const getAIFeedback = () => {
    const feedbacks = [
      "🔊 Keep your back straight during push-ups",
      "🔊 Remember to breathe deeply",
      "🔊 Engage your core for better stability",
      "🔊 Go slower for better muscle activation",
      "🔊 Perfect form leads to better results"
    ];
    return feedbacks[Math.floor(Math.random() * feedbacks.length)];
  };

  useEffect(() => {
    setAiFeedback(getAIFeedback());
    const interval = setInterval(() => {
      const newFeedback = getAIFeedback();
      setAiFeedback(newFeedback);
      VoiceCoach.speak(newFeedback.replace('🔊', ''));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const quickActions = [
    { id: 'library', name: 'Library', icon: '📚', color: 'bg-purple-500', screen: 'ExerciseLibrary' },
    { id: 'progress', name: 'Progress', icon: '📊', color: 'bg-green-500', screen: 'Progress' },
    { id: 'history', name: 'History', icon: '📜', color: 'bg-orange-500', screen: 'WorkoutHistory' },
    { id: 'profile', name: 'Profile', icon: '👤', color: 'bg-blue-500', screen: 'Profile' },
    { id: 'ai', name: 'AI Coach', icon: '🤖', color: 'bg-purple-600', screen: 'AIDashboard' }
  ];

  const exercises = [
    {
      id: 'pushups',
      name: 'Push-ups',
      icon: '💪',
      target: userData?.recommendations?.pushups || 10,
      current: todayProgress.pushups,
      unit: 'reps',
      ai: 'Keep back straight, elbows at 45°'
    },
    {
      id: 'squats',
      name: 'Squats',
      icon: '🦵',
      target: userData?.recommendations?.squats || 15,
      current: todayProgress.squats,
      unit: 'reps',
      ai: 'Chest up, knees behind toes'
    },
    {
      id: 'lunges',
      name: 'Lunges',
      icon: '🏃',
      target: userData?.recommendations?.lunges || 12,
      current: todayProgress.lunges,
      unit: 'reps',
      ai: 'Front knee at 90°, back knee接近 floor'
    },
    {
      id: 'planks',
      name: 'Planks',
      icon: '🧘',
      target: userData?.recommendations?.planks || 60,
      current: todayProgress.planks,
      unit: 'sec',
      ai: 'Straight line head to heels'
    }
  ];

  const calculateProgress = (current, target) => {
    return Math.min(100, (current / target) * 100);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          onPress: async () => {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('userData');
            navigation.replace('Login');
          },
          style: 'destructive'
        }
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header with Profile Menu */}
      <View className="bg-primary pt-12 pb-4 px-5">
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-white text-2xl font-bold">{getGreeting()}</Text>
            <Text className="text-white text-lg mt-1">
              {userData?.username || 'User'}! 
            </Text>
          </View>
          
          <TouchableOpacity 
            className="bg-white/20 p-2 rounded-full"
            onPress={() => setShowMenu(true)}
          >
            <View className="w-12 h-12 bg-white rounded-full items-center justify-center">
              <Text className="text-primary text-xl font-bold">
                {userData?.username?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View className="flex-row mt-4">
          <View className="bg-white/20 px-3 py-2 rounded-xl flex-1 mr-2">
            <Text className="text-white/80 text-xs">🔥 Streak</Text>
            <Text className="text-white text-lg font-bold">0 days</Text>
          </View>
          <View className="bg-white/20 px-3 py-2 rounded-xl flex-1 ml-2">
            <Text className="text-white/80 text-xs">📊 Workouts</Text>
            <Text className="text-white text-lg font-bold">0</Text>
          </View>
        </View>
      </View>

      {/* AI Feedback Banner */}
      <View className="bg-purple-100 mx-4 mt-4 p-3 rounded-xl flex-row items-center">
        <View className="bg-purple-500 p-2 rounded-full mr-3">
          <Text className="text-white text-lg">🤖</Text>
        </View>
        <View className="flex-1">
          <Text className="text-purple-800 font-bold text-sm">AI Coach Says:</Text>
          <Text className="text-purple-700 text-sm">{aiFeedback}</Text>
        </View>
        <TouchableOpacity onPress={() => VoiceCoach.speak(aiFeedback.replace('🔊', ''))}>
          <Text className="text-purple-600">🔊</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {/* Quick Actions */}
        <Text className="text-sm font-bold text-gray-500 mb-2">QUICK ACTIONS</Text>
        <View className="flex-row flex-wrap mb-4">
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              className={`w-[48%] ${action.color} p-3 rounded-xl mb-2 mr-[4%] items-center`}
              onPress={() => navigation.navigate(action.screen)}
            >
              <Text className="text-2xl mb-1">{action.icon}</Text>
              <Text className="text-white text-xs font-semibold">{action.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Today's Workout */}
        <Text className="text-sm font-bold text-gray-500 mb-2">TODAY'S WORKOUT</Text>
        
        {exercises.map((exercise) => {
          const progress = calculateProgress(exercise.current, exercise.target);
          
          return (
            <TouchableOpacity
              key={exercise.id}
              className="bg-white p-3 rounded-xl mb-2"
              onPress={() => navigation.navigate('Workout', {
                exerciseType: exercise.id,
                exerciseName: exercise.name,
                targetReps: exercise.target,
                unit: exercise.unit,
                currentProgress: exercise.current
              })}
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                  <Text className="text-xl">{exercise.icon}</Text>
                </View>
                <View className="flex-1">
                  <View className="flex-row justify-between items-center">
                    <Text className="font-bold text-gray-800">{exercise.name}</Text>
                    <Text className="text-xs text-gray-500">
                      {exercise.current}/{exercise.target} {exercise.unit}
                    </Text>
                  </View>
                  
                  <View className="h-1.5 bg-gray-200 rounded-full mt-1">
                    <View 
                      className={`h-1.5 rounded-full ${progress >= 100 ? 'bg-green-500' : 'bg-primary'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </View>

                  <Text className="text-xs text-purple-600 mt-1">
                    💡 {exercise.ai}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity 
          className="bg-green-500 py-3 rounded-xl items-center mt-2 mb-4"
          onPress={() => navigation.navigate('Workout', {
            exerciseType: exercises[0].id,
            exerciseName: exercises[0].name,
            targetReps: exercises[0].target,
            unit: exercises[0].unit,
            currentProgress: exercises[0].current
          })}
        >
          <Text className="text-white font-bold">🚀 Quick Start {exercises[0].name}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Profile Menu Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showMenu}
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity 
          className="flex-1 bg-black/50"
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View className="absolute top-20 right-5 bg-white rounded-xl shadow-lg w-56">
            <View className="p-4 border-b border-gray-200">
              <Text className="font-bold text-gray-800">{userData?.username}</Text>
              <Text className="text-xs text-gray-500">{userData?.email || 'user@example.com'}</Text>
            </View>

            <TouchableOpacity 
              className="flex-row items-center p-4 border-b border-gray-100"
              onPress={() => {
                setShowMenu(false);
                navigation.navigate('Profile');
              }}
            >
              <Text className="text-xl mr-3">👤</Text>
              <Text className="text-gray-700">View Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-row items-center p-4 border-b border-gray-100"
              onPress={() => {
                setShowMenu(false);
                navigation.navigate('Profile');
              }}
            >
              <Text className="text-xl mr-3">⚙️</Text>
              <Text className="text-gray-700">Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-row items-center p-4 border-b border-gray-100"
              onPress={() => {
                setShowMenu(false);
                Alert.alert('Voice Coach', VoiceCoach.isEnabled ? 'Voice is ON' : 'Voice is OFF');
              }}
            >
              <Text className="text-xl mr-3">🔊</Text>
              <Text className="text-gray-700">Voice Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-row items-center p-4"
              onPress={handleLogout}
            >
              <Text className="text-xl mr-3">🚪</Text>
              <Text className="text-red-500">Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}