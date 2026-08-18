"use client";

import axios from 'axios';
import { useMemo } from 'react';

// Create a base axios instance
export const baseApiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

/**
 * A React hook that returns an Axios instance for custom DB session auth.
 */
export function useApiClient() {
  const apiClient = useMemo(() => {
    const instance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    return instance;
  }, []);

  return apiClient;
}
