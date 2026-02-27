import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function WorkoutHistoryScreen({ navigation }) {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all'); // all, week, month
  const [selectedExercise, setSelectedExercise] = useState('all');
  const [exercises, setExercises] = useState([]);
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalReps: 0,
    totalTime: 0,
    avgFormScore: 0
  });

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [history, selectedFilter, selectedExercise]);

  const loadHistory = async () => {
    try {
      const data = await AsyncStorage.getItem('userData');
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.workoutHistory) {
          // Sort by date (newest first)
          const sortedHistory = parsed.workoutHistory.sort((a, b) => 
            new Date(b.date) - new Date(a.date)
          );
          setHistory(sortedHistory);
          calculateStats(sortedHistory);
          
          // Extract unique exercises
          const uniqueExercises = [...new Set(sortedHistory.map(w => w.exercise))];
          setExercises(uniqueExercises);
        }
      }
    } catch (error) {
      console.log('Error loading history:', error);
    }
  };

  const calculateStats = (historyData) => {
    let totalReps = 0;
    let totalTime = 0;
    let totalFormScore = 0;
    let formCount = 0;

    historyData.forEach(workout => {
      if (workout.reps) totalReps += workout.reps;
      if (workout.duration) totalTime += workout.duration;
      if (workout.formScore) {
        totalFormScore += workout.formScore;
        formCount++;
      }
    });

    setStats({
      totalWorkouts: historyData.length,
      totalReps,
      totalTime,
      avgFormScore: formCount > 0 ? (totalFormScore / formCount).toFixed(1) : 0
    });
  };

  const applyFilters = () => {
    let filtered = [...history];

    // Apply time filter
    if (selectedFilter !== 'all') {
      const now = new Date();
      const cutoff = new Date();
      
      if (selectedFilter === 'week') {
        cutoff.setDate(now.getDate() - 7);
      } else if (selectedFilter === 'month') {
        cutoff.setMonth(now.getMonth() - 1);
      }

      filtered = filtered.filter(workout => 
        new Date(workout.date) >= cutoff
      );
    }

    // Apply exercise filter
    if (selectedExercise !== 'all') {
      filtered = filtered.filter(workout => 
        workout.exercise === selectedExercise
      );
    }

    setFilteredHistory(filtered);
  };

  const clearFilters = () => {
    setSelectedFilter('all');
    setSelectedExercise('all');
  };

  const deleteWorkout = (workoutId) => {
    Alert.alert(
      'Delete Workout',
      'Are you sure you want to delete this workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              const data = await AsyncStorage.getItem('userData');
              if (data) {
                const parsed = JSON.parse(data);
                const updatedHistory = parsed.workoutHistory.filter(w => w.id !== workoutId);
                parsed.workoutHistory = updatedHistory;
                await AsyncStorage.setItem('userData', JSON.stringify(parsed));
                setHistory(updatedHistory);
              }
            } catch (error) {
              console.log('Error deleting workout:', error);
            }
          },
          style: 'destructive'
        }
      ]
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0m';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const getExerciseIcon = (exercise) => {
    const icons = {
      pushups: '💪',
      squats: '🦵',
      lunges: '🏃',
      planks: '🧘',
      default: '🏋️'
    };
    return icons[exercise?.toLowerCase()] || icons.default;
  };

  const WorkoutCard = ({ workout }) => (
    <TouchableOpacity
      className="bg-white p-4 rounded-xl mb-3 shadow-sm border border-gray-100"
      onLongPress={() => deleteWorkout(workout.id)}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View className="w-12 h-12 bg-primary/10 rounded-full items-center justify-center mr-3">
            <Text className="text-2xl">{getExerciseIcon(workout.exercise)}</Text>
          </View>
          <View>
            <Text className="text-lg font-bold text-gray-800 capitalize">
              {workout.exercise}
            </Text>
            <Text className="text-sm text-gray-500">{formatDate(workout.date)}</Text>
          </View>
        </View>
        <View className="bg-primary/10 px-3 py-1 rounded-full">
          <Text className="text-primary text-xs">{workout.time || '12:00'}</Text>
        </View>
      </View>

      <View className="flex-row justify-around py-2 border-t border-gray-100">
        <View className="items-center">
          <Text className="text-xl font-bold text-gray-800">{workout.reps || 0}</Text>
          <Text className="text-xs text-gray-500">Reps</Text>
        </View>
        <View className="items-center">
          <Text className="text-xl font-bold text-gray-800">{formatTime(workout.duration)}</Text>
          <Text className="text-xs text-gray-500">Duration</Text>
        </View>
        <View className="items-center">
          <Text className="text-xl font-bold text-gray-800">{workout.formScore || '—'}</Text>
          <Text className="text-xs text-gray-500">Form</Text>
        </View>
        <View className="items-center">
          <Text className="text-xl font-bold text-gray-800">{workout.calories || '—'}</Text>
          <Text className="text-xs text-gray-500">Cal</Text>
        </View>
      </View>

      {workout.notes && (
        <View className="mt-2 p-2 bg-gray-50 rounded-lg">
          <Text className="text-xs text-gray-600 italic">{workout.notes}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-primary pt-12 pb-6 px-5 rounded-b-3xl">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text className="text-3xl text-white">←</Text>
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-white">Workout History</Text>
          <TouchableOpacity onPress={clearFilters}>
            <Text className="text-white text-sm">Clear</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View className="flex-row justify-around">
          <View className="items-center">
            <Text className="text-white text-xl font-bold">{stats.totalWorkouts}</Text>
            <Text className="text-white/80 text-xs">Total</Text>
          </View>
          <View className="items-center">
            <Text className="text-white text-xl font-bold">{stats.totalReps}</Text>
            <Text className="text-white/80 text-xs">Reps</Text>
          </View>
          <View className="items-center">
            <Text className="text-white text-xl font-bold">{formatTime(stats.totalTime)}</Text>
            <Text className="text-white/80 text-xs">Time</Text>
          </View>
          <View className="items-center">
            <Text className="text-white text-xl font-bold">{stats.avgFormScore}</Text>
            <Text className="text-white/80 text-xs">Avg Form</Text>
          </View>
        </View>
      </View>

      {/* Filters */}
      <View className="bg-white px-5 py-4 border-b border-gray-200">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {/* Time Filters */}
          <View className="flex-row mr-4">
            {['all', 'week', 'month'].map((filter) => (
              <TouchableOpacity
                key={filter}
                className={`mr-2 px-4 py-2 rounded-full ${
                  selectedFilter === filter ? 'bg-primary' : 'bg-gray-100'
                }`}
                onPress={() => setSelectedFilter(filter)}
              >
                <Text className={selectedFilter === filter ? 'text-white' : 'text-gray-700'}>
                  {filter === 'all' ? 'All Time' : filter === 'week' ? 'This Week' : 'This Month'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Exercise Filters */}
          <View className="flex-row">
            <TouchableOpacity
              className={`mr-2 px-4 py-2 rounded-full ${
                selectedExercise === 'all' ? 'bg-primary' : 'bg-gray-100'
              }`}
              onPress={() => setSelectedExercise('all')}
            >
              <Text className={selectedExercise === 'all' ? 'text-white' : 'text-gray-700'}>
                All Exercises
              </Text>
            </TouchableOpacity>
            
            {exercises.map((exercise) => (
              <TouchableOpacity
                key={exercise}
                className={`mr-2 px-4 py-2 rounded-full ${
                  selectedExercise === exercise ? 'bg-primary' : 'bg-gray-100'
                }`}
                onPress={() => setSelectedExercise(exercise)}
              >
                <Text className={selectedExercise === exercise ? 'text-white' : 'text-gray-700'}>
                  {exercise}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* History List */}
      {filteredHistory.length > 0 ? (
        <FlatList
          data={filteredHistory}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => <WorkoutCard workout={item} />}
          contentContainerClassName="p-5"
          showsVerticalScrollIndicator={false}
          ListFooterComponent={<View className="h-5" />}
        />
      ) : (
        <View className="flex-1 items-center justify-center p-5">
          <Text className="text-6xl mb-4">📝</Text>
          <Text className="text-xl font-bold text-gray-800 mb-2">No workouts yet</Text>
          <Text className="text-base text-gray-500 text-center mb-6">
            Complete your first workout to see it here!
          </Text>
          <TouchableOpacity
            className="bg-primary px-8 py-4 rounded-xl"
            onPress={() => navigation.navigate('Dashboard')}
          >
            <Text className="text-white font-bold">Go to Dashboard</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}