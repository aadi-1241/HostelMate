import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import type { InsertAllocation } from "@shared/schema";

export function useAvailableBeds() {
  return useQuery({
    queryKey: [api.beds.available.path],
    queryFn: async () => {
      const res = await fetch(api.beds.available.path);
      if (!res.ok) throw new Error("Failed to fetch available beds");
      return api.beds.available.responses[200].parse(await res.json());
    },
  });
}

export function useAllocations() {
  return useQuery({
    queryKey: [api.allocations.list.path],
    queryFn: async () => {
      const res = await fetch(api.allocations.list.path);
      if (!res.ok) throw new Error("Failed to fetch allocations");
      return api.allocations.list.responses[200].parse(await res.json());
    },
  });
}

export function useStudentAllocations(studentId: number) {
  return useQuery({
    queryKey: [api.allocations.byStudent.path, studentId],
    queryFn: async () => {
      const url = api.allocations.byStudent.path.replace(":studentId", String(studentId));
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch student allocations");
      return api.allocations.byStudent.responses[200].parse(await res.json());
    },
    enabled: studentId > 0,
  });
}

export function useCreateAllocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: InsertAllocation) => {
      const res = await fetch(api.allocations.create.path, {
        method: api.allocations.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to allocate bed");
      return api.allocations.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.allocations.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.beds.available.path] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
    },
  });
}
