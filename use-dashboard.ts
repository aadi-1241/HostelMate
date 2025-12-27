import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { queryClient } from "@/lib/queryClient";

export function useDashboardStats() {
  return useQuery({
    queryKey: [api.dashboard.stats.path],
    queryFn: async () => {
      const res = await fetch(api.dashboard.stats.path);
      if (!res.ok) throw new Error("Failed to fetch dashboard stats");
      return api.dashboard.stats.responses[200].parse(await res.json());
    },
  });
}

export function useHostelOccupancy() {
  return useQuery({
    queryKey: [api.dashboard.hostelOccupancy.path],
    queryFn: async () => {
      const res = await fetch(api.dashboard.hostelOccupancy.path);
      if (!res.ok) throw new Error("Failed to fetch hostel occupancy");
      return api.dashboard.hostelOccupancy.responses[200].parse(await res.json());
    },
  });
}

export function useFloorOccupancy(hostelId: number | null) {
  return useQuery({
    queryKey: [api.dashboard.floorOccupancy.path, hostelId],
    queryFn: async () => {
      if (!hostelId) return [];
      const url = api.dashboard.floorOccupancy.path.replace(":hostelId", String(hostelId));
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch floor occupancy");
      return api.dashboard.floorOccupancy.responses[200].parse(await res.json());
    },
    enabled: !!hostelId,
  });
}

export function useDuePayments() {
  return useQuery({
    queryKey: [api.dashboard.duePayments.path],
    queryFn: async () => {
      const res = await fetch(api.dashboard.duePayments.path);
      if (!res.ok) throw new Error("Failed to fetch due payments");
      return api.dashboard.duePayments.responses[200].parse(await res.json());
    },
  });
}

export function useTodaysPayments() {
  return useQuery({
    queryKey: [api.dashboard.todaysPayments.path],
    queryFn: async () => {
      const res = await fetch(api.dashboard.todaysPayments.path);
      if (!res.ok) throw new Error("Failed to fetch today's payments");
      return api.dashboard.todaysPayments.responses[200].parse(await res.json());
    },
  });
}

export function useMarkPaymentAsPaid() {
  return useMutation({
    mutationFn: async (paymentId: number) => {
      const url = api.payments.markAsPaid.path.replace(":paymentId", String(paymentId));
      const res = await fetch(url, { method: "PATCH" });
      if (!res.ok) throw new Error("Failed to mark payment as paid");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.dashboard.duePayments.path] });
    },
  });
}
