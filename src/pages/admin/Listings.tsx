import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { buildLocalizedPath } from '@/routes';
import { platformScope } from '@/config/platform';

interface Property {
  id: string;
  title: string;
  type: string;
  price: number;
  location: string;
  area: string;
  bedrooms: number;
  bathrooms: number;
  area_size: number;
  description: string | null;
  images: string[];
  featured: boolean;
  listing_type: 'sale' | 'rent';
  created_at: string;
}

const Listings = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const fetchProperties = async () => {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('type', platformScope.propertyType)
      .eq('listing_type', platformScope.listingType)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProperties(data as unknown as Property[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد أنك تريد حذف هذه الفيلا؟')) return;

    const { error } = await supabase.from('properties').delete().eq('id', id);

    if (error) {
      toast({
        title: 'خطأ',
        description: 'فشل حذف الفيلا',
        variant: 'destructive',
      });
    } else {
      toast({ title: 'تم بنجاح', description: 'تم حذف الفيلا بنجاح' });
      fetchProperties();
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG').format(price) + ' جنيه';
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8 flex flex-col gap-4 items-start sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">إدارة الفلل للإيجار</h1>
          <p className="text-muted-foreground">إضافة، تعديل أو حذف فلل الإيجار</p>
        </div>
        <div className="flex w-full sm:w-auto gap-2">
          <Input
            placeholder="بحث..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64"
          />
          <Button onClick={() => navigate(buildLocalizedPath.adminListings() + '/new')}>
            <Plus className="mr-2 h-4 w-4" />
            <span className="sr-only sm:not-sr-only sm:ml-2">إضافة</span>
            <span className="sm:hidden">إضافة</span>
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="whitespace-nowrap">العنوان</TableHead>
                <TableHead className="whitespace-nowrap">السعر / ليلة</TableHead>
                <TableHead className="whitespace-nowrap">الموقع</TableHead>
                <TableHead className="text-right whitespace-nowrap">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    جاري التحميل...
                  </TableCell>
                </TableRow>
              ) : properties.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    لا توجد فلل حالياً. أضف أول فيلا الآن!
                  </TableCell>
                </TableRow>
              ) : (
                properties
                  .filter(property =>
                    property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    property.location.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((property) => (
                    <TableRow key={property.id}>
                      <TableCell className="font-medium whitespace-nowrap">{property.title}</TableCell>
                      <TableCell className="whitespace-nowrap">{formatPrice(property.price)}</TableCell>
                      <TableCell className="whitespace-nowrap">{property.location}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`${buildLocalizedPath.adminListings()}/${property.id}`)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(property.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default Listings;
