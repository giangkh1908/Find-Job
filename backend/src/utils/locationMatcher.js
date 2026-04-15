/**
 * Location Fuzzy Matching Utility
 */

// Vietnam cities with aliases
const VIETNAM_CITIES = {
  'hồ chí Minh': ['hồ chí minh', 'ho chi minh', 'tp.hcm', 'tp hcm', 'hcm', 'sài gòn', 'sai gon', 'sg'],
  'hà nội': ['hà nội', 'ha noi', 'hn', 'hanoi'],
  'đà nẵng': ['đà nẵng', 'da nang', 'dn', 'đn'],
  'hải phòng': ['hải phòng', 'hai phong', 'hp'],
  'cần thơ': ['cần thơ', 'can tho', 'ct'],
  'biên hòa': ['biên hòa', 'bien hoa', 'bh'],
  'nha trang': ['nha trang', 'nhatrang'],
  'huế': ['huế', 'hue'],
  'quảng ngãi': ['quảng ngãi', 'quang ngai'],
  'bình dương': ['bình dương', 'binh duong', 'bd'],
  'vũng tàu': ['vũng tàu', 'vung tau', 'vt'],
  'đồng nai': ['đồng nai', 'dong nai'],
  'long an': ['long an'],
  'bắc ninh': ['bắc ninh', 'bac ninh'],
  'bắc giang': ['bắc giang', 'bac giang'],
  'hưng yên': ['hưng yên', 'hung yen'],
  'hải dương': ['hải dương', 'hai duong'],
  'nam định': ['nam định', 'nam dinh'],
  'thái nguyên': ['thái nguyên', 'thai nguyen'],
  'vĩnh phúc': ['vĩnh phúc', 'vinh phuc'],
  'quảng ninh': ['quảng ninh', 'quang ninh'],
  'thanh hóa': ['thanh hóa', 'thanh hoa'],
  'nghệ an': ['nghệ an', 'nghe an'],
  'hà tĩnh': ['hà tĩnh', 'ha tinh'],
  'quảng bình': ['quảng bình', 'quang binh'],
  'quảng trị': ['quảng trị', 'quang tri'],
  'thừa thiên huế': ['thừa thiên huế', 'thua thien hue'],
  'quảng nam': ['quảng nam', 'quang nam'],
  'quảng ngãi': ['quảng ngãi', 'quang ngai'],
  'bình định': ['bình định', 'binh dinh'],
  'phú yên': ['phú yên', 'phu yen'],
  'khánh hòa': ['khánh hòa', 'khanh hoa'],
  'ninh thuận': ['ninh thuận', 'ninh thuan'],
  'bình thuận': ['bình thuận', 'binh thuan'],
  'lâm đồng': ['lâm đồng', 'lam dong'],
  'bình phước': ['bình phước', 'binh phuoc'],
  'tây ninh': ['tây ninh', 'tay ninh'],
  'bạc liêu': ['bạc liêu', 'bac lieu'],
  'cà mau': ['cà mau', 'ca mau'],
  'kiên giang': ['kiên giang', 'kien giang'],
  'an giang': ['an giang'],
  'hậu giang': ['hậu giang', 'hau giang'],
  'tiền giang': ['tiền giang', 'tien giang'],
  'vĩnh long': ['vĩnh long', 'vinh long'],
  'đồng tháp': ['đồng tháp', 'dong thap'],
  'sóc trăng': ['sóc trăng', 'soc trang'],
  'trà vinh': ['trà vinh', 'tra vinh'],
};

function normalizeLocation(loc) {
  if (!loc) return '';
  return loc.toLowerCase()
    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
    .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
    .replace(/[ìíịỉĩ]/g, 'i')
    .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
    .replace(/[ùúụủũưừứựửữ]/g, 'u')
    .replace(/[ỳýỵỷỹ]/g, 'y')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function findCityMatch(locationText) {
  if (!locationText) return null;
  
  const normalized = normalizeLocation(locationText);
  
  for (const [city, aliases] of Object.entries(VIETNAM_CITIES)) {
    // Check if city name is in the location text
    if (normalized.includes(city)) {
      return city;
    }
    
    // Check aliases
    for (const alias of aliases) {
      if (normalized.includes(alias)) {
        return city;
      }
    }
  }
  
  return null;
}

export function matchLocation(jobLocation, preference) {
  if (!preference) return { match: true, score: 5 };
  if (!jobLocation) return { match: false, score: 0 };
  
  const normalizedJob = normalizeLocation(jobLocation);
  const normalizedPref = normalizeLocation(preference);
  
  // Exact match
  if (normalizedJob === normalizedPref) {
    return { match: true, score: 10 };
  }
  
  // Contains match
  if (normalizedJob.includes(normalizedPref) || normalizedPref.includes(normalizedJob)) {
    return { match: true, score: 8 };
  }
  
  // Same city
  const jobCity = findCityMatch(jobLocation);
  const prefCity = findCityMatch(preference);
  
  if (jobCity && prefCity && jobCity === prefCity) {
    return { match: true, score: 7 };
  }
  
  // Check for "(mới)" suffix - new location
  if (normalizedJob.includes('(mới)') || normalizedJob.includes('(moi)')) {
    const baseJob = normalizedJob.replace(/\(mới\)|\(moi\)/, '').trim();
    if (baseJob === normalizedPref || baseJob.includes(normalizedPref)) {
      return { match: true, score: 6 };
    }
  }
  
  // Check for "& X nơi khác" pattern
  if (normalizedJob.includes('&') || normalizedJob.includes('và')) {
    // Job has multiple locations - partial match
    if (findCityMatch(jobLocation) === findCityMatch(preference)) {
      return { match: true, score: 5 };
    }
  }
  
  return { match: false, score: 0 };
}

export function groupJobsByLocation(jobs) {
  const locationGroups = {};
  
  for (const job of jobs) {
    const city = findCityMatch(job.location) || 'Khác';
    if (!locationGroups[city]) {
      locationGroups[city] = [];
    }
    locationGroups[city].push(job);
  }
  
  // Convert to array format with counts
  return Object.entries(locationGroups)
    .map(([city, jobList]) => ({
      city,
      count: jobList.length,
      jobs: jobList,
    }))
    .sort((a, b) => b.count - a.count);
}
