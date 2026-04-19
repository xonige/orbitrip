
import { Language } from '../types';

const API_KEY = '4ca7c53d-9c81-4b83-8e50-a72f9a0aeb74';
// Use local proxy in development to bypass CORS, otherwise use direct API
// Always use the local proxy path which is handled by Vite (dev) or Nginx (prod)
const BASE_URL = '/viator-api/products'; 

export interface ViatorProduct {
  productCode: string;
  productUrl?: string;
  title: string;
  description: string;
  images: Array<{ variants: Array<{ url: string, width: number, height: number }> }>;
  pricing: {
    summary: {
      fromPrice: number;
      fromPriceBeforeDiscount?: number;
    };
    currency: string;
  };
  reviews: {
    combinedAverageRating: number;
    totalReviews: number;
  };
  itinerary?: {
    duration: {
      fixedDurationInMinutes: number;
    };
  };
}

export const viatorService = {
  /**
   * Search for products by destination and category
   */
  searchProducts: async (destId: number | string, language: Language = Language.EN): Promise<ViatorProduct[]> => {
    try {
      const response = await fetch(`${BASE_URL}/search`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json; version=2.0',
          // Viator sandbox only accepts 'en-US' — UI language is handled client-side
          'Accept-Language': 'en-US',
          'exp-api-key': API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filtering: {
            destination: String(destId),
          },
          sorting: {
            order: 'DESCENDING',
            sort: 'TRAVELER_RATING'
          },
          pagination: {
            start: 1,
            count: 12
          },
          currency: 'USD'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Viator API error (${response.status}):`, errorText);
        throw new Error(`Viator API error: ${response.status}`);
      }

      const data = await response.json();
      return data.products || [];
    } catch (error) {
      console.error('Failed to fetch Viator products:', error);
      return [];
    }
  },

  /**
   * Get product details for more rich info if needed
   */
  getProductDetails: async (productCode: string, language: Language = Language.EN): Promise<ViatorProduct | null> => {
    try {
      const response = await fetch(`${BASE_URL}/${productCode}`, {
        headers: {
          'Accept': 'application/json; version=2.0',
          'Accept-Language': 'en-US',
          'exp-api-key': API_KEY
        }
      });
      if (!response.ok) return null;
      return await response.json();
    } catch (error) {
      return null;
    }
  }
};
