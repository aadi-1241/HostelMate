import { Layout } from "@/components/layout";
import { useHostels, useCreateHostel } from "@/hooks/use-hostels";
import { Button } from "@/components/ui/button";
import { Plus, MapPin, Building } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertHostelSchema, type InsertHostel } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function HostelsPage() {
  const { data: hostels, isLoading } = useHostels();
  const createHostel = useCreateHostel();
  const [isOpen, setIsOpen] = useState(false);

  // Hardcoded organization ID for MVP as per schema constraint (need an org first)
  // In a real app, we'd fetch orgs first or let user select.
  // For now, assuming org ID 1 exists (seeded) or we handle it in form
  const defaultOrgId = 1; 

  const form = useForm<InsertHostel>({
    resolver: zodResolver(insertHostelSchema),
    defaultValues: {
      organizationId: defaultOrgId,
      name: "",
      location: "",
      type: "Co-ed",
      status: "active"
    }
  });

  const onSubmit = (data: InsertHostel) => {
    // Clean up empty strings
    const formattedData = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, value === "" ? null : value])
    ) as InsertHostel;

    createHostel.mutate(formattedData, {
      onSuccess: () => {
        setIsOpen(false);
        form.reset();
      }
    });
  };

  return (
    <Layout>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hostels</h1>
          <p className="text-muted-foreground mt-1">Manage your branches and buildings.</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4 mr-2" />
              Add Hostel
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Hostel</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Hostel Name</Label>
                <Input id="name" {...form.register("name")} placeholder="e.g. Sunrise Residency" />
                {form.formState.errors.name && <p className="text-destructive text-xs">{form.formState.errors.name.message}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" {...form.register("location")} placeholder="e.g. Gachibowli, Hyderabad" />
                {form.formState.errors.location && <p className="text-destructive text-xs">{form.formState.errors.location.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select onValueChange={(val) => form.setValue("type", val)} defaultValue={form.getValues("type")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Boys">Boys</SelectItem>
                    <SelectItem value="Girls">Girls</SelectItem>
                    <SelectItem value="Co-ed">Co-ed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit" disabled={createHostel.isPending}>
                  {createHostel.isPending ? "Creating..." : "Create Hostel"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
        {isLoading ? (
          [1, 2, 3].map((i) => <Skeleton key={i} className="h-48 rounded-2xl" />)
        ) : hostels?.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-2xl bg-muted/30">
            <Building className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-lg font-semibold">No hostels found</h3>
            <p className="text-muted-foreground text-sm">Get started by creating your first hostel branch.</p>
          </div>
        ) : (
          hostels?.map((hostel) => (
            <Card key={hostel.id} className="card-hover group border-border/50">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="h-10 w-10 rounded-lg bg-blue-50 text-primary flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    <Building className="h-5 w-5" />
                  </div>
                  <Badge variant={hostel.status === "active" ? "default" : "secondary"}>
                    {hostel.status}
                  </Badge>
                </div>
                <CardTitle className="text-xl">{hostel.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center text-muted-foreground text-sm mb-4">
                  <MapPin className="w-4 h-4 mr-1" />
                  {hostel.location}
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-muted/50 p-2 rounded-lg text-center">
                    <span className="block font-semibold text-foreground">{hostel.type}</span>
                    <span className="text-xs text-muted-foreground">Type</span>
                  </div>
                  <div className="bg-muted/50 p-2 rounded-lg text-center">
                    <span className="block font-semibold text-foreground">--</span>
                    <span className="text-xs text-muted-foreground">Capacity</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </Layout>
  );
}
