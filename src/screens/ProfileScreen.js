import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
  Modal,
  Image,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import VoiceCoach from '../services/VoiceCoach';
import { useTheme } from '../context/ThemeContext';

export default function ProfileScreen({ navigation }) {
  const { darkMode, toggleTheme } = useTheme();
  const [userData, setUserData] = useState(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  const [tempImage, setTempImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [workoutStats, setWorkoutStats] = useState({
    totalWorkouts: 0,
    totalReps: 0,
    totalTime: 0,
    joinDate: ''
  });

  useEffect(() => {
    loadUserData();
    loadSettings();
    loadStats();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await AsyncStorage.getItem('userData');
      if (data) {
        const parsed = JSON.parse(data);
        setUserData(parsed);
        setEditedData(parsed);
        if (parsed.profileImage) setProfileImage(parsed.profileImage);
      }
    } catch (error) {
      console.log('Error loading user data:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const voice = await AsyncStorage.getItem('voiceEnabled');
      if (voice !== null) setVoiceEnabled(JSON.parse(voice));
    } catch (error) {
      console.log('Error loading settings:', error);
    }
  };

  const loadStats = async () => {
    // Mock stats - replace with actual data from backend
    setWorkoutStats({
      totalWorkouts: 24,
      totalReps: 1250,
      totalTime: 1860, // minutes
      joinDate: 'Jan 15, 2026'
    });
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setUploading(true);
      // Simulate upload delay
      setTimeout(() => {
        setTempImage(result.assets[0].uri);
        setUploading(false);
        Alert.alert('Success', 'Image selected! Click Save to update profile.');
      }, 1500);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setUploading(true);
      setTimeout(() => {
        setTempImage(result.assets[0].uri);
        setUploading(false);
        Alert.alert('Success', 'Photo captured! Click Save to update profile.');
      }, 1500);
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      'Change Profile Photo',
      'Choose an option',
      [
        { text: '📸 Take Photo', onPress: takePhoto },
        { text: '🖼️ Choose from Gallery', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const updateUserData = async () => {
    Keyboard.dismiss();
    try {
      if (!editedData.username?.trim()) {
        Alert.alert('Error', 'Name cannot be empty');
        return;
      }
      
      const updatedData = { 
        ...userData, 
        ...editedData,
        profileImage: tempImage || profileImage
      };
      
      setUploading(true);
      // Simulate save delay
      setTimeout(async () => {
        await AsyncStorage.setItem('userData', JSON.stringify(updatedData));
        setUserData(updatedData);
        setProfileImage(tempImage || profileImage);
        setTempImage(null);
        setEditMode(false);
        setUploading(false);
        Alert.alert('Success', 'Profile updated successfully');
      }, 2000);
      
    } catch (error) {
      setUploading(false);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const formatTime = (minutes) => {
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  const theme = {
    bg: darkMode ? 'bg-gray-900' : 'bg-gray-50',
    cardBg: darkMode ? 'bg-gray-800' : 'bg-white',
    text: darkMode ? 'text-white' : 'text-gray-800',
    subText: darkMode ? 'text-gray-300' : 'text-gray-600',
    border: darkMode ? 'border-gray-700' : 'border-gray-200',
    inputBg: darkMode ? 'bg-gray-700' : 'bg-white',
    inputText: darkMode ? 'text-white' : 'text-gray-800',
  };

  return (
    <KeyboardAvoidingView 
      className={`flex-1 ${theme.bg}`}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View className={`${darkMode ? 'bg-gray-800' : 'bg-primary'} pt-12 pb-6 px-5 rounded-b-3xl`}>
        <View className="flex-row items-center justify-between">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
            <Text className="text-3xl text-white">←</Text>
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-white">Profile</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView className={`flex-1 px-5 pt-5 ${theme.bg}`} keyboardShouldPersistTaps="handled">
        {/* Profile Picture */}
        <View className="items-center mb-6">
          <TouchableOpacity onPress={showImagePickerOptions} className="relative" disabled={uploading}>
            <View className="w-28 h-28 bg-gray-300 rounded-full items-center justify-center">
              {profileImage || tempImage ? (
                <Image source={{ uri: tempImage || profileImage }} className="w-28 h-28 rounded-full" />
              ) : (
                <Text className="text-5xl text-gray-600">
                  {userData?.username?.charAt(0).toUpperCase() || 'U'}
                </Text>
              )}
              {uploading && (
                <View className="absolute inset-0 bg-black/50 rounded-full items-center justify-center">
                  <ActivityIndicator color="white" />
                </View>
              )}
            </View>
            {!editMode && !uploading && (
              <View className="absolute bottom-0 right-0 bg-primary w-8 h-8 rounded-full items-center justify-center">
                <Text className="text-white text-lg">📷</Text>
              </View>
            )}
          </TouchableOpacity>
          <Text className={`${theme.subText} mt-2 text-center`}>
            {editMode ? 'Tap photo to change' : userData?.email || ''}
          </Text>
        </View>

        {/* Workout Stats */}
        <View className={`${theme.cardBg} p-5 rounded-xl mb-4`}>
          <Text className={`text-lg font-bold ${theme.text} mb-4`}>Workout Stats</Text>
          <View className="flex-row justify-between mb-3">
            <Text className={theme.subText}>Total Workouts</Text>
            <Text className={`font-bold ${theme.text}`}>{workoutStats.totalWorkouts}</Text>
          </View>
          <View className="flex-row justify-between mb-3">
            <Text className={theme.subText}>Total Reps</Text>
            <Text className={`font-bold ${theme.text}`}>{workoutStats.totalReps}</Text>
          </View>
          <View className="flex-row justify-between mb-3">
            <Text className={theme.subText}>Total Time</Text>
            <Text className={`font-bold ${theme.text}`}>{formatTime(workoutStats.totalTime)}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className={theme.subText}>Member Since</Text>
            <Text className={`font-bold ${theme.text}`}>{workoutStats.joinDate}</Text>
          </View>
        </View>

        {/* Account Section */}
        <View className={`${theme.cardBg} p-5 rounded-xl mb-4`}>
          <Text className={`text-lg font-bold ${theme.text} mb-4`}>Account Details</Text>
          
          {!editMode ? (
            <>
              <View className="flex-row justify-between py-3 border-b border-gray-200">
                <Text className={theme.subText}>Name</Text>
                <Text className={theme.text}>{userData?.username || '-'}</Text>
              </View>
              <View className="flex-row justify-between py-3 border-b border-gray-200">
                <Text className={theme.subText}>Age</Text>
                <Text className={theme.text}>{userData?.age || '-'} years</Text>
              </View>
              <View className="flex-row justify-between py-3 border-b border-gray-200">
                <Text className={theme.subText}>Height</Text>
                <Text className={theme.text}>{userData?.height || '-'} cm</Text>
              </View>
              <View className="flex-row justify-between py-3 border-b border-gray-200">
                <Text className={theme.subText}>Weight</Text>
                <Text className={theme.text}>{userData?.weight || '-'} kg</Text>
              </View>
              <View className="flex-row justify-between py-3 border-b border-gray-200">
                <Text className={theme.subText}>BMI</Text>
                <Text className={theme.text}>{userData?.bmi || '-'}</Text>
              </View>
              
              <TouchableOpacity 
                className="bg-primary/10 p-3 rounded-lg mt-3"
                onPress={() => setEditMode(true)}
              >
                <Text className="text-primary text-center font-bold">✏️ Edit Profile</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View>
              <TextInput
                className={`border ${theme.border} p-3 rounded-lg mb-3 ${theme.inputBg} ${theme.inputText}`}
                placeholder="Name"
                placeholderTextColor={darkMode ? '#9CA3AF' : '#9CA3AF'}
                value={editedData.username}
                onChangeText={(text) => setEditedData({...editedData, username: text})}
                returnKeyType="next"
              />
              <TextInput
                className={`border ${theme.border} p-3 rounded-lg mb-3 ${theme.inputBg} ${theme.inputText}`}
                placeholder="Age"
                keyboardType="numeric"
                placeholderTextColor={darkMode ? '#9CA3AF' : '#9CA3AF'}
                value={String(editedData.age || '')}
                onChangeText={(text) => setEditedData({...editedData, age: text})}
                returnKeyType="next"
              />
              <TextInput
                className={`border ${theme.border} p-3 rounded-lg mb-3 ${theme.inputBg} ${theme.inputText}`}
                placeholder="Height (cm)"
                keyboardType="numeric"
                placeholderTextColor={darkMode ? '#9CA3AF' : '#9CA3AF'}
                value={String(editedData.height || '')}
                onChangeText={(text) => setEditedData({...editedData, height: text})}
                returnKeyType="next"
              />
              <TextInput
                className={`border ${theme.border} p-3 rounded-lg mb-3 ${theme.inputBg} ${theme.inputText}`}
                placeholder="Weight (kg)"
                keyboardType="numeric"
                placeholderTextColor={darkMode ? '#9CA3AF' : '#9CA3AF'}
                value={String(editedData.weight || '')}
                onChangeText={(text) => setEditedData({...editedData, weight: text})}
                returnKeyType="done"
                onSubmitEditing={updateUserData}
              />
              
              <View className="flex-row mt-3">
                <TouchableOpacity 
                  className="flex-1 bg-gray-300 p-3 rounded-lg mr-2"
                  onPress={() => {
                    setEditMode(false);
                    setTempImage(null);
                  }}
                  disabled={uploading}
                >
                  <Text className="text-center text-gray-700">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  className={`flex-1 bg-primary p-3 rounded-lg ml-2 ${uploading ? 'opacity-50' : ''}`}
                  onPress={updateUserData}
                  disabled={uploading}
                >
                  {uploading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-center text-white">Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Preferences Section */}
        <View className={`${theme.cardBg} p-5 rounded-xl mb-4`}>
          <Text className={`text-lg font-bold ${theme.text} mb-4`}>Preferences</Text>
          
          <View className="flex-row justify-between items-center py-3 border-b border-gray-200">
            <View className="flex-row items-center">
              <Text className="mr-3">🌙</Text>
              <Text className={theme.subText}>Dark Mode</Text>
            </View>
            <Switch 
              value={darkMode} 
              onValueChange={toggleTheme}
              trackColor={{ false: '#767577', true: '#007AFF' }}
            />
          </View>

          <View className="flex-row justify-between items-center py-3">
            <View className="flex-row items-center">
              <Text className="mr-3">🔊</Text>
              <Text className={theme.subText}>Voice Coach</Text>
            </View>
            <Switch 
              value={voiceEnabled} 
              onValueChange={(val) => {
                setVoiceEnabled(val);
                VoiceCoach.setEnabled(val);
                AsyncStorage.setItem('voiceEnabled', JSON.stringify(val));
              }}
              trackColor={{ false: '#767577', true: '#007AFF' }}
            />
          </View>
        </View>

        {/* Support Section */}
        <View className={`${theme.cardBg} p-5 rounded-xl mb-4`}>
          <Text className={`text-lg font-bold ${theme.text} mb-4`}>Support</Text>
          
          <TouchableOpacity 
            className="flex-row items-center py-3 border-b border-gray-200"
            onPress={() => Alert.alert('Help Center', 'Email: support@fitnessapp.com')}
          >
            <Text className="mr-3">❓</Text>
            <Text className={theme.subText}>Help Center</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-row items-center py-3 border-b border-gray-200"
            onPress={() => Alert.alert('Terms & Conditions', 'Terms and conditions...')}
          >
            <Text className="mr-3">📜</Text>
            <Text className={theme.subText}>Terms & Conditions</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-row items-center py-3"
            onPress={() => Alert.alert('Privacy Policy', 'Privacy policy...')}
          >
            <Text className="mr-3">🔏</Text>
            <Text className={theme.subText}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View className={`${theme.cardBg} p-5 rounded-xl mb-4`}>
          <View className="flex-row justify-between items-center">
            <Text className={theme.subText}>App Version</Text>
            <Text className={theme.text}>2.1.0</Text>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          className="bg-red-500 p-4 rounded-xl items-center mb-8"
          onPress={() => {
            Alert.alert('Logout', 'Are you sure?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Logout', onPress: () => navigation.replace('Login') }
            ]);
          }}
        >
          <Text className="text-white font-bold text-lg">Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}