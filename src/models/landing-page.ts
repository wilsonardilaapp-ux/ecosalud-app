

export type LandingPageData = {
  hero: HeroSection;
  navigation: NavigationSection;
  sections: ContentSection[];
  testimonials: TestimonialSection[];
  seo: SEOSection;
  form: FormSection;
  header: LandingHeaderConfigData; // New section
};

export type HeroSection = {
  title: string;
  subtitle: string;
  additionalContent: string;
  imageUrl: string;
  ctaButtonText: string;
  ctaButtonUrl: string;
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
};

export type NavigationSection = {
  enabled: boolean;
  logoUrl: string;
  logoAlt: string;
  logoWidth: number;
  logoAlignment: 'left' | 'center' | 'right';
  businessName: string;
  links: NavLink[];
  backgroundColor: string;
  textColor: string;
  hoverColor: string;
  fontSize: number;
  spacing: number;
  useShadow: boolean;
};

export type NavLink = {
  id: string;
  text: string;
  url: string;
  openInNewTab: boolean;
};

export type ContentSection = {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  subsections: SubSection[];
  backgroundColor: string;
  textColor: string;
};

export type SubSection = {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  mediaType: 'image' | 'video' | null;
};

export type TestimonialSection = {
  id: string;
  authorName: string;
  authorRole: string;
  text: string;
  avatarUrl: string;
  rating: number;
};

export type SEOSection = {
  title: string;
  description: string;
  keywords: string[];
};

export type FormField = {
  id: string;
  label: string;
  type: 'text' | 'email' | 'textarea' | 'tel' | 'number';
  placeholder: string;
  required: boolean;
};

export type FormSection = {
  fields: FormField[];
  destinationEmail: string;
};

// New Types for Header Configuration
export type LandingHeaderConfigData = {
    banner: {
        mediaUrl: string | null;
        mediaType: 'image' | 'video' | null;
    };
    businessInfo: {
        name: string;
        address: string;
        phone: string;
        email?: string;
        logoURL?: string; // Add logoURL here
    };
    socialLinks: {
        tiktok: string;
        instagram: string;
        facebook: string;
        whatsapp: string;
        twitter: string;
    };
    carouselItems: CarouselItem[];
};

export type CarouselItem = {
    id: string;
    mediaUrl: string | null;
    mediaType: 'image' | 'video' | null;
    slogan: string;
};
