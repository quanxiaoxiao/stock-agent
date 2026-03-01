import { TradeProposal } from '../domain/proposal';
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';

export class FileStore {
  private basePath: string;

  constructor(basePath: string = './memory') {
    this.basePath = basePath;
    
    // Ensure directories exist
    const dirs = ['proposals', 'approvals', 'outcomes'];
    dirs.forEach(dir => {
      const dirPath = join(this.basePath, dir);
      if (!existsSync(dirPath)) {
        mkdirSync(dirPath, { recursive: true });
      }
    });
  }

  saveProposal(proposal: TradeProposal): void {
    const filePath = join(this.basePath, 'proposals', `${proposal.id}.json`);
    writeFileSync(filePath, JSON.stringify(proposal, null, 2));
  }

  saveForApproval(proposal: TradeProposal): void {
    const filePath = join(this.basePath, 'approvals', 'pending', `${proposal.id}.json`);
    const pendingDir = join(this.basePath, 'approvals', 'pending');
    
    if (!existsSync(pendingDir)) {
      mkdirSync(pendingDir, { recursive: true });
    }
    
    writeFileSync(filePath, JSON.stringify(proposal, null, 2));
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
        return JSON.parse(content);
      });
  }
}