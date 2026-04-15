/**
 * Job Controller
 */
import { success, error } from '../utils/response.js';
import { jobService } from '../services/jobService.js';

export const jobController = {
  async createSearch(req, res, next) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return error(res, 'Unauthorized', 401, 'UNAUTHORIZED');
      }

      const result = await jobService.createSearch(userId, req.body);
      success(res, result, 202);
    } catch (err) {
      next(err);
    }
  },

  async getStatus(req, res, next) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return error(res, 'Unauthorized', 401, 'UNAUTHORIZED');
      }

      const result = await jobService.getStatus(userId, req.params.searchId);
      success(res, result);
    } catch (err) {
      next(err);
    }
  },

  async getResults(req, res, next) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return error(res, 'Unauthorized', 401, 'UNAUTHORIZED');
      }

      const result = await jobService.getResults(userId, req.params.searchId);
      success(res, result);
    } catch (err) {
      next(err);
    }
  },
};
