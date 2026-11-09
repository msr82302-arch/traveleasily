export interface SamplePassportPreset {
  id: string;
  countryName: string;
  countryCode: string;
  flag: string;
  holderName: string;
  passportNumber: string;
  nationalityCode: string;
  dob: string;
  gender: 'M' | 'F';
  issueDate: string;
  expiryDate: string;
  mrzLine1: string;
  mrzLine2: string;
  avatarPlaceholder: string;
}

export const SAMPLE_PASSPORT_PRESETS: SamplePassportPreset[] = [
  {
    id: 'bhr_preset',
    countryName: 'Kingdom of Bahrain',
    countryCode: 'BH',
    flag: '🇧🇭',
    holderName: 'Ahmed Mohammed Al-Khalifa',
    passportNumber: 'B82910471',
    nationalityCode: 'BHR',
    dob: '1992-05-14',
    gender: 'M',
    issueDate: '2023-01-10',
    expiryDate: '2033-01-09',
    mrzLine1: 'P<BHRAL<KHALIFA<<AHMED<MOHAMMED<<<<<<<<<<<<<',
    mrzLine2: 'B829104717BHR9205144M3301095<<<<<<<<<<<<<<02',
    avatarPlaceholder: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'sau_preset',
    countryName: 'Kingdom of Saudi Arabia',
    countryCode: 'SA',
    flag: '🇸🇦',
    holderName: 'Fahad Abdullah Al-Otaibi',
    passportNumber: 'S71049281',
    nationalityCode: 'SAU',
    dob: '1988-11-20',
    gender: 'M',
    issueDate: '2022-04-12',
    expiryDate: '2032-04-11',
    mrzLine1: 'P<SAUAL<OTAIBI<<FAHAD<ABDULLAH<<<<<<<<<<<<<',
    mrzLine2: 'S710492814SAU8811208M3204116<<<<<<<<<<<<<<08',
    avatarPlaceholder: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'usa_preset',
    countryName: 'United States of America',
    countryCode: 'US',
    flag: '🇺🇸',
    holderName: 'Sarah Elizabeth Jenkins',
    passportNumber: '542910842',
    nationalityCode: 'USA',
    dob: '1995-08-25',
    gender: 'F',
    issueDate: '2021-06-18',
    expiryDate: '2031-06-17',
    mrzLine1: 'P<USAJENKINS<<SARAH<ELIZABETH<<<<<<<<<<<<<<<',
    mrzLine2: '5429108426USA9508253F3106178<<<<<<<<<<<<<<06',
    avatarPlaceholder: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'gbr_preset',
    countryName: 'United Kingdom',
    countryCode: 'GB',
    flag: '🇬🇧',
    holderName: 'James William Oliver',
    passportNumber: '918237461',
    nationalityCode: 'GBR',
    dob: '1984-03-09',
    gender: 'M',
    issueDate: '2020-09-01',
    expiryDate: '2030-08-31',
    mrzLine1: 'P<GBROLIVER<<JAMES<WILLIAM<<<<<<<<<<<<<<<<<<',
    mrzLine2: '9182374613GBR8403099M3008315<<<<<<<<<<<<<<04',
    avatarPlaceholder: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'deu_preset',
    countryName: 'Germany',
    countryCode: 'DE',
    flag: '🇩🇪',
    holderName: 'Anna Maria Schmidt',
    passportNumber: 'C01X00T47',
    nationalityCode: 'DEU',
    dob: '1990-12-03',
    gender: 'F',
    issueDate: '2022-02-15',
    expiryDate: '2032-02-14',
    mrzLine1: 'P<DEUSCHMIDT<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<<',
    mrzLine2: 'C01X00T478DEU9012036F3202142<<<<<<<<<<<<<<00',
    avatarPlaceholder: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
  },
  {
    id: 'jpn_preset',
    countryName: 'Japan',
    countryCode: 'JP',
    flag: '🇯🇵',
    holderName: 'Kenji Sato',
    passportNumber: 'TZ8391024',
    nationalityCode: 'JPN',
    dob: '1993-07-19',
    gender: 'M',
    issueDate: '2023-08-20',
    expiryDate: '2033-08-19',
    mrzLine1: 'P<JPNSATO<<KENJI<<<<<<<<<<<<<<<<<<<<<<<<<<<<',
    mrzLine2: 'TZ83910244JPN9307191M3308197<<<<<<<<<<<<<<05',
    avatarPlaceholder: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
  }
];
