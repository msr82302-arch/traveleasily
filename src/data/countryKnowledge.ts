export interface CountryKnowledgeRecord {
  code: string;
  name: string;
  nameAr: string;
  flag: string;
  officialPortalUrl: string;
  governingAuthority: string;
  lastVerifiedDate: string;
  verificationBadge: string;
  visaCategories: {
    category: string;
    validity: string;
    stayPeriod: string;
    processingTime: string;
    governmentFeeUSD: number;
    description: string;
  }[];
  passportRules: {
    minValidityMonths: number;
    blankPagesRequired: number;
    mrzStandard: string;
  };
  healthAndVaccineRules: string[];
  photoSpecifications: string;
  entryProtocols: string[];
  disclaimerNotice: string;
}

export const COUNTRY_KNOWLEDGE_REGISTRY: Record<string, CountryKnowledgeRecord> = {
  SA: {
    code: 'SA',
    name: 'Saudi Arabia',
    nameAr: 'المملكة العربية السعودية',
    flag: '🇸🇦',
    officialPortalUrl: 'https://visa.visitsaudi.com',
    governingAuthority: 'Ministry of Foreign Affairs & Ministry of Tourism (KSA)',
    lastVerifiedDate: 'November 2026',
    verificationBadge: 'Official Consular Verified • Tier-1 Direct Gateway',
    visaCategories: [
      {
        category: 'Tourist eVisa (Multiple Entry)',
        validity: '1 Year (365 days)',
        stayPeriod: 'Up to 90 days per visit',
        processingTime: '24 – 48 Hours',
        governmentFeeUSD: 140,
        description: 'Covers general tourism, family visits, business meetings, and Umrah outside of Hajj season.',
      },
      {
        category: 'GCC Residents eVisa',
        validity: '1 Year (Multiple) or 3 Months (Single)',
        stayPeriod: 'Up to 90 days',
        processingTime: '12 – 24 Hours',
        governmentFeeUSD: 95,
        description: 'Fast-track clearance for holders of valid Bahraini, Emirati, Qatari, Kuwaiti, or Omani resident permits.',
      },
      {
        category: 'Transit / Stopover Visa',
        validity: '96 Hours (4 days)',
        stayPeriod: 'Up to 96 hours',
        processingTime: 'Instant to 6 Hours',
        governmentFeeUSD: 25,
        description: 'Issued complimentary or low-fee with SAUDIA or Flynas flights for short city layovers.',
      },
    ],
    passportRules: {
      minValidityMonths: 6,
      blankPagesRequired: 2,
      mrzStandard: 'ICAO Doc 9303 Type 3 (Passport Book)',
    },
    healthAndVaccineRules: [
      'Comprehensive COVID-19 and emergency medical insurance automatically bundled into the government visa fee.',
      'Meningococcal (ACWY) vaccination certificate required for pilgrims visiting Holy Sites (Makkah & Madinah).',
      'Yellow Fever vaccination card mandatory if arriving from WHO-classified endemic transmission zones.',
    ],
    photoSpecifications: '200x200px minimum, white background, no eyeglasses, neutral facial expression, 70-80% face coverage.',
    entryProtocols: [
      'King Fahd Causeway (Bahrain to KSA border) accepts digital QR or printed eVisa sheet.',
      'Female travelers can travel solo without a mahram (guardian requirement removed).',
      'Non-Muslim visitors cannot enter the holy precincts of Makkah and Madinah.',
    ],
    disclaimerNotice: 'Easy Travels assists with document validation and automated portal submission. Final grant authority remains with the Saudi Ministry of Foreign Affairs.',
  },

  AE: {
    code: 'AE',
    name: 'United Arab Emirates',
    nameAr: 'الإمارات العربية المتحدة',
    flag: '🇦🇪',
    officialPortalUrl: 'https://icp.gov.ae',
    governingAuthority: 'Federal Authority for Identity, Citizenship, Customs and Port Security (ICP)',
    lastVerifiedDate: 'November 2026',
    verificationBadge: 'Official Consular Verified • Smart ICP Connected',
    visaCategories: [
      {
        category: '30-Day Single Entry Tourist Visa',
        validity: '60 days from issuance',
        stayPeriod: '30 days duration',
        processingTime: '24 – 48 Hours',
        governmentFeeUSD: 95,
        description: 'Standard single entry tourist permit for leisure, business meetings, and visiting relatives.',
      },
      {
        category: '60-Day Multiple Entry Tourist Visa',
        validity: '60 days from issuance',
        stayPeriod: '60 days duration',
        processingTime: '24 – 72 Hours',
        governmentFeeUSD: 185,
        description: 'Extended stay permit allowing multiple entries into Dubai, Abu Dhabi, and Northern Emirates.',
      },
    ],
    passportRules: {
      minValidityMonths: 6,
      blankPagesRequired: 2,
      mrzStandard: 'ICAO Doc 9303 Machine-Readable',
    },
    healthAndVaccineRules: [
      'Valid international travel health insurance required for entry into Dubai and Abu Dhabi.',
      'Yellow fever card required only if originating from countries with risk of yellow fever transmission.',
    ],
    photoSpecifications: 'Passport size 4.3x5.5cm, high resolution, white background, color photograph taken within last 6 months.',
    entryProtocols: [
      'Pre-approved e-Visa must be printed or carried on mobile device with verifiable QR code.',
      'Overstay fines apply immediately upon expiry of the permitted duration of stay without grace period.',
    ],
    disclaimerNotice: 'Approval decisions are issued under the sovereign jurisdiction of the General Directorate of Residency and Foreigners Affairs (GDRFA) and ICP.',
  },

  GB: {
    code: 'GB',
    name: 'United Kingdom',
    nameAr: 'المملكة المتحدة',
    flag: '🇬🇧',
    officialPortalUrl: 'https://www.gov.uk/electronic-travel-authorisation-eta',
    governingAuthority: 'UK Visas and Immigration (UKVI) & Home Office',
    lastVerifiedDate: 'November 2026',
    verificationBadge: 'Official ETA Gateway • UK Home Office Scheme',
    visaCategories: [
      {
        category: 'UK Electronic Travel Authorisation (ETA)',
        validity: '2 Years (Multiple Entry)',
        stayPeriod: 'Up to 6 months per visit',
        processingTime: 'Instant to 3 Business Days',
        governmentFeeUSD: 13,
        description: 'Digital pre-travel permission for nationals of Bahrain, Saudi Arabia, UAE, Qatar, Kuwait, and Oman.',
      },
      {
        category: 'Standard Visitor Visa (Non-ETA Nationalities)',
        validity: '6 Months, 2 Years, or 5 Years',
        stayPeriod: 'Up to 180 days per visit',
        processingTime: '15 Business Days',
        governmentFeeUSD: 145,
        description: 'Consular visa requiring biometric appointment at VFS Global Manama / regional centers.',
      },
    ],
    passportRules: {
      minValidityMonths: 6,
      blankPagesRequired: 2,
      mrzStandard: 'Biometric e-Passport with ICAO Chip / MRZ',
    },
    healthAndVaccineRules: [
      'Tuberculosis (TB) test certificate required only for long-term stays exceeding 6 months from specified countries.',
      'Routine travel health insurance recommended.',
    ],
    photoSpecifications: 'Live selfie capture via UK ETA app or 35x45mm UKVI compliant biometric photo.',
    entryProtocols: [
      'ETA is electronically linked to the traveler passport number; no physical vignette sticker required.',
      'Must travel on the exact passport used during the ETA application.',
    ],
    disclaimerNotice: 'An ETA allows travel to the UK border but does not guarantee entry. A UK Border Force officer will inspect documents upon arrival.',
  },

  BH: {
    code: 'BH',
    name: 'Bahrain',
    nameAr: 'مملكة البحرين',
    flag: '🇧🇭',
    officialPortalUrl: 'https://www.evisa.gov.bh',
    governingAuthority: 'Nationality, Passports & Residence Affairs (NPRA)',
    lastVerifiedDate: 'November 2026',
    verificationBadge: 'Home Territory Direct Desk • Riffa HQ Support',
    visaCategories: [
      {
        category: '2-Week Single Entry Tourist eVisa',
        validity: '30 Days from issuance',
        stayPeriod: '14 Days duration',
        processingTime: '3 – 5 Business Days',
        governmentFeeUSD: 29,
        description: 'For eligible nationalities visiting Bahrain for tourism, exhibitions, or family visits.',
      },
      {
        category: '3-Month Multiple Entry Visit Visa',
        validity: '30 Days from issuance',
        stayPeriod: 'Up to 30 days per entry',
        processingTime: '3 – 5 Business Days',
        governmentFeeUSD: 77,
        description: 'Multiple entry permit with renewable stay periods via NPRA online portal.',
      },
    ],
    passportRules: {
      minValidityMonths: 6,
      blankPagesRequired: 2,
      mrzStandard: 'ICAO Doc 9303',
    },
    healthAndVaccineRules: [
      'Standard yellow fever vaccine required if arriving from infected territory.',
    ],
    photoSpecifications: 'Clear scanned passport bio page with legible MRZ strip; passport photo on plain light background.',
    entryProtocols: [
      'Arrivals via Bahrain International Airport (BAH) or King Fahd Causeway.',
      'GCC citizens do not require visa and may enter using National Identity Card.',
    ],
    disclaimerNotice: 'NPRA Bahrain retains sole authority over entry permits into the Kingdom.',
  },

  TR: {
    code: 'TR',
    name: 'Turkey',
    nameAr: 'تركيا',
    flag: '🇹🇷',
    officialPortalUrl: 'https://www.evisa.gov.tr',
    governingAuthority: 'Ministry of Foreign Affairs, Republic of Türkiye',
    lastVerifiedDate: 'November 2026',
    verificationBadge: 'Official e-Visa Gateway • MFA Türkiye',
    visaCategories: [
      {
        category: 'e-Visa for Tourism & Commerce',
        validity: '180 Days (Multiple Entry)',
        stayPeriod: 'Up to 90 days total',
        processingTime: 'Instant to 2 Hours',
        governmentFeeUSD: 60,
        description: 'Instant electronic visa for eligible passports including GCC nationals and Schengen/US visa holders.',
      },
    ],
    passportRules: {
      minValidityMonths: 6,
      blankPagesRequired: 2,
      mrzStandard: 'ICAO Doc 9303',
    },
    healthAndVaccineRules: ['Travel insurance covering emergency hospitalization within Turkey recommended.'],
    photoSpecifications: 'No photo upload needed for standard e-Visa; matching passport bio details required.',
    entryProtocols: ['Carry a paper copy or mobile electronic copy with legible barcode for border police verification.'],
    disclaimerNotice: 'Electronic visas are valid only when the purpose of travel is tourism or commerce.',
  },

  QA: {
    code: 'QA',
    name: 'Qatar',
    nameAr: 'دولة قطر',
    flag: '🇶🇦',
    officialPortalUrl: 'https://hayya.qa',
    governingAuthority: 'Ministry of Interior (MOI) & Qatar Tourism',
    lastVerifiedDate: 'November 2026',
    verificationBadge: 'Official Hayya Digital System • State of Qatar',
    visaCategories: [
      {
        category: 'Hayya Tourist Entry Permit (A1)',
        validity: '30 Days from issuance',
        stayPeriod: 'Up to 30 days (extendable)',
        processingTime: '24 – 48 Hours',
        governmentFeeUSD: 28,
        description: 'Digital entry permit issued via Hayya platform for tourists and conference attendees.',
      },
      {
        category: 'GCC Residents Permit (A2)',
        validity: '30 Days from issuance',
        stayPeriod: 'Up to 30 days',
        processingTime: '12 – 24 Hours',
        governmentFeeUSD: 28,
        description: 'For approved professions holding valid GCC residency with 3+ months validity.',
      },
    ],
    passportRules: {
      minValidityMonths: 6,
      blankPagesRequired: 2,
      mrzStandard: 'ICAO Machine-Readable',
    },
    healthAndVaccineRules: ['Mandatory health insurance policy approved by the Ministry of Public Health (MOPH) Qatar.'],
    photoSpecifications: 'Recent color photograph with white background, no sunglasses or glare.',
    entryProtocols: ['Entry through Hamad International Airport (DOH) or Abu Samra Land Crossing from KSA.'],
    disclaimerNotice: 'Entry permits are subject to background security clearance by the Qatar Ministry of Interior.',
  },

  US: {
    code: 'US',
    name: 'United States',
    nameAr: 'الولايات المتحدة الأمريكية',
    flag: '🇺🇸',
    officialPortalUrl: 'https://esta.cbp.dhs.gov',
    governingAuthority: 'U.S. Customs and Border Protection (CBP) & Dept of State',
    lastVerifiedDate: 'November 2026',
    verificationBadge: 'Official ESTA Portal & Consular Protocol',
    visaCategories: [
      {
        category: 'ESTA (Visa Waiver Program)',
        validity: '2 Years (Multiple Entry)',
        stayPeriod: 'Up to 90 days per visit',
        processingTime: '72 Hours',
        governmentFeeUSD: 21,
        description: 'For citizens of 41 Visa Waiver Program countries with biometric e-passports.',
      },
      {
        category: 'B1/B2 Non-Immigrant Visitor Visa',
        validity: 'Up to 10 Years (Multiple Entry)',
        stayPeriod: 'Up to 6 months per entry (I-94 determination)',
        processingTime: 'Consular interview dependent',
        governmentFeeUSD: 185,
        description: 'Full consular application with DS-160 lodgement, fee payment, and embassy interview in Manama.',
      },
    ],
    passportRules: {
      minValidityMonths: 6,
      blankPagesRequired: 2,
      mrzStandard: 'Biometric Passport with E-Chip required for ESTA',
    },
    healthAndVaccineRules: ['Routine travel vaccines recommended; medical travel insurance highly advised.'],
    photoSpecifications: '2x2 inches (51x51mm), white background, taken within last 6 months, no eyeglasses permitted.',
    entryProtocols: ['ESTA approval does not guarantee entry; CBP officer at port of entry determines admission.'],
    disclaimerNotice: 'Easy Travels provides DS-160 translation, dossier preparation, and appointment scheduling. We are not affiliated with the US Embassy.',
  },
};
