import { useEffect, useMemo, useState } from "react";
import {
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  LogOut,
  Plus,
  Trash2,
} from "lucide-react";
import { ShimaLogo } from "@/components/brand/ShimaLogo";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  clearOwnerToken,
  consumeOwnerTokenFromUrl,
  fetchOwnerSnapshot,
  saveOwnerAvailability,
} from "@/lib/ownerPortalApi";
import { parseDateOnly } from "@/utils/dateOnly";
import type {
  OwnerPortalSnapshot,
  OwnerVilla,
} from "@/types/ownerAccess";

interface DraftPeriod {
  key: string;
  id?: string;
  available_from: string;
  available_to: string;
}

function draftPeriods(villa: OwnerVilla | undefined): DraftPeriod[] {
  return (villa?.availability || []).map((period) => ({
    key: period.id,
    id: period.id,
    available_from: period.available_from,
    available_to: period.available_to,
  }));
}

function formatDate(value: string): string {
  const parsed = parseDateOnly(value);
  return parsed
    ? new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium" }).format(parsed)
    : value;
}

function validatePeriods(periods: DraftPeriod[]): string | null {
  for (const period of periods) {
    if (!period.available_from || !period.available_to) {
      return "أكمل تاريخ البداية والنهاية لكل فترة";
    }
    if (period.available_to < period.available_from) {
      return "تاريخ نهاية الفترة يجب أن يكون بعد تاريخ بدايتها";
    }
  }
  const sorted = [...periods].sort((a, b) =>
    a.available_from.localeCompare(b.available_from),
  );
  for (let index = 1; index < sorted.length; index += 1) {
    if (sorted[index].available_from <= sorted[index - 1].available_to) {
      return "فترات التوفر لا يمكن أن تتداخل";
    }
  }
  return null;
}

export default function OwnerPortal() {
  const { toast } = useToast();
  const [token, setToken] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<OwnerPortalSnapshot | null>(null);
  const [selectedVillaId, setSelectedVillaId] = useState("");
  const [periods, setPeriods] = useState<DraftPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedVilla = useMemo(
    () => snapshot?.villas.find((villa) => villa.id === selectedVillaId),
    [selectedVillaId, snapshot],
  );

  useEffect(() => {
    const accessToken = consumeOwnerTokenFromUrl();
    setToken(accessToken);
    if (!accessToken) {
      setError("افتح الرابط الذي أرسله لك مسؤول الموقع");
      setLoading(false);
      return;
    }

    fetchOwnerSnapshot(accessToken)
      .then((data) => {
        setSnapshot(data);
        const firstVilla = data.villas[0];
        if (firstVilla) {
          setSelectedVillaId(firstVilla.id);
          setPeriods(draftPeriods(firstVilla));
        }
        setError(null);
      })
      .catch((requestError) => {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "تعذر فتح بوابة المالك",
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const selectVilla = (villa: OwnerVilla) => {
    if (saving) return;
    setSelectedVillaId(villa.id);
    setPeriods(draftPeriods(villa));
  };

  const addPeriod = () => {
    setPeriods((current) => [
      ...current,
      {
        key: crypto.randomUUID(),
        available_from: "",
        available_to: "",
      },
    ]);
  };

  const updatePeriod = (
    key: string,
    field: "available_from" | "available_to",
    value: string,
  ) => {
    setPeriods((current) =>
      current.map((period) =>
        period.key === key ? { ...period, [field]: value } : period,
      ),
    );
  };

  const removePeriod = (key: string) => {
    setPeriods((current) => current.filter((period) => period.key !== key));
  };

  const submitAvailability = async () => {
    if (!token || !selectedVilla) return;
    const validationError = validatePeriods(periods);
    if (validationError) {
      toast({
        title: "راجع التواريخ",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const availability = await saveOwnerAvailability(
        token,
        selectedVilla.id,
        periods.map(({ id, available_from, available_to }) => ({
          ...(id ? { id } : {}),
          available_from,
          available_to,
        })),
      );
      setSnapshot((current) =>
        current
          ? {
              ...current,
              villas: current.villas.map((villa) =>
                villa.id === selectedVilla.id
                  ? {
                      ...villa,
                      availability,
                      stats: {
                        ...villa.stats,
                        availability_ranges: availability.length,
                      },
                    }
                  : villa,
              ),
            }
          : current,
      );
      setPeriods(
        availability.map((period) => ({
          key: period.id,
          id: period.id,
          available_from: period.available_from,
          available_to: period.available_to,
        })),
      );
      toast({
        title: "تم حفظ التوفر",
        description: "تم تحديث تواريخ الفيلا بنجاح",
      });
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

  const endSession = () => {
    clearOwnerToken();
    setToken(null);
    setSnapshot(null);
    setError("تم إنهاء الجلسة. استخدم رابط المالك للدخول مرة أخرى.");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="mx-auto mb-3 h-9 w-9 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-muted-foreground">جاري التحقق من الرابط...</p>
        </div>
      </div>
    );
  }

  if (error || !snapshot) {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg items-center p-4" dir="rtl">
        <Card className="w-full">
          <CardHeader className="items-center">
            <ShimaLogo surface="auto" size="md" framed />
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertTitle>تعذر فتح بوابة المالك</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <ShimaLogo surface="auto" size="sm" framed />
            <div>
              <p className="font-semibold">بوابة المالك</p>
              <p className="text-xs text-muted-foreground">
                أهلاً {snapshot.owner.display_name}
              </p>
            </div>
          </div>
          <Button variant="ghost" className="gap-2" onClick={endSession}>
            <LogOut className="h-4 w-4" />
            إنهاء الجلسة
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8">
        <section>
          <div className="mb-4">
            <h1 className="text-2xl font-bold">اختر الفيلا</h1>
            <p className="text-sm text-muted-foreground">
              تظهر هنا فقط الفلل التي عيّنها لك مسؤول الموقع
            </p>
          </div>
          {snapshot.villas.length === 0 ? (
            <Alert>
              <AlertTitle>لا توجد فلل معيّنة</AlertTitle>
              <AlertDescription>
                تواصل مع مسؤول الموقع لإضافة الفيلا إلى رابطك.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {snapshot.villas.map((villa) => (
                <button
                  key={villa.id}
                  type="button"
                  onClick={() => selectVilla(villa)}
                  className={`rounded-xl border p-4 text-right transition ${
                    villa.id === selectedVillaId
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "bg-card hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{villa.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {villa.location}
                      </p>
                    </div>
                    {villa.id === selectedVillaId && (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        {selectedVilla && (
          <>
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm">طلبات الحجز</CardTitle>
                  <CalendarDays className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent className="text-3xl font-bold">
                  {selectedVilla.stats.total_requests}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm">قيد الانتظار</CardTitle>
                  <Clock3 className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent className="text-3xl font-bold">
                  {selectedVilla.stats.pending_requests}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm">مؤكدة</CardTitle>
                  <CalendarCheck className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent className="text-3xl font-bold">
                  {selectedVilla.stats.confirmed_requests}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm">فترات التوفر</CardTitle>
                  <CalendarDays className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent className="text-3xl font-bold">
                  {selectedVilla.stats.availability_ranges}
                </CardContent>
              </Card>
            </section>

            <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
              <Card>
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <CardTitle>تواريخ توفر {selectedVilla.title}</CardTitle>
                      <p className="mt-1 text-sm text-muted-foreground">
                        عدّل الفترات ثم اضغط حفظ التغييرات
                      </p>
                    </div>
                    <Button variant="outline" className="gap-2" onClick={addPeriod}>
                      <Plus className="h-4 w-4" />
                      إضافة فترة
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {periods.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                      لا توجد فترات توفر. الفيلا لن تظهر متاحة للحجز حتى تضيف
                      فترة.
                    </div>
                  ) : (
                    periods.map((period, index) => (
                      <div
                        key={period.key}
                        className="grid items-end gap-3 rounded-lg border p-4 sm:grid-cols-[1fr_1fr_auto]"
                      >
                        <div className="space-y-2">
                          <Label htmlFor={`from-${period.key}`}>
                            متاح من
                          </Label>
                          <Input
                            id={`from-${period.key}`}
                            type="date"
                            value={period.available_from}
                            onChange={(event) =>
                              updatePeriod(
                                period.key,
                                "available_from",
                                event.target.value,
                              )
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`to-${period.key}`}>متاح إلى</Label>
                          <Input
                            id={`to-${period.key}`}
                            type="date"
                            min={period.available_from}
                            value={period.available_to}
                            onChange={(event) =>
                              updatePeriod(
                                period.key,
                                "available_to",
                                event.target.value,
                              )
                            }
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          title={`حذف الفترة ${index + 1}`}
                          onClick={() => removePeriod(period.key)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))
                  )}

                  <div className="flex justify-end border-t pt-4">
                    <Button
                      onClick={() => void submitAvailability()}
                      disabled={saving}
                    >
                      {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="h-fit">
                <CardHeader>
                  <CardTitle className="text-lg">الحجوزات القادمة</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    تظهر التواريخ فقط دون أي بيانات شخصية
                  </p>
                </CardHeader>
                <CardContent>
                  {selectedVilla.booked_ranges.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      لا توجد حجوزات قادمة
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {selectedVilla.booked_ranges.map((range, index) => (
                        <div
                          key={`${range.check_in}-${range.check_out}-${index}`}
                          className="rounded-lg border p-3"
                        >
                          <Badge variant="secondary" className="mb-2">
                            محجوز
                          </Badge>
                          <p className="text-sm">
                            {formatDate(range.check_in)} —{" "}
                            {formatDate(range.check_out)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
