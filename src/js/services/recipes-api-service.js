import { apiClient } from '../api/axios';

class RecipesApiService {
  constructor() {
    this.title = '';
    this.category = '';
    this.page = 1;
    this.totalPages = null;
    this.limit = this.getLimitByViewport();
    this.time = null;
    this.area = '';
    this.ingredient = '';
  }

  getLimitByViewport() {
    const width = window.innerWidth;

    if (width >= 1280) {
      return 9;
    } else if (width >= 768) {
      return 8;
    } else {
      return 6;
    }
  }

  updateParams(paramName, value) {
    if (this.hasOwnProperty(paramName)) {
      this[paramName] = value;
    }
  }

  getQueryParams() {
    const params = {
      title: this.title ?? null,
      category: this.category ?? null,
      page: this.page,
      // totalPages: this.totalPages,
      limit: this.limit,
      time: this.time ?? null,
      area: this.area ?? null,
      ingredient: this.ingredient ?? null,
    };

    return Object.fromEntries(
      Object.entries(params).filter(
        ([_, value]) => value !== null && value !== ''
      )
    );
  }

  resetFilterQueryParams() {
    this.title = '';
    this.page = 1;
    // this.totalPages = null;
    this.limit = this.getLimitByViewport();
    this.time = null;
    this.area = '';
    this.ingredient = '';
  }

  async fetchRecipes() {
    try {
      const response = await apiClient.get('/recipes', {
        params: this.getQueryParams(),
      });
      this.totalPages = response.data.totalPages;
      return response.data;
    } catch (error) {
      console.error('Error fetching recipes:', error);
      throw error;
    }
  }
  getTotalPages() {
    return this.totalPages;
  }
}

export const recipesApiService = new RecipesApiService();
