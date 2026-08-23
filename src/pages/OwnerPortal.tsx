import { useEffect, useMemo, useState } from "react";
import {
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  LogOut,
} from "lucide-react";
import { ShimaLogo } from "@/components/brand/ShimaLogo";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  clearOwnerToken,
  consumeOwnerTokenFromUrl,
  fetchOwnerSnapshot,
  saveOwnerAvailability,
} from "@/lib/ownerPortalApi";
import { parseDateOnly } from "@/utils/dateOnly";
import {
  expandRangesToDates,
  mergeDatesToRanges,
  serializeDateSet,
} from "@/utils/blockedDates";
import BlockedDatesEditor from "@/components/BlockedDatesEditor";
import type {
  OwnerPortalSnapshot,
  OwnerVilla,
} from "@/types/ownerAccess";

function villaBlockedDates(villa: OwnerVilla | undefined): Set<string> {
  return expandRangesToDates(villa?.availability || []);
}

function formatDate(value: string): string {
  const parsed = parseDateOnly(value);
  return parsed
    ? new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium" }).format(parsed)
    : value;
}

export default function OwnerPortal() {
  const { toast } = useToast();
  const [token, setToken] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<OwnerPortalSnapshot | null>(null);
  const [selectedVillaId, setSelectedVillaId] = useState("");
  const [blockedDates, setBlockedDates] = useState<Set<string>>(new Set());
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
          setBlockedDates(villaBlockedDates(firstVilla));
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
    setBlockedDates(villaBlockedDates(villa));
  };

  const savedBlockedDates = useMemo(
    () => villaBlockedDates(selectedVilla),
    [selectedVilla],
  );
  const dirty =
    serializeDateSet(blockedDates) !== serializeDateSet(savedBlockedDates);

  const submitAvailability = async () => {
    if (!token || !selectedVilla) return;

    setSaving(true);
    try {
      const availability = await saveOwnerAvailability(
        token,
        selectedVilla.id,
        mergeDatesToRanges(blockedDates),
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
      setBlockedDates(expandRangesToDates(availability));
      toast({
        title: "تم حفظ الأيام المحجوزة",
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
                  <CardTitle className="text-sm">أيام محجوزة</CardTitle>
                  <CalendarDays className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent className="text-3xl font-bold">
                  {blockedDates.size}
                </CardContent>
              </Card>
            </section>

            <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
              <Card>
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <CardTitle>الأيام المحجوزة — {selectedVilla.title}</CardTitle>
                      <p className="mt-1 text-sm text-muted-foreground">
                        كل التواريخ مفتوحة افتراضياً. حدّد فقط الأيام غير المتاحة ثم احفظ.
                      </p>
                    </div>
                    <Button
                      onClick={() => void submitAvailability()}
                      disabled={saving || !dirty}
                    >
                      {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <BlockedDatesEditor
                    blockedDates={blockedDates}
                    onChange={setBlockedDates}
                    bookedRanges={selectedVilla.booked_ranges}
                    disabled={saving}
                  />
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
