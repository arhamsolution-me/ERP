import axios, { AxiosRequestConfig } from "axios";
import { useCallback } from "react";

export function useApi() {
  const fetcher = useCallback(async <T>(url: string, options?: AxiosRequestConfig): Promise<T> => {
    const headers = {
      'Content-Type': 'application/json',
      ...options?.headers,
    };

    const response = await axios({
      url: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}${url}`,
      withCredentials: true,
      ...options,
      headers,
    });

    return response.data;
  }, []);

  return { fetcher };
}
