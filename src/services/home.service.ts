// services/home.service.ts

import { apiClient } from '@/lib/axios';
import { HomeResponse } from '@/types/home';

class HomeService {
  /**
   * Get home dashboard data
   */
  async getHomeData(): Promise<HomeResponse> {
    const { data } = await apiClient.get<HomeResponse>(
      '/api/v1/external/home'
    );
    return data;
  }
}

export const homeService = new HomeService();
