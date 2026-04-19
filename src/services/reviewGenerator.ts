/**
 * Review Generator for OrbiTrip Drivers
 * Generates unique, realistic tourist reviews for each driver
 * Reviews span 7 years (2019-2026) and mention real Georgian locations
 */

// Tourist name pools by nationality
const TOURIST_NAMES: Record<string, string[]> = {
  US: ['Mike Johnson', 'Sarah Williams', 'David Brown', 'Jessica Davis', 'Chris Miller', 'Emily Wilson', 'James Moore', 'Amanda Taylor', 'Robert Anderson', 'Lisa Thomas', 'William Jackson', 'Jennifer White', 'John Harris', 'Michelle Martin', 'Daniel Thompson'],
  UK: ['Oliver Smith', 'Charlotte Jones', 'George Williams', 'Amelia Brown', 'Harry Taylor', 'Sophie Davies', 'Jack Wilson', 'Olivia Evans', 'Thomas Roberts', 'Emma Johnson', 'James Walker', 'Isabella Wright', 'William Hall', 'Mia Green', 'Alexander King'],
  DE: ['Maximilian Müller', 'Sophie Schmidt', 'Felix Weber', 'Anna Fischer', 'Leon Wagner', 'Marie Becker', 'Paul Hoffmann', 'Laura Schäfer', 'Lucas Koch', 'Hannah Bauer', 'Elias Richter', 'Lena Wolf', 'Noah Klein', 'Johanna Lang', 'Finn Schwarz'],
  FR: ['Louis Martin', 'Camille Dubois', 'Hugo Bernard', 'Léa Moreau', 'Arthur Petit', 'Manon Leroy', 'Gabriel Robert', 'Emma Simon', 'Raphaël Laurent', 'Chloé Michel', 'Jules Lefebvre', 'Inès Garcia', 'Adam Thomas', 'Sarah David', 'Lucas Richard'],
  IT: ['Marco Rossi', 'Giulia Romano', 'Alessandro Colombo', 'Sofia Ricci', 'Lorenzo Ferrari', 'Aurora Russo', 'Matteo Gallo', 'Francesca Costa', 'Leonardo Greco', 'Chiara Mancini', 'Gabriele Bruno', 'Alice Fontana', 'Davide Conti', 'Martina Esposito', 'Andrea Lombardi'],
  PL: ['Jan Kowalski', 'Anna Nowak', 'Krzysztof Wójcik', 'Maria Kamińska', 'Piotr Lewandowski', 'Katarzyna Zielińska', 'Tomasz Szymański', 'Aleksandra Woźniak', 'Marcin Dąbrowski', 'Monika Kozłowska', 'Paweł Jankowski', 'Agnieszka Mazur', 'Adam Krawczyk', 'Ewa Piotrowska', 'Michał Grabowski'],
  IL: ['Yossi Cohen', 'Noa Levy', 'Avi Mizrahi', 'Shira Peretz', 'Eitan Goldberg', 'Maya Friedman', 'Oren Shapiro', 'Tali Katz', 'Amir Ben-David', 'Dana Levi', 'Itai Rosenberg', 'Yael Stern', 'Roi Avraham', 'Shani Mor', 'Gil Dayan'],
  RU: ['Aleksey Ivanov', 'Olga Smirnova', 'Dmitry Kuznetsov', 'Ekaterina Popova', 'Andrey Volkov', 'Marina Sokolova', 'Sergey Lebedev', 'Natalia Kozlova', 'Pavel Novikov', 'Irina Morozova', 'Nikolay Petrov', 'Tatiana Fedorova', 'Anton Orlov', 'Yulia Makarova', 'Viktor Egorov'],
  CN: ['Wei Zhang', 'Xiao Li', 'Ming Wang', 'Ying Liu', 'Hao Chen', 'Mei Yang', 'Jun Huang', 'Fang Zhou', 'Tao Wu', 'Lan Xu', 'Lei Sun', 'Hui Ma', 'Peng Hu', 'Na Guo', 'Jie Lin'],
  KR: ['Minjun Kim', 'Soyeon Park', 'Jiwon Lee', 'Yuna Choi', 'Seojun Jung', 'Hayeon Kang', 'Hyunwoo Cho', 'Jimin Yoon', 'Dohyun Lim', 'Haeun Song', 'Junsu Han', 'Subin Oh', 'Taeyang Shin', 'Eunbi Kwon', 'Jihoon Ryu'],
  AU: ['Liam Mitchell', 'Ella Thompson', 'Noah Campbell', 'Grace Stewart', 'Ethan Murray', 'Ruby Phillips', 'Oliver Watson', 'Chloe Morgan', 'William Fraser', 'Zoe Palmer', 'Jack Robertson', 'Mia Spencer', 'Cooper Reid', 'Lily Burns', 'Mason Sullivan'],
  TR: ['Emre Yilmaz', 'Elif Kaya', 'Burak Demir', 'Zeynep Öztürk', 'Kaan Çelik', 'Selin Aydın', 'Mert Yildiz', 'Derya Polat', 'Caner Şahin', 'Esra Arslan', 'Oğuz Koç', 'İpek Erdoğan', 'Arda Aksoy', 'Buse Özkan', 'Deniz Kurt'],
};

// Georgian locations and transfers
const TRANSFERS = [
  'Tbilisi to Kazbegi', 'Tbilisi to Batumi', 'Kutaisi to Batumi', 'Tbilisi to Kutaisi',
  'Batumi to Borjomi', 'Tbilisi to Sighnaghi', 'Kutaisi to Martvili Canyon', 'Tbilisi to Gudauri',
  'Batumi to Sarpi border', 'Kutaisi Airport transfer', 'Tbilisi Airport pickup', 'Batumi Airport transfer',
  'Tbilisi to Mtskheta', 'Tbilisi to David Gareja', 'Tbilisi to Ananuri', 'Kutaisi to Okatse Canyon',
  'Batumi to Gonio', 'Tbilisi to Jvari Monastery', 'Batumi to Kutaisi', 'Tbilisi to Tusheti',
  'Kutaisi to Prometheus Cave', 'Tbilisi to Borjomi', 'Batumi to Machakhela', 'Tbilisi to Vardzia',
  'Kutaisi to Sataplia', 'Batumi to Kintrishi', 'Tbilisi to Uplistsikhe', 'Kutaisi to Gelati',
];

const LANDMARKS = [
  'Okatse Canyon', 'Martvili Canyon', 'Prometheus Cave', 'Kazbegi', 'Mtskheta', 'Sighnaghi',
  'Ananuri Fortress', 'Gudauri', 'Gergeti Trinity Church', 'Jvari Monastery', 'David Gareja',
  'Borjomi', 'Vardzia', 'Uplistsikhe', 'Batumi Boulevard', 'Old Tbilisi', 'Narikala Fortress',
  'Tsinandali', 'Telavi', 'Svaneti', 'Mestia', 'Ushguli', 'Sataplia', 'Gelati Monastery',
  'Bagrati Cathedral', 'Rabati Castle', 'Kintrishi Reserve', 'Machakhela Gorge', 'Gonio Fortress',
  'Botanical Garden Batumi', 'Abanotubani', 'Rustaveli Avenue', 'Bridge of Peace',
];

// Templates for review text generation
const REVIEW_TEMPLATES_EN = [
  (name: string, car: string, loc: string) => `${name} was an incredible driver! We took the ${loc} route and the ${car} was perfect for our group. Highly recommend!`,
  (name: string, car: string, loc: string) => `Our trip to ${loc} with ${name} was unforgettable. The ${car} was clean, comfortable, and ${name} knew all the best photo spots along the way.`,
  (name: string, car: string, loc: string) => `What an amazing experience! ${name} picked us up right on time in a pristine ${car}. The drive to ${loc} was spectacular and ${name} was so knowledgeable about Georgian history.`,
  (name: string, car: string, loc: string) => `We booked ${name} for our ${loc} transfer and couldn't be happier. The ${car} handled the mountain roads perfectly. ${name} even stopped for us to try local wine!`,
  (name: string, car: string, loc: string) => `Five stars isn't enough for ${name}! Our ${loc} trip in the ${car} was the highlight of our Georgia vacation. Safe driving, great conversation, and ${name} recommended an amazing restaurant.`,
  (name: string, car: string, loc: string) => `${name} made our ${loc} day trip absolutely magical. The ${car} was spotless and ${name} spoke excellent English. We felt so safe on the winding roads.`,
  (name: string, car: string, loc: string) => `Fantastic service! ${name} was punctual, professional, and the ${car} was very comfortable for our long drive to ${loc}. Would definitely book again.`,
  (name: string, car: string, loc: string) => `Best driver in Georgia! We hired ${name} for the ${loc} route and the ${car} was in perfect condition. ${name} went above and beyond, stopping at hidden viewpoints.`,
  (name: string, car: string, loc: string) => `We were nervous about driving in Georgia but ${name} made us feel completely at ease. The ${car} was great and the ${loc} scenery was breathtaking. Thank you, ${name}!`,
  (name: string, car: string, loc: string) => `${name} is an exceptional driver! The ${loc} transfer in the ${car} was smooth and comfortable. Even our kids loved the trip. Water bottles and WiFi included!`,
  (name: string, car: string, loc: string) => `Used ${name} twice during our trip — once for ${loc} and once for airport transfer. Both times the ${car} was clean and ${name} was on time. Professional service.`,
  (name: string, car: string, loc: string) => `The ${loc} trip was a dream come true thanks to ${name}. The ${car} had AC which was essential in the summer heat. ${name} shared fascinating stories about the region.`,
  (name: string, car: string, loc: string) => `I usually don't write reviews but ${name} deserves one. Our ${loc} journey in the ${car} was absolutely perfect. The car was spacious enough for all our luggage too.`,
  (name: string, car: string, loc: string) => `Third time using OrbiTrip and ${name} is by far the best driver we've had. The ${car} was immaculate for our ${loc} trip. Already booked ${name} for tomorrow!`,
  (name: string, car: string, loc: string) => `${name} picked us up from the airport in a beautiful ${car} and drove us to ${loc}. The price was fair, the service was premium. Georgia needs more drivers like ${name}!`,
  (name: string, car: string, loc: string) => `Absolutely wonderful experience with ${name}! The ${loc} route was beautiful and the ${car} made the journey so comfortable. ${name} even helped carry our bags.`,
  (name: string, car: string, loc: string) => `We traveled with ${name} to ${loc} and it was the best decision of our trip. The ${car} was modern and well-maintained. ${name} was patient when we took too many photos!`,
  (name: string, car: string, loc: string) => `Our family of four fit perfectly in ${name}'s ${car} for the ${loc} trip. Great AC, smooth ride, and ${name} found us amazing khinkali on the way back!`,
  (name: string, car: string, loc: string) => `${name} is a gem! Professional, friendly, and the ${car} was top-notch. The ${loc} transfer was exactly what we needed. Will recommend to all friends visiting Georgia.`,
  (name: string, car: string, loc: string) => `Incredible day trip to ${loc} with ${name}. The ${car} was comfortable even on rough roads. ${name} waited for us at every stop without any rush. True hospitality!`,
  (name: string, car: string, loc: string) => `We found ${name} on OrbiTrip for our ${loc} adventure. The ${car} was newer than expected and ${name} was genuinely passionate about showing us Georgia. 10/10!`,
  (name: string, car: string, loc: string) => `Safe, reliable, and fun — that describes ${name} perfectly. Our ${loc} trip in the ${car} was worry-free. ${name} adjusted the music to our taste!`,
  (name: string, car: string, loc: string) => `${name}'s ${car} was perfect for our group trip to ${loc}. Free water, great AC, and ${name} knew every shortcut. Arrived faster than Google Maps estimated!`,
  (name: string, car: string, loc: string) => `Booked ${name} last minute for ${loc} and so glad we did. The ${car} was spotless, ${name} was charming, and the views were incredible. Best money we spent in Georgia!`,
  (name: string, car: string, loc: string) => `We have traveled to 30+ countries and ${name} is one of the best drivers we've ever had. The ${car} handled the ${loc} mountain roads like a dream. Truly professional.`,
  (name: string, car: string, loc: string) => `My wife and I booked ${name} for a romantic trip to ${loc}. The ${car} was very comfortable and ${name} gave us privacy while being attentive to our needs. Perfect balance!`,
  (name: string, car: string, loc: string) => `${name} was recommended by our hotel and wow, what a great recommendation! The ${loc} drive in the ${car} was flawless. ${name} even stopped at a local market for us.`,
  (name: string, car: string, loc: string) => `As a solo female traveler, I was apprehensive but ${name} was absolutely professional. The ${car} was safe and comfortable for my ${loc} trip. Felt very secure throughout.`,
  (name: string, car: string, loc: string) => `Our ${loc} adventure with ${name} exceeded all expectations! The ${car} was modern, ${name} was knowledgeable, and the Georgian hospitality was real. Can't wait to come back!`,
  (name: string, car: string, loc: string) => `${name} drove us from Tbilisi to ${loc} and it was perfect. The ${car} was so comfortable I fell asleep on the way back! ${name} is truly a professional.`,
];

const REVIEW_TEMPLATES_RU = [
  (name: string, car: string, loc: string) => `${name} — потрясающий водитель! Мы ехали по маршруту ${loc}, ${car} был идеален для нашей группы. Очень рекомендую!`,
  (name: string, car: string, loc: string) => `Наша поездка в ${loc} с ${name} была незабываемой. ${car} был чистым, удобным, а ${name} знал все лучшие места для фото.`,
  (name: string, car: string, loc: string) => `Какой невероятный опыт! ${name} забрал нас вовремя на чистейшем ${car}. Дорога до ${loc} была потрясающей!`,
  (name: string, car: string, loc: string) => `Забронировали ${name} для трансфера ${loc} и очень довольны. ${car} отлично справился с горными дорогами.`,
  (name: string, car: string, loc: string) => `Пять звёзд мало для ${name}! Поездка ${loc} на ${car} стала лучшим моментом нашего отпуска в Грузии.`,
  (name: string, car: string, loc: string) => `${name} сделал нашу поездку в ${loc} волшебной. ${car} был безупречно чистым, а ${name} отлично говорил по-английски.`,
  (name: string, car: string, loc: string) => `Отличный сервис! ${name} был пунктуален и профессионален, а ${car} очень удобен для долгой дороги до ${loc}.`,
  (name: string, car: string, loc: string) => `Лучший водитель в Грузии! ${name} возил нас по маршруту ${loc}, ${car} был в идеальном состоянии.`,
  (name: string, car: string, loc: string) => `${name} — исключительный водитель! Трансфер ${loc} на ${car} был комфортным и безопасным. Даже дети были в восторге!`,
  (name: string, car: string, loc: string) => `Третий раз пользуюсь OrbiTrip, и ${name} — лучший водитель! ${car} был безупречен для нашей поездки ${loc}.`,
];

// Generate reviews for a driver
export function generateReviewsForDriver(
  driverName: string,
  carModel: string,
  driverCity: string,
  reviewCount: number
): { reviews: any[], rating: number } {
  const reviews: any[] = [];
  const usedNames = new Set<string>();
  const nationalities = Object.keys(TOURIST_NAMES);
  
  // Determine relevant transfers based on city
  const cityTransfers = TRANSFERS.filter(t => {
    const lower = t.toLowerCase();
    if (driverCity === 'tbilisi') return lower.includes('tbilisi');
    if (driverCity === 'kutaisi') return lower.includes('kutaisi');
    if (driverCity === 'batumi') return lower.includes('batumi');
    return true;
  });
  
  let totalRating = 0;
  
  for (let i = 0; i < reviewCount; i++) {
    // Pick unique tourist name
    let touristName = '';
    let attempts = 0;
    while (attempts < 50) {
      const nat = nationalities[Math.floor(Math.random() * nationalities.length)];
      const names = TOURIST_NAMES[nat];
      touristName = names[Math.floor(Math.random() * names.length)];
      if (!usedNames.has(touristName) || usedNames.size >= 150) {
        usedNames.add(touristName);
        break;
      }
      attempts++;
    }
    
    // Pick transfer/location
    const transfer = cityTransfers[Math.floor(Math.random() * cityTransfers.length)] || TRANSFERS[0];
    const landmark = LANDMARKS[Math.floor(Math.random() * LANDMARKS.length)];
    const location = Math.random() > 0.5 ? transfer : landmark;
    
    // Pick template (rotate EN/RU based on index)
    const isRu = Math.random() < 0.35; // 35% Russian reviews
    const templates = isRu ? REVIEW_TEMPLATES_RU : REVIEW_TEMPLATES_EN;
    const template = templates[i % templates.length];
    const text = template(driverName, carModel, location);
    
    // Rating distribution (mostly 4-5, occasionally 3)
    const ratingRoll = Math.random();
    const rating = ratingRoll < 0.65 ? 5 : ratingRoll < 0.9 ? 4 : 3;
    totalRating += rating;
    
    // Date spread over 7 years (2019-2026)
    const year = 2019 + Math.floor(Math.random() * 7);
    const month = 1 + Math.floor(Math.random() * 12);
    const day = 1 + Math.floor(Math.random() * 28);
    const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    reviews.push({
      author: touristName,
      rating,
      textEn: isRu ? '' : text,
      textRu: isRu ? text : '',
      date
    });
  }
  
  // Sort by date descending
  reviews.sort((a: any, b: any) => b.date.localeCompare(a.date));
  
  const avgRating = reviewCount > 0 ? Math.round((totalRating / reviewCount) * 10) / 10 : 4.8;
  
  return { reviews, rating: Math.min(5, Math.max(3.5, avgRating)) };
}

// Distribute cities evenly among drivers
export function assignCity(index: number, total: number): string {
  const cities = ['tbilisi', 'kutaisi', 'batumi'];
  // Weighted: Tbilisi 50%, Kutaisi 25%, Batumi 25%
  if (index < Math.floor(total * 0.5)) return 'tbilisi';
  if (index < Math.floor(total * 0.75)) return 'kutaisi';
  return 'batumi';
}
