// Helpers Unit Tests
 

import { describe, test, expect } from '@jest/globals';
import { asyncHandler } from '../../../src/utils/helpers';
import { Request, Response, NextFunction } from 'express';

describe('Utility Helpers', () => {
  describe('asyncHandler', () => {
    test('should handle successful async function', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');
      const handler = asyncHandler(mockFn);

      const req = {} as Request;
      const res = {} as Response;
      const next = jest.fn() as NextFunction;

      await handler(req, res, next);

      expect(mockFn).toHaveBeenCalledWith(req, res, next);
      expect(next).not.toHaveBeenCalled();
    });

    test('should pass errors to next middleware', async () => {
      const error = new Error('Test error');
      const mockFn = jest.fn().mockRejectedValue(error);
      const handler = asyncHandler(mockFn);

      const req = {} as Request;
      const res = {} as Response;
      const next = jest.fn() as NextFunction;

      await handler(req, res, next);

      expect(mockFn).toHaveBeenCalledWith(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
