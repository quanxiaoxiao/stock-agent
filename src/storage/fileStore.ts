import { TradeProposal, TradeProposalSchema } from '../domain/proposal.js';
import {
  UserFeedback,
  UserFeedbackSchema,
  UserIntent,
  UserIntentSchema,
  createDefaultIntent,
} from '../domain/intent.js';
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';

export class FileStore {
  private basePath: string;

  constructor(basePath: string = './memory') {
    this.basePath = basePath;
    
    // Ensure directories exist
    const dirs = [
      'proposals',
      'approvals',
      'approvals/pending',
      'approvals/approved',
      'approvals/processed',
      'outcomes',
      'intent-feedback',
    ];
    dirs.forEach(dir => {
      const dirPath = join(this.basePath, dir);
      if (!existsSync(dirPath)) {
        mkdirSync(dirPath, { recursive: true });
      }
    });
  }

  saveProposal(proposal: TradeProposal): void {
    // Validate before saving
    const validatedProposal = TradeProposalSchema.parse(proposal);
    const filePath = join(this.basePath, 'proposals', `${validatedProposal.id}.json`);
    writeFileSync(filePath, JSON.stringify(validatedProposal, null, 2));
  }

  saveForApproval(proposal: TradeProposal): void {
    // Validate before saving
    const validatedProposal = TradeProposalSchema.parse(proposal);
    const filePath = join(this.basePath, 'approvals', 'pending', `${validatedProposal.id}.json`);
    const pendingDir = join(this.basePath, 'approvals', 'pending');
    
    if (!existsSync(pendingDir)) {
      mkdirSync(pendingDir, { recursive: true });
    }
    
    writeFileSync(filePath, JSON.stringify(validatedProposal, null, 2));
  }

  getPendingApprovals(): TradeProposal[] {
    const pendingDir = join(this.basePath, 'approvals', 'pending');
    if (!existsSync(pendingDir)) {
      return [];
    }

    const files: string[] = readdirSync(pendingDir);
    return files
      .filter(file => file.endsWith('.json'))
      .map((file: string) => {
        const filePath = join(pendingDir, file);
        const content = readFileSync(filePath, 'utf8');
        const parsed = JSON.parse(content);
        
        // Validate the retrieved proposal
        const validatedProposal = TradeProposalSchema.parse(parsed);
        return validatedProposal;
      });
  }

  loadUserIntent(): UserIntent {
    const intentPath = join(this.basePath, 'user-intent.json');
    if (!existsSync(intentPath)) {
      const defaultIntent = createDefaultIntent();
      this.saveUserIntent(defaultIntent);
      return defaultIntent;
    }

    const content = readFileSync(intentPath, 'utf8');
    const parsed = JSON.parse(content);
    return UserIntentSchema.parse(parsed);
  }

  saveUserIntent(intent: UserIntent): void {
    const validatedIntent = UserIntentSchema.parse(intent);
    const intentPath = join(this.basePath, 'user-intent.json');
    writeFileSync(intentPath, JSON.stringify(validatedIntent, null, 2));
  }

  appendFeedback(feedback: UserFeedback): void {
    const validatedFeedback = UserFeedbackSchema.parse(feedback);
    const historyPath = join(this.basePath, 'intent-feedback', 'history.json');
    const history = this.getFeedbackHistory();
    history.push(validatedFeedback);
    writeFileSync(historyPath, JSON.stringify(history, null, 2));
  }

  getFeedbackHistory(): UserFeedback[] {
    const historyPath = join(this.basePath, 'intent-feedback', 'history.json');
    if (!existsSync(historyPath)) {
      return [];
    }

    const content = readFileSync(historyPath, 'utf8');
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed)) {
      throw new Error('Feedback history file must be an array');
    }

    return parsed.map((item) => UserFeedbackSchema.parse(item));
  }

  findProposalById(proposalId: string): TradeProposal | null {
    const locations = [
      join(this.basePath, 'proposals'),
      join(this.basePath, 'approvals', 'pending'),
      join(this.basePath, 'approvals', 'approved'),
      join(this.basePath, 'approvals', 'processed'),
    ];

    for (const directory of locations) {
      const filePath = join(directory, `${proposalId}.json`);
      if (!existsSync(filePath)) {
        continue;
      }

      const content = readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(content);
      return TradeProposalSchema.parse(parsed);
    }

    return null;
  }
}
