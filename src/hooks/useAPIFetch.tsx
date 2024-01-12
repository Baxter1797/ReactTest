import { QueryClient, UseQueryResult, useQuery, useQueryClient } from "@tanstack/react-query"
import axios, { AxiosResponse } from "axios"
import { useRef, useState } from "react"

function useAPIFetch() {
    
    const queryClient = useQueryClient()

/*     const fetchData = async (key: string, url: string) => {
        await queryClient.prefetchQuery(key, async () => {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        });
      };
    
      return { fetchData }; */

      const useCustomQuery = () => {
        const fetchData = async (key, url) => {
          await useQuery(key, async () => {
            const response = await fetch(url);
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.json();
          });
        };
      
        return { fetchData };
      };

    }



/*     const apiFetchResponse = useQuery({
        queryKey: [queryKeyRef.current],
        queryFn: async (): Promise<AxiosResponse<unknown, unknown>> => {
            const response = await axios.get(urlRef.current.toString())
            return response
        }
    }) */

export default useAPIFetch