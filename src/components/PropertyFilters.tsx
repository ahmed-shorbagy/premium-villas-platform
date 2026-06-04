import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { featureLabels } from "@/data/properties";

interface PropertyFiltersProps {
  sortBy: string;
  onSortChange: (sort: string) => void;
  selectedFeatures?: string[];
  onFeaturesChange?: (features: string[]) => void;
}

const FEATURE_FILTERS = [
  'jacuzzi',
  'billiards',
  'tennis',
  'sauna',
  'kids_pool',
  'kids_games',
  'chalet',
];

const PropertyFilters = ({ sortBy, onSortChange, selectedFeatures = [], onFeaturesChange }: PropertyFiltersProps) => {
  const toggleFeature = (feature: string) => {
    if (!onFeaturesChange) return;
    if (selectedFeatures.includes(feature)) {
      onFeaturesChange(selectedFeatures.filter(f => f !== feature));
    } else {
      onFeaturesChange([...selectedFeatures, feature]);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">فلل للإيجار</p>
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="h-11 w-full rounded-xl border-glass-border bg-card/60 backdrop-blur-sm sm:w-52">
            <SelectValue placeholder="ترتيب حسب" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">الأحدث أولاً</SelectItem>
            <SelectItem value="price-asc">السعر: من الأقل للأعلى</SelectItem>
            <SelectItem value="price-desc">السعر: من الأعلى للأقل</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap gap-2">
        {FEATURE_FILTERS.map(feature => (
          <Badge
            key={feature}
            variant={selectedFeatures.includes(feature) ? "default" : "outline"}
            className="cursor-pointer select-none rounded-lg px-3 py-1.5 text-sm transition-all hover:opacity-80 font-normal"
            onClick={() => toggleFeature(feature)}
          >
            {featureLabels[feature] || feature}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default PropertyFilters;
