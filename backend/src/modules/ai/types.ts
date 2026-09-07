export interface IChatHistoryItem {
  sender: 'user' | 'bot';
  message: string;
  timestamp: string;
}

export interface IAIResponse {
  reply: string;
  source: 'gemini-2.5-flash' | 'gemini-1.5-flash' | 'local-semantic-engine';
  confidence: number;
  isFallback: boolean;
  requiresHumanEscalation: boolean;
  timestamp: string;
}

export interface IAIEngine {
  generateReply(message: string, history?: IChatHistoryItem[]): Promise<IAIResponse>;
}
