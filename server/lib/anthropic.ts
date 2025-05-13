import Anthropic from '@anthropic-ai/sdk';
import { SearchAnalytics } from '@shared/schema';

// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
const ANTHROPIC_MODEL = 'claude-3-7-sonnet-20250219';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Function to analyze search analytics data and provide insights
export async function analyzeSearchData(data: SearchAnalytics): Promise<any> {
  try {
    const prompt = `
      Analyze the following Google Search Console data and provide valuable insights. 
      The data shows search performance including clicks, impressions, CTR, and position for various search queries.
      
      Data:
      ${JSON.stringify(data, null, 2)}
      
      Please provide:
      1. A brief summary of overall performance
      2. 3-5 specific insights categorized as:
         - "positive" (strengths or improvements)
         - "opportunity" (areas that could be improved)
         - "info" (neutral but important observations)
      3. Top performing queries/pages and why they're successful
      4. Recommendations for improvement
      
      Format your response as valid JSON with the following structure:
      {
        "summary": "Brief overview of search performance",
        "insights": [
          {
            "type": "positive|opportunity|info",
            "title": "Short insight title",
            "description": "Detailed explanation"
          }
        ],
        "topPerformers": {
          "queries": [{"name": "query", "reason": "why it performs well"}],
          "pages": [{"name": "page", "reason": "why it performs well"}]
        },
        "recommendations": ["recommendation 1", "recommendation 2"]
      }
    `;

    const response = await anthropic.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    });

    // Extract JSON from the response
    const content = response.content[0].text;
    try {
      return JSON.parse(content);
    } catch (parseError) {
      // If parsing fails, try to extract JSON from the text using regex
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                         content.match(/{[\s\S]*}/);
                         
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
      }
      
      throw new Error("Could not parse JSON from Anthropic response");
    }
  } catch (error) {
    console.error('Error analyzing search data with Anthropic:', error);
    throw new Error(`Failed to analyze search data: ${error.message}`);
  }
}

// Function to provide recommendations for improving specific queries
export async function getQueryRecommendations(query: string, data: any): Promise<string[]> {
  try {
    const prompt = `
      Analyze this specific search query "${query}" from Google Search Console data:
      
      ${JSON.stringify(data, null, 2)}
      
      Provide 3-5 actionable recommendations to improve its performance in search results.
      Format your response as a JSON array of strings, each containing one recommendation.
    `;

    const response = await anthropic.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0].text;
    try {
      return JSON.parse(content);
    } catch (parseError) {
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                         content.match(/\[([\s\S]*?)\]/);
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1] || jsonMatch[0]);
      }
      
      // If parsing still fails, return the raw text as a single item array
      return [content.trim()];
    }
  } catch (error) {
    console.error('Error getting query recommendations:', error);
    throw new Error(`Failed to get query recommendations: ${error.message}`);
  }
}

// Function to summarize overall search performance trends
export async function summarizePerformanceTrends(historicalData: any): Promise<string> {
  try {
    const prompt = `
      Analyze these historical search performance metrics from Google Search Console:
      
      ${JSON.stringify(historicalData, null, 2)}
      
      Provide a concise paragraph summarizing the performance trends over time.
      Focus on changes in clicks, impressions, CTR, and position.
      Highlight any significant patterns or anomalies.
    `;

    const response = await anthropic.messages.create({
      model: ANTHROPIC_MODEL,
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    });

    return response.content[0].text.trim();
  } catch (error) {
    console.error('Error summarizing performance trends:', error);
    throw new Error(`Failed to summarize performance trends: ${error.message}`);
  }
}

export default {
  analyzeSearchData,
  getQueryRecommendations,
  summarizePerformanceTrends
};
