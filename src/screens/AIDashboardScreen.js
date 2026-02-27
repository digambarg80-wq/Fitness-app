import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import VoiceCoach from '../services/VoiceCoach';

export default function AIDashboardScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('today');
  const [aiInsights, setAiInsights] = useState(null);

  useEffect(() => {
    loadUserData();
    generateInsights();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await AsyncStorage.getItem('userData');
      if (data) setUserData(JSON.parse(data));
    } catch (error) {
      console.log('Error loading user data:', error);
    }
  };

  const generateInsights = () => {
    // AI generates insights based on user data
    setAiInsights({
      dailyPlan: {
        focus: "Upper Body Strength",
        exercises: [
          { name: "Push-ups", sets: 3, reps: 12, completed: false },
          { name: "Diamond Push-ups", sets: 3, reps: 8, completed: false },
          { name: "Tricep Dips", sets: 3, reps: 10, completed: false }
        ],
        tip: "Focus on controlled movements, not speed"
      },
      progress: {
        weekly: "+15% strength",
        monthly: "+45 reps total",
        form: "85% accuracy"
      },
      recommendations: [
        "Try decline push-ups for upper chest",
        "Add 2 more reps each set this week",
        "Rest 45 seconds between sets"
      ]
    });
  };

  const speakTip = (tip) => {
    VoiceCoach.speak(tip);
  };

  const tabs = [
    { id: 'today', name: 'Today', icon: '📅' },
    { id: 'plan', name: 'Weekly', icon: '📊' },
    { id: 'tips', name: 'Tips', icon: '💡' },
    { id: 'progress', name: 'Progress', icon: '📈' }
  ];

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-primary pt-12 pb-6 px-5 rounded-b-3xl">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text className="text-3xl text-white">←</Text>
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-white">🤖 AI Coach</Text>
          <View style={{ width: 30 }} />
        </View>
        <Text className="text-white/80">Hello, {userData?.username || 'Athlete'}!</Text>
      </View>

      {/* AI Status Card */}
      <View className="bg-purple-100 mx-5 -mt-5 p-5 rounded-xl shadow-lg">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-purple-800 text-lg font-bold">AI Analysis Ready</Text>
            <Text className="text-purple-600">Based on your last 5 workouts</Text>
          </View>
          <View className="bg-purple-500 p-3 rounded-full">
            <Text className="text-2xl text-white">🤖</Text>
          </View>
        </View>
      </View>

      {/* Tab Navigation */}
      <View className="flex-row bg-white mx-5 mt-5 rounded-xl p-1">
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            className={`flex-1 py-3 rounded-lg ${activeTab === tab.id ? 'bg-primary' : ''}`}
            onPress={() => setActiveTab(tab.id)}
          >
            <Text className={`text-center ${activeTab === tab.id ? 'text-white' : 'text-gray-600'}`}>
              {tab.icon} {tab.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView className="flex-1 px-5 pt-5">
        {/* Today's Plan */}
        {activeTab === 'today' && aiInsights?.dailyPlan && (
          <View className="bg-white p-5 rounded-xl mb-5">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-800">🎯 Today's Focus</Text>
              <TouchableOpacity onPress={() => speakTip(aiInsights.dailyPlan.tip)}>
                <Text className="text-primary">🔊 Listen</Text>
              </TouchableOpacity>
            </View>
            <Text className="text-primary font-bold text-lg mb-3">{aiInsights.dailyPlan.focus}</Text>
            
            {aiInsights.dailyPlan.exercises.map((ex, index) => (
              <View key={index} className="flex-row items-center justify-between py-3 border-b border-gray-100">
                <View className="flex-row items-center">
                  <Text className="w-8 h-8 bg-gray-100 rounded-full text-center leading-8 mr-3">{index + 1}</Text>
                  <View>
                    <Text className="font-bold text-gray-800">{ex.name}</Text>
                    <Text className="text-sm text-gray-500">{ex.sets} sets × {ex.reps} reps</Text>
                  </View>
                </View>
                <TouchableOpacity className={`px-3 py-1 rounded-full ${ex.completed ? 'bg-green-500' : 'bg-gray-200'}`}>
                  <Text className={ex.completed ? 'text-white' : 'text-gray-600'}>✓</Text>
                </TouchableOpacity>
              </View>
            ))}

            <View className="mt-4 p-3 bg-blue-50 rounded-lg">
              <Text className="text-blue-800">💡 Tip: {aiInsights.dailyPlan.tip}</Text>
            </View>
          </View>
        )}

        {/* Weekly Plan */}
        {activeTab === 'plan' && (
          <View className="bg-white p-5 rounded-xl mb-5">
            <Text className="text-xl font-bold text-gray-800 mb-4">📊 Weekly Plan</Text>
            
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
              <View key={day} className="flex-row items-center py-3 border-b border-gray-100">
                <Text className="w-12 font-bold text-gray-700">{day}</Text>
                <Text className="flex-1 text-gray-600">
                  {index === 0 ? 'Upper Body' :
                   index === 1 ? 'Cardio' :
                   index === 2 ? 'Lower Body' :
                   index === 3 ? 'Core' :
                   index === 4 ? 'Full Body' :
                   index === 5 ? 'HIIT' : 'Rest Day'}
                </Text>
                <TouchableOpacity className="bg-primary/10 px-3 py-1 rounded-full">
                  <Text className="text-primary text-xs">View</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* AI Tips */}
        {activeTab === 'tips' && aiInsights?.recommendations && (
          <View className="bg-white p-5 rounded-xl mb-5">
            <Text className="text-xl font-bold text-gray-800 mb-4">💡 AI Recommendations</Text>
            
            {aiInsights.recommendations.map((tip, index) => (
              <View key={index} className="flex-row items-start mb-4 p-3 bg-gray-50 rounded-xl">
                <Text className="text-2xl mr-3">{index === 0 ? '💪' : index === 1 ? '🔥' : '⭐'}</Text>
                <View className="flex-1">
                  <Text className="text-gray-800">{tip}</Text>
                  <TouchableOpacity 
                    className="mt-2"
                    onPress={() => VoiceCoach.speak(tip)}
                  >
                    <Text className="text-primary text-sm">🔊 Hear tip</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Progress */}
        {activeTab === 'progress' && aiInsights?.progress && (
          <View className="bg-white p-5 rounded-xl mb-5">
            <Text className="text-xl font-bold text-gray-800 mb-4">📈 Your Progress</Text>
            
            <View className="flex-row justify-around mb-6">
              <View className="items-center">
                <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-2">
                  <Text className="text-2xl">💪</Text>
                </View>
                <Text className="font-bold text-gray-800">{aiInsights.progress.weekly}</Text>
                <Text className="text-xs text-gray-500">This Week</Text>
              </View>
              <View className="items-center">
                <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-2">
                  <Text className="text-2xl">📊</Text>
                </View>
                <Text className="font-bold text-gray-800">{aiInsights.progress.monthly}</Text>
                <Text className="text-xs text-gray-500">This Month</Text>
              </View>
              <View className="items-center">
                <View className="w-16 h-16 bg-purple-100 rounded-full items-center justify-center mb-2">
                  <Text className="text-2xl">🎯</Text>
                </View>
                <Text className="font-bold text-gray-800">{aiInsights.progress.form}</Text>
                <Text className="text-xs text-gray-500">Form Score</Text>
              </View>
            </View>

            {/* Progress Chart Placeholder */}
            <View className="h-32 bg-gray-100 rounded-xl items-center justify-center">
              <Text className="text-gray-400">Progress chart coming soon</Text>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View className="flex-row justify-around mb-8">
          <TouchableOpacity className="items-center" onPress={() => VoiceCoach.speak("Analyzing your form")}>
            <View className="w-12 h-12 bg-purple-100 rounded-full items-center justify-center mb-2">
              <Text className="text-2xl">📹</Text>
            </View>
            <Text className="text-xs text-gray-600">Analyze Form</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="items-center" onPress={() => Alert.alert('AI Coach', 'Generating new plan...')}>
            <View className="w-12 h-12 bg-green-100 rounded-full items-center justify-center mb-2">
              <Text className="text-2xl">🔄</Text>
            </View>
            <Text className="text-xs text-gray-600">New Plan</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="items-center" onPress={() => navigation.navigate('Profile')}>
            <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mb-2">
              <Text className="text-2xl">⚙️</Text>
            </View>
            <Text className="text-xs text-gray-600">Settings</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}