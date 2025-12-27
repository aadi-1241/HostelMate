import { Layout } from "@/components/layout";
import { useStudents, useCreateStudent } from "@/hooks/use-students";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search, User, Eye, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertStudentSchema, type InsertStudent } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function StudentsPage() {
  const { data: students, isLoading, refetch } = useStudents();
  const createStudent = useCreateStudent();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const form = useForm<InsertStudent>({
    resolver: zodResolver(insertStudentSchema),
    defaultValues: {
      name: "",
      mobile: "",
      email: "",
      status: "active",
      idProofType: "Aadhar"
    }
  });

  const onSubmit = (data: InsertStudent) => {
    // Clean up empty strings to null for optional fields
    const formattedData = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, value === "" ? null : value])
    ) as InsertStudent;

    createStudent.mutate(formattedData, {
      onSuccess: () => {
        setIsOpen(false);
        form.reset();
      }
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedStudent) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/uploads/request-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: file.name,
          size: file.size,
          contentType: file.type,
        }),
      });

      const { uploadURL, objectPath } = await res.json();

      // Upload file to presigned URL
      await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      // Update student with photo URL
      const updateRes = await fetch(`/api/students/${selectedStudent.id}/photo`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoUrl: objectPath }),
      });

      if (updateRes.ok) {
        await refetch();
        alert("Aadhar card photo uploaded successfully!");
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload Aadhar card photo");
    } finally {
      setUploading(false);
    }
  };

  const filteredStudents = students?.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.mobile.includes(searchTerm)
  );

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Students</h1>
            <p className="text-muted-foreground mt-1">Manage tenants and residents with Aadhar verification.</p>
          </div>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary shadow-lg shadow-primary/20">
                <Plus className="w-4 h-4 mr-2" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input {...form.register("name")} placeholder="John Doe" />
                  {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Mobile Number *</Label>
                    <Input {...form.register("mobile")} placeholder="+91 9876543210" />
                    {form.formState.errors.mobile && <p className="text-xs text-destructive">{form.formState.errors.mobile.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Email (Optional)</Label>
                    <Input {...form.register("email")} type="email" placeholder="john@example.com" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>ID Proof Type</Label>
                    <Input {...form.register("idProofType")} placeholder="Aadhar" value="Aadhar" />
                  </div>
                  <div className="space-y-2">
                    <Label>ID Number</Label>
                    <Input {...form.register("idProofNumber")} placeholder="XXXX XXXX XXXX XXXX" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Permanent Address</Label>
                  <Input {...form.register("address")} placeholder="City, State" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Guardian Name</Label>
                    <Input {...form.register("guardianName")} />
                  </div>
                  <div className="space-y-2">
                    <Label>Guardian Mobile</Label>
                    <Input {...form.register("guardianMobile")} />
                  </div>
                </div>

                <div className="flex justify-end pt-4 gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={createStudent.isPending}>
                    {createStudent.isPending ? "Adding..." : "Add Student"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border/50 flex items-center gap-3">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input 
              className="border-none shadow-none focus-visible:ring-0 px-0 h-auto placeholder:text-muted-foreground"
              placeholder="Search students by name or mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent bg-muted/30">
                  <TableHead>Student</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Aadhar ID</TableHead>
                  <TableHead>Guardian</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
                ) : filteredStudents?.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No students found.</TableCell></TableRow>
                ) : (
                  filteredStudents?.map((student) => (
                    <TableRow key={student.id} className="group">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={student.photoUrl || undefined} />
                            <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{student.name}</div>
                            <div className="text-xs text-muted-foreground">ID: #{student.id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{student.mobile}</div>
                        <div className="text-xs text-muted-foreground">{student.email || "—"}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-mono">{student.idProofNumber || "—"}</div>
                        <div className="text-xs text-muted-foreground">{student.idProofType || "—"}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{student.guardianName || "—"}</div>
                        <div className="text-xs text-muted-foreground">{student.guardianMobile || "—"}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={student.status === "active" ? "default" : "secondary"}>
                          {student.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog open={isViewOpen && selectedStudent?.id === student.id} onOpenChange={setIsViewOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedStudent(student)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                              <DialogTitle>{student.name} - Aadhar Card</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                              <div className="space-y-2">
                                <Label>ID Proof Number</Label>
                                <div className="p-2 bg-muted rounded text-sm font-mono">{student.idProofNumber || "Not provided"}</div>
                              </div>
                              <div className="space-y-2">
                                <Label>ID Proof Photo</Label>
                                {student.idProofPhotoUrl ? (
                                  <div className="relative group">
                                    <img 
                                      src={student.idProofPhotoUrl} 
                                      alt="Aadhar Card" 
                                      className="w-full rounded border border-border max-h-96 object-contain"
                                    />
                                  </div>
                                ) : (
                                  <div className="p-8 bg-muted rounded text-center text-muted-foreground">
                                    No Aadhar card photo uploaded
                                  </div>
                                )}
                              </div>
                              <div className="pt-4">
                                <Label htmlFor="photo-upload" className="block mb-2">Upload Aadhar Card Photo</Label>
                                <Input
                                  id="photo-upload"
                                  type="file"
                                  accept="image/*"
                                  onChange={handlePhotoUpload}
                                  disabled={uploading}
                                />
                                {uploading && <p className="text-sm text-muted-foreground mt-2">Uploading...</p>}
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
