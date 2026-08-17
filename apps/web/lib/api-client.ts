"use client";

import axios from 'axios';
import { useAuth } from '@clerk/nextjs';
import { useMemo } from 'react';

// Create a base axios instance without auth headers
export const baseApiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * A React hook that returns an authenticated Axios instance.
 * It automatically attaches the Clerk Bearer token to every request.
 */
export function useApiClient() {
  const { getToken } = useAuth();

  const apiClient = useMemo(() => {
    const instance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    instance.interceptors.request.use(async (config) => {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    return instance;
  }, [getToken]);

  return apiClient;
}
