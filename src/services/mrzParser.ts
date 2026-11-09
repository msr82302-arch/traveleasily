import { MRZExtractedData } from '../types/visa';

// ICAO Doc 9303 Check Digit Weight Multipliers: 7, 3, 1 repeating
const WEIGHTS = [7, 3, 1];

function getCharValue(char: string): number {
  if (char >= '0' && char <= '9') {
    return char.charCodeAt(0) - '0'.charCodeAt(0);
  }
  if (char >= 'A' && char <= 'Z') {
    return char.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
  }
  if (char === '<') {
    return 0;
  }
  return 0;
}

export function computeCheckDigit(input: string): number {
  let sum = 0;
  for (let i = 0; i < input.length; i++) {
    const val = getCharValue(input[i]);
    const weight = WEIGHTS[i % 3];
    sum += val * weight;
  }
  return sum % 10;
}

export function verifyCheckDigit(input: string, checkDigitChar: string): boolean {
  const expected = computeCheckDigit(input);
  const actual = parseInt(checkDigitChar, 10);
  return expected === actual;
}

function parseYYMMDD(yymmdd: string, isExpiry = false): string {
  if (!yymmdd || yymmdd.length !== 6) return '';
  const yy = parseInt(yymmdd.substring(0, 2), 10);
  const mm = yymmdd.substring(2, 4);
  const dd = yymmdd.substring(4, 6);

  // Century inference:
  // For expiry: usually current century (2000s)
  // For birth: if yy > 26 (current year 26 in 2026), 19xx; otherwise 20xx
  let fullYear: number;
  if (isExpiry) {
    fullYear = 2000 + yy;
  } else {
    fullYear = yy > 26 ? 1900 + yy : 2000 + yy;
  }

  return `${fullYear}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
}

export function parseTD3MRZ(line1Raw: string, line2Raw: string): MRZExtractedData {
  const line1 = line1Raw.toUpperCase().padEnd(44, '<').substring(0, 44);
  const line2 = line2Raw.toUpperCase().padEnd(44, '<').substring(0, 44);

  const warnings: string[] = [];

  // Line 1:
  // 0-1: Type ('P<')
  const docType = (line1.charAt(0) === 'P' ? 'P' : 'I') as 'P' | 'I' | 'V';
  const issuingCountry = line1.substring(2, 5).replace(/</g, '').trim();

  // 5-43: Names
  const namePart = line1.substring(5, 44);
  const nameSplit = namePart.split('<<');
  const surname = (nameSplit[0] || '').replace(/</g, ' ').trim();
  const givenNames = (nameSplit[1] || '').replace(/</g, ' ').trim();
  const fullName = `${givenNames} ${surname}`.trim();

  // Line 2:
  // 0-8: Passport Number (9 chars)
  const passportNumberRaw = line2.substring(0, 9);
  const passportNumber = passportNumberRaw.replace(/</g, '').trim();
  const passportCheck = line2.charAt(9);
  const passportNumberValid = verifyCheckDigit(passportNumberRaw, passportCheck);

  // 10-12: Nationality (3 chars)
  const nationality = line2.substring(10, 13).replace(/</g, '').trim();

  // 13-18: Date of Birth (YYMMDD)
  const dobRaw = line2.substring(13, 19);
  const dobCheck = line2.charAt(19);
  const dobValid = verifyCheckDigit(dobRaw, dobCheck);
  const dateOfBirth = parseYYMMDD(dobRaw, false);

  // 20: Gender
  const sexChar = line2.charAt(20);
  const gender: 'M' | 'F' | 'X' = sexChar === 'M' ? 'M' : sexChar === 'F' ? 'F' : 'X';

  // 21-26: Expiry Date (YYMMDD)
  const expiryRaw = line2.substring(21, 27);
  const expiryCheck = line2.charAt(27);
  const expiryValid = verifyCheckDigit(expiryRaw, expiryCheck);
  const expirationDate = parseYYMMDD(expiryRaw, true);

  // 43: Composite check digit
  const compositeString =
    passportNumberRaw + passportCheck + dobRaw + dobCheck + expiryRaw + expiryCheck + line2.substring(28, 43);
  const compositeCheck = line2.charAt(43);
  const compositeValid = verifyCheckDigit(compositeString, compositeCheck);

  // Check passport expiry within 6 months rule
  if (expirationDate) {
    const expiryDateObj = new Date(expirationDate);
    const sixMonthsFuture = new Date();
    sixMonthsFuture.setMonth(sixMonthsFuture.getMonth() + 6);
    if (expiryDateObj < sixMonthsFuture) {
      warnings.push('Warning: Passport expires in less than 6 months. Many destination embassies may reject application.');
    }
  }

  if (!passportNumberValid) {
    warnings.push('Document number checksum verification discrepancy detected. Please verify visually.');
  }

  // Calculate field confidence
  const docConfidence = passportNumberValid ? 98 : 78;
  const dobConfidence = dobValid ? 96 : 74;
  const expiryConfidence = expiryValid ? 97 : 75;
  const surnameConfidence = surname.length > 1 ? 95 : 65;
  const givenConfidence = givenNames.length > 1 ? 95 : 65;
  const natConfidence = nationality.length === 3 ? 98 : 70;
  const genConfidence = gender !== 'X' ? 99 : 80;

  const overallConfidence = Math.round(
    (docConfidence + dobConfidence + expiryConfidence + surnameConfidence + givenConfidence + natConfidence) / 6
  );

  return {
    documentType: docType,
    documentNumber: passportNumber,
    documentNumberConfidence: docConfidence,
    surname,
    surnameConfidence,
    givenNames,
    givenNamesConfidence: givenConfidence,
    fullName,
    nationality,
    nationalityConfidence: natConfidence,
    dateOfBirth,
    dobConfidence,
    gender,
    genderConfidence: genConfidence,
    expirationDate,
    expiryConfidence,
    issuingCountry,
    rawMRZLines: [line1, line2],
    overallConfidence,
    checksumValid: passportNumberValid && dobValid && expiryValid,
    warnings,
  };
}
