import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Pill } from "lucide-react";

interface TabletCardProps {
  name: string;
  uses: string;
  dosage?: string;
  sideEffects?: string;
  category: string;
  ageLimit?: string;
}

const categoryColors: Record<string, string> = {
  painkiller: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  antibiotic: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  vitamin: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  antacid: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  antihistamine: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  other: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
};

export const TabletCard = ({ name, uses, dosage, sideEffects, category, ageLimit }: TabletCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Pill className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">{name}</CardTitle>
              <Badge className={`mt-2 ${categoryColors[category] || categoryColors.other}`}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold text-sm text-muted-foreground mb-1">Uses</h4>
          <CardDescription className="text-foreground leading-relaxed">{uses}</CardDescription>
        </div>
        {dosage && (
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground mb-1">Dosage</h4>
            <CardDescription className="text-foreground">{dosage}</CardDescription>
          </div>
        )}
        {sideEffects && (
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground mb-1">Side Effects</h4>
            <CardDescription className="text-foreground">{sideEffects}</CardDescription>
          </div>
        )}
        {ageLimit && (
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground mb-1">Age Limit</h4>
            <CardDescription className="text-foreground font-medium">{ageLimit}</CardDescription>
          </div>
        )}
      </CardContent>
    </Card>
  );
};