export interface WebsiteChapter {
  id: string;
  title: string;
  badge: string;
  description: string;
  enabled: boolean;
}

export interface WebsiteConfig {
  heroTitle: string;
  heroHighlight: string;
  heroSubtitle: string;
  announcementText: string;
  topBannerText: string;
  topBannerEnabled: boolean;
  maintenanceMode: boolean;
  showcaseEnabled: boolean;
  tarotEnabled: boolean;
  voiceEnabled: boolean;
  downloadEnabled: boolean;
  navagrahaEnabled?: boolean;
  ratings: {
    score: string;
    reviewCount: string;
    todayConsultations: string;
  };
  chapters: WebsiteChapter[];
  tarotSettings: {
    yesNoPrice: number;
    audioReadingEnabled: boolean;
  };
}

export interface ReleaseData {
  currentVersion: string;
  latestVersion: string;
  buildCode: number;
  downloadUrl: string;
  fileSizeMb: number;
  minAndroidVersion: string;
  sha256?: string;
  releaseNotes: string[];
  isMandatory: boolean;
}
