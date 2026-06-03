import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useVillaOwnerWhatsApp } from '@/hooks/useReservations';
import { Phone, Save, Loader2, MessageCircle } from 'lucide-react';

const Settings = () => {
  const { ownerWhatsApp, loading, saveOwnerWhatsApp } = useVillaOwnerWhatsApp();
  const [editNumber, setEditNumber] = useState('');
  const [initialized, setInitialized] = useState(false);
  const [saving, setSaving] = useState(false);

  // Initialize the edit field once the value is loaded
  if (!loading && !initialized) {
    setEditNumber(ownerWhatsApp);
    setInitialized(true);
  }

  const handleSave = async () => {
    setSaving(true);
    await saveOwnerWhatsApp(editNumber.trim());
    setSaving(false);
  };

  const handleTestWhatsApp = () => {
    const cleaned = editNumber.replace(/\D/g, '');
    if (!cleaned) {
      alert('يرجى إدخال رقم واتساب أولاً');
      return;
    }
    const message = '🔔 رسالة تجريبية من Shima AK — هذه رسالة اختبارية للتأكد من أن الرقم يعمل بشكل صحيح.';
    window.open(
      `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold text-foreground">الإعدادات</h1>
        <p className="text-muted-foreground">إدارة إعدادات النظام العامة</p>
      </div>

      {/* Villa Owner WhatsApp Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-500" />
            رقم واتساب صاحبة الفلل
          </CardTitle>
          <CardDescription>
            رقم الواتساب الذي سيتم إرسال إشعارات الحجوزات إليه، وهو أيضاً الرقم الذي سيظهر للعملاء في الموقع للتواصل. يجب إدخال الرقم مع رمز الدولة (مثال: +972597470912)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="owner-whatsapp">رقم الواتساب (مع رمز الدولة)</Label>
                <div className="relative">
                  <Phone className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="owner-whatsapp"
                    type="tel"
                    placeholder="+972597470912"
                    value={editNumber}
                    onChange={(e) => setEditNumber(e.target.value.replace(/[^\d+\-\s]/g, ''))}
                    className="ps-10"
                    dir="ltr"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  هذا الرقم سيظهر في أسفل الموقع للعملاء، وسيستقبل تفاصيل كل حجز جديد. يمكنك تغييره في أي وقت.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={handleSave} disabled={saving} className="gap-2">
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  حفظ الرقم
                </Button>
                <Button
                  variant="outline"
                  onClick={handleTestWhatsApp}
                  disabled={!editNumber.trim()}
                  className="gap-2"
                >
                  <MessageCircle className="h-4 w-4 text-green-500" />
                  اختبار الرقم
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="mt-6 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
              <Phone className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-sm">
              <p className="font-medium text-foreground mb-1">كيف يعمل نظام الحجز؟</p>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>العميل يحجز الفيلا عبر الموقع</li>
                <li>تظهر الحجوزات في لوحة التحكم → الحجوزات</li>
                <li>اضغط "إبلاغ صاحبة الفلل" — تُرسل رسالة واتساب تلقائياً <strong>بدون رقم العميل</strong></li>
                <li>تواصل مع العميل مباشرة من لوحة الحجوزات</li>
                <li>حدّث حالة الحجز (مؤكد / ملغي / مكتمل)</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
