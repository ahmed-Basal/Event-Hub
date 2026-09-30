import { axiosClient } from '../../../shared';
import type { HomePageData } from '../types';

/**
 * homeApi
 * Raw HTTP layer for home page data, isolated from UI components and TanStack Query logic.
 */
export const homeApi = {
  /**
   * Fetch home-page-specific data:
   * featured activity, upcoming activities, site stats.
   */
  getPageData: async (): Promise<HomePageData> => {
    const response = await axiosClient.get<HomePageData>('/home');
    return response.data;
  },
};
