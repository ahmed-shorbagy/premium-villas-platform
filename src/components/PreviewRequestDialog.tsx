import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone, MessageCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PreviewRequestDialogProps {
    propertyId: string;
    propertyTitle: string;
    propertyPrice: string;
    propertyLocation: string;
    children: React.ReactNode;
    whatsappNumber?: string;
}

const DEFAULT_AGENT_NUMBER = '201211847800'; // +20 121 184 7800

const PreviewRequestDialog = ({
    propertyId,
    propertyTitle,
    propertyPrice,
    propertyLocation,
    children,
    whatsappNumber,
}: PreviewRequestDialogProps) => {
    const [open, setOpen] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Validate Egyptian phone numbers (01x followed by 8 digits)
    const validatePhone = (phone: string): boolean => {
        const cleaned = phone.replace(/\D/g, '');
        // Egyptian mobile: starts with 01 followed by 0, 1, 2, or 5, then 8 more digits
        const egyptianMobileRegex = /^01[0125]\d{8}$/;
        return egyptianMobileRegex.test(cleaned);
    };

    const formatPhoneForDisplay = (phone: string): string => {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length >= 11) {
            return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 7)} ${cleaned.slice(7, 11)}`;
        }
        return phone;
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Allow only numbers and common separators
        const cleaned = value.replace(/[^\d\s\-]/g, '');
        setPhoneNumber(cleaned);
        setError('');
    };

    const trackPreviewRequest = async () => {
        try {
            await supabase.from('analytics').insert({
                event_type: 'preview_request',
                property_id: propertyId,
                metadata: {
                    property_title: propertyTitle,
                    property_price: propertyPrice,
                    user_phone: phoneNumber.replace(/\D/g, ''),
                },
            });
        } catch (err) {
            console.error('Failed to track preview request:', err);
        }
    };

    const handleSubmit = async () => {
        const cleanedPhone = phoneNumber.replace(/\D/g, '');

        if (!validatePhone(cleanedPhone)) {
            setError('يرجى إدخال رقم هاتف صحيح');
            return;
        }

        setIsSubmitting(true);

        // Track the request
        await trackPreviewRequest();

        // Build WhatsApp message - compact format
        // Build WhatsApp message - simple and clean format
        // \u202A and \u202C ensure the phone number is treated as LTR text preventing scrambling in RTL context
        const message = `حجز جديد لفيلا
السعر: ${propertyPrice}
الموقع: ${propertyLocation}
رقم العميل: \u202A${formatPhoneForDisplay(cleanedPhone)}\u202C`;

        const encodedMessage = encodeURIComponent(message);
        const targetNumber = whatsappNumber || DEFAULT_AGENT_NUMBER;
        const whatsappUrl = `https://wa.me/${targetNumber}?text=${encodedMessage}`;

        // Open WhatsApp
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

        // Reset and close
        setIsSubmitting(false);
        setPhoneNumber('');
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-md" dir="rtl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-right">
                        <MessageCircle className="h-5 w-5 text-gold" />
                        طلب حجز الفيلا
                    </DialogTitle>
                    <DialogDescription className="text-right">
                        أدخل رقم هاتفك وسنتواصل معك لترتيب موعد المعاينة
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-right block">
                            رقم الهاتف
                        </Label>
                        <div className="relative">
                            <Phone className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="01x xxxx xxxx"
                                value={phoneNumber}
                                onChange={handlePhoneChange}
                                className="ps-10 text-left"
                                dir="ltr"
                                maxLength={14}
                            />
                        </div>
                        {error && (
                            <p className="text-sm text-destructive text-right">{error}</p>
                        )}
                    </div>

                    <div className="rounded-lg bg-secondary/50 p-3 text-sm text-muted-foreground">
                        <p className="font-medium text-foreground mb-1">تفاصيل الفيلا:</p>
                        <p>{propertyTitle}</p>
                        <p className="text-gold font-semibold">{propertyPrice}</p>
                    </div>
                </div>

                <DialogFooter className="flex-row-reverse gap-2 sm:flex-row-reverse">
                    <Button
                        variant="gold"
                        onClick={handleSubmit}
                        disabled={isSubmitting || !phoneNumber.trim()}
                        className="flex-1 gap-2"
                    >
                        {isSubmitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                        )}
                        إرسال عبر واتساب
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default PreviewRequestDialog;
