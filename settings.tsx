import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <Layout>
       <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure your organization and preferences.</p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Organization Profile</CardTitle>
            <CardDescription>Details about your hostel management company.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Organization Name</Label>
              <Input defaultValue="Sunrise Hostels Pvt Ltd" />
            </div>
            <div className="space-y-2">
              <Label>Owner Name</Label>
              <Input defaultValue="Rajesh Kumar" />
            </div>
            <div className="space-y-2">
              <Label>Support Mobile</Label>
              <Input defaultValue="+91 9988776655" />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
