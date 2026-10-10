import { axiosClient } from '../../../shared';
import type { HomePageData } from '../types';

/**
 * Landing and home overview API service client.
 */
export const homeApi = {
  /**
   * Fetches aggregated home page dashboard data including flagship featured event, upcoming strip, and community counts.
   * @returns {Promise<HomePageData>} Resolves to home page metrics and event cards dataset.
   */
  getPageData: async (): Promise<HomePageData> => {
    const response = await axiosClient.get<any>('/home');
    return response.data?.data ?? response.data;
  },
};
