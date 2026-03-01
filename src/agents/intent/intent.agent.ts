import { Agent } from '../../core/agent.js';
import { UserFeedback, UserIntent, UserIntentSchema } from '../../domain/intent.js';
import { FileStore } from '../../storage/fileStore.js';

export class IntentAgent implements Agent<UserFeedback, UserIntent> {
  name = 'intent';
  private store: FileStore;

  constructor(store: FileStore = new FileStore()) {
    this.store = store;
  }

  async run(feedback: UserFeedback): Promise<UserIntent> {
    const currentIntent = this.store.loadUserIntent();
    const updatedIntent = this.updateIntent(currentIntent, feedback);
    this.store.appendFeedback(feedback);
    this.store.saveUserIntent(updatedIntent);
    return updatedIntent;
  }

  private updateIntent(intent: UserIntent, feedback: UserFeedback): UserIntent {
    const nextIntent = { ...intent };

    switch (feedback.action) {
      case 'APPROVE':
        nextIntent.riskTolerance = clamp(nextIntent.riskTolerance + 0.03, 0, 1);
        nextIntent.confidence = clamp(nextIntent.confidence + 0.04, 0, 1);
        break;
      case 'REJECT':
        nextIntent.riskTolerance = clamp(nextIntent.riskTolerance - 0.04, 0, 1);
        nextIntent.confidence = clamp(nextIntent.confidence + 0.02, 0, 1);
        break;
      case 'WATCH':
        nextIntent.riskTolerance = clamp(nextIntent.riskTolerance - 0.01, 0, 1);
        nextIntent.confidence = clamp(nextIntent.confidence + 0.01, 0, 1);
        break;
      case 'ADJUST':
        if (feedback.adjustedSizePercent !== undefined) {
          if (feedback.adjustedSizePercent >= 10) {
            nextIntent.riskTolerance = clamp(nextIntent.riskTolerance + 0.02, 0, 1);
          } else {
            nextIntent.riskTolerance = clamp(nextIntent.riskTolerance - 0.02, 0, 1);
          }
        }

        if (feedback.adjustedHoldingDays !== undefined) {
          nextIntent.holdingHorizonDays = Math.max(
            1,
            Math.round((nextIntent.holdingHorizonDays * 0.8) + (feedback.adjustedHoldingDays * 0.2))
          );
        }
        break;
      default:
        break;
    }

    nextIntent.updatedAt = Date.now();
    return UserIntentSchema.parse(nextIntent);
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
