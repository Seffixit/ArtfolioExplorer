import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Eye, Heart, MessageCircle } from "lucide-react";
import type { PortfolioWithDetails } from "@shared/schema";

interface PortfolioCardProps {
  portfolio: PortfolioWithDetails;
  onViewCaseStudy: (portfolio: PortfolioWithDetails) => void;
  onLike?: (portfolioId: number) => void;
}

export function PortfolioCard({ portfolio, onViewCaseStudy, onLike }: PortfolioCardProps) {
  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike?.(portfolio.id);
  };

  const getAuthorInitials = () => {
    const firstName = portfolio.author.firstName || '';
    const lastName = portfolio.author.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
  };

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer">
      <div className="relative overflow-hidden">
        <img 
          src={portfolio.imageUrl} 
          alt={portfolio.title}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 right-4 flex gap-2">
          {portfolio.featured && (
            <Badge variant="default" className="bg-primary text-primary-foreground">
              Featured
            </Badge>
          )}
          {portfolio.trending && (
            <Badge variant="destructive">
              Trending
            </Badge>
          )}
        </div>
        <div className="absolute bottom-4 left-4">
          <Badge variant="secondary" className="bg-black/50 text-white border-none">
            {portfolio.category.name}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Avatar className="w-10 h-10">
            <AvatarImage src={portfolio.author.profileImageUrl || undefined} />
            <AvatarFallback>{getAuthorInitials()}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              {portfolio.author.firstName} {portfolio.author.lastName}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {portfolio.author.email}
            </p>
          </div>
        </div>
        
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-primary transition-colors">
          {portfolio.title}
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
          {portfolio.description}
        </p>
        
        {portfolio.tags && portfolio.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {portfolio.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {portfolio.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{portfolio.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
            <button 
              onClick={handleLike}
              className="flex items-center space-x-1 hover:text-primary transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span>{portfolio.views}</span>
            </button>
            <button 
              onClick={handleLike}
              className="flex items-center space-x-1 hover:text-red-500 transition-colors"
            >
              <Heart className="w-4 h-4" />
              <span>{portfolio.likes}</span>
            </button>
            <span className="flex items-center space-x-1">
              <MessageCircle className="w-4 h-4" />
              <span>{portfolio.comments}</span>
            </span>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onViewCaseStudy(portfolio)}
            className="text-primary hover:text-primary/80"
          >
            View Case Study →
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
