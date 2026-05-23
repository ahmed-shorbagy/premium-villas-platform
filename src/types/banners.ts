export interface Banner {
    id: string;
    title: string | null;
    description: string | null;
    image_url: string;
    link: string | null;
    is_active: boolean;
    display_order: number;
    created_at: string;
    updated_at: string;
}

export type BannerInput = Omit<Banner, 'id' | 'created_at' | 'updated_at'>;
