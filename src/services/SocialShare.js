import { Share, Alert } from 'react-native';

class SocialShare {
  async shareWorkout(workoutData) {
    const message = this.formatWorkoutMessage(workoutData);
    
    try {
      await Share.share({
        message,
        title: 'My Workout Achievement'
      });
    } catch (error) {
      Alert.alert('Error', 'Could not share');
    }
  }

  formatWorkoutMessage(data) {
    return `💪 Just completed ${data.reps} ${data.exercise}!\n🔥 Form score: ${data.formScore}/10\n⏱️ Duration: ${data.duration}s\n\n#FitnessTracker #Workout`;
  }

  async shareProgress(photo) {
    Alert.alert('Share', 'Photo sharing coming soon!');
  }

  async shareMilestone(milestone) {
    const message = `🏆 Milestone Unlocked!\n${milestone.description}`;
    await Share.share({ message });
  }
}

export default new SocialShare();