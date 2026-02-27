import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Keyboard,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Email validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password validation
  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push("at least 8 characters");
    if (!/[A-Z]/.test(password)) errors.push("one uppercase letter");
    if (!/[a-z]/.test(password)) errors.push("one lowercase letter");
    if (!/[0-9]/.test(password)) errors.push("one number");
    if (!/[!@#$%^&*]/.test(password)) errors.push("one special character (!@#$%^&*)");
    return errors;
  };

  // 🔥 FIXED: Login function - Profile image preserve karta hai
  const handleAuth = async () => {
    Keyboard.dismiss();
    
    const newErrors = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    // Username required for signup
    if (!isLogin && !username) {
      newErrors.username = 'Username is required';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordErrors = validatePassword(password);
      if (passwordErrors.length > 0) {
        newErrors.password = `Password must contain: ${passwordErrors.join(', ')}`;
      }
    }
    
    if (!isLogin && password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    
    try {
      let response;
      if (isLogin) {
        response = await authAPI.login({ email, password });
      } else {
        response = await authAPI.register({ 
          email, 
          password,
          username: username,
          age: 25,
          height_cm: 170,
          weight_kg: 70
        });
      }
      
      // ✅ Sirf token save karo
      await AsyncStorage.setItem('token', response.data.token);
      
      // ✅ User data save karo with profile image preservation
      const existingData = await AsyncStorage.getItem('userData');
      let userDataToSave = response.data.user;
      
      if (existingData) {
        const parsed = JSON.parse(existingData);
        // 🔥 IMPORTANT: Agar pehle se profile image hai toh use preserve karo
        if (parsed.profileImage) {
          userDataToSave.profileImage = parsed.profileImage;
        }
      }
      
      await AsyncStorage.setItem('userData', JSON.stringify(userDataToSave));
      
      setLoading(false);
      navigation.replace('Dashboard');
      
    } catch (error) {
      setLoading(false);
      console.log('Auth error:', error.response?.data || error.message);
      Alert.alert('Error', error.response?.data?.message || 'Authentication failed');
    }
  };

  const handleGoogleSignIn = () => {
    Alert.alert(
      'Google Sign-In',
      'Google Sign-In will be implemented with Firebase',
      [{ text: 'OK' }]
    );
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerClassName="flex-grow" keyboardShouldPersistTaps="handled">
        {/* Back button */}
        <TouchableOpacity 
          className="absolute top-12 left-5 z-10"
          onPress={() => {
            if (isLogin) {
              Alert.alert('Exit', 'Do you want to exit the app?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Exit', onPress: () => console.log('Exit pressed') }
              ]);
            } else {
              setIsLogin(true);
              setErrors({});
            }
          }}
        >
          <Text className="text-primary text-lg">← Back</Text>
        </TouchableOpacity>

        <View className="pt-24 pb-10 bg-primary rounded-b-3xl items-center">
          <Text className="text-5xl font-bold text-white mb-2">💪 FitTrack</Text>
          <Text className="text-base text-white/90">Your Personal AI Fitness Coach</Text>
        </View>

        <View className="px-8 pt-8 pb-10">
          <Text className="text-3xl font-bold text-gray-800 mb-8 text-center">
            {isLogin ? 'Welcome Back!' : 'Create Account'}
          </Text>
          
          {/* Username Field - Only for Signup */}
          {!isLogin && (
            <View className="mb-4">
              <TextInput
                className={`bg-white p-4 rounded-xl text-base border ${
                  errors.username ? 'border-red-500 border-2' : 'border-gray-200'
                }`}
                placeholder="Username"
                placeholderTextColor="#999"
                value={username}
                onChangeText={(text) => {
                  setUsername(text);
                  setErrors({...errors, username: null});
                }}
                returnKeyType="next"
              />
              {errors.username && <Text className="text-red-500 text-xs mt-1 ml-1">{errors.username}</Text>}
            </View>
          )}
          
          {/* Email Input */}
          <View className="mb-4">
            <TextInput
              className={`bg-white p-4 rounded-xl text-base border ${
                errors.email ? 'border-red-500 border-2' : 'border-gray-200'
              }`}
              placeholder="Email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setErrors({...errors, email: null});
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
            />
            {errors.email && <Text className="text-red-500 text-xs mt-1 ml-1">{errors.email}</Text>}
          </View>
          
          {/* Password Input */}
          <View className="mb-4">
            <View className={`flex-row items-center bg-white rounded-xl border ${
                errors.password ? 'border-red-500 border-2' : 'border-gray-200'
              }`}>
              <TextInput
                className="flex-1 p-4 text-base"
                placeholder="Password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setErrors({...errors, password: null});
                }}
                secureTextEntry={!showPassword}
                returnKeyType={!isLogin ? "next" : "done"}
              />
              <TouchableOpacity 
                className="p-4"
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text className="text-xl">{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
            {errors.password && <Text className="text-red-500 text-xs mt-1 ml-1">{errors.password}</Text>}
          </View>

          {/* Confirm Password for Signup */}
          {!isLogin && (
            <View className="mb-4">
              <View className={`flex-row items-center bg-white rounded-xl border ${
                  errors.confirmPassword ? 'border-red-500 border-2' : 'border-gray-200'
                }`}>
                <TextInput
                  className="flex-1 p-4 text-base"
                  placeholder="Confirm Password"
                  placeholderTextColor="#999"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    setErrors({...errors, confirmPassword: null});
                  }}
                  secureTextEntry={!showConfirmPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleAuth}
                />
                <TouchableOpacity 
                  className="p-4"
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Text className="text-xl">{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && <Text className="text-red-500 text-xs mt-1 ml-1">{errors.confirmPassword}</Text>}
            </View>
          )}

          {/* Password Requirements Hint */}
          {!isLogin && (
            <View className="bg-blue-50 p-4 rounded-lg mb-4">
              <Text className="text-sm font-bold text-primary mb-1">Password must contain:</Text>
              <Text className="text-xs text-gray-600 ml-2">✓ At least 8 characters</Text>
              <Text className="text-xs text-gray-600 ml-2">✓ One uppercase letter</Text>
              <Text className="text-xs text-gray-600 ml-2">✓ One lowercase letter</Text>
              <Text className="text-xs text-gray-600 ml-2">✓ One number</Text>
              <Text className="text-xs text-gray-600 ml-2">✓ One special character (!@#$%^&*)</Text>
            </View>
          )}

          {/* Login Button */}
          <TouchableOpacity 
            className="bg-primary p-4 rounded-xl items-center mb-4"
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white font-bold text-lg">
                {isLogin ? 'Login' : 'Sign Up'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Google Sign-In */}
          <TouchableOpacity 
            className="bg-[#4285F4] p-4 rounded-xl items-center mb-4"
            onPress={handleGoogleSignIn}
          >
            <Text className="text-white font-bold text-lg">🔵 Continue with Google</Text>
          </TouchableOpacity>

          {/* Toggle between Login and Signup */}
          <TouchableOpacity onPress={() => {
            Keyboard.dismiss();
            setIsLogin(!isLogin);
            setErrors({});
            setEmail('');
            setPassword('');
            setUsername('');
            setConfirmPassword('');
          }}>
            <Text className="text-primary text-center">
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}