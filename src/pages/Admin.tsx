import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2, Edit, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const Admin = () => {
  const [tablets, setTablets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [editingTablet, setEditingTablet] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState<{
    name: string;
    uses: string;
    dosage: string;
    side_effects: string;
    age_limit: string;
    category: "painkiller" | "antibiotic" | "vitamin" | "antacid" | "antihistamine" | "other";
  }>({
    name: "",
    uses: "",
    dosage: "",
    side_effects: "",
    age_limit: "",
    category: "other",
  });

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    setUser(session.user);

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', session.user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleData) {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    setIsAdmin(true);
    fetchTablets();
  };

  const fetchTablets = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("tablets")
      .select("*")
      .order("name");

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load tablets.",
        variant: "destructive",
      });
    } else {
      setTablets(data || []);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingTablet) {
      const { error } = await supabase
        .from("tablets")
        .update(formData)
        .eq("id", editingTablet.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update tablet.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Tablet updated successfully.",
        });
        fetchTablets();
        resetForm();
      }
    } else {
      const { error } = await supabase.from("tablets").insert([formData]);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to add tablet.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Tablet added successfully.",
        });
        fetchTablets();
        resetForm();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this tablet?")) return;

    const { error } = await supabase.from("tablets").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete tablet.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Tablet deleted successfully.",
      });
      fetchTablets();
    }
  };

  const handleEdit = (tablet: any) => {
    setEditingTablet(tablet);
    setFormData({
      name: tablet.name,
      uses: tablet.uses,
      dosage: tablet.dosage || "",
      side_effects: tablet.side_effects || "",
      age_limit: tablet.age_limit || "",
      category: tablet.category as "painkiller" | "antibiotic" | "vitamin" | "antacid" | "antihistamine" | "other",
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      uses: "",
      dosage: "",
      side_effects: "",
      age_limit: "",
      category: "other",
    });
    setEditingTablet(null);
    setIsDialogOpen(false);
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Admin Panel</h2>
          <p className="text-muted-foreground">Manage tablet information</p>
        </div>

        <div className="grid gap-8">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Tablet
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingTablet ? "Edit Tablet" : "Add New Tablet"}</DialogTitle>
                <DialogDescription>
                  {editingTablet ? "Update tablet information" : "Add a new tablet to the database"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tablet Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value as "painkiller" | "antibiotic" | "vitamin" | "antacid" | "antihistamine" | "other" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="painkiller">Painkiller</SelectItem>
                      <SelectItem value="antibiotic">Antibiotic</SelectItem>
                      <SelectItem value="vitamin">Vitamin</SelectItem>
                      <SelectItem value="antacid">Antacid</SelectItem>
                      <SelectItem value="antihistamine">Antihistamine</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="uses">Uses *</Label>
                  <Textarea
                    id="uses"
                    value={formData.uses}
                    onChange={(e) => setFormData({ ...formData, uses: e.target.value })}
                    required
                    className="min-h-[100px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dosage">Dosage</Label>
                  <Input
                    id="dosage"
                    value={formData.dosage}
                    onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="side_effects">Side Effects</Label>
                  <Textarea
                    id="side_effects"
                    value={formData.side_effects}
                    onChange={(e) => setFormData({ ...formData, side_effects: e.target.value })}
                    className="min-h-[100px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age_limit">Age Limit</Label>
                  <Input
                    id="age_limit"
                    placeholder="e.g., Adults only (18+), Children over 6 years"
                    value={formData.age_limit}
                    onChange={(e) => setFormData({ ...formData, age_limit: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    {editingTablet ? "Update Tablet" : "Add Tablet"}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Card>
            <CardHeader>
              <CardTitle>All Tablets</CardTitle>
              <CardDescription>View and manage all tablets in the database</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Uses</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tablets.map((tablet) => (
                      <TableRow key={tablet.id}>
                        <TableCell className="font-medium">{tablet.name}</TableCell>
                        <TableCell className="capitalize">{tablet.category}</TableCell>
                        <TableCell className="max-w-md truncate">{tablet.uses}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(tablet)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(tablet.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Admin;