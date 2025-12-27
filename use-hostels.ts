import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertHostel } from "@shared/schema";

// Hostels
export function useHostels(organizationId?: string) {
  return useQuery({
    queryKey: [api.hostels.list.path, organizationId],
    queryFn: async () => {
      // Construct URL with query params if needed
      const url = organizationId 
        ? `${api.hostels.list.path}?organizationId=${organizationId}`
        : api.hostels.list.path;
        
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch hostels");
      return api.hostels.list.responses[200].parse(await res.json());
    },
  });
}

export function useHostel(id: number) {
  return useQuery({
    queryKey: [api.hostels.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.hostels.get.path, { id });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch hostel");
      return api.hostels.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateHostel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertHostel) => {
      const res = await fetch(api.hostels.create.path, {
        method: api.hostels.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create hostel");
      return api.hostels.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.hostels.list.path] });
    },
  });
}
