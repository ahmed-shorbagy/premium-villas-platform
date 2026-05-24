import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PropertyFiltersProps {
  sortBy: string;
  onSortChange: (sort: string) => void;
}

const PropertyFilters = ({ sortBy, onSortChange }: PropertyFiltersProps) => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">فلل للإيجار فقط</p>
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
  );
};

export default PropertyFilters;
