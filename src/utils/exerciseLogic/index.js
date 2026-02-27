import { PushupDetector } from './pushups';
import { SquatDetector } from './squats';
import { LungeDetector } from './lunges';
import { PlankDetector } from './planks';

export function createDetector(exerciseType) {
    switch(exerciseType) {
        case 'pushups': 
            return new PushupDetector();
        case 'squats': 
            return new SquatDetector();
        case 'lunges': 
            return new LungeDetector();
        case 'planks': 
            return new PlankDetector();
        default: 
            throw new Error(`Unknown exercise type: ${exerciseType}`);
    }
}

export {
    PushupDetector,
    SquatDetector,
    LungeDetector,
    PlankDetector
};