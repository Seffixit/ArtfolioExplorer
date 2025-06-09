import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { X, Search, PenTool, FlaskRound, Rocket } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { PortfolioWithDetails, CaseStudy } from "@shared/schema";

interface CaseStudyModalProps {
  portfolio: PortfolioWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CaseStudyModal({ portfolio, isOpen, onClose }: CaseStudyModalProps) {
  const { data: caseStudy, isLoading } = useQuery({
    queryKey: ['/api/portfolios', portfolio?.id, 'case-study'],
    enabled: !!portfolio && isOpen,
  });

  if (!portfolio) return null;

  const getAuthorInitials = () => {
    const firstName = portfolio.author.firstName || '';
    const lastName = portfolio.author.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
  };

  const processSteps = [
    { icon: Search, title: "Research", description: "User interviews and market analysis" },
    { icon: PenTool, title: "Design", description: "Wireframes and visual design" },
    { icon: FlaskRound, title: "Testing", description: "Usability testing and iterations" },
    { icon: Rocket, title: "Launch", description: "Implementation and monitoring" },
  ];

  const defaultResults = [
    { metric: "45%", label: "Increase in User Engagement" },
    { metric: "32%", label: "Reduction in Bounce Rate" },
    { metric: "4.8/5", label: "User Satisfaction Score" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-background border-b pb-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-3">
              <Avatar className="w-12 h-12">
                <AvatarImage src={portfolio.author.profileImageUrl || undefined} />
                <AvatarFallback>{getAuthorInitials()}</AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-2xl font-bold">
                  {portfolio.title}
                </DialogTitle>
                <p className="text-muted-foreground">
                  by {portfolio.author.firstName} {portfolio.author.lastName}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-8 py-6">
          {/* Hero Image */}
          <div className="relative">
            <img 
              src={portfolio.imageUrl} 
              alt={portfolio.title}
              className="w-full h-64 md:h-80 object-cover rounded-lg"
            />
            <div className="absolute bottom-4 left-4">
              <Badge variant="secondary" className="bg-black/50 text-white border-none">
                {portfolio.category.name}
              </Badge>
            </div>
          </div>

          {/* Project Overview */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Project Overview</h3>
            {isLoading ? (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-20 bg-muted rounded animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-20 bg-muted rounded animate-pulse" />
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Challenge</h4>
                  <p className="text-muted-foreground">
                    {caseStudy?.challenge || "This project required innovative solutions to address complex user needs while maintaining aesthetic appeal and functionality."}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Solution</h4>
                  <p className="text-muted-foreground">
                    {caseStudy?.solution || "We developed a comprehensive design system with focus on user experience, visual hierarchy, and seamless interactions."}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Process */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Design Process</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {processSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h4 className="font-medium">{step.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tags */}
          {portfolio.tags && portfolio.tags.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Technologies & Skills</h3>
              <div className="flex flex-wrap gap-2">
                {portfolio.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Results & Impact</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(caseStudy?.results as any[] || defaultResults).map((result: any, index: number) => (
                <div key={index} className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">
                    {result.metric || result.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {result.label || result.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Images */}
          {caseStudy?.images && caseStudy.images.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Visual Examples</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {caseStudy.images.map((imageUrl, index) => (
                  <img 
                    key={index}
                    src={imageUrl} 
                    alt={`Case study example ${index + 1}`}
                    className="rounded-lg shadow-md w-full h-64 object-cover"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Project Details</h3>
            <p className="text-muted-foreground leading-relaxed">
              {portfolio.description}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
