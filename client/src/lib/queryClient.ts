import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    let url = queryKey[0] as string;
    const params = new URLSearchParams();
    
    // Handle parameters for Search Console API calls
    if (url.includes('/api/search-console/') && 
        (url.includes('analytics') || 
         url.includes('performance') || 
         url.includes('country') || 
         url.includes('device'))) {
      
      // Add siteUrl param if available (index 1)
      if (queryKey.length > 1 && queryKey[1]) {
        params.append('siteUrl', queryKey[1] as string);
      }
      
      // Add startDate param if available (index 2)
      if (queryKey.length > 2 && queryKey[2]) {
        params.append('startDate', queryKey[2] as string);
      }
      
      // Add endDate param if available (index 3)
      if (queryKey.length > 3 && queryKey[3]) {
        params.append('endDate', queryKey[3] as string);
      }
      
      // Append params to URL
      url = `${url}?${params.toString()}`;
    }
    
    const res = await fetch(url, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
