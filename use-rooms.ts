import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertFloor, type InsertRoom, type InsertBed } from "@shared/schema";

// Floors
export function useFloors(hostelId: number) {
  return useQuery({
    queryKey: [api.floors.list.path, hostelId],
    queryFn: async () => {
      const url = buildUrl(api.floors.list.path, { hostelId });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch floors");
      return api.floors.list.responses[200].parse(await res.json());
    },
    enabled: !!hostelId,
  });
}

export function useCreateFloor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertFloor) => {
      const res = await fetch(api.floors.create.path, {
        method: api.floors.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create floor");
      return api.floors.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.floors.list.path, variables.hostelId] });
    },
  });
}

// Rooms
export function useRooms(floorId: number) {
  return useQuery({
    queryKey: [api.rooms.list.path, floorId],
    queryFn: async () => {
      const url = buildUrl(api.rooms.list.path, { floorId });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch rooms");
      return api.rooms.list.responses[200].parse(await res.json());
    },
    enabled: !!floorId,
  });
}

export function useCreateRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertRoom) => {
      const res = await fetch(api.rooms.create.path, {
        method: api.rooms.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create room");
      return api.rooms.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.rooms.list.path, variables.floorId] });
    },
  });
}

// Beds
export function useBeds(roomId: number) {
  return useQuery({
    queryKey: [api.beds.list.path, roomId],
    queryFn: async () => {
      const url = buildUrl(api.beds.list.path, { roomId });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch beds");
      return api.beds.list.responses[200].parse(await res.json());
    },
    enabled: !!roomId,
  });
}

export function useCreateBed() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertBed) => {
      const res = await fetch(api.beds.create.path, {
        method: api.beds.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create bed");
      return api.beds.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.beds.list.path, variables.roomId] });
    },
  });
}

export function useBulkCreateBeds() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { roomId: number; count: number; prefix?: string }) => {
      const res = await fetch(api.beds.bulkCreate.path, {
        method: api.beds.bulkCreate.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to bulk create beds");
      return api.beds.bulkCreate.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.beds.list.path, variables.roomId] });
    },
  });
}
