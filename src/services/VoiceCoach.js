import * as Speech from 'expo-speech';

class VoiceCoach {
  constructor() {
    this.isEnabled = true;
    this.isSpeaking = false;
    this.voice = null;
  }

  setEnabled(enabled) {
    this.isEnabled = enabled;
    if (!enabled) {
      this.stop();
    }
  }

  async speak(message) {
    if (!this.isEnabled) return;

    try {
      this.isSpeaking = true;
      const options = {
        rate: 0.8,
        pitch: 1.0,
        language: 'en'
      };
      await Speech.speak(message, options);
      this.isSpeaking = false;
    } catch (error) {
      console.log('Speech error:', error);
      this.isSpeaking = false;
    }
  }

  async stop() {
    try {
      await Speech.stop();
      this.isSpeaking = false;
    } catch (error) {
      console.log('Stop error:', error);
    }
  }

  // Motivational messages
  motivate() {
    const messages = [
      "You're doing great! Keep going!",
      "Almost there! Push through!",
      "Perfect form! You're crushing it!",
      "One more rep! You can do it!",
      "Remember to breathe and focus on form"
    ];
    const random = messages[Math.floor(Math.random() * messages.length)];
    this.speak(random);
  }

  // Form correction
  correctForm(issue) {
    const corrections = {
      'back sagging': 'Keep your back straight, tighten your core',
      'hips too high': 'Lower your hips, keep your body straight',
      'not deep enough': 'Go lower for better results',
      'knees collapsing': 'Push your knees outward'
    };
    const message = corrections[issue] || 'Focus on your form';
    this.speak(message);
  }

  // Count reps
  countRep(number) {
    if (number % 5 === 0) {
      this.speak(`${number} reps! Keep going!`);
    }
  }

  // Workout complete
  complete() {
    this.speak("Great job! Workout complete! You're amazing!");
  }
}

// Create and export a single instance
const voiceCoachInstance = new VoiceCoach();
export default voiceCoachInstance;