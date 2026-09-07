import { IAIEngine, IAIResponse, IChatHistoryItem } from './types';
import { GeminiProvider } from './GeminiProvider';
import { LocalFallbackProvider } from './LocalFallbackProvider';
import { logger } from '../../core/logger';

export class AIService implements IAIEngine {
  private static instance: AIService;
  private geminiProvider: GeminiProvider;
  private localProvider: LocalFallbackProvider;

  private constructor() {
    this.geminiProvider = new GeminiProvider();
    this.localProvider = new LocalFallbackProvider();
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  public async generateReply(
    message: string,
    history: IChatHistoryItem[] = []
  ): Promise<IAIResponse> {
    if (this.geminiProvider.isAvailable()) {
      try {
        logger.debug('[AIService] Routing to Gemini 1.5 Flash...');
        return await this.geminiProvider.generateReply(message, history);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        logger.warn(
          `[AIService] Gemini Provider failed (${msg}), falling back to Local Semantic Provider.`
        );
      }
    }

    logger.debug('[AIService] Routing to Local Semantic Provider...');
    return await this.localProvider.generateReply(message, history);
  }
}

export const aiService = AIService.getInstance();
