import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DashboardScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [todayProgress, setTodayProgress] = useState({
    pushups: 0,
    squats: 0,
    lunges: 0,
    planks: 0
  });
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [totalWorkouts, setTotalWorkouts] = useState(0);

  useEffect(() => {
    loadUserData();
    
    const unsubscribe = navigation.addListener('focus', () => {
      loadUserData();
    });

    return unsubscribe;
  }, [navigation]);

  const loadUserData = async () => {
    try {
      const data = await AsyncStorage.getItem('userData');
      if (data) {
        const parsedData = JSON.parse(data);
        setUserData(parsedData);
        
        if (parsedData.dailyProgress) {
          setTodayProgress(parsedData.dailyProgress);
        }
        
        // Calculate streak
        if (parsedData.workoutHistory) {
          calculateStreak(parsedData.workoutHistory);
          setTotalWorkouts(parsedData.workoutHistory.length);
        }
      } else {
        navigation.replace('Setup');
      }
      setLoading(false);
    } catch (error) {
      console.log('Error loading user data:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to load user data');
    }
  };

  const calculateStreak = (history) => {
    if (!history || history.length === 0) {
      setStreak(0);
      return;
    }

    // Simple streak calculation (last 7 days)
    const today = new Date().toDateString();
    const lastWorkout = new Date(history[history.length - 1]?.date).toDateString();
    
    if (lastWorkout === today) {
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }
  };

  const saveProgress = async (exercise, value) => {
    try {
      const updatedProgress = { ...todayProgress, [exercise]: value };
      setTodayProgress(updatedProgress);
      
      if (userData) {
        const updatedUserData = {
          ...userData,
          dailyProgress: updatedProgress,
          lastUpdated: new Date().toISOString()
        };
        
        // Save to workout history if workout completed
        if (value >= (userData.recommendations?.[exercise] || 0)) {
          const historyEntry = {
            date: new Date().toDateString(),
            time: new Date().toLocaleTimeString(),
            exercise,
            reps: value,
            target: userData.recommendations?.[exercise] || 0,
            timestamp: new Date().toISOString()
          };
          
          const history = userData.workoutHistory || [];
          updatedUserData.workoutHistory = [...history, historyEntry];
        }
        
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));
        setUserData(updatedUserData);
      }
    } catch (error) {
      console.log('Error saving progress:', error);
      Alert.alert('Error', 'Failed to save progress');
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning ☀️';
    if (hour < 17) return 'Good Afternoon ⛅';
    return 'Good Evening 🌙';
  };

  const getMotivationalQuote = () => {
    const quotes = [
      "The only bad workout is the one that didn't happen.",
      "Your body can stand almost anything. It's your mind you have to convince.",
      "Fitness is not about being better than someone else. It's about being better than you used to be.",
      "The hard days are the best because that's when champions are made.",
      "Strive for progress, not perfection.",
      "You are stronger than you think!",
      "Small progress is still progress.",
      "Consistency over intensity.",
      "Your future self will thank you.",
      "Every rep brings you closer to your goal."
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  const getFormFeedback = (exercise, current) => {
    if (!userData || !userData.recommendations) return null;
    
    const target = userData.recommendations[exercise];
    if (!target) return null;
    
    if (current >= target) {
      return { message: '✓ Goal achieved!', color: 'text-green-600', bg: 'bg-green-100' };
    } else if (current >= target * 0.7) {
      return { message: '👍 Great progress!', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    } else {
      return { message: '💪 Keep going!', color: 'text-blue-600', bg: 'bg-blue-100' };
    }
  };

  const getWorkoutTypeIcon = () => {
    if (!userData?.workoutType) return '🏋️';
    const icons = {
      home: '🏠',
      gym: '🏋️',
      yoga: '🧘',
      cardio: '🏃'
    };
    return icons[userData.workoutType] || '🏋️';
  };

  const exercises = userData?.recommendations ? [
    {
      id: 'pushups',
      name: 'Push-ups',
      icon: '💪',
      color: '#FF6B6B',
      target: userData.recommendations.pushups || 10,
      description: 'Upper body strength',
      unit: 'reps',
      gradient: 'from-red-400 to-red-500'
    },
    {
      id: 'squats',
      name: 'Squats',
      icon: '🦵',
      color: '#4ECDC4',
      target: userData.recommendations.squats || 15,
      description: 'Lower body strength',
      unit: 'reps',
      gradient: 'from-teal-400 to-teal-500'
    },
    {
      id: 'lunges',
      name: 'Lunges',
      icon: '🏃',
      color: '#45B7D1',
      target: userData.recommendations.lunges || 12,
      description: 'Legs & balance',
      unit: 'reps',
      gradient: 'from-blue-400 to-blue-500'
    },
    {
      id: 'planks',
      name: 'Planks',
      icon: '🧘',
      color: '#96CEB4',
      target: userData.recommendations.planks || 60,
      description: 'Core strength',
      unit: 'sec',
      gradient: 'from-green-400 to-green-500'
    }
  ] : [];

  const calculateProgress = (exerciseId) => {
    const target = exercises.find(e => e.id === exerciseId)?.target || 1;
    const current = todayProgress[exerciseId] || 0;
    return Math.min(100, (current / target) * 100);
  };

  const getDailyTip = () => {
    const tips = [
      "🔥 Warm up for 5 minutes before starting",
      "💧 Stay hydrated - drink water between sets",
      "🎯 Focus on form, not speed",
      "🌬️ Breathe deeply throughout each exercise",
      "⏱️ Rest 30-60 seconds between exercises",
      "📱 Track your progress daily",
      "😴 Get 7-8 hours of sleep for recovery",
      "🥗 Eat protein within 30 mins after workout",
      "🎵 Listen to music for better performance",
      "🤝 Find a workout buddy for motivation"
    ];
    return tips[Math.floor(Math.random() * tips.length)];
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          onPress: () => navigation.replace('Login'),
          style: 'destructive'
        }
      ]
    );
  };

  const quickActions = [
    {
      id: 'library',
      name: 'Exercise Library',
      icon: '📚',
      color: 'bg-purple-500',
      screen: 'ExerciseLibrary'
    },
    {
      id: 'progress',
      name: 'Progress',
      icon: '📊',
      color: 'bg-green-500',
      screen: 'Progress'
    },
    {
      id: 'history',
      name: 'History',
      icon: '📜',
      color: 'bg-orange-500',
      screen: 'WorkoutHistory'
    },
    {
      id: 'profile',
      name: 'Profile',
      icon: '👤',
      color: 'bg-blue-500',
      screen: 'Profile'
    }
  ];

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#007AFF" />
        <Text className="mt-4 text-gray-600">Loading your dashboard...</Text>
      </View>
    );
  }

  if (!userData) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 p-5">
        <Text className="text-2xl mb-4">😕</Text>
        <Text className="text-lg text-red-600 mb-5">No user data found</Text>
        <TouchableOpacity 
          className="bg-primary px-8 py-4 rounded-xl"
          onPress={() => navigation.replace('Setup')}
        >
          <Text className="text-white font-bold">Go to Setup</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header with User Info */}
      <View className="bg-primary pt-12 pb-6 px-5 rounded-b-3xl">
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-white text-2xl font-bold">{getGreeting()}</Text>
            <Text className="text-white text-lg mt-1">
              {userData.username || 'User'}! 
              <Text className="text-white/80 text-base ml-2">
                {getWorkoutTypeIcon()} {userData.workoutType?.charAt(0).toUpperCase() + userData.workoutType?.slice(1) || 'Home'}
              </Text>
            </Text>
          </View>
          
          <TouchableOpacity 
            className="bg-white/20 p-3 rounded-full"
            onPress={handleLogout}
          >
            <View className="w-10 h-10 bg-white rounded-full items-center justify-center">
              <Text className="text-primary text-xl font-bold">
                {userData.firstLetter || userData.username?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Streak and Stats */}
        <View className="flex-row justify-between mt-2">
          <View className="bg-white/20 px-4 py-2 rounded-xl flex-1 mr-2">
            <Text className="text-white/80 text-xs">🔥 Streak</Text>
            <Text className="text-white text-xl font-bold">{streak} days</Text>
          </View>
          <View className="bg-white/20 px-4 py-2 rounded-xl flex-1 ml-2">
            <Text className="text-white/80 text-xs">📊 Total Workouts</Text>
            <Text className="text-white text-xl font-bold">{totalWorkouts}</Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-5 pt-5" showsVerticalScrollIndicator={false}>
        {/* Motivational Quote */}
        <View className="bg-white p-4 rounded-xl mb-5 shadow-sm border border-gray-100">
          <Text className="text-gray-600 italic text-center">
            "{getMotivationalQuote()}"
          </Text>
        </View>

        {/* Quick Actions Grid */}
        <Text className="text-lg font-bold text-gray-800 mb-3">Quick Actions</Text>
        <View className="flex-row flex-wrap mb-6">
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              className={`w-[48%] ${action.color} p-4 rounded-xl mb-3 mr-[4%] items-center`}
              onPress={() => navigation.navigate(action.screen)}
            >
              <Text className="text-3xl mb-2">{action.icon}</Text>
              <Text className="text-white font-semibold">{action.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Today's Progress Summary */}
        <View className="bg-white p-5 rounded-xl mb-5 shadow-sm border border-gray-100">
          <Text className="text-lg font-bold text-gray-800 mb-4">Today's Progress</Text>
          <View className="flex-row justify-around">
            <View className="items-center">
              <Text className="text-2xl font-bold text-primary">{todayProgress.pushups}</Text>
              <Text className="text-xs text-gray-500 mt-1">Push-ups</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-primary">{todayProgress.squats}</Text>
              <Text className="text-xs text-gray-500 mt-1">Squats</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-primary">{todayProgress.lunges}</Text>
              <Text className="text-xs text-gray-500 mt-1">Lunges</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-primary">{todayProgress.planks}s</Text>
              <Text className="text-xs text-gray-500 mt-1">Planks</Text>
            </View>
          </View>
        </View>

        {/* Daily Tip */}
        <View className="bg-blue-50 p-4 rounded-xl mb-5 border-l-4 border-primary">
          <Text className="text-sm font-bold text-primary mb-2">💡 Daily Tip</Text>
          <Text className="text-gray-700">{getDailyTip()}</Text>
        </View>

        {/* BMI Indicator (if available) */}
        {userData.bmi && (
          <View className={`p-4 rounded-xl mb-5 ${
            userData.bmi < 18.5 ? 'bg-yellow-100' :
            userData.bmi < 25 ? 'bg-green-100' :
            userData.bmi < 30 ? 'bg-orange-100' : 'bg-red-100'
          }`}>
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-sm text-gray-600">Your BMI</Text>
                <Text className={`text-2xl font-bold ${
                  userData.bmi < 18.5 ? 'text-yellow-600' :
                  userData.bmi < 25 ? 'text-green-600' :
                  userData.bmi < 30 ? 'text-orange-600' : 'text-red-600'
                }`}>
                  {userData.bmi}
                </Text>
                <Text className="text-sm text-gray-500 mt-1">
                  {userData.bmiCategory}
                </Text>
              </View>
              <Text className="text-4xl">
                {userData.bmi < 18.5 ? '⚠️' :
                 userData.bmi < 25 ? '✅' :
                 userData.bmi < 30 ? '⚡' : '🔴'}
              </Text>
            </View>
          </View>
        )}

        {/* Today's Workout Section */}
        <Text className="text-lg font-bold text-gray-800 mb-3">Today's Workout</Text>
        
        {exercises.map((exercise) => {
          const feedback = getFormFeedback(exercise.id, todayProgress[exercise.id]);
          const progress = calculateProgress(exercise.id);
          
          return (
            <TouchableOpacity
              key={exercise.id}
              className="bg-white p-4 rounded-xl mb-3 shadow-sm border border-gray-100"
              onPress={() => navigation.navigate('Workout', {
                exerciseType: exercise.id,
                exerciseName: exercise.name,
                targetReps: exercise.target,
                unit: exercise.unit,
                currentProgress: todayProgress[exercise.id],
                onProgressUpdate: (value) => saveProgress(exercise.id, value)
              })}
            >
              <View className="flex-row items-center mb-3">
                <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-3">
                  <Text className="text-2xl">{exercise.icon}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-800">{exercise.name}</Text>
                  <Text className="text-sm text-gray-500">{exercise.description}</Text>
                </View>
                <View className="bg-primary/10 px-3 py-1 rounded-full">
                  <Text className="text-primary text-xs font-bold">
                    {exercise.target} {exercise.unit}
                  </Text>
                </View>
              </View>
              
              {/* Progress Bar */}
              <View className="h-2 bg-gray-200 rounded-full mb-2">
                <View 
                  className={`h-2 rounded-full ${
                    progress >= 100 ? 'bg-green-500' : 'bg-primary'
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </View>
              
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-gray-500">
                  {todayProgress[exercise.id] || 0} / {exercise.target} {exercise.unit}
                </Text>
                {feedback && (
                  <View className={`px-3 py-1 rounded-full ${feedback.bg}`}>
                    <Text className={`text-xs font-semibold ${feedback.color}`}>
                      {feedback.message}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Start Workout Button */}
        {exercises.length > 0 && (
          <TouchableOpacity 
            className="bg-green-500 py-4 rounded-xl items-center mb-8 mt-2"
            onPress={() => navigation.navigate('Workout', {
              exerciseType: exercises[0].id,
              exerciseName: exercises[0].name,
              targetReps: exercises[0].target,
              unit: exercises[0].unit,
              currentProgress: todayProgress[exercises[0].id],
              onProgressUpdate: (value) => saveProgress(exercises[0].id, value)
            })}
          >
            <Text className="text-white text-lg font-bold">
              🚀 Quick Start {exercises[0].name}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}