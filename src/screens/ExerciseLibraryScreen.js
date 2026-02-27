import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Animated,
  Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

// Complete exercise database
const EXERCISES = {
  home: [
    {
      id: 'pushups',
      name: 'Push-ups',
      icon: '💪',
      difficulty: 'Beginner',
      muscleGroups: ['Chest', 'Shoulders', 'Triceps'],
      duration: '30 sec',
      calories: '8-12 per rep',
      equipment: 'None',
      description: 'The classic bodyweight exercise for upper body strength.',
      longDescription: 'Push-ups are one of the most effective bodyweight exercises. They target your pectorals, deltoids, and triceps while also engaging your core stabilizers.',
      formTips: [
        'Keep your body in a straight line from head to heels',
        'Lower your chest until it almost touches the floor',
        'Elbows should be at a 45-degree angle to your body',
        'Breathe in on the way down, out on the way up',
        'Keep your core tight throughout the movement'
      ],
      commonMistakes: [
        'Sagging hips or raising butt too high',
        'Flaring elbows out to the sides',
        'Not going low enough',
        'Holding breath'
      ],
      variations: [
        { name: 'Wide Push-ups', description: 'Hands wider than shoulders - targets chest more' },
        { name: 'Diamond Push-ups', description: 'Hands together under chest - targets triceps' },
        { name: 'Decline Push-ups', description: 'Feet elevated - increases difficulty' },
        { name: 'Incline Push-ups', description: 'Hands on elevated surface - easier variation' }
      ],
      benefits: [
        'Builds upper body strength',
        'Improves core stability',
        'No equipment needed',
        'Can be done anywhere'
      ],
      rating: 4.8,
      reviews: 1243,
      color: ['#FF6B6B', '#EE5A5A']
    },
    {
      id: 'squats',
      name: 'Squats',
      icon: '🦵',
      difficulty: 'Beginner',
      muscleGroups: ['Quadriceps', 'Hamstrings', 'Glutes', 'Core'],
      duration: '45 sec',
      calories: '10-15 per rep',
      equipment: 'None',
      description: 'The king of lower body exercises.',
      longDescription: 'Squats are a compound exercise that targets your entire lower body. They strengthen your quads, hamstrings, glutes, and calves.',
      formTips: [
        'Keep your chest up and back straight',
        'Lower as if sitting in a chair',
        'Keep knees behind toes',
        'Go down until thighs are parallel to ground',
        'Drive through heels to stand up'
      ],
      commonMistakes: [
        'Knees caving inward',
        'Rounding the back',
        'Not going low enough',
        'Lifting heels off ground'
      ],
      variations: [
        { name: 'Jump Squats', description: 'Explosive jump at top - adds cardio' },
        { name: 'Bulgarian Split Squats', description: 'Rear foot elevated - unilateral strength' },
        { name: 'Pistol Squats', description: 'Single leg squat - advanced' },
        { name: 'Sumo Squats', description: 'Wide stance - targets inner thighs' }
      ],
      benefits: [
        'Builds lower body strength',
        'Improves mobility and flexibility',
        'Engages core muscles',
        'Functional movement for daily life'
      ],
      rating: 4.9,
      reviews: 2156,
      color: ['#4ECDC4', '#45B7D1']
    },
    {
      id: 'lunges',
      name: 'Lunges',
      icon: '🏃',
      difficulty: 'Beginner',
      muscleGroups: ['Quadriceps', 'Glutes', 'Hamstrings', 'Core'],
      duration: '40 sec',
      calories: '8-12 per rep',
      equipment: 'None',
      description: 'Unilateral leg exercise that improves balance and coordination.',
      longDescription: 'Lunges are excellent for building unilateral leg strength and improving balance. They target your quads, glutes, and hamstrings.',
      formTips: [
        'Keep torso upright',
        'Front knee at 90 degrees',
        'Back knee接近 floor',
        'Push through front heel to return',
        'Keep shoulders back'
      ],
      commonMistakes: [
        'Knee past toes',
        'Leaning forward too much',
        'Not going deep enough',
        'Losing balance'
      ],
      variations: [
        { name: 'Walking Lunges', description: 'Move forward with each lunge' },
        { name: 'Reverse Lunges', description: 'Step backward - easier on knees' },
        { name: 'Side Lunges', description: 'Lateral movement - targets inner thighs' },
        { name: 'Curtsy Lunges', description: 'Cross behind - targets glutes differently' }
      ],
      benefits: [
        'Improves balance and coordination',
        'Builds unilateral strength',
        'Corrects muscle imbalances',
        'Engages core stabilizers'
      ],
      rating: 4.7,
      reviews: 987,
      color: ['#45B7D1', '#96CEB4']
    },
    {
      id: 'planks',
      name: 'Planks',
      icon: '🧘',
      difficulty: 'Beginner',
      muscleGroups: ['Core', 'Shoulders', 'Back', 'Glutes'],
      duration: '30-60 sec',
      calories: '3-5 per minute',
      equipment: 'None',
      description: 'The ultimate core stability exercise.',
      longDescription: 'Planks are an isometric core exercise that builds endurance in your abs, back, and shoulders. They improve posture and stability.',
      formTips: [
        'Keep body straight from head to heels',
        'Engage core by pulling belly button to spine',
        'Squeeze glutes',
        'Keep neck neutral by looking at floor',
        'Don\'t let hips sag or rise'
      ],
      commonMistakes: [
        'Hips sagging toward floor',
        'Butt too high in air',
        'Holding breath',
        'Looking forward (strains neck)'
      ],
      variations: [
        { name: 'Side Planks', description: 'Balance on one arm - targets obliques' },
        { name: 'Plank Jacks', description: 'Jump feet in and out - adds cardio' },
        { name: 'Mountain Climbers', description: 'Alternate knees to chest - dynamic' },
        { name: 'Reverse Planks', description: 'Face up - targets posterior chain' }
      ],
      benefits: [
        'Builds core endurance',
        'Improves posture',
        'Reduces back pain',
        'No equipment needed'
      ],
      rating: 4.6,
      reviews: 856,
      color: ['#96CEB4', '#FFE194']
    }
  ],
  gym: [
    {
      id: 'benchPress',
      name: 'Bench Press',
      icon: '🏋️',
      difficulty: 'Intermediate',
      muscleGroups: ['Chest', 'Triceps', 'Shoulders'],
      equipment: ['Barbell', 'Bench'],
      duration: '3-5 sets',
      calories: '5-8 per rep',
      description: 'Compound chest exercise for building upper body strength.',
      longDescription: 'The bench press is the gold standard for chest development. This compound movement targets your pectorals, triceps, and front delts.',
      formTips: [
        'Keep shoulders back and down',
        'Feet planted firmly on ground',
        'Bar should touch mid-chest',
        'Elbows at 75-degree angle',
        'Drive through heels'
      ],
      commonMistakes: [
        'Bouncing bar off chest',
        'Lifting butt off bench',
        'Uneven bar path',
        'Locking elbows too hard'
      ],
      variations: [
        { name: 'Incline Bench', description: 'Targets upper chest' },
        { name: 'Decline Bench', description: 'Targets lower chest' },
        { name: 'Dumbbell Press', description: 'Better range of motion' },
        { name: 'Close-grip Press', description: 'Targets triceps' }
      ],
      benefits: [
        'Builds chest mass',
        'Strengthens triceps',
        'Improves pushing strength',
        'Compound movement'
      ],
      rating: 4.9,
      reviews: 3456,
      color: ['#355C7D', '#6C5B7B']
    }
  ],
  yoga: [
    {
      id: 'downwardDog',
      name: 'Downward Dog',
      icon: '🧘',
      difficulty: 'Beginner',
      muscleGroups: ['Full Body', 'Hamstrings', 'Shoulders', 'Back'],
      duration: '30-60 sec',
      calories: '2-4 per minute',
      equipment: 'Yoga mat',
      description: 'Foundational yoga pose that stretches and strengthens the entire body.',
      longDescription: 'Downward-Facing Dog is a fundamental yoga pose that stretches your hamstrings, calves, and spine while strengthening your arms, shoulders, and core.',
      formTips: [
        'Hands shoulder-width apart',
        'Feet hip-width apart',
        'Press hips up and back',
        'Keep spine long',
        'Heels reaching toward floor'
      ],
      commonMistakes: [
        'Rounding the back',
        'Shoulders hunched',
        'Knees bent too much',
        'Weight too far forward'
      ],
      variations: [
        { name: 'Three-legged Dog', description: 'Lift one leg - adds challenge' },
        { name: 'Puppy Pose', description: 'Knees down - gentler stretch' },
        { name: 'Dolphin Pose', description: 'On forearms - shoulder opener' },
        { name: 'Wide-legged Dog', description: 'Feet wider - inner thigh stretch' }
      ],
      benefits: [
        'Full body stretch',
        'Builds upper body strength',
        'Calms the mind',
        'Improves circulation'
      ],
      rating: 4.8,
      reviews: 2345,
      color: ['#9B59B6', '#8E44AD']
    }
  ],
  cardio: [
    {
      id: 'jumpingJacks',
      name: 'Jumping Jacks',
      icon: '🤸',
      difficulty: 'Beginner',
      muscleGroups: ['Full Body', 'Cardio', 'Shoulders', 'Legs'],
      duration: '30-60 sec',
      calories: '8-12 per minute',
      equipment: 'None',
      description: 'Classic cardio warm-up that gets your heart rate up quickly.',
      longDescription: 'Jumping jacks are a simple, effective cardio exercise that engages your whole body. They improve cardiovascular fitness and coordination.',
      formTips: [
        'Land softly on balls of feet',
        'Keep rhythm steady',
        'Breathe rhythmically',
        'Swing arms fully',
        'Keep core engaged'
      ],
      commonMistakes: [
        'Landing heavily',
        'Arms not extending fully',
        'Holding breath',
        'Poor rhythm'
      ],
      variations: [
        { name: 'Cross Jacks', description: 'Arms and legs cross - coordination' },
        { name: 'Power Jacks', description: 'Explosive - higher intensity' },
        { name: 'Squat Jacks', description: 'Land in squat - lower body focus' },
        { name: 'Star Jacks', description: 'Jump into star shape - advanced' }
      ],
      benefits: [
        'Cardiovascular health',
        'Full body engagement',
        'No equipment',
        'Good for warm-up'
      ],
      rating: 4.5,
      reviews: 1543,
      color: ['#F1C40F', '#F39C12']
    }
  ]
};

const WORKOUT_TYPES = [
  { id: 'all', name: 'All', icon: '📋', color: '#6C5B7B' },
  { id: 'home', name: 'Home', icon: '🏠', color: '#4ECDC4' },
  { id: 'gym', name: 'Gym', icon: '🏋️', color: '#355C7D' },
  { id: 'yoga', name: 'Yoga', icon: '🧘', color: '#9B59B6' },
  { id: 'cardio', name: 'Cardio', icon: '🏃', color: '#E67E22' }
];

const DIFFICULTY_LEVELS = [
  { id: 'all', name: 'All Levels' },
  { id: 'Beginner', name: 'Beginner' },
  { id: 'Intermediate', name: 'Intermediate' },
  { id: 'Advanced', name: 'Advanced' }
];

const DIFFICULTY_COLORS = {
  Beginner: { bg: '#E8F5E9', text: '#2E7D32' },
  Intermediate: { bg: '#FFF3E0', text: '#F57C00' },
  Advanced: { bg: '#FFEBEE', text: '#C62828' }
};

export default function ExerciseLibraryScreen({ navigation }) {
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const scrollY = new Animated.Value(0);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const saved = await AsyncStorage.getItem('favoriteExercises');
      if (saved) setFavorites(JSON.parse(saved));
    } catch (error) {
      console.log('Error loading favorites:', error);
    }
  };

  const toggleFavorite = async (exerciseId) => {
    let newFavorites;
    if (favorites.includes(exerciseId)) {
      newFavorites = favorites.filter(id => id !== exerciseId);
    } else {
      newFavorites = [...favorites, exerciseId];
    }
    setFavorites(newFavorites);
    await AsyncStorage.setItem('favoriteExercises', JSON.stringify(newFavorites));
  };

  const getFilteredExercises = () => {
    let exercises = [];
    
    if (selectedType === 'all') {
      Object.values(EXERCISES).forEach(typeExercises => {
        exercises = [...exercises, ...typeExercises];
      });
    } else {
      exercises = EXERCISES[selectedType] || [];
    }

    if (searchQuery) {
      exercises = exercises.filter(ex => 
        ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.muscleGroups.some(m => m.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedDifficulty !== 'all') {
      exercises = exercises.filter(ex => ex.difficulty === selectedDifficulty);
    }

    exercises.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'difficulty') {
        const order = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3 };
        return order[a.difficulty] - order[b.difficulty];
      }
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });

    return exercises;
  };

  const ExerciseCard = ({ exercise }) => {
    const isFavorite = favorites.includes(exercise.id);
    const difficultyColor = DIFFICULTY_COLORS[exercise.difficulty];
    
    return (
      <TouchableOpacity
        className="bg-white rounded-2xl mb-4 overflow-hidden shadow-lg"
        onPress={() => setSelectedExercise(exercise)}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={exercise.color || ['#4ECDC4', '#45B7D1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="p-4"
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="w-14 h-14 bg-white/20 rounded-2xl items-center justify-center">
                <Text className="text-3xl">{exercise.icon}</Text>
              </View>
              <View className="ml-4">
                <Text className="text-xl font-bold text-white">{exercise.name}</Text>
                <View className="flex-row items-center mt-1">
                  <View className={`px-2 py-1 rounded-full mr-2`} style={{ backgroundColor: difficultyColor.bg }}>
                    <Text className="text-xs font-semibold" style={{ color: difficultyColor.text }}>
                      {exercise.difficulty}
                    </Text>
                  </View>
                  <Text className="text-white/80 text-xs">⭐ {exercise.rating}</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity onPress={() => toggleFavorite(exercise.id)}>
              <Text className="text-2xl text-white">
                {isFavorite ? '⭐' : '☆'}
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
        
        <View className="p-4">
          <Text className="text-gray-700 text-sm mb-3" numberOfLines={2}>
            {exercise.description}
          </Text>
          
          <View className="flex-row flex-wrap mb-3">
            {exercise.muscleGroups.slice(0, 3).map((muscle, index) => (
              <View key={index} className="bg-gray-100 px-3 py-1.5 rounded-full mr-2 mb-2">
                <Text className="text-xs text-gray-700">{muscle}</Text>
              </View>
            ))}
          </View>
          
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Text className="text-gray-500 mr-3">⏱️ {exercise.duration}</Text>
              <Text className="text-gray-500">🔥 {exercise.calories}</Text>
            </View>
            <Text className="text-primary font-semibold">View Details →</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const ExerciseDetail = ({ exercise, onClose }) => {
    const [activeTab, setActiveTab] = useState('overview');
    
    return (
      <Modal
        animationType="slide"
        transparent={false}
        visible={!!exercise}
        onRequestClose={onClose}
      >
        <View className="flex-1 bg-white">
          {/* Header with gradient */}
          <LinearGradient
            colors={exercise?.color || ['#4ECDC4', '#45B7D1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="pt-12 pb-4 px-5"
          >
            <View className="flex-row justify-between items-center mb-4">
              <TouchableOpacity onPress={onClose} className="w-10 h-10 bg-white/20 rounded-full items-center justify-center">
                <Text className="text-2xl text-white">←</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => toggleFavorite(exercise?.id)}>
                <Text className="text-3xl text-white">
                  {favorites.includes(exercise?.id) ? '⭐' : '☆'}
                </Text>
              </TouchableOpacity>
            </View>
            
            <View className="flex-row items-center">
              <View className="w-16 h-16 bg-white/20 rounded-2xl items-center justify-center mr-4">
                <Text className="text-4xl">{exercise?.icon}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-2xl font-bold text-white">{exercise?.name}</Text>
                <View className="flex-row items-center mt-1">
                  <View className={`px-2 py-1 rounded-full mr-2`} style={{ backgroundColor: DIFFICULTY_COLORS[exercise?.difficulty]?.bg }}>
                    <Text className="text-xs font-semibold" style={{ color: DIFFICULTY_COLORS[exercise?.difficulty]?.text }}>
                      {exercise?.difficulty}
                    </Text>
                  </View>
                  <Text className="text-white/90 text-sm">⭐ {exercise?.rating} ({exercise?.reviews})</Text>
                </View>
              </View>
            </View>
          </LinearGradient>

          {/* Tab Bar */}
          <View className="flex-row bg-white border-b border-gray-200 px-2">
            {[
              { id: 'overview', label: 'Overview', icon: '📋' },
              { id: 'tips', label: 'Form Tips', icon: '✅' },
              { id: 'variations', label: 'Variations', icon: '🔄' },
              { id: 'benefits', label: 'Benefits', icon: '💪' }
            ].map((tab) => (
              <TouchableOpacity
                key={tab.id}
                className={`flex-1 py-3 items-center border-b-2 ${
                  activeTab === tab.id ? 'border-primary' : 'border-transparent'
                }`}
                onPress={() => setActiveTab(tab.id)}
              >
                <Text className="text-lg mb-1">{tab.icon}</Text>
                <Text className={`text-xs ${
                  activeTab === tab.id ? 'text-primary font-semibold' : 'text-gray-500'
                }`}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Scrollable Content */}
          <ScrollView 
            className="flex-1 px-5 pt-4" 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          >
            {activeTab === 'overview' && (
              <View>
                <View className="flex-row justify-around mb-6">
                  <View className="items-center bg-gray-50 p-3 rounded-xl flex-1 mr-2">
                    <Text className="text-2xl mb-1">⏱️</Text>
                    <Text className="text-xs text-gray-500">Duration</Text>
                    <Text className="text-sm font-bold text-gray-800">{exercise?.duration}</Text>
                  </View>
                  <View className="items-center bg-gray-50 p-3 rounded-xl flex-1 mr-2">
                    <Text className="text-2xl mb-1">🔥</Text>
                    <Text className="text-xs text-gray-500">Calories</Text>
                    <Text className="text-sm font-bold text-gray-800">{exercise?.calories}</Text>
                  </View>
                  <View className="items-center bg-gray-50 p-3 rounded-xl flex-1">
                    <Text className="text-2xl mb-1">💪</Text>
                    <Text className="text-xs text-gray-500">Equipment</Text>
                    <Text className="text-sm font-bold text-gray-800">{exercise?.equipment || 'None'}</Text>
                  </View>
                </View>

                <View className="mb-6">
                  <Text className="text-lg font-bold text-gray-800 mb-3">📝 Description</Text>
                  <Text className="text-gray-600 leading-6">{exercise?.longDescription}</Text>
                </View>

                <View className="mb-6">
                  <Text className="text-lg font-bold text-gray-800 mb-3">🎯 Target Muscles</Text>
                  <View className="flex-row flex-wrap">
                    {exercise?.muscleGroups.map((muscle, index) => (
                      <View key={index} className="bg-blue-100 px-4 py-2 rounded-full mr-2 mb-2">
                        <Text className="text-blue-700 font-medium">{muscle}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {activeTab === 'tips' && (
              <View>
                <View className="mb-6">
                  <Text className="text-lg font-bold text-gray-800 mb-3">✅ Form Tips</Text>
                  {exercise?.formTips.map((tip, index) => (
                    <View key={index} className="flex-row items-start mb-3 bg-green-50 p-4 rounded-xl">
                      <View className="w-6 h-6 bg-green-500 rounded-full items-center justify-center mr-3">
                        <Text className="text-white text-sm">✓</Text>
                      </View>
                      <Text className="flex-1 text-gray-700">{tip}</Text>
                    </View>
                  ))}
                </View>

                <View className="mb-6">
                  <Text className="text-lg font-bold text-gray-800 mb-3">⚠️ Common Mistakes</Text>
                  {exercise?.commonMistakes.map((mistake, index) => (
                    <View key={index} className="flex-row items-start mb-3 bg-red-50 p-4 rounded-xl">
                      <View className="w-6 h-6 bg-red-500 rounded-full items-center justify-center mr-3">
                        <Text className="text-white text-sm">✗</Text>
                      </View>
                      <Text className="flex-1 text-gray-700">{mistake}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {activeTab === 'variations' && (
              <View>
                <Text className="text-lg font-bold text-gray-800 mb-3">🔄 Variations</Text>
                {exercise?.variations.map((variation, index) => (
                  <View key={index} className="bg-gray-50 p-4 rounded-xl mb-3">
                    <Text className="font-bold text-gray-800 mb-1">{variation.name}</Text>
                    <Text className="text-sm text-gray-600">{variation.description}</Text>
                  </View>
                ))}
              </View>
            )}

            {activeTab === 'benefits' && (
              <View>
                <Text className="text-lg font-bold text-gray-800 mb-3">💎 Benefits</Text>
                {exercise?.benefits.map((benefit, index) => (
                  <View key={index} className="flex-row items-start mb-3 bg-yellow-50 p-4 rounded-xl">
                    <Text className="text-yellow-600 text-lg mr-3">✨</Text>
                    <Text className="flex-1 text-gray-700">{benefit}</Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Fixed Start Button */}
          <View className="absolute bottom-0 left-0 right-0 bg-white pt-2 pb-6 px-5 border-t border-gray-200 shadow-lg">
            <TouchableOpacity
              className="bg-primary py-4 rounded-xl items-center"
              onPress={() => {
                onClose();
                navigation.navigate('Workout', {
                  exerciseType: exercise?.id,
                  exerciseName: exercise?.name,
                  targetReps: exercise?.id === 'planks' ? 60 : 10,
                  unit: exercise?.id === 'planks' ? 'seconds' : 'reps',
                  exerciseData: exercise
                });
              }}
            >
              <Text className="text-white text-lg font-bold">🚀 Start This Exercise</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  const filteredExercises = getFilteredExercises();

  return (
    <View className="flex-1 bg-gray-50">
      {/* Animated Header */}
      <Animated.View className="bg-primary pt-12 px-5 pb-4">
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text className="text-3xl text-white">←</Text>
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-white">Exercise Library</Text>
          <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
            <Text className="text-2xl text-white">🔍</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="bg-white/20 rounded-2xl flex-row items-center px-4 py-2">
          <Text className="text-white/60 mr-2">🔍</Text>
          <TextInput
            className="flex-1 py-2 text-base text-white"
            placeholder="Search exercises..."
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text className="text-white/60">✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </Animated.View>

      {/* Workout Type Filter */}
      <View className="bg-white py-3 px-4 border-b border-gray-200">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {WORKOUT_TYPES.map((type) => (
            <TouchableOpacity
              key={type.id}
              className={`mr-3 px-5 py-2.5 rounded-full flex-row items-center ${
                selectedType === type.id ? 'bg-primary' : 'bg-gray-100'
              }`}
              onPress={() => setSelectedType(type.id)}
            >
              <Text className={`mr-2 ${selectedType === type.id ? 'text-white' : 'text-gray-700'}`}>
                {type.icon}
              </Text>
              <Text className={`font-medium ${
                selectedType === type.id ? 'text-white' : 'text-gray-700'
              }`}>
                {type.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Difficulty Filter */}
      <View className="bg-white px-4 py-3 border-b border-gray-200">
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {DIFFICULTY_LEVELS.map((level) => (
            <TouchableOpacity
              key={level.id}
              className={`mr-2 px-5 py-2.5 rounded-full ${
                selectedDifficulty === level.id 
                  ? level.id === 'all' ? 'bg-gray-800' : DIFFICULTY_COLORS[level.id]?.bg
                  : 'bg-gray-100'
              }`}
              onPress={() => setSelectedDifficulty(level.id)}
            >
              <Text className={`font-medium ${
                selectedDifficulty === level.id 
                  ? level.id === 'all' ? 'text-white' : DIFFICULTY_COLORS[level.id]?.text
                  : 'text-gray-700'
              }`}>
                {level.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Exercise List */}
      <ScrollView 
        className="flex-1 px-5 pt-4"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-sm text-gray-500">
            {filteredExercises.length} exercises found
          </Text>
        </View>
        
        {filteredExercises.map((exercise) => (
          <ExerciseCard key={exercise.id} exercise={exercise} />
        ))}

        {filteredExercises.length === 0 && (
          <View className="items-center justify-center py-16">
            <Text className="text-6xl mb-4">😕</Text>
            <Text className="text-xl font-bold text-gray-800 mb-2">No exercises found</Text>
            <Text className="text-base text-gray-500 text-center px-8">
              Try adjusting your filters or search query
            </Text>
            <TouchableOpacity 
              className="bg-primary px-8 py-4 rounded-xl mt-6"
              onPress={() => {
                setSelectedType('all');
                setSelectedDifficulty('all');
                setSearchQuery('');
              }}
            >
              <Text className="text-white font-bold">Clear All Filters</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Exercise Detail Modal */}
      {selectedExercise && (
        <ExerciseDetail 
          exercise={selectedExercise} 
          onClose={() => setSelectedExercise(null)} 
        />
      )}
    </View>
  );
}