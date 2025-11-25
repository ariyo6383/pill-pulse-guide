import { useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Recommend = () => {
  const [healthProblem, setHealthProblem] = useState("");
  const [recommendation, setRecommendation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGetRecommendation = async () => {
    if (!healthProblem.trim()) {
      toast({
        title: "Input required",
        description: "Please describe your health problem.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setRecommendation("");

    try {
      const { data, error } = await supabase.functions.invoke("recommend-tablets", {
        body: { healthProblem },
      });

      if (error) {
        console.error("Edge function error:", error);
        toast({
          title: "Error",
          description: "Failed to get recommendation. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (data?.recommendation) {
        setRecommendation(data.recommendation);
      } else {
        toast({
          title: "No recommendation",
          description: "Unable to generate a recommendation. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Recommendation error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12 space-y-4">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
              <Sparkles className="h-5 w-5" />
              <span className="font-semibold">AI-Powered Recommendations</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              Get Tablet Recommendations
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Describe your symptoms and our AI will suggest tablets that might help
            </p>
          </div>

          {/* Disclaimer Alert */}
          <Alert className="mb-8 border-accent/50 bg-accent/5">
            <AlertCircle className="h-5 w-5 text-accent" />
            <AlertDescription className="text-sm">
              <strong>Important Disclaimer:</strong> This information is for educational purposes only. 
              Always consult a healthcare professional before taking any medication. For serious or 
              persistent symptoms, please seek immediate medical attention.
            </AlertDescription>
          </Alert>

          {/* Input Card */}
          <Card className="mb-8 shadow-lg">
            <CardHeader>
              <CardTitle>Describe Your Health Problem</CardTitle>
              <CardDescription>
                Be as specific as possible about your symptoms, duration, and severity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Example: I have a mild headache that started this morning and it's bothering me at work..."
                value={healthProblem}
                onChange={(e) => setHealthProblem(e.target.value)}
                className="min-h-[150px] text-base"
              />
              <Button
                onClick={handleGetRecommendation}
                disabled={isLoading}
                className="w-full h-12 text-base"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Getting Recommendations...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Get AI Recommendation
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Recommendation Result */}
          {recommendation && (
            <Card className="shadow-lg border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  AI Recommendation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <div className="whitespace-pre-wrap leading-relaxed text-foreground">
                    {recommendation}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Recommend;