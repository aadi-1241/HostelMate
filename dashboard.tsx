import { Layout } from "@/components/layout";
import { StatCard } from "@/components/stat-card";
import { useDashboardStats, useFloorOccupancy, useDuePayments, useHostelOccupancy, useMarkPaymentAsPaid, useTodaysPayments } from "@/hooks/use-dashboard";
import { useHostels } from "@/hooks/use-hostels";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { 
  Building2, 
  BedDouble, 
  Users, 
  Wallet,
  Phone,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer as RespContainer } from "recharts";
import { useState, useRef } from "react";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: hostels } = useHostels();
  const [selectedHostelId, setSelectedHostelId] = useState<number | null>(null);
  const [selectedFloorId, setSelectedFloorId] = useState<number | null>(null);
  const { data: floorOccupancy } = useFloorOccupancy(selectedHostelId);
  const { data: beds } = useQuery({
    queryKey: ["/api/beds/available"],
    queryFn: async () => {
      const res = await fetch("/api/beds/available");
      if (!res.ok) throw new Error("Failed to fetch available beds");
      return res.json();
    }
  });
  const { data: hostelOccupancy } = useHostelOccupancy();
  const { data: duePayments } = useDuePayments();
  const { data: todaysPayments } = useTodaysPayments();
  const { mutate: markAsPaid } = useMarkPaymentAsPaid();
  
  const dragStartX = useRef(0);
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if ("touches" in e) {
      dragStartX.current = e.touches[0].clientX;
    } else {
      dragStartX.current = e.clientX;
    }
  };
  
  const handleDragEnd = (e: React.MouseEvent | React.TouchEvent, paymentId: number) => {
    let endX = 0;
    if ("changedTouches" in e) {
      endX = e.changedTouches[0].clientX;
    } else {
      endX = (e as React.MouseEvent).clientX;
    }
    const diff = endX - dragStartX.current;
    if (diff > 100) {
      markAsPaid(paymentId);
    }
  };

  if (statsLoading) {
    return (
      <Layout>
        <div className="space-y-4">
          <Skeleton className="h-12 w-48" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  const occupancyData = stats ? [
    { name: 'Occupied', value: stats.occupiedBeds },
    { name: 'Available', value: stats.availableBeds },
  ] : [];

  const COLORS = ['hsl(221, 83%, 53%)', 'hsl(210, 40%, 96%)'];

  return (
    <Layout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user?.firstName || 'Admin'}. Here's what's happening today.
          </p>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Hostels"
          value={stats?.totalHostels || 0}
          icon={Building2}
          description="Active branches"
        />
        <StatCard
          title="Total Beds"
          value={stats?.totalBeds || 0}
          icon={BedDouble}
          description="Total capacity"
        />
        <StatCard
          title="Occupied"
          value={stats?.occupiedBeds || 0}
          icon={Users}
          description="Currently occupied"
        />
        <StatCard
          title="Vacant"
          value={stats?.availableBeds || 0}
          icon={BedDouble}
          description="Available beds"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Occupancy Pie Chart */}
        <Card className="col-span-4 border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Overall Occupancy</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full flex items-center justify-center">
              {stats && stats.totalBeds > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={occupancyData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {occupancyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-muted-foreground text-sm">No data available</div>
              )}
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-sm text-muted-foreground">Occupied ({stats?.occupiedBeds})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-muted" />
                <span className="text-sm text-muted-foreground">Available ({stats?.availableBeds})</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Info */}
        <Card className="col-span-3 border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Quick Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border/30">
                <span className="text-sm text-muted-foreground">Total Rooms</span>
                <span className="font-semibold text-lg">{stats?.totalRooms || 0}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/30">
                <span className="text-sm text-muted-foreground">Occupancy Rate</span>
                <span className="font-semibold text-lg">
                  {stats && stats.totalBeds > 0
                    ? Math.round((stats.occupiedBeds / stats.totalBeds) * 100)
                    : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-muted-foreground">Due Payments</span>
                <Badge variant="destructive">{duePayments?.length || 0}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hostel-wise Occupancy */}
      {hostelOccupancy && hostelOccupancy.length > 0 && (
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Hostel-wise Occupancy Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/50">
                    <TableHead>Hostel Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-center">Total Beds</TableHead>
                    <TableHead className="text-center">Occupied</TableHead>
                    <TableHead className="text-center">Available</TableHead>
                    <TableHead className="text-center">Occupancy %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hostelOccupancy.map((hostel: any) => (
                    <TableRow 
                      key={hostel.hostelId} 
                      className={`border-b border-border/50 cursor-pointer hover:bg-accent/50 transition-colors ${selectedHostelId === hostel.hostelId ? 'bg-accent' : ''}`}
                      onClick={() => setSelectedHostelId(selectedHostelId === hostel.hostelId ? null : hostel.hostelId)}
                    >
                      <TableCell className="font-semibold">{hostel.hostelName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{hostel.hostelLocation}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{hostel.hostelType}</Badge>
                      </TableCell>
                      <TableCell className="text-center font-semibold">{hostel.totalBeds}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="default">{hostel.occupiedBeds}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{hostel.availableBeds}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all"
                              style={{ width: `${hostel.occupancyRate}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold">{hostel.occupancyRate}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Floor-wise Occupancy */}
      {selectedHostelId && floorOccupancy && floorOccupancy.length > 0 && (
        <Card className="border-primary/20 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              Floor Status: {hostels?.find(h => h.id === selectedHostelId)?.name}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setSelectedHostelId(null)}>Close</Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/50">
                    <TableHead>Floor</TableHead>
                    <TableHead className="text-center">Total Beds</TableHead>
                    <TableHead className="text-center">Occupied</TableHead>
                    <TableHead className="text-center">Available</TableHead>
                    <TableHead className="text-center">Occupancy %</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {floorOccupancy.map((floor: any) => (
                    <TableRow 
                      key={floor.floorId} 
                      className={`border-b border-border/50 cursor-pointer hover:bg-accent/50 transition-colors ${selectedFloorId === floor.floorId ? 'bg-accent' : ''}`}
                      onClick={() => setSelectedFloorId(selectedFloorId === floor.floorId ? null : floor.floorId)}
                    >
                      <TableCell className="font-semibold">Floor {floor.floorNumber}</TableCell>
                      <TableCell className="text-center">{floor.totalBeds}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="default">{floor.occupiedBeds}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{floor.availableBeds}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all"
                              style={{ width: `${floor.occupancyRate}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold">{floor.occupancyRate}%</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Available Beds Section */}
      {selectedFloorId && (
        <Card className="border-primary/20 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              Available Rooms & Beds: Floor {floorOccupancy?.find(f => f.floorId === selectedFloorId)?.floorNumber}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setSelectedFloorId(null)}>Close</Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {(() => {
                const floorBeds = beds?.filter((b: any) => b.floorId === selectedFloorId) || [];
                if (floorBeds.length === 0) return <div className="col-span-full text-center py-4 text-muted-foreground">No available beds on this floor</div>;
                
                // Group by room
                const roomsMap = floorBeds.reduce((acc: any, bed: any) => {
                  if (!acc[bed.roomNumber]) acc[bed.roomNumber] = [];
                  acc[bed.roomNumber].push(bed);
                  return acc;
                }, {});

                return Object.entries(roomsMap).map(([roomNumber, roomBeds]: [string, any]) => (
                  <Card key={roomNumber} className="border-border/50">
                    <CardHeader className="p-3 border-b border-border/50">
                      <CardTitle className="text-sm">Room {roomNumber}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3">
                      <div className="flex flex-wrap gap-2">
                        {roomBeds.map((bed: any) => (
                          <Badge key={bed.bedId} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Bed {bed.bedNumber}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ));
              })()}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Due Payments Section */}
      <Card className={`border-destructive/20 shadow-sm ${(!duePayments || duePayments.length === 0) ? 'opacity-50' : ''}`}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <CardTitle className="text-destructive">Pending Payments ({duePayments?.length || 0})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {duePayments && duePayments.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/50">
                    <TableHead>Student Name</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Hostel</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {duePayments.map((payment: any) => (
                    <TableRow 
                      key={payment.paymentId} 
                      className="border-b border-border/50 cursor-grab active:cursor-grabbing hover:bg-accent/50 transition-colors"
                      onMouseDown={handleDragStart}
                      onMouseUp={(e) => handleDragEnd(e, payment.paymentId)}
                      onTouchStart={handleDragStart}
                      onTouchEnd={(e) => handleDragEnd(e, payment.paymentId)}
                      data-testid={`row-payment-${payment.paymentId}`}
                    >
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{payment.studentName}</span>
                          <span className="text-xs text-muted-foreground">{payment.studentMobile}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = `tel:${payment.studentMobile}`;
                            }}
                            title="Call student"
                            data-testid={`button-call-${payment.paymentId}`}
                          >
                            <Phone className="w-4 h-4 text-primary" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = `tel:${payment.studentMobile}`;
                            }}
                          >
                            Call Now
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {payment.hostelName || "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {payment.floorNumber && payment.roomNumber 
                          ? `F${payment.floorNumber}, R${payment.roomNumber}`
                          : "—"}
                      </TableCell>
                      <TableCell className="font-semibold">₹{payment.amount}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {payment.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Drag right to mark paid</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No pending payments</div>
          )}
        </CardContent>
      </Card>

      {/* Today's Payments Section */}
      <Card className={`border-green-500/20 shadow-sm mt-6 ${(!todaysPayments || todaysPayments.length === 0) ? 'opacity-50' : ''}`}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <CardTitle className="text-green-600">Today's Payments ({todaysPayments?.length || 0})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {todaysPayments && todaysPayments.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/50">
                    <TableHead>Student Name</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Hostel/Room/Bed</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {todaysPayments.map((payment: any) => (
                    <TableRow key={payment.paymentId} className="border-b border-border/50 hover:bg-accent/50 transition-colors">
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{payment.studentName}</span>
                          <span className="text-xs text-muted-foreground">{payment.studentMobile}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = `tel:${payment.studentMobile}`;
                            }}
                            title="Call student"
                          >
                            <Phone className="w-4 h-4 text-primary" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2 text-green-600 border-green-200 bg-green-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = `tel:${payment.studentMobile}`;
                            }}
                          >
                            <Phone className="w-3 h-3 mr-1" />
                            Call Student
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex flex-col">
                          <span className="font-medium">{payment.hostelName || "—"}</span>
                          <span className="text-xs text-muted-foreground">
                            {payment.floorNumber ? `Floor ${payment.floorNumber}` : ""}
                            {payment.roomNumber ? `, Room ${payment.roomNumber}` : ""}
                            {payment.bedNumber ? `, Bed ${payment.bedNumber}` : ""}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">₹{payment.amount}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {payment.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-100">Paid</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No payments received today</div>
          )}
        </CardContent>
      </Card>
    </Layout>
  );
}
