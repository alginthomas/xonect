// Phone number utilities for country detection and validation

export interface CountryInfo {
  name: string;
  code: string;
  flag: string;
}

// Comprehensive mapping of international dialing codes to countries
export const COUNTRY_CODES: Record<string, CountryInfo> = {
  // North America
  '1': { name: 'United States', code: 'US', flag: '🇺🇸' },
  
  // Europe
  '33': { name: 'France', code: 'FR', flag: '🇫🇷' },
  '34': { name: 'Spain', code: 'ES', flag: '🇪🇸' },
  '39': { name: 'Italy', code: 'IT', flag: '🇮🇹' },
  '41': { name: 'Switzerland', code: 'CH', flag: '🇨🇭' },
  '43': { name: 'Austria', code: 'AT', flag: '🇦🇹' },
  '44': { name: 'United Kingdom', code: 'GB', flag: '🇬🇧' },
  '45': { name: 'Denmark', code: 'DK', flag: '🇩🇰' },
  '46': { name: 'Sweden', code: 'SE', flag: '🇸🇪' },
  '47': { name: 'Norway', code: 'NO', flag: '🇳🇴' },
  '48': { name: 'Poland', code: 'PL', flag: '🇵🇱' },
  '49': { name: 'Germany', code: 'DE', flag: '🇩🇪' },
  
  // Asia Pacific
  '81': { name: 'Japan', code: 'JP', flag: '🇯🇵' },
  '82': { name: 'South Korea', code: 'KR', flag: '🇰🇷' },
  '84': { name: 'Vietnam', code: 'VN', flag: '🇻🇳' },
  '86': { name: 'China', code: 'CN', flag: '🇨🇳' },
  '91': { name: 'India', code: 'IN', flag: '🇮🇳' },
  '92': { name: 'Pakistan', code: 'PK', flag: '🇵🇰' },
  '93': { name: 'Afghanistan', code: 'AF', flag: '🇦🇫' },
  '94': { name: 'Sri Lanka', code: 'LK', flag: '🇱🇰' },
  '95': { name: 'Myanmar', code: 'MM', flag: '🇲🇲' },
  '98': { name: 'Iran', code: 'IR', flag: '🇮🇷' },
  
  // Middle East
  '90': { name: 'Turkey', code: 'TR', flag: '🇹🇷' },
  '966': { name: 'Saudi Arabia', code: 'SA', flag: '🇸🇦' },
  '971': { name: 'UAE', code: 'AE', flag: '🇦🇪' },
  '972': { name: 'Israel', code: 'IL', flag: '🇮🇱' },
  '973': { name: 'Bahrain', code: 'BH', flag: '🇧🇭' },
  '974': { name: 'Qatar', code: 'QA', flag: '🇶🇦' },
  '975': { name: 'Bhutan', code: 'BT', flag: '🇧🇹' },
  '976': { name: 'Mongolia', code: 'MN', flag: '🇲🇳' },
  '977': { name: 'Nepal', code: 'NP', flag: '🇳🇵' },
  
  // Africa
  '20': { name: 'Egypt', code: 'EG', flag: '🇪🇬' },
  '27': { name: 'South Africa', code: 'ZA', flag: '🇿🇦' },
  '212': { name: 'Morocco', code: 'MA', flag: '🇲🇦' },
  '213': { name: 'Algeria', code: 'DZ', flag: '🇩🇿' },
  '216': { name: 'Tunisia', code: 'TN', flag: '🇹🇳' },
  '218': { name: 'Libya', code: 'LY', flag: '🇱🇾' },
  '220': { name: 'Gambia', code: 'GM', flag: '🇬🇲' },
  '221': { name: 'Senegal', code: 'SN', flag: '🇸🇳' },
  '222': { name: 'Mauritania', code: 'MR', flag: '🇲🇷' },
  '223': { name: 'Mali', code: 'ML', flag: '🇲🇱' },
  '224': { name: 'Guinea', code: 'GN', flag: '🇬🇳' },
  '225': { name: 'Ivory Coast', code: 'CI', flag: '🇨🇮' },
  '226': { name: 'Burkina Faso', code: 'BF', flag: '🇧🇫' },
  '227': { name: 'Niger', code: 'NE', flag: '🇳🇪' },
  '228': { name: 'Togo', code: 'TG', flag: '🇹🇬' },
  '229': { name: 'Benin', code: 'BJ', flag: '🇧🇯' },
  '230': { name: 'Mauritius', code: 'MU', flag: '🇲🇺' },
  '231': { name: 'Liberia', code: 'LR', flag: '🇱🇷' },
  '232': { name: 'Sierra Leone', code: 'SL', flag: '🇸🇱' },
  '233': { name: 'Ghana', code: 'GH', flag: '🇬🇭' },
  '234': { name: 'Nigeria', code: 'NG', flag: '🇳🇬' },
  '235': { name: 'Chad', code: 'TD', flag: '🇹🇩' },
  '236': { name: 'Central African Republic', code: 'CF', flag: '🇨🇫' },
  '237': { name: 'Cameroon', code: 'CM', flag: '🇨🇲' },
  '238': { name: 'Cape Verde', code: 'CV', flag: '🇨🇻' },
  '239': { name: 'São Tomé and Príncipe', code: 'ST', flag: '🇸🇹' },
  '240': { name: 'Equatorial Guinea', code: 'GQ', flag: '🇬🇶' },
  '241': { name: 'Gabon', code: 'GA', flag: '🇬🇦' },
  '242': { name: 'Republic of the Congo', code: 'CG', flag: '🇨🇬' },
  '243': { name: 'Democratic Republic of the Congo', code: 'CD', flag: '🇨🇩' },
  '244': { name: 'Angola', code: 'AO', flag: '🇦🇴' },
  '245': { name: 'Guinea-Bissau', code: 'GW', flag: '🇬🇼' },
  '246': { name: 'British Indian Ocean Territory', code: 'IO', flag: '🇮🇴' },
  '248': { name: 'Seychelles', code: 'SC', flag: '🇸🇨' },
  '249': { name: 'Sudan', code: 'SD', flag: '🇸🇩' },
  '250': { name: 'Rwanda', code: 'RW', flag: '🇷🇼' },
  '251': { name: 'Ethiopia', code: 'ET', flag: '🇪🇹' },
  '252': { name: 'Somalia', code: 'SO', flag: '🇸🇴' },
  '253': { name: 'Djibouti', code: 'DJ', flag: '🇩🇯' },
  '254': { name: 'Kenya', code: 'KE', flag: '🇰🇪' },
  '255': { name: 'Tanzania', code: 'TZ', flag: '🇹🇿' },
  '256': { name: 'Uganda', code: 'UG', flag: '🇺🇬' },
  '257': { name: 'Burundi', code: 'BI', flag: '🇧🇮' },
  '258': { name: 'Mozambique', code: 'MZ', flag: '🇲🇿' },
  '260': { name: 'Zambia', code: 'ZM', flag: '🇿🇲' },
  '261': { name: 'Madagascar', code: 'MG', flag: '🇲🇬' },
  '262': { name: 'Mayotte', code: 'YT', flag: '🇾🇹' },
  '263': { name: 'Zimbabwe', code: 'ZW', flag: '🇿🇼' },
  '264': { name: 'Namibia', code: 'NA', flag: '🇳🇦' },
  '265': { name: 'Malawi', code: 'MW', flag: '🇲🇼' },
  '266': { name: 'Lesotho', code: 'LS', flag: '🇱🇸' },
  '267': { name: 'Botswana', code: 'BW', flag: '🇧🇼' },
  '268': { name: 'Eswatini', code: 'SZ', flag: '🇸🇿' },
  '269': { name: 'Comoros', code: 'KM', flag: '🇰🇲' },
  
  // South America
  '54': { name: 'Argentina', code: 'AR', flag: '🇦🇷' },
  '55': { name: 'Brazil', code: 'BR', flag: '🇧🇷' },
  '56': { name: 'Chile', code: 'CL', flag: '🇨🇱' },
  '57': { name: 'Colombia', code: 'CO', flag: '🇨🇴' },
  '58': { name: 'Venezuela', code: 'VE', flag: '🇻🇪' },
  '591': { name: 'Bolivia', code: 'BO', flag: '🇧🇴' },
  '592': { name: 'Guyana', code: 'GY', flag: '🇬🇾' },
  '593': { name: 'Ecuador', code: 'EC', flag: '🇪🇨' },
  '594': { name: 'French Guiana', code: 'GF', flag: '🇬🇫' },
  '595': { name: 'Paraguay', code: 'PY', flag: '🇵🇾' },
  '596': { name: 'Martinique', code: 'MQ', flag: '🇲🇶' },
  '597': { name: 'Suriname', code: 'SR', flag: '🇸🇷' },
  '598': { name: 'Uruguay', code: 'UY', flag: '🇺🇾' },
  
  // Oceania
  '61': { name: 'Australia', code: 'AU', flag: '🇦🇺' },
  '64': { name: 'New Zealand', code: 'NZ', flag: '🇳🇿' },
  '679': { name: 'Fiji', code: 'FJ', flag: '🇫🇯' },
  '685': { name: 'Samoa', code: 'WS', flag: '🇼🇸' },
  '686': { name: 'Kiribati', code: 'KI', flag: '🇰🇮' },
  '687': { name: 'New Caledonia', code: 'NC', flag: '🇳🇨' },
  '688': { name: 'Tuvalu', code: 'TV', flag: '🇹🇻' },
  '689': { name: 'French Polynesia', code: 'PF', flag: '🇵🇫' },
  '690': { name: 'Tokelau', code: 'TK', flag: '🇹🇰' },
  
  // Additional countries
  '52': { name: 'Mexico', code: 'MX', flag: '🇲🇽' },
  '53': { name: 'Cuba', code: 'CU', flag: '🇨🇺' },
  '60': { name: 'Malaysia', code: 'MY', flag: '🇲🇾' },
  '62': { name: 'Indonesia', code: 'ID', flag: '🇮🇩' },
  '63': { name: 'Philippines', code: 'PH', flag: '🇵🇭' },
  '65': { name: 'Singapore', code: 'SG', flag: '🇸🇬' },
  '66': { name: 'Thailand', code: 'TH', flag: '🇹🇭' },
  '351': { name: 'Portugal', code: 'PT', flag: '🇵🇹' },
  '352': { name: 'Luxembourg', code: 'LU', flag: '🇱🇺' },
  '353': { name: 'Ireland', code: 'IE', flag: '🇮🇪' },
  '354': { name: 'Iceland', code: 'IS', flag: '🇮🇸' },
  '355': { name: 'Albania', code: 'AL', flag: '🇦🇱' },
  '356': { name: 'Malta', code: 'MT', flag: '🇲🇹' },
  '357': { name: 'Cyprus', code: 'CY', flag: '🇨🇾' },
  '358': { name: 'Finland', code: 'FI', flag: '🇫🇮' },
  '359': { name: 'Bulgaria', code: 'BG', flag: '🇧🇬' },
  '370': { name: 'Lithuania', code: 'LT', flag: '🇱🇹' },
  '371': { name: 'Latvia', code: 'LV', flag: '🇱🇻' },
  '372': { name: 'Estonia', code: 'EE', flag: '🇪🇪' },
  '373': { name: 'Moldova', code: 'MD', flag: '🇲🇩' },
  '374': { name: 'Armenia', code: 'AM', flag: '🇦🇲' },
  '375': { name: 'Belarus', code: 'BY', flag: '🇧🇾' },
  '376': { name: 'Andorra', code: 'AD', flag: '🇦🇩' },
  '377': { name: 'Monaco', code: 'MC', flag: '🇲🇨' },
  '378': { name: 'San Marino', code: 'SM', flag: '🇸🇲' },
  '380': { name: 'Ukraine', code: 'UA', flag: '🇺🇦' },
  '381': { name: 'Serbia', code: 'RS', flag: '🇷🇸' },
  '382': { name: 'Montenegro', code: 'ME', flag: '🇲🇪' },
  '383': { name: 'Kosovo', code: 'XK', flag: '🇽🇰' },
  '385': { name: 'Croatia', code: 'HR', flag: '🇭🇷' },
  '386': { name: 'Slovenia', code: 'SI', flag: '🇸🇮' },
  '387': { name: 'Bosnia and Herzegovina', code: 'BA', flag: '🇧🇦' },
  '389': { name: 'North Macedonia', code: 'MK', flag: '🇲🇰' },
  '420': { name: 'Czech Republic', code: 'CZ', flag: '🇨🇿' },
  '421': { name: 'Slovakia', code: 'SK', flag: '🇸🇰' },
  '423': { name: 'Liechtenstein', code: 'LI', flag: '🇱🇮' },
  '500': { name: 'Falkland Islands', code: 'FK', flag: '🇫🇰' },
  '501': { name: 'Belize', code: 'BZ', flag: '🇧🇿' },
  '502': { name: 'Guatemala', code: 'GT', flag: '🇬🇹' },
  '503': { name: 'El Salvador', code: 'SV', flag: '🇸🇻' },
  '504': { name: 'Honduras', code: 'HN', flag: '🇭🇳' },
  '505': { name: 'Nicaragua', code: 'NI', flag: '🇳🇮' },
  '506': { name: 'Costa Rica', code: 'CR', flag: '🇨🇷' },
  '507': { name: 'Panama', code: 'PA', flag: '🇵🇦' },
  '508': { name: 'Saint Pierre and Miquelon', code: 'PM', flag: '🇵🇲' },
  '509': { name: 'Haiti', code: 'HT', flag: '🇭🇹' },
  '590': { name: 'Guadeloupe', code: 'GP', flag: '🇬🇵' },
  '7': { name: 'Russia', code: 'RU', flag: '🇷🇺' },
};

/**
 * Extract country code from phone number
 */
export const extractCountryCode = (phoneNumber: string): string | null => {
  if (!phoneNumber) return null;
  
  // Remove all non-digit characters
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  
  if (!digitsOnly) return null;
  
  // Remove leading zeros
  const cleanNumber = digitsOnly.replace(/^0+/, '');
  
  if (!cleanNumber) return null;
  
  // Try to match country codes (longest first to avoid conflicts)
  const sortedCodes = Object.keys(COUNTRY_CODES).sort((a, b) => b.length - a.length);
  
  for (const code of sortedCodes) {
    if (cleanNumber.startsWith(code)) {
      return code;
    }
  }
  
  return null;
};

/**
 * Get country information from phone number
 */
export const getCountryFromPhoneNumber = (phoneNumber: string): CountryInfo | null => {
  const countryCode = extractCountryCode(phoneNumber);
  
  if (!countryCode || !COUNTRY_CODES[countryCode]) {
    return null;
  }
  
  return COUNTRY_CODES[countryCode];
};

/**
 * Get country name from phone number (convenience function)
 */
export const getCountryNameFromPhoneNumber = (phoneNumber: string): string => {
  const countryInfo = getCountryFromPhoneNumber(phoneNumber);
  return countryInfo ? countryInfo.name : 'Unknown';
};

/**
 * Get all unique countries from a list of leads
 */
export const getUniqueCountriesFromLeads = (leads: { phone?: string }[]): CountryInfo[] => {
  const countryMap = new Map<string, CountryInfo>();
  
  leads.forEach(lead => {
    if (lead.phone) {
      const countryInfo = getCountryFromPhoneNumber(lead.phone);
      if (countryInfo) {
        countryMap.set(countryInfo.code, countryInfo);
      }
    }
  });
  
  return Array.from(countryMap.values()).sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * Validate phone number format
 */
export const isValidPhoneNumber = (phoneNumber: string): boolean => {
  if (!phoneNumber) return false;
  
  const digitsOnly = phoneNumber.replace(/\D/g, '');
  
  // Phone number should have at least 7 digits and at most 15 digits
  return digitsOnly.length >= 7 && digitsOnly.length <= 15;
};

/**
 * Format phone number with country info
 */
export const formatPhoneWithCountry = (phoneNumber: string): string => {
  const countryInfo = getCountryFromPhoneNumber(phoneNumber);
  
  if (!countryInfo) {
    return phoneNumber;
  }
  
  return `${countryInfo.flag} ${phoneNumber}`;
};