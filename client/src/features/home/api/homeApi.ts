import { axiosClient } from '../../../shared';
import type { HomePageData } from '../types';

export const homeApi = {

  getPageData: async (): Promise<HomePageData> => {
    const response = await axiosClient.get<HomePageData>('/home');
    return response.data;
  },
};
