interface ScrapedData {
  url: string;
  title: string;
  content: string;
  emotionalTone: number;
  behavioralTriggers: string[];
  timestamp: number;
}

interface BehavioralPattern {
  trigger: string;
  frequency: number;
  effectiveness: number;
  targetDemographic: string[];
}

export class WebScraper {
  private static scrapedData: ScrapedData[] = [];
  private static behavioralPatterns: BehavioralPattern[] = [];

  static async scrapeTarget(url: string): Promise<ScrapedData> {
    try {
      // Simulate web scraping (in real implementation, would use proxy or edge function)
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
      const data = await response.json();
      
      const content = data.contents || '';
      const title = this.extractTitle(content);
      const emotionalTone = this.analyzeEmotionalTone(content);
      const behavioralTriggers = this.extractBehavioralTriggers(content);

      const scrapedData: ScrapedData = {
        url,
        title,
        content: content.substring(0, 1000), // Truncate for storage
        emotionalTone,
        behavioralTriggers,
        timestamp: Date.now()
      };

      this.scrapedData.push(scrapedData);
      this.updateBehavioralPatterns(scrapedData);
      
      return scrapedData;
    } catch (error) {
      console.error('Scraping failed:', error);
      return {
        url,
        title: 'Unknown',
        content: '',
        emotionalTone: 0,
        behavioralTriggers: [],
        timestamp: Date.now()
      };
    }
  }

  static async scrapeMultipleTargets(urls: string[]): Promise<ScrapedData[]> {
    const promises = urls.map(url => this.scrapeTarget(url));
    return Promise.all(promises);
  }

  private static extractTitle(html: string): string {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    return titleMatch ? titleMatch[1] : 'Untitled';
  }

  private static analyzeEmotionalTone(content: string): number {
    const positiveWords = ['happy', 'joy', 'love', 'amazing', 'wonderful', 'success', 'win', 'great', 'excellent'];
    const negativeWords = ['sad', 'angry', 'hate', 'terrible', 'awful', 'failure', 'lose', 'bad', 'horrible'];
    const urgencyWords = ['now', 'limited', 'urgent', 'hurry', 'quick', 'immediate', 'deadline', 'expire'];
    
    const text = content.toLowerCase();
    let score = 0;
    
    positiveWords.forEach(word => {
      score += (text.match(new RegExp(word, 'g')) || []).length;
    });
    
    negativeWords.forEach(word => {
      score -= (text.match(new RegExp(word, 'g')) || []).length * 0.8;
    });
    
    urgencyWords.forEach(word => {
      score += (text.match(new RegExp(word, 'g')) || []).length * 1.5;
    });
    
    return Math.max(-10, Math.min(10, score));
  }

  private static extractBehavioralTriggers(content: string): string[] {
    const triggers = [
      'social_proof', 'scarcity', 'authority', 'reciprocity', 'commitment',
      'liking', 'urgency', 'fear_of_missing_out', 'emotional_appeal',
      'repetition', 'anchoring', 'bandwagon', 'loss_aversion'
    ];
    
    const detectedTriggers: string[] = [];
    const text = content.toLowerCase();
    
    // Simple keyword detection for behavioral triggers
    if (text.includes('everyone') || text.includes('most people')) {
      detectedTriggers.push('social_proof');
    }
    if (text.includes('limited') || text.includes('only')) {
      detectedTriggers.push('scarcity');
    }
    if (text.includes('expert') || text.includes('doctor') || text.includes('study')) {
      detectedTriggers.push('authority');
    }
    if (text.includes('free') || text.includes('gift')) {
      detectedTriggers.push('reciprocity');
    }
    if (text.includes('now') || text.includes('today')) {
      detectedTriggers.push('urgency');
    }
    
    return detectedTriggers;
  }

  private static updateBehavioralPatterns(data: ScrapedData) {
    data.behavioralTriggers.forEach(trigger => {
      const existing = this.behavioralPatterns.find(p => p.trigger === trigger);
      if (existing) {
        existing.frequency += 1;
        existing.effectiveness = (existing.effectiveness + data.emotionalTone) / 2;
      } else {
        this.behavioralPatterns.push({
          trigger,
          frequency: 1,
          effectiveness: data.emotionalTone,
          targetDemographic: ['general']
        });
      }
    });
  }

  static getBehavioralPatterns(): BehavioralPattern[] {
    return this.behavioralPatterns;
  }

  static getScrapedData(): ScrapedData[] {
    return this.scrapedData;
  }
}