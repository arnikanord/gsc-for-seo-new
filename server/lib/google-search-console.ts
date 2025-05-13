import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { SearchAnalytics } from '@shared/schema';

// Create OAuth2 client
export function createOAuth2Client(redirectUri?: string): OAuth2Client {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri || process.env.GOOGLE_REDIRECT_URI
  );
}

// Generate Google OAuth authorization URL
export function getAuthUrl(oauth2Client: OAuth2Client): string {
  const scopes = [
    'https://www.googleapis.com/auth/webmasters.readonly',
    'https://www.googleapis.com/auth/webmasters',
    'profile',
    'email'
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'  // Forces re-consent to get refresh token
  });
}

// Exchange code for tokens
export async function getTokens(oauth2Client: OAuth2Client, code: string) {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  return tokens;
}

// Get list of websites (properties) from Search Console
export async function getSiteList(accessToken: string): Promise<string[]> {
  try {
    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });
    
    const searchconsole = google.webmasters({ version: 'v3', auth: oauth2Client });
    const response = await searchconsole.sites.list();
    
    if (!response.data.siteEntry) {
      return [];
    }
    
    // Extract site URLs from the response
    return response.data.siteEntry.map(site => site.siteUrl || '');
  } catch (error) {
    console.error('Error fetching site list:', error);
    throw new Error(`Failed to fetch site list: ${error.message}`);
  }
}

// Get search analytics data for a specific site
export async function getSearchAnalytics(
  accessToken: string, 
  siteUrl: string, 
  startDate: string, 
  endDate: string,
  dimensions: string[] = ['query']
): Promise<SearchAnalytics> {
  try {
    const oauth2Client = createOAuth2Client();
    oauth2Client.setCredentials({ access_token: accessToken });
    
    const searchconsole = google.webmasters({ version: 'v3', auth: oauth2Client });
    
    const response = await searchconsole.searchanalytics.query({
      siteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions,
        rowLimit: 100,  // Maximum allowed by API
        searchType: 'web'
      }
    });
    
    if (!response.data) {
      throw new Error('No data returned from Search Console API');
    }
    
    return {
      rows: (response.data.rows || []).map(row => ({
        keys: row.keys || [],
        clicks: row.clicks || 0,
        impressions: row.impressions || 0,
        ctr: row.ctr || 0,
        position: row.position || 0
      })),
      responseAggregationType: response.data.responseAggregationType,
      startDate,
      endDate
    };
  } catch (error) {
    console.error('Error fetching search analytics:', error);
    throw new Error(`Failed to fetch search analytics: ${error.message}`);
  }
}

// Get performance data by date for charts
export async function getPerformanceByDate(
  accessToken: string,
  siteUrl: string,
  startDate: string,
  endDate: string
): Promise<SearchAnalytics> {
  return getSearchAnalytics(accessToken, siteUrl, startDate, endDate, ['date']);
}

// Get performance data by device
export async function getPerformanceByDevice(
  accessToken: string,
  siteUrl: string,
  startDate: string,
  endDate: string
): Promise<SearchAnalytics> {
  return getSearchAnalytics(accessToken, siteUrl, startDate, endDate, ['device']);
}

// Get performance data by page
export async function getPerformanceByPage(
  accessToken: string,
  siteUrl: string,
  startDate: string,
  endDate: string
): Promise<SearchAnalytics> {
  return getSearchAnalytics(accessToken, siteUrl, startDate, endDate, ['page']);
}

// Get performance data by country
export async function getPerformanceByCountry(
  accessToken: string,
  siteUrl: string,
  startDate: string,
  endDate: string
): Promise<SearchAnalytics> {
  return getSearchAnalytics(accessToken, siteUrl, startDate, endDate, ['country']);
}

export default {
  createOAuth2Client,
  getAuthUrl,
  getTokens,
  getSiteList,
  getSearchAnalytics,
  getPerformanceByDate,
  getPerformanceByDevice,
  getPerformanceByPage,
  getPerformanceByCountry
};
