import { Building, Home, Layers, Store, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PropertyFiltersProps {
  activeType: string;
  activeListingType: string;
  sortBy: string;
  onTypeChange: (type: string) => void;
  onListingTypeChange: (type: string) => void;
  onSortChange: (sort: string) => void;
  hideTypeFilter?: boolean;
}

const typeFilters = [
  { value: 'all', label: 'الكل', icon: Layers },
  { value: 'apartment', label: 'شقق', icon: Building },
  { value: 'villa', label: 'فلل', icon: Home },
  { value: 'office', label: 'مكاتب', icon: Briefcase },
  { value: 'commercial', label: 'تجاري', icon: Store },
  { value: 'duplex', label: 'دوبلكس', icon: Layers },
  { value: 'land', label: 'أراضي', icon: Layers },
];

const PropertyFilters = ({
  activeType,
  activeListingType,
  sortBy,
  onTypeChange,
  onListingTypeChange,
  onSortChange,
  hideTypeFilter = false
}: PropertyFiltersProps) => {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Listing Type Filters */}
        <div className="flex bg-secondary p-1 rounded-lg">
          <button
            onClick={() => onListingTypeChange('all')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeListingType === 'all'
              ? 'bg-gold text-white shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            الكل
          </button>
          <button
            onClick={() => onListingTypeChange('sale')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeListingType === 'sale'
              ? 'bg-gold text-white shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            تمليك
          </button>
          <button
            onClick={() => onListingTypeChange('rent')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeListingType === 'rent'
              ? 'bg-gold text-white shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            إيجار
          </button>
        </div>

        <div className="h-6 w-px bg-border hidden sm:block" />

        {!hideTypeFilter && (
          <div className="flex flex-wrap gap-2">
            {typeFilters.map((filter) => {
              const Icon = filter.icon;
              return (
                <Button
                  key={filter.value}
                  variant={activeType === filter.value ? 'gold' : 'outline'}
                  size="sm"
                  onClick={() => onTypeChange(filter.value)}
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {filter.label}
                </Button>
              );
            })}
          </div>
        )}
      </div>

      {/* Sort Dropdown */}
      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="ترتيب حسب" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">الأحدث أولاً</SelectItem>
          <SelectItem value="price-asc">السعر: من الأقل للأعلى</SelectItem>
          <SelectItem value="price-desc">السعر: من الأعلى للأقل</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default PropertyFilters;
