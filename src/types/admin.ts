export interface AdminSettings {
  publicRegistration: boolean;
  emailVerification: boolean;
  autoApproveArtists: boolean;
  maxUploadSize: number;
  allowedFormats: string[];
}

export interface BandManagement {
  id: string;
  name: string;
  formedIn: string;
  imageUrl: string;
  genres: string[];
  description: string;
  members: BandMember[];
  socialLinks: {
    website?: string;
    spotify?: string;
    youtube?: string;
    instagram?: string;
    facebook?: string;
  };
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  songs?: Song[];
}

export interface BandMember {
  id: string;
  name: string;
  role: string;
  imageUrl?: string;
  joinDate: string;
  leaveDate?: string;
}