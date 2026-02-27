import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const exercises = [
  { id: 'pushups', name: 'Push-ups', icon: '💪' },
  { id: 'squats', name: 'Squats', icon: '🦵' },
  { id: 'lunges', name: 'Lunges', icon: '🏃' },
  { id: 'planks', name: 'Planks', icon: '🧘' }
];

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Exercise</Text>
      {exercises.map((ex) => (
        <TouchableOpacity
          key={ex.id}
          style={styles.button}
          onPress={() => navigation.navigate('Workout', {
            exerciseType: ex.id,
            exerciseName: ex.name
          })}
        >
          <Text style={styles.buttonText}>{ex.icon} {ex.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center'
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    textAlign: 'center'
  }
});