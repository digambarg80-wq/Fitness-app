import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
  Keyboard
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push("at least 8 characters");
    if (!/[A-Z]/.test(password)) errors.push("one uppercase letter");
    if (!/[a-z]/.test(password)) errors.push("one lowercase letter");
    if (!/[0-9]/.test(password)) errors.push("one number");
    if (!/[!@#$%^&*]/.test(password)) errors.push("one special character (!@#$%^&*)");
    return errors;
  };

  const handleAuth = async () => {
    Keyboard.dismiss();
    
    const newErrors = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email';
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
    
    setTimeout(async () => {
      setLoading(false);
      
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData && isLogin) {
          navigation.replace('Dashboard');
        } else if (!isLogin) {
          navigation.replace('Setup');
        } else {
          navigation.replace('Setup');
        }
      } catch (error) {
        navigation.replace('Setup');
      }
    }, 1500);
  };

  const handleGoogleLogin = () => {
    Keyboard.dismiss();
    setLoading(true);
    setTimeout(async () => {
      setLoading(false);
      
      try {
        const userData = await AsyncStorage.getItem('userData');
        if (userData) {
          navigation.replace('Dashboard');
        } else {
          navigation.replace('Setup');
        }
      } catch (error) {
        navigation.replace('Setup');
      }
    }, 1500);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-gray-50"
    >
      <TouchableOpacity 
        className="absolute top-12 left-5 z-10 p-2"
        onPress={() => {
          Keyboard.dismiss();
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
        <Text className="text-base text-primary font-semibold">← Back</Text>
      </TouchableOpacity>

      <ScrollView 
        contentContainerClassName="flex-grow"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="pt-24 pb-10 bg-primary border-b-4 border-b-primary rounded-b-3xl items-center">
          <Text className="text-5xl font-bold text-white mb-2">💪 FitTrack</Text>
          <Text className="text-base text-white/90">Your Personal AI Fitness Coach</Text>
        </View>

        <View className="px-8 pt-8 pb-10 bg-gray-50 rounded-t-3xl -mt-5">
          <Text className="text-3xl font-bold text-gray-800 mb-8 text-center">
            {isLogin ? 'Welcome Back!' : 'Create Account'}
          </Text>
          
          <View className="mb-4">
            <TextInput
              className={`bg-white p-4 rounded-xl text-base border ${
                errors.email ? 'border-danger border-2' : 'border-gray-200'
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
            {errors.email && <Text className="text-danger text-xs mt-1 ml-1">{errors.email}</Text>}
          </View>
          
          <View className="mb-4">
            <View className={`flex-row items-center bg-white rounded-xl border ${
                errors.password ? 'border-danger border-2' : 'border-gray-200'
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
            {errors.password && <Text className="text-danger text-xs mt-1 ml-1">{errors.password}</Text>}
          </View>

          {!isLogin && (
            <View className="mb-4">
              <View className={`flex-row items-center bg-white rounded-xl border ${
                  errors.confirmPassword ? 'border-danger border-2' : 'border-gray-200'
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
                />
                <TouchableOpacity 
                  className="p-4"
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Text className="text-xl">{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && <Text className="text-danger text-xs mt-1 ml-1">{errors.confirmPassword}</Text>}
            </View>
          )}

          {!isLogin && (
            <View className="bg-blue-50 p-4 rounded-lg mb-4">
              <Text className="text-sm font-bold text-primary mb-1">Password must contain:</Text>
              <Text className="text-xs text-gray-600 ml-2 mb-0.5">✓ At least 8 characters</Text>
              <Text className="text-xs text-gray-600 ml-2 mb-0.5">✓ One uppercase letter</Text>
              <Text className="text-xs text-gray-600 ml-2 mb-0.5">✓ One lowercase letter</Text>
              <Text className="text-xs text-gray-600 ml-2 mb-0.5">✓ One number</Text>
              <Text className="text-xs text-gray-600 ml-2 mb-0.5">✓ One special character (!@#$%^&*)</Text>
            </View>
          )}

          <TouchableOpacity 
            className={`bg-primary p-5 rounded-xl items-center mt-2 ${loading ? 'opacity-60' : ''}`}
            onPress={handleAuth}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-lg font-bold">
                {isLogin ? 'Login' : 'Sign Up'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            className={`bg-[#4285F4] p-5 rounded-xl items-center mt-4 ${loading ? 'opacity-60' : ''}`}
            onPress={handleGoogleLogin}
            disabled={loading}
          >
            <Text className="text-white text-lg font-bold">🔵 Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => {
            Keyboard.dismiss();
            setIsLogin(!isLogin);
            setErrors({});
            setEmail('');
            setPassword('');
            setConfirmPassword('');
          }}>
            <Text className="text-primary text-center mt-5 text-base">
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}