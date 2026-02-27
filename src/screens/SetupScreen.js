import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { userAPI } from '../services/api';

const MAX_HEIGHT = 272;
const MIN_HEIGHT = 55;
const MAX_WEIGHT = 300;
const MIN_WEIGHT = 20;
const MAX_AGE = 120;
const MIN_AGE = 13;

export default function SetupScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [userData, setUserData] = useState({
    username: '',
    age: '',
    height: '',
    weight: '',
    gender: '',
    fitnessLevel: '',
    workoutType: 'home',
    goals: []
  });

  const workoutTypes = [
    { id: 'home', name: 'Home Workout', icon: '🏠', description: 'No equipment, bodyweight exercises' },
    { id: 'gym', name: 'Gym Workout', icon: '🏋️', description: 'Weight training, machines, free weights' },
    { id: 'yoga', name: 'Yoga & Flexibility', icon: '🧘', description: 'Stretching, flexibility, mindfulness' },
    { id: 'cardio', name: 'Cardio', icon: '🏃', description: 'Running, cycling, high-intensity' }
  ];

  const goals = [
    'Lose Weight',
    'Build Muscle',
    'Get Stronger',
    'Improve Endurance',
    'Stay Fit',
    'Tone Body'
  ];

  const fitnessLevels = ['Beginner', 'Intermediate', 'Advanced'];

  const validateAge = (age) => {
    const numAge = parseInt(age);
    if (isNaN(numAge)) return 'Age must be a number';
    if (numAge < MIN_AGE) return `You must be at least ${MIN_AGE} years old`;
    if (numAge > MAX_AGE) return `Age cannot exceed ${MAX_AGE}`;
    return null;
  };

  const validateHeight = (height) => {
    const numHeight = parseInt(height);
    if (isNaN(numHeight)) return 'Height must be a number';
    if (numHeight < MIN_HEIGHT) return `Minimum height is ${MIN_HEIGHT} cm`;
    if (numHeight > MAX_HEIGHT) return `Maximum height cannot exceed ${MAX_HEIGHT} cm`;
    return null;
  };

  const validateWeight = (weight) => {
    const numWeight = parseInt(weight);
    if (isNaN(numWeight)) return 'Weight must be a number';
    if (numWeight < MIN_WEIGHT) return `Minimum weight is ${MIN_WEIGHT} kg`;
    if (numWeight > MAX_WEIGHT) return `Maximum weight cannot exceed ${MAX_WEIGHT} kg`;
    return null;
  };

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { category: 'Underweight', color: '#FFA500' };
    if (bmi < 25) return { category: 'Normal weight', color: '#28a745' };
    if (bmi < 30) return { category: 'Overweight', color: '#FFA500' };
    return { category: 'Obese', color: '#dc3545' };
  };

  const handleNext = () => {
    Keyboard.dismiss();
    const newErrors = {};

    if (step === 1) {
      if (!userData.username?.trim()) {
        newErrors.username = 'Please enter your name';
      }
      
      const ageError = validateAge(userData.age);
      if (ageError) newErrors.age = ageError;
      
      const heightError = validateHeight(userData.height);
      if (heightError) newErrors.height = heightError;
      
      const weightError = validateWeight(userData.weight);
      if (weightError) newErrors.weight = weightError;
      
      if (!userData.gender) newErrors.gender = 'Please select gender';
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      setStep(2);
      setErrors({});
      
    } else if (step === 2) {
      if (!userData.workoutType) {
        Alert.alert('Error', 'Please select your workout type');
        return;
      }
      setStep(3);
      
    } else if (step === 3) {
      if (!userData.fitnessLevel) {
        Alert.alert('Error', 'Please select your fitness level');
        return;
      }
      setStep(4);
      
    } else if (step === 4) {
      if (userData.goals.length === 0) {
        Alert.alert('Error', 'Please select at least one goal');
        return;
      }
      saveUserData();
    }
  };

  const handleBack = () => {
    Keyboard.dismiss();
    if (step > 1) {
      setStep(step - 1);
      setErrors({});
    } else {
      Alert.alert('Exit Setup', 'Are you sure you want to cancel setup?', [
        { text: 'Continue Setup', style: 'cancel' },
        { text: 'Exit', onPress: () => navigation.replace('Login') }
      ]);
    }
  };

  const saveUserData = async () => {
    setLoading(true);
    try {
      // 🔥 Backend API call to update profile
      const response = await userAPI.updateProfile({
        username: userData.username,
        age: parseInt(userData.age),
        height_cm: parseInt(userData.height),
        weight_kg: parseInt(userData.weight),
        fitness_level: userData.fitnessLevel,
        workout_type: userData.workoutType,
        goals: userData.goals
      });
      
      // 🔥 Update local storage
      const existingData = await AsyncStorage.getItem('userData');
      const parsedData = existingData ? JSON.parse(existingData) : {};
      
      const updatedUserData = {
        ...parsedData,
        ...response.data.user,
        ...userData
      };
      
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUserData));
      
      setLoading(false);
      navigation.replace('Dashboard');
      
    } catch (error) {
      setLoading(false);
      console.log('Save error:', error.response?.data || error.message);
      Alert.alert('Error', error.response?.data?.message || 'Failed to save user data');
    }
  };

  const toggleGoal = (goal) => {
    if (userData.goals.includes(goal)) {
      setUserData({
        ...userData,
        goals: userData.goals.filter(g => g !== goal)
      });
    } else {
      setUserData({
        ...userData,
        goals: [...userData.goals, goal]
      });
    }
  };

  const toggleGender = (gender) => {
    if (userData.gender === gender) {
      setUserData({...userData, gender: ''});
    } else {
      setUserData({...userData, gender: gender});
    }
    setErrors({...errors, gender: null});
  };

  const calculateBMI = () => {
    if (userData.weight && userData.height) {
      const heightInMeters = parseFloat(userData.height) / 100;
      const weight = parseFloat(userData.weight);
      return (weight / (heightInMeters * heightInMeters)).toFixed(1);
    }
    return null;
  };

  const calculateRecommendations = () => {
    const bmi = calculateBMI();
    let basePushups = 10;
    let baseSquats = 15;
    
    if (bmi > 25) {
      basePushups = 8;
      baseSquats = 12;
    } else if (bmi < 18.5) {
      basePushups = 12;
      baseSquats = 18;
    }
    
    if (userData.fitnessLevel === 'Beginner') {
      basePushups = Math.floor(basePushups * 0.7);
      baseSquats = Math.floor(baseSquats * 0.7);
    } else if (userData.fitnessLevel === 'Advanced') {
      basePushups = Math.floor(basePushups * 1.5);
      baseSquats = Math.floor(baseSquats * 1.5);
    }
    
    return {
      pushups: basePushups,
      squats: baseSquats,
      lunges: Math.floor(baseSquats * 0.8),
      planks: 60
    };
  };

  const renderStep1 = () => {
    const bmi = calculateBMI();
    
    return (
      <View className="px-4">
        <Text className="text-2xl font-bold text-center text-gray-800 mb-6">
          Tell us about yourself
        </Text>
        
        <View className="mb-4">
          <Text className="text-base font-semibold text-gray-700 mb-2">
            Your Name <Text className="text-red-500">*</Text>
          </Text>
          <TextInput
            className={`bg-white p-4 rounded-xl text-base border ${
              errors.username ? 'border-red-500 border-2' : 'border-gray-200'
            }`}
            placeholder="e.g., John"
            value={userData.username}
            onChangeText={(text) => {
              setUserData({...userData, username: text});
              setErrors({...errors, username: null});
            }}
          />
          {errors.username && <Text className="text-red-500 text-xs mt-1">{errors.username}</Text>}
        </View>
        
        <View className="mb-4">
          <Text className="text-base font-semibold text-gray-700 mb-2">
            Age <Text className="text-red-500">*</Text>
          </Text>
          <TextInput
            className={`bg-white p-4 rounded-xl text-base border ${
              errors.age ? 'border-red-500 border-2' : 'border-gray-200'
            }`}
            placeholder={`e.g., 25 (${MIN_AGE}-${MAX_AGE} years)`}
            keyboardType="numeric"
            value={userData.age}
            onChangeText={(text) => {
              setUserData({...userData, age: text});
              setErrors({...errors, age: null});
            }}
          />
          {errors.age && <Text className="text-red-500 text-xs mt-1">{errors.age}</Text>}
        </View>

        <View className="mb-4">
          <Text className="text-base font-semibold text-gray-700 mb-2">
            Height (cm) <Text className="text-red-500">*</Text>
          </Text>
          <TextInput
            className={`bg-white p-4 rounded-xl text-base border ${
              errors.height ? 'border-red-500 border-2' : 'border-gray-200'
            }`}
            placeholder={`e.g., 170 (${MIN_HEIGHT}-${MAX_HEIGHT} cm)`}
            keyboardType="numeric"
            value={userData.height}
            onChangeText={(text) => {
              setUserData({...userData, height: text});
              setErrors({...errors, height: null});
            }}
          />
          {errors.height && <Text className="text-red-500 text-xs mt-1">{errors.height}</Text>}
        </View>

        <View className="mb-4">
          <Text className="text-base font-semibold text-gray-700 mb-2">
            Weight (kg) <Text className="text-red-500">*</Text>
          </Text>
          <TextInput
            className={`bg-white p-4 rounded-xl text-base border ${
              errors.weight ? 'border-red-500 border-2' : 'border-gray-200'
            }`}
            placeholder={`e.g., 70 (${MIN_WEIGHT}-${MAX_WEIGHT} kg)`}
            keyboardType="numeric"
            value={userData.weight}
            onChangeText={(text) => {
              setUserData({...userData, weight: text});
              setErrors({...errors, weight: null});
            }}
          />
          {errors.weight && <Text className="text-red-500 text-xs mt-1">{errors.weight}</Text>}
        </View>

        <View className="mb-4">
          <Text className="text-base font-semibold text-gray-700 mb-2">
            Gender <Text className="text-red-500">*</Text>
          </Text>
          <View className="flex-row justify-between">
            {['Male', 'Female', 'Other'].map((g) => (
              <TouchableOpacity
                key={g}
                className={`flex-1 p-4 mx-1 rounded-xl border ${
                  userData.gender === g 
                    ? 'bg-primary border-primary' 
                    : 'bg-white border-gray-200'
                } ${errors.gender && !userData.gender ? 'border-red-500 border-2' : ''}`}
                onPress={() => toggleGender(g)}
              >
                <Text className={`text-center ${
                  userData.gender === g ? 'text-white' : 'text-gray-700'
                }`}>
                  {g}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.gender && <Text className="text-red-500 text-xs mt-1">{errors.gender}</Text>}
          <Text className="text-xs text-gray-400 italic text-center mt-2">Tap again to deselect</Text>
        </View>

        {bmi && (
          <View className="bg-blue-50 p-4 rounded-xl mt-4 border-2 border-blue-200">
            <Text className="text-lg font-bold text-primary text-center">Your BMI: {bmi}</Text>
            <Text className={`text-center font-semibold mt-1`}>
              {getBMICategory(bmi).category}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderStep2 = () => (
    <View className="px-4">
      <Text className="text-2xl font-bold text-center text-gray-800 mb-6">
        Choose Your Workout Type
      </Text>
      
      {workoutTypes.map((type) => (
        <TouchableOpacity
          key={type.id}
          className={`p-5 rounded-xl mb-4 border-2 ${
            userData.workoutType === type.id 
              ? 'bg-blue-50 border-primary' 
              : 'bg-white border-gray-200'
          }`}
          onPress={() => setUserData({...userData, workoutType: type.id})}
        >
          <View className="flex-row items-center">
            <Text className="text-3xl mr-4">{type.icon}</Text>
            <View className="flex-1">
              <Text className={`text-xl font-bold ${
                userData.workoutType === type.id ? 'text-primary' : 'text-gray-800'
              }`}>
                {type.name}
              </Text>
              <Text className="text-sm text-gray-600 mt-1">
                {type.description}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderStep3 = () => (
    <View className="px-4">
      <Text className="text-2xl font-bold text-center text-gray-800 mb-6">
        What's your fitness level?
      </Text>
      
      {fitnessLevels.map((level) => (
        <TouchableOpacity
          key={level}
          className={`p-6 rounded-xl mb-4 border-2 ${
            userData.fitnessLevel === level 
              ? 'bg-blue-50 border-primary' 
              : 'bg-white border-gray-200'
          }`}
          onPress={() => {
            if (userData.fitnessLevel === level) {
              setUserData({...userData, fitnessLevel: ''});
            } else {
              setUserData({...userData, fitnessLevel: level});
            }
          }}
        >
          <Text className={`text-xl font-bold text-center mb-2 ${
            userData.fitnessLevel === level ? 'text-primary' : 'text-gray-800'
          }`}>
            {level}
          </Text>
          <Text className="text-sm text-gray-600 text-center">
            {level === 'Beginner' && 'New to exercise (0-3 months)'}
            {level === 'Intermediate' && 'Exercise regularly (3-12 months)'}
            {level === 'Advanced' && 'Experienced (1+ years)'}
          </Text>
        </TouchableOpacity>
      ))}
      <Text className="text-xs text-gray-400 italic text-center mt-2">Tap again to deselect</Text>
    </View>
  );

  const renderStep4 = () => {
    const bmi = calculateBMI();
    const recommendations = calculateRecommendations();
    
    return (
      <View className="px-4">
        <Text className="text-2xl font-bold text-center text-gray-800 mb-6">
          Select Your Goals
        </Text>
        
        <View className="flex-row flex-wrap justify-center mb-6">
          {goals.map((goal) => (
            <TouchableOpacity
              key={goal}
              className={`px-5 py-3 rounded-full m-1.5 border ${
                userData.goals.includes(goal) 
                  ? 'bg-primary border-primary' 
                  : 'bg-white border-gray-200'
              }`}
              onPress={() => toggleGoal(goal)}
            >
              <Text className={userData.goals.includes(goal) ? 'text-white' : 'text-gray-700'}>
                {goal}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text className="text-xs text-gray-400 italic text-center mb-6">Tap to select/deselect</Text>

        <View className="bg-white p-6 rounded-xl shadow-lg">
          <Text className="text-xl font-bold text-center text-gray-800 mb-4">
            🎯 Your Personalized Plan
          </Text>
          
          <View className="bg-primary self-start px-4 py-2 rounded-full mb-4">
            <Text className="text-white font-bold">
              {workoutTypes.find(t => t.id === userData.workoutType)?.icon} {workoutTypes.find(t => t.id === userData.workoutType)?.name}
            </Text>
          </View>
          
          <View className="flex-row justify-between py-3 border-b border-gray-100">
            <Text className="text-gray-700">💪 Push-ups:</Text>
            <Text className="font-bold text-primary">{recommendations.pushups} reps</Text>
          </View>
          <View className="flex-row justify-between py-3 border-b border-gray-100">
            <Text className="text-gray-700">🦵 Squats:</Text>
            <Text className="font-bold text-primary">{recommendations.squats} reps</Text>
          </View>
          <View className="flex-row justify-between py-3 border-b border-gray-100">
            <Text className="text-gray-700">🏃 Lunges:</Text>
            <Text className="font-bold text-primary">{recommendations.lunges} reps</Text>
          </View>
          <View className="flex-row justify-between py-3 border-b border-gray-100">
            <Text className="text-gray-700">🧘 Planks:</Text>
            <Text className="font-bold text-primary">{recommendations.planks} sec</Text>
          </View>

          {bmi && bmi >= 30 && (
            <View className="bg-red-50 p-4 rounded-xl mt-4 border border-red-200">
              <Text className="text-red-600 text-center">
                ⚠️ Based on your BMI, consult with a doctor before starting.
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View className="flex-row justify-between items-center px-5 pt-12 pb-5 bg-white border-b border-gray-200">
        <TouchableOpacity onPress={handleBack} className="p-2">
          <Text className="text-base text-primary font-semibold">← Back</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">Setup Profile</Text>
        <View className="w-12" />
      </View>

      <View className="flex-row justify-center mt-5 mb-3">
        {[1, 2, 3, 4].map((i) => (
          <View
            key={i}
            className={`h-3 rounded-full mx-1.5 ${
              step >= i ? 'w-8 bg-primary' : 'w-3 bg-gray-300'
            }`}
          />
        ))}
      </View>
      <Text className="text-center text-gray-600 mb-5">Step {step} of 4</Text>

      <ScrollView 
        contentContainerClassName="pb-8"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
      >
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </ScrollView>

      <View className="p-5 bg-white border-t border-gray-200">
        <TouchableOpacity
          className={`bg-primary p-4 rounded-xl items-center ${loading ? 'opacity-60' : ''}`}
          onPress={handleNext}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-lg text-white font-bold">
              {step === 4 ? 'Complete Setup' : 'Next'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}