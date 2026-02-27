import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export default function WorkoutHistoryScreen({ navigation }) {
  return (
    <View className="flex-1 bg-gray-50 p-5">
      <View className="flex-row items-center mb-8 pt-10">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Text className="text-2xl">←</Text>
        </TouchableOpacity>
        <Text className="text-2xl font-bold text-gray-800">Workout History</Text>
      </View>
      
      <View className="bg-white p-6 rounded-xl items-center">
        <Text className="text-4xl mb-4">📜</Text>
        <Text className="text-lg text-gray-600 text-center">
          History screen coming soon! This will show your past workouts.
        </Text>
      </View>
    </View>
  );
}