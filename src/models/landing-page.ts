
export type LandingPageData = {
  hero: HeroSection;
  navigation: NavigationSection;
  sections: ContentSection[];
  testimonials: TestimonialSection[];
  seo: SEOSection;
  form: FormSection;
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
  logoUrl: string;
  businessName: string;
  links: NavLink[];
  backgroundColor: string;
  textColor: string;
  hoverColor: string;
  fontSise: number;
  spacing: number;
  logoAlignment: 'left' | 'center' | 'right';
};

export type NavLink = {
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
  imageUrl: string;
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

export type FormSection = {
    positiveReviewUrl: string;
    internalNotificationEmail: string;
    initialTitle: string;
    initialSubtitle: string;
    negativeFeedbackTitle: string;
    negativeFeedbackSubtitle: string;
    thankYouTitle: string;
    thankYouSubtitle: string;
};
