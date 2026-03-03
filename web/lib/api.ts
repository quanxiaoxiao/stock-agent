import axios from 'axios';
import { 
  UserIntent, 
  TradeProposal, 
  TradeOutcome, 
  UserFeedback,
  EpisodicMemory,
  ReflectionInsight,
  DecisionResult
} from './types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// 意图管理
export const getIntent = async (): Promise<UserIntent> => {
  const response = await api.get('/intent');
  return response.data;
};

export const updateIntent = async (intent: UserIntent): Promise<UserIntent> => {
  const response = await api.put('/intent', intent);
  return response.data;
};

// 交易决策
export const runDecision = async (symbol?: string): Promise<DecisionResult> => {
  const response = await api.post('/decisions', { symbol });
  return response.data;
};

// 审批管理
export const getPendingApprovals = async (): Promise<TradeProposal[]> => {
  const response = await api.get('/approvals/pending');
  return response.data;
};

export const approveProposal = async (id: string, note?: string): Promise<void> => {
  await api.post(`/approvals/${id}/approve`, { note });
};

export const processApproved = async (): Promise<void> => {
  await api.post('/approvals/process');
};

// 提议管理
export const getProposals = async (): Promise<TradeProposal[]> => {
  const response = await api.get('/proposals');
  return response.data;
};

export const getProposal = async (id: string): Promise<TradeProposal> => {
  const response = await api.get(`/proposals/${id}`);
  return response.data;
};

export const submitFeedback = async (
  id: string, 
  action: string, 
  note?: string,
  adjustedSizePercent?: number,
  adjustedHoldingDays?: number
): Promise<void> => {
  await api.post(`/proposals/${id}/feedback`, {
    action,
    note,
    adjustedSizePercent,
    adjustedHoldingDays,
  });
};

// 历史记录
export const getOutcomes = async (): Promise<TradeOutcome[]> => {
  const response = await api.get('/outcomes');
  return response.data;
};

export const getFeedbackHistory = async (): Promise<UserFeedback[]> => {
  const response = await api.get('/feedback');
  return response.data;
};

// 记忆系统
export const getMemories = async (): Promise<EpisodicMemory[]> => {
  const response = await api.get('/memory');
  return response.data;
};

// 反思系统
export const runReflection = async (): Promise<ReflectionInsight> => {
  const response = await api.post('/reflection');
  return response.data;
};

export const getReflections = async (): Promise<ReflectionInsight[]> => {
  const response = await api.get('/reflections');
  return response.data;
};
