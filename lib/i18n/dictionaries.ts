import type { Locale } from './config';

export type Dictionary = {
  common: {
    signIn: string;
    signUp: string;
    getStarted: string;
    learnMore: string;
    contactUs: string;
    goToApp: string;
    pricing: string;
    features: string;
    product: string;
    tools: string;
    blog: string;
    resources: string;
    tryNow: string;
    tryNowForFree: string;
    generate: string;
    startFree: string;
    loading: string;
  };

  nav: {
    home: string;
    tools: string;
    blog: string;
    pricing: string;
    features: string;
    contactUs: string;
  };

  footer: {
    aiTools: string;
    freeResources: string;
    marketingResources: string;
    solutions: string;
    companySupport: string;
    resources: string;
    company: string;
    privacyPolicy: string;
    contact: string;
    allRightsReserved: string;
    popularComparisons: string;
    copyright: string;
  };

  home: {
    hero: {
      intro: string;
      title: string;
      titleBrand: string;
      titleEnd: string;
      subtitle: string;
      cta: string;
      promptPlaceholder: string;
      chipAd: string;
      chipStatic: string;
      chipUGC: string;
      trustLink: string;
      blogLink: string;
      jasperLink: string;
      exploreTools: string;
    };
    features: {
      title: string;
      subtitle: string;
      feature1Title: string;
      feature1Desc: string;
      feature2Title: string;
      feature2Desc: string;
      feature3Title: string;
      feature3Desc: string;
    };
    pricing: {
      title: string;
      subtitle: string;
      litePlan: string;
      litePrice: string;
      litePeriod: string;
      liteFeature1: string;
      liteFeature2: string;
      proPlan: string;
      proPrice: string;
      proPeriod: string;
      proFeature1: string;
      proFeature2: string;
    };
    finalCta: {
      title: string;
      note: string;
      contactText: string;
    };
  };

  tools: {
    title: string;
    subtitle: string;
    captionGenerator: string;
    contentGenerator: string;
    blogIdeas: string;
    socialPosts: string;
    sentenceRewriter: string;
    viralPostGenerator: string;
    blogGenerator: string;
    viralAudioFinder: string;
    allTools: string;
    marketingBlog: string;
    jasperAlternative: string;
    bestToolsAgencies: string;
    socialMediaTools: string;
    contentMarketingAI: string;
  };
};

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  en: () => import('@/locales/en.json').then((module) => module.default),
  ar: () => import('@/locales/ar.json').then((module) => module.default),
  fr: () => import('@/locales/fr.json').then((module) => module.default),
};

export const getDictionary = async (locale: Locale): Promise<Dictionary> => {
  try {
    return await dictionaries[locale]();
  } catch (error) {
    console.error(`Failed to load dictionary for locale: ${locale}`, error);
    // Fallback to English
    return await dictionaries['en']();
  }
};
