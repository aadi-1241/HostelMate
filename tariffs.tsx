import { Layout } from "@/components/layout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTariffSchema, type InsertTariff, type Tariff } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { Plus, IndianRupee, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function TariffsPage() {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const { data: tariffs, isLoading } = useQuery<Tariff[]>({
    queryKey: ["/api/tariffs"],
  });

  const createTariff = useMutation({
    mutationFn: async (data: InsertTariff) => {
      const res = await apiRequest("POST", "/api/tariffs", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tariffs"] });
      setIsOpen(false);
      toast({ title: "Success", description: "Tariff added successfully" });
    },
  });

  const form = useForm<InsertTariff>({
    resolver: zodResolver(insertTariffSchema),
    defaultValues: {
      organizationId: 1,
      roomType: "Single",
      tariffType: "share_wise",
      sharingType: 1,
      amount: "0",
      effectiveDate: new Date().toISOString().split("T")[0],
      status: "active",
    },
  });

  const tariffType = form.watch("tariffType");

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tariff Management</h1>
            <p className="text-muted-foreground mt-1">Configure room-wise and share-wise pricing.</p>
          </div>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Tariff
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Tariff Rule</DialogTitle>
              </DialogHeader>
              <form onSubmit={form.handleSubmit((data) => createTariff.mutate(data))} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Room Type</Label>
                    <Select onValueChange={(v) => form.setValue("roomType", v)} defaultValue="Single">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Single">Single</SelectItem>
                        <SelectItem value="Double">Double</SelectItem>
                        <SelectItem value="Triple">Triple</SelectItem>
                        <SelectItem value="Dormitory">Dormitory</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tariff Type</Label>
                    <Select onValueChange={(v) => form.setValue("tariffType", v)} defaultValue="share_wise">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="room_wise">Room-wise</SelectItem>
                        <SelectItem value="share_wise">Share-wise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {tariffType === "share_wise" && (
                  <div className="space-y-2">
                    <Label>Sharing Type</Label>
                    <Select onValueChange={(v) => form.setValue("sharingType", Number(v))} defaultValue="1">
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1-Share</SelectItem>
                        <SelectItem value="2">2-Share</SelectItem>
                        <SelectItem value="3">3-Share</SelectItem>
                        <SelectItem value="4">4-Share</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Amount (₹)</Label>
                    <Input type="number" {...form.register("amount")} />
                  </div>
                  <div className="space-y-2">
                    <Label>Effective Date</Label>
                    <Input type="date" {...form.register("effectiveDate")} />
                  </div>
                </div>

                <div className="flex justify-end pt-4 gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={createTariff.isPending}>
                    {createTariff.isPending ? "Saving..." : "Save Tariff"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Active Tariff Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room Type</TableHead>
                  <TableHead>Tariff Type</TableHead>
                  <TableHead>Sharing</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Effective From</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tariffs?.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.roomType}</TableCell>
                    <TableCell className="capitalize">{t.tariffType.replace('_', ' ')}</TableCell>
                    <TableCell>{t.sharingType ? `${t.sharingType}-Share` : "Entire Room"}</TableCell>
                    <TableCell className="font-semibold">₹{t.amount}</TableCell>
                    <TableCell>{new Date(t.effectiveDate).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
