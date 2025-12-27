import { Layout } from "@/components/layout";
import { useStudents } from "@/hooks/use-students";
import { useAvailableBeds, useCreateAllocation, useAllocations } from "@/hooks/use-allocations";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, HomeIcon, Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAllocationSchema, type InsertAllocation } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function AllocationsPage() {
  const { data: students, isLoading: studentsLoading } = useStudents();
  const { data: availableBeds, isLoading: bedsLoading } = useAvailableBeds();
  const { data: allocations } = useAllocations();
  const createAllocation = useCreateAllocation();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<InsertAllocation>({
    resolver: zodResolver(insertAllocationSchema),
    defaultValues: {
      studentId: 0,
      bedId: 0,
      startDate: new Date().toISOString().split("T")[0],
      endDate: null,
    },
  });

  const onSubmit = (data: InsertAllocation) => {
    // Ensure empty strings are converted to null for dates
    const formattedData = {
      ...data,
      endDate: data.endDate === "" ? null : data.endDate,
    };
    createAllocation.mutate(formattedData, {
      onSuccess: () => {
        setIsOpen(false);
        form.reset();
      },
    });
  };

  const selectedBedId = form.watch("bedId");
  const selectedBed = availableBeds?.find((b: any) => b.bedId === selectedBedId);

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Room Allocations</h1>
            <p className="text-muted-foreground mt-1">
              Allocate beds to students and track occupancy.
            </p>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary shadow-lg shadow-primary/20">
                <Plus className="w-4 h-4 mr-2" />
                Allocate Bed
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Allocate Bed to Student</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 pt-4"
              >
                <div className="space-y-2">
                  <Label>Student *</Label>
                  <Controller
                    name="studentId"
                    control={form.control}
                    render={({ field }) => (
                      <Select
                        value={field.value ? String(field.value) : ""}
                        onValueChange={(val) => field.onChange(Number(val))}
                      >
                        <SelectTrigger>
                          {studentsLoading ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Loading students...
                            </div>
                          ) : (
                            <SelectValue placeholder="Select student" />
                          )}
                        </SelectTrigger>
                        <SelectContent>
                          {students && students.length > 0 ? (
                            students.map((s: any) => (
                              <SelectItem key={s.id} value={String(s.id)}>
                                {s.name} ({s.mobile})
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-2 text-sm text-muted-foreground">
                              No students found
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Available Bed *</Label>
                  <Controller
                    name="bedId"
                    control={form.control}
                    render={({ field }) => (
                      <Select
                        value={field.value ? String(field.value) : ""}
                        onValueChange={(val) => field.onChange(Number(val))}
                      >
                        <SelectTrigger>
                          {bedsLoading ? (
                            <div className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Loading beds...
                            </div>
                          ) : (
                            <SelectValue placeholder="Select bed" />
                          )}
                        </SelectTrigger>
                        <SelectContent>
                          {availableBeds && availableBeds.length > 0 ? (
                            availableBeds.map((b: any) => (
                              <SelectItem key={b.bedId} value={String(b.bedId)}>
                                {b.hostelName} • {b.floorNumber}F • Room {b.roomNumber} • Bed {b.bedNumber} (₹{b.rentAmount})
                              </SelectItem>
                            ))
                          ) : (
                            <div className="p-2 text-sm text-muted-foreground">
                              No available beds
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                {selectedBed && (
                  <div className="bg-muted p-4 rounded-lg text-sm space-y-2">
                    <div className="font-semibold">Selected Bed Details:</div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-muted-foreground">Hostel:</span> {selectedBed.hostelName}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Location:</span> {selectedBed.hostelLocation}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Floor:</span> {selectedBed.floorNumber}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Room:</span> {selectedBed.roomNumber}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Bed:</span> {selectedBed.bedNumber}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Rent:</span> ₹{selectedBed.rentAmount}
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date *</Label>
                    <Input type="date" {...form.register("startDate")} />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date (Optional)</Label>
                    <Input type="date" {...form.register("endDate")} />
                  </div>
                </div>

                <div className="flex justify-end pt-4 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createAllocation.isPending || !form.formState.isValid}
                    className="bg-primary"
                  >
                    {createAllocation.isPending
                      ? "Allocating..."
                      : "Allocate Bed"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Allocations Table */}
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border/50">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <HomeIcon className="w-4 h-4" />
              Active Allocations ({allocations?.length || 0})
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border/50">
                  <TableHead>Student Name</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Hostel</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Bed</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allocations && allocations.length > 0 ? (
                  allocations.map((alloc: any) => (
                    <TableRow
                      key={alloc.allocationId}
                      className="border-b border-border/50"
                    >
                      <TableCell className="font-medium">
                        {alloc.studentName}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {alloc.studentMobile}
                      </TableCell>
                      <TableCell className="text-sm">
                        {alloc.hostelName}
                      </TableCell>
                      <TableCell className="text-sm">
                        F{alloc.floorNumber}, Room {alloc.roomNumber}
                      </TableCell>
                      <TableCell className="text-sm font-semibold">
                        {alloc.bedNumber}
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(alloc.startDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-sm">
                        {alloc.endDate
                          ? new Date(alloc.endDate).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            alloc.status === "active"
                              ? "default"
                              : "secondary"
                          }
                          className="capitalize"
                        >
                          {alloc.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-muted-foreground py-8"
                    >
                      No allocations yet. Click "Allocate Bed" to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
