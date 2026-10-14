// A country hint from the device's language and time zone — never location.
// The server prefers the user's own choice and the IP country.

const TZ: Record<string, string> = {
  "Africa/Lagos": "NG", "Africa/Accra": "GH", "Africa/Nairobi": "KE", "Africa/Johannesburg": "ZA",
  "Africa/Cairo": "EG", "Africa/Casablanca": "MA", "Africa/Abidjan": "CI", "Africa/Kampala": "UG",
  "Africa/Dar_es_Salaam": "TZ", "Africa/Addis_Ababa": "ET", "Africa/Algiers": "DZ", "Africa/Tunis": "TN",
  "Africa/Douala": "CM", "Africa/Dakar": "SN", "Africa/Kigali": "RW", "Africa/Lusaka": "ZM",
  "Africa/Harare": "ZW", "Africa/Maputo": "MZ", "Africa/Luanda": "AO", "Africa/Kinshasa": "CD",
  "Europe/London": "GB", "Europe/Dublin": "IE", "Europe/Paris": "FR", "Europe/Berlin": "DE",
  "Europe/Madrid": "ES", "Europe/Rome": "IT", "Europe/Amsterdam": "NL", "Europe/Brussels": "BE",
  "Europe/Lisbon": "PT", "Europe/Zurich": "CH", "Europe/Vienna": "AT", "Europe/Stockholm": "SE",
  "Europe/Oslo": "NO", "Europe/Copenhagen": "DK", "Europe/Helsinki": "FI", "Europe/Warsaw": "PL",
  "Europe/Prague": "CZ", "Europe/Budapest": "HU", "Europe/Bucharest": "RO", "Europe/Athens": "GR",
  "Europe/Istanbul": "TR", "Europe/Kyiv": "UA", "Europe/Kiev": "UA", "Europe/Moscow": "RU",
  "Asia/Dubai": "AE", "Asia/Riyadh": "SA", "Asia/Qatar": "QA", "Asia/Kuwait": "KW",
  "Asia/Jerusalem": "IL", "Asia/Karachi": "PK", "Asia/Kolkata": "IN", "Asia/Calcutta": "IN",
  "Asia/Dhaka": "BD", "Asia/Bangkok": "TH", "Asia/Jakarta": "ID", "Asia/Manila": "PH",
  "Asia/Singapore": "SG", "Asia/Kuala_Lumpur": "MY", "Asia/Ho_Chi_Minh": "VN", "Asia/Saigon": "VN",
  "Asia/Shanghai": "CN", "Asia/Hong_Kong": "HK", "Asia/Taipei": "TW", "Asia/Seoul": "KR",
  "Asia/Tokyo": "JP", "Australia/Sydney": "AU", "Australia/Melbourne": "AU", "Australia/Brisbane": "AU",
  "Australia/Perth": "AU", "Australia/Adelaide": "AU", "Pacific/Auckland": "NZ",
  "America/New_York": "US", "America/Chicago": "US", "America/Denver": "US", "America/Los_Angeles": "US",
  "America/Phoenix": "US", "America/Anchorage": "US", "Pacific/Honolulu": "US", "America/Detroit": "US",
  "America/Toronto": "CA", "America/Vancouver": "CA", "America/Edmonton": "CA", "America/Winnipeg": "CA",
  "America/Halifax": "CA", "America/Mexico_City": "MX", "America/Bogota": "CO", "America/Lima": "PE",
  "America/Santiago": "CL", "America/Argentina/Buenos_Aires": "AR", "America/Buenos_Aires": "AR",
  "America/Sao_Paulo": "BR", "America/Caracas": "VE", "America/Jamaica": "JM",
};

export function regionHint(): string {
  try {
    const langs = navigator.languages?.length ? navigator.languages : [navigator.language || ""];
    for (const l of langs) {
      const m = /^[a-z]{2,3}(?:[-_][a-z]{4})?[-_]([a-z]{2})(?:[-_]|$)/i.exec(l || "");
      if (m) return m[1].toUpperCase();
    }
  } catch {}
  try {
    const z = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (z && TZ[z]) return TZ[z];
  } catch {}
  return "";
}
