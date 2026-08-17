import { useAuth, useOrganization } from "@clerk/nextjs";
import axios, { AxiosRequestConfig } from "axios";
import { useCallback } from "react";

export function useApi() {
  const { getToken } = useAuth();
  const { organization } = useOrganization();

  const fetcher = useCallback(async <T>(url: string, options?: AxiosRequestConfig): Promise<T> => {
    const token = await getToken();
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'x-tenant-id': organization?.id || 'default_tenant', // Multi-tenant boundary
      ...options?.headers,
    };

    const response = await axios({
      url: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}${url}`,
      ...options,
      headers,
    });

    return response.data;
  }, [getToken, organization?.id]);

  return { fetcher };
}
