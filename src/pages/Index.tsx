import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { TabletCard } from "@/components/TabletCard";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [tablets, setTablets] = useState<any[]>([]);
  const [filteredTablets, setFilteredTablets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTablets();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredTablets(tablets);
    } else {
      const filtered = tablets.filter((tablet) =>
        tablet.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTablets(filtered);
    }
  }, [searchTerm, tablets]);

  const fetchTablets = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("tablets")
      .select("*")
      .order("name");

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load tablets. Please try again.",
        variant: "destructive",
      });
    } else {
      setTablets(data || []);
      setFilteredTablets(data || []);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <Header />
      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Find Tablet Information
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Search our comprehensive database to learn about tablet uses, dosages, and side effects
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for a tablet by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-14 text-lg shadow-lg border-2 focus:border-primary"
            />
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading tablets...</p>
          </div>
        ) : filteredTablets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchTerm ? `No tablets found matching "${searchTerm}"` : "No tablets available"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTablets.map((tablet) => (
              <TabletCard
                key={tablet.id}
                name={tablet.name}
                uses={tablet.uses}
                dosage={tablet.dosage}
                sideEffects={tablet.side_effects}
                category={tablet.category}
                ageLimit={tablet.age_limit}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;