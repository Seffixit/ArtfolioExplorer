import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Grid3X3, List, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Category } from "@shared/schema";

interface SearchFiltersProps {
  onSearch: (query: string) => void;
  onCategoryFilter: (categoryId: number | null) => void;
  onSortChange: (sortBy: 'recent' | 'popular' | 'views' | 'alphabetical') => void;
  onViewModeChange: (mode: 'grid' | 'list') => void;
  selectedCategory: number | null;
  searchQuery: string;
  sortBy: string;
  viewMode: 'grid' | 'list';
}

export function SearchFilters({
  onSearch,
  onCategoryFilter,
  onSortChange,
  onViewModeChange,
  selectedCategory,
  searchQuery,
  sortBy,
  viewMode,
}: SearchFiltersProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(localSearch);
  };

  const handleCategoryClick = (categoryId: number) => {
    if (selectedCategory === categoryId) {
      onCategoryFilter(null);
    } else {
      onCategoryFilter(categoryId);
    }
  };

  const clearSearch = () => {
    setLocalSearch('');
    onSearch('');
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          type="text"
          placeholder="Search portfolios, artists, or techniques..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="pl-10 pr-10"
        />
        {localSearch && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
            onClick={clearSearch}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </form>

      {/* Category Filters */}
      <div className="space-y-3">
        <h3 className="font-medium text-sm">Categories</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => onCategoryFilter(null)}
            className="h-8"
          >
            All Categories
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => handleCategoryClick(category.id)}
              className="h-8"
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="views">Most Viewed</SelectItem>
              <SelectItem value="alphabetical">Alphabetical</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? "default" : "outline"}
            size="icon"
            onClick={() => onViewModeChange('grid')}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? "default" : "outline"}
            size="icon"
            onClick={() => onViewModeChange('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Active Filters */}
      {(selectedCategory || searchQuery) && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Search: "{searchQuery}"
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={clearSearch}
              />
            </Badge>
          )}
          {selectedCategory && (
            <Badge variant="secondary" className="gap-1">
              {categories.find(c => c.id === selectedCategory)?.name}
              <X 
                className="w-3 h-3 cursor-pointer" 
                onClick={() => onCategoryFilter(null)}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
