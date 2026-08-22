import { useMemo, useState } from "react";
import { Copy, KeyRound, Pencil, Plus, ShieldOff } from "lucide-react";
import { useOwnerAdmin, type OwnerSaveInput } from "@/hooks/useOwnerAdmin";
import type { OwnerRecord } from "@/types/ownerAccess";
import { buildLocalizedPath } from "@/routes";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const EMPTY_FORM: OwnerSaveInput = {
  display_name: "",
  phone: "",
  email: "",
  is_active: true,
  property_ids: [],
};

function formatDate(value: string | null): string {
  if (!value) return "لم يُستخدم بعد";
  return new Intl.DateTimeFormat("ar-EG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function Owners() {
  const {
    owners,
    properties,
    loading,
    error,
    saveOwner,
    rotateLink,
    revokeLink,
    assignmentsFor,
    activeTokenFor,
  } = useOwnerAdmin();
  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<OwnerSaveInput>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [busyOwnerId, setBusyOwnerId] = useState<string | null>(null);
  const [generatedLink, setGeneratedLink] = useState("");

  const propertyById = useMemo(
    () => new Map(properties.map((property) => [property.id, property])),
    [properties],
  );

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFormOpen(true);
  };

  const openEdit = (owner: OwnerRecord) => {
    setForm({
      id: owner.id,
      display_name: owner.display_name,
      phone: owner.phone || "",
      email: owner.email || "",
      is_active: owner.is_active,
      property_ids: assignmentsFor(owner.id),
    });
    setFormOpen(true);
  };

  const toggleProperty = (propertyId: string, checked: boolean) => {
    setForm((current) => ({
      ...current,
      property_ids: checked
        ? [...new Set([...current.property_ids, propertyId])]
        : current.property_ids.filter((id) => id !== propertyId),
    }));
  };

  const handleSave = async () => {
    if (!form.display_name.trim()) return;
    setSaving(true);
    try {
      await saveOwner(form);
      setFormOpen(false);
      toast({ title: "تم الحفظ", description: "تم تحديث المالك وتعيينات الفلل" });
    } catch (requestError) {
      toast({
        title: "تعذر الحفظ",
        description:
          requestError instanceof Error ? requestError.message : "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleGenerate = async (owner: OwnerRecord) => {
    const currentToken = activeTokenFor(owner.id);
    if (
      currentToken &&
      !confirm("إنشاء رابط جديد سيُلغي الرابط الحالي فوراً. هل تريد المتابعة؟")
    ) {
      return;
    }
    setBusyOwnerId(owner.id);
    try {
      const secret = await rotateLink(owner.id);
      const link =
        `${window.location.origin}${buildLocalizedPath.ownerPortal()}#access=${encodeURIComponent(secret)}`;
      setGeneratedLink(link);
    } catch (requestError) {
      toast({
        title: "تعذر إنشاء الرابط",
        description:
          requestError instanceof Error ? requestError.message : "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    } finally {
      setBusyOwnerId(null);
    }
  };

  const handleRevoke = async (owner: OwnerRecord) => {
    if (!confirm(`هل تريد إلغاء رابط ${owner.display_name} فوراً؟`)) return;
    setBusyOwnerId(owner.id);
    try {
      await revokeLink(owner.id);
      toast({ title: "تم الإلغاء", description: "لم يعد الرابط السابق صالحاً" });
    } catch (requestError) {
      toast({
        title: "تعذر إلغاء الرابط",
        description:
          requestError instanceof Error ? requestError.message : "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    } finally {
      setBusyOwnerId(null);
    }
  };

  const copyGeneratedLink = async () => {
    await navigator.clipboard.writeText(generatedLink);
    toast({ title: "تم النسخ", description: "أرسل الرابط للمالك بطريقة آمنة" });
  };

  return (
    <div className="p-4 md:p-8" dir="rtl">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">ملاك الفلل</h1>
          <p className="text-muted-foreground">
            عيّن عدة فلل لكل مالك وأنشئ رابط وصول قابل للإلغاء
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          إضافة مالك
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المالك</TableHead>
                <TableHead>الفلل المعيّنة</TableHead>
                <TableHead>حالة الرابط</TableHead>
                <TableHead>آخر استخدام</TableHead>
                <TableHead className="text-left">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center">
                    جاري التحميل...
                  </TableCell>
                </TableRow>
              ) : owners.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-10 text-center text-muted-foreground"
                  >
                    لم تتم إضافة ملاك بعد
                  </TableCell>
                </TableRow>
              ) : (
                owners.map((owner) => {
                  const assigned = assignmentsFor(owner.id);
                  const token = activeTokenFor(owner.id);
                  return (
                    <TableRow key={owner.id}>
                      <TableCell>
                        <div className="font-medium">{owner.display_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {owner.phone || owner.email || "لا توجد وسيلة تواصل"}
                        </div>
                        {!owner.is_active && (
                          <Badge variant="secondary" className="mt-1">
                            غير نشط
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex max-w-md flex-wrap gap-1">
                          {assigned.length === 0 ? (
                            <span className="text-sm text-muted-foreground">
                              لا توجد فلل
                            </span>
                          ) : (
                            assigned.map((propertyId) => (
                              <Badge key={propertyId} variant="outline">
                                {propertyById.get(propertyId)?.title || "فيلا محذوفة"}
                              </Badge>
                            ))
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={token ? "default" : "secondary"}>
                          {token ? "نشط" : "لا يوجد رابط"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(token?.last_used_at || null)}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="تعديل المالك والتعيينات"
                            onClick={() => openEdit(owner)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title={token ? "تدوير الرابط" : "إنشاء رابط"}
                            disabled={
                              busyOwnerId === owner.id || !owner.is_active
                            }
                            onClick={() => void handleGenerate(owner)}
                          >
                            <KeyRound className="h-4 w-4" />
                          </Button>
                          {token && (
                            <Button
                              variant="ghost"
                              size="icon"
                              title="إلغاء الرابط"
                              disabled={busyOwnerId === owner.id}
                              onClick={() => void handleRevoke(owner)}
                            >
                              <ShieldOff className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>{form.id ? "تعديل المالك" : "إضافة مالك"}</DialogTitle>
            <DialogDescription>
              لا يستطيع المالك فتح أي فيلا غير محددة هنا.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="owner-name">اسم المالك</Label>
                <Input
                  id="owner-name"
                  value={form.display_name}
                  maxLength={120}
                  onChange={(event) =>
                    setForm({ ...form, display_name: event.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="owner-phone">رقم الهاتف</Label>
                <Input
                  id="owner-phone"
                  value={form.phone}
                  onChange={(event) =>
                    setForm({ ...form, phone: event.target.value })
                  }
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="owner-email">البريد الإلكتروني (اختياري)</Label>
                <Input
                  id="owner-email"
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm({ ...form, email: event.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>الفلل المعيّنة</Label>
              <div className="grid gap-2 rounded-lg border p-3 sm:grid-cols-2">
                {properties.map((property) => (
                  <label
                    key={property.id}
                    className="flex cursor-pointer items-start gap-3 rounded-md p-2 hover:bg-muted"
                  >
                    <Checkbox
                      checked={form.property_ids.includes(property.id)}
                      onCheckedChange={(checked) =>
                        toggleProperty(property.id, checked === true)
                      }
                    />
                    <span>
                      <span className="block text-sm font-medium">
                        {property.title}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {property.location}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {form.id && (
              <label className="flex items-center gap-3 rounded-lg border p-3">
                <Checkbox
                  checked={form.is_active}
                  onCheckedChange={(checked) =>
                    setForm({ ...form, is_active: checked === true })
                  }
                />
                <span className="text-sm">
                  حساب المالك نشط (إلغاء التحديد يلغي رابطه فوراً)
                </span>
              </label>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              إلغاء
            </Button>
            <Button
              onClick={() => void handleSave()}
              disabled={saving || !form.display_name.trim()}
            >
              {saving ? "جاري الحفظ..." : "حفظ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(generatedLink)}
        onOpenChange={(open) => {
          if (!open) setGeneratedLink("");
        }}
      >
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>تم إنشاء رابط المالك</DialogTitle>
            <DialogDescription>
              سيظهر هذا الرابط الآن فقط. نسخه أو إرساله يعني منح صلاحية الوصول،
              ويمكنك إلغاؤه أو تدويره في أي وقت.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Input value={generatedLink} readOnly dir="ltr" />
            <Button
              size="icon"
              title="نسخ الرابط"
              onClick={() => void copyGeneratedLink()}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={() => setGeneratedLink("")}>تم</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
