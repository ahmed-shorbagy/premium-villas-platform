export type ListingRequestStatus = 'pending' | 'approved' | 'declined';

export interface ListingRequest {
    id: string;
    // Property Details
    title: string;
    description: string | null;
    type: string;
    listing_type: 'sale' | 'rent';
    price: number;
    location: string;
    bedrooms: number;
    bathrooms: number;
    features: string[] | null;
    images: string[] | null;
    card_images: string[] | null;
    gallery_images: string[] | null;
    // User Contact Info
    contact_name: string;
    contact_phone: string;
    contact_email: string | null;
    contact_location: string | null;
    // Installments
    installments_available: boolean;
    installment_period: string | null;
    installment_value: number | null;
    // Status
    status: ListingRequestStatus;
    admin_notes: string | null;
    // Timestamps
    created_at: string;
    updated_at: string;
}

export interface ListingRequestInput {
    // Property Details
    title: string;
    description?: string | null;
    type: string;
    listing_type: 'sale' | 'rent';
    price: number;
    location: string;
    bedrooms: number;
    bathrooms: number;
    features?: string[] | null;
    images?: string[] | null;
    card_images?: string[] | null;
    gallery_images?: string[] | null;
    // User Contact Info
    contact_name: string;
    contact_phone: string;
    contact_email?: string | null;
    contact_location?: string | null;
    // Installments
    installments_available?: boolean;
    installment_period?: string | null;
    installment_value?: number | null;
}
