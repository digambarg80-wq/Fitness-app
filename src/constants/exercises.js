export const EXERCISES = {
  home: [
    {
      id: 'pushups',
      name: 'Push-ups',
      icon: '💪',
      difficulty: 'Beginner',
      muscleGroups: ['Chest', 'Shoulders', 'Triceps'],
      duration: '30 sec',
      calories: '5-10 per rep',
      description: 'Classic bodyweight exercise for upper body strength',
      formTips: [
        'Keep back straight',
        'Elbows at 45° angle',
        'Lower chest to floor',
        'Breathe out when pushing up'
      ],
      variations: ['Wide push-ups', 'Diamond push-ups', 'Decline push-ups']
    },
    // ... more exercises
  ],
  gym: [
    // ... gym exercises
  ],
  yoga: [
    // ... yoga exercises
  ],
  cardio: [
    // ... cardio exercises
  ]
};

export const WORKOUT_TYPES = [
  { id: 'all', name: 'All', icon: '📋' },
  { id: 'home', name: 'Home', icon: '🏠' },
  { id: 'gym', name: 'Gym', icon: '🏋️' },
  { id: 'yoga', name: 'Yoga', icon: '🧘' },
  { id: 'cardio', name: 'Cardio', icon: '🏃' }
];

export const DIFFICULTY_COLORS = {
  Beginner: 'text-green-600 bg-green-100',
  Intermediate: 'text-yellow-600 bg-yellow-100',
  Advanced: 'text-red-600 bg-red-100'
};