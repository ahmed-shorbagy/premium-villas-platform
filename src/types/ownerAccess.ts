export interface OwnerRecord {
  id: string;
  display_name: string;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OwnerAssignment {
  owner_id: string;
  property_id: string;
  assigned_at: string;
}

export interface OwnerTokenStatus {
  id: string;
  owner_id: string;
  label: string | null;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
}

export interface OwnerPropertyOption {
  id: string;
  title: string;
  location: string;
}

export interface OwnerAdminData {
  owners: OwnerRecord[];
  assignments: OwnerAssignment[];
  tokens: OwnerTokenStatus[];
  properties: OwnerPropertyOption[];
}

export interface OwnerAvailabilityPeriod {
  id: string;
  available_from: string;
  available_to: string;
}

export interface OwnerBookedRange {
  check_in: string;
  check_out: string;
}

export interface OwnerVillaStats {
  total_requests: number;
  pending_requests: number;
  confirmed_requests: number;
  availability_ranges: number;
}

export interface OwnerVilla {
  id: string;
  title: string;
  location: string;
  images: string[];
  availability: OwnerAvailabilityPeriod[];
  booked_ranges: OwnerBookedRange[];
  stats: OwnerVillaStats;
}

export interface OwnerPortalSnapshot {
  owner: {
    id: string;
    display_name: string;
  };
  villas: OwnerVilla[];
}
