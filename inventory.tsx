import { Layout } from "@/components/layout";
import { useHostels } from "@/hooks/use-hostels";
import { useFloors, useRooms, useBeds, useCreateFloor, useCreateRoom, useCreateBed } from "@/hooks/use-rooms";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, Plus, Bed, LayoutGrid, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertFloorSchema, insertRoomSchema, insertBedSchema, type InsertFloor, type InsertRoom, type InsertBed } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Sub-component for Floor List
function FloorList({ hostelId, selectedFloorId, onSelectFloor }: { hostelId: number, selectedFloorId: number | null, onSelectFloor: (id: number) => void }) {
  const { data: floors } = useFloors(hostelId);
  const createFloor = useCreateFloor();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const form = useForm<InsertFloor>({
    resolver: zodResolver(insertFloorSchema),
    defaultValues: { hostelId, floorNumber: "" }
  });

  const onSubmit = (data: InsertFloor) => {
    createFloor.mutate(data, {
      onSuccess: () => {
        setIsCreateOpen(false);
        form.reset();
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Floors</h3>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="icon" variant="ghost" className="h-6 w-6"><Plus className="h-4 w-4" /></Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Floor</DialogTitle></DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Floor Number/Name</Label>
                <Input {...form.register("floorNumber")} placeholder="e.g. Ground, 1, 2" />
              </div>
              <Button type="submit" disabled={createFloor.isPending}>Add Floor</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-2">
        {floors?.map((floor) => (
          <div
            key={floor.id}
            onClick={() => onSelectFloor(floor.id)}
            className={cn(
              "p-3 rounded-lg cursor-pointer transition-all flex items-center justify-between group",
              selectedFloorId === floor.id ? "bg-primary text-primary-foreground shadow-md" : "bg-card hover:bg-muted"
            )}
          >
            <span className="font-medium">Floor {floor.floorNumber}</span>
            <ChevronRight className={cn("w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity", selectedFloorId === floor.id && "opacity-100")} />
          </div>
        ))}
        {floors?.length === 0 && <p className="text-sm text-muted-foreground italic">No floors yet</p>}
      </div>
    </div>
  );
}

// Sub-component for Room List
function RoomList({ floorId, selectedRoomId, onSelectRoom }: { floorId: number, selectedRoomId: number | null, onSelectRoom: (id: number) => void }) {
  const { data: rooms } = useRooms(floorId);
  const createRoom = useCreateRoom();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const form = useForm<InsertRoom>({
    resolver: zodResolver(insertRoomSchema),
    defaultValues: { floorId, roomNumber: "", capacity: 1, type: "Non-AC", rentAmount: "5000" }
  });

  const onSubmit = (data: InsertRoom) => {
    // Force numbers for numeric fields due to form inputs being strings
    const payload = {
      ...data,
      capacity: Number(data.capacity),
      rentAmount: String(data.rentAmount)
    };
    createRoom.mutate(payload, {
      onSuccess: () => {
        setIsCreateOpen(false);
        form.reset();
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Rooms</h3>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="icon" variant="ghost" className="h-6 w-6"><Plus className="h-4 w-4" /></Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Room</DialogTitle></DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Room Number</Label>
                <Input {...form.register("roomNumber")} placeholder="e.g. 101" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Capacity</Label>
                  <Input type="number" {...form.register("capacity")} placeholder="e.g. 3" />
                </div>
                <div className="space-y-2">
                  <Label>Rent (₹)</Label>
                  <Input type="number" {...form.register("rentAmount")} placeholder="e.g. 5000" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select onValueChange={(val) => form.setValue("type", val)} defaultValue="Non-AC">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AC">AC</SelectItem>
                    <SelectItem value="Non-AC">Non-AC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={createRoom.isPending}>Add Room</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {rooms?.map((room) => (
          <div
            key={room.id}
            onClick={() => onSelectRoom(room.id)}
            className={cn(
              "p-3 rounded-lg cursor-pointer transition-all border border-transparent hover:border-border",
              selectedRoomId === room.id ? "bg-primary/10 border-primary text-primary" : "bg-card"
            )}
          >
            <div className="flex justify-between items-center">
              <span className="font-bold">Room {room.roomNumber}</span>
              <Badge variant="outline" className="text-xs bg-transparent">{room.type}</Badge>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Capacity: {room.capacity} | Rent: ₹{room.rentAmount}
            </div>
          </div>
        ))}
        {rooms?.length === 0 && <p className="text-sm text-muted-foreground italic">No rooms yet</p>}
      </div>
    </div>
  );
}

// Sub-component for Bed List
function BedList({ roomId }: { roomId: number }) {
  const { data: beds } = useBeds(roomId);
  const createBed = useCreateBed();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const form = useForm<InsertBed>({
    resolver: zodResolver(insertBedSchema),
    defaultValues: { roomId, bedNumber: "", status: "available" }
  });

  const onSubmit = (data: InsertBed) => {
    createBed.mutate(data, {
      onSuccess: () => {
        setIsCreateOpen(false);
        form.reset();
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Beds</h3>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline"><Plus className="h-3 w-3 mr-1" /> Add Bed</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Bed</DialogTitle></DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Bed Number/Label</Label>
                <Input {...form.register("bedNumber")} placeholder="e.g. A, B, 1, 2" />
              </div>
              <Button type="submit" disabled={createBed.isPending}>Add Bed</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {beds?.map((bed) => (
          <Card key={bed.id} className="p-4 flex flex-col items-center justify-center gap-2 border-border/50 shadow-none bg-muted/20">
            <Bed className={cn(
              "w-8 h-8",
              bed.status === 'available' ? "text-green-500" : "text-red-500"
            )} />
            <span className="font-bold text-lg">{bed.bedNumber}</span>
            <Badge variant={bed.status === 'available' ? 'default' : 'destructive'} className="text-[10px] h-5 px-2">
              {bed.status}
            </Badge>
          </Card>
        ))}
        {beds?.length === 0 && <p className="col-span-full text-sm text-muted-foreground italic text-center py-4">No beds added yet</p>}
      </div>
    </div>
  );
}

export default function InventoryPage() {
  const { data: hostels } = useHostels();
  const [selectedHostelId, setSelectedHostelId] = useState<number | null>(null);
  const [selectedFloorId, setSelectedFloorId] = useState<number | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);

  // Auto-select first hostel if available and none selected
  if (hostels && hostels.length > 0 && !selectedHostelId) {
    setSelectedHostelId(hostels[0].id);
  }

  return (
    <Layout>
      <div className="flex flex-col gap-6 h-[calc(100vh-8rem)]">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground mt-1">Manage floors, rooms, and beds hierarchy.</p>
        </div>

        <div className="flex items-center gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
          <Home className="w-5 h-5 text-muted-foreground" />
          <div className="w-64">
            <Select 
              value={String(selectedHostelId)} 
              onValueChange={(val) => {
                setSelectedHostelId(Number(val));
                setSelectedFloorId(null);
                setSelectedRoomId(null);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Hostel" />
              </SelectTrigger>
              <SelectContent>
                {hostels?.map(h => (
                  <SelectItem key={h.id} value={String(h.id)}>{h.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedHostelId ? (
          <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
            {/* Floors Column */}
            <div className="col-span-12 md:col-span-3 bg-card rounded-xl border border-border p-4 shadow-sm overflow-y-auto">
              <FloorList 
                hostelId={selectedHostelId} 
                selectedFloorId={selectedFloorId}
                onSelectFloor={(id) => {
                  setSelectedFloorId(id);
                  setSelectedRoomId(null);
                }}
              />
            </div>

            {/* Rooms Column */}
            <div className="col-span-12 md:col-span-4 bg-card rounded-xl border border-border p-4 shadow-sm overflow-y-auto">
              {selectedFloorId ? (
                <RoomList 
                  floorId={selectedFloorId}
                  selectedRoomId={selectedRoomId}
                  onSelectRoom={setSelectedRoomId}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                  <LayoutGrid className="w-12 h-12 mb-2 opacity-20" />
                  <p>Select a floor to view rooms</p>
                </div>
              )}
            </div>

            {/* Beds Column */}
            <div className="col-span-12 md:col-span-5 bg-card rounded-xl border border-border p-4 shadow-sm overflow-y-auto">
              {selectedRoomId ? (
                <BedList roomId={selectedRoomId} />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                  <Bed className="w-12 h-12 mb-2 opacity-20" />
                  <p>Select a room to view beds</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl">
            Select a hostel to manage inventory
          </div>
        )}
      </div>
    </Layout>
  );
}
