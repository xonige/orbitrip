
import { LocationOption } from '../types';

const AIRPORTS: LocationOption[] = [
  { id: 'tbs-airport', nameEn: 'Tbilisi International Airport (TBS)', nameRu: 'Аэропорт Тбилиси (TBS)', nameKz: 'Tbilisi халықаралық әуежайы (TBS)', type: 'AIRPORT', lat: 41.6692, lng: 44.9547 },
  { id: 'kut-airport', nameEn: 'Kutaisi International Airport (KUT)', nameRu: 'Аэропорт Кутаиси (KUT)', nameKz: 'Kutaisi халықаралық әуежайы (KUT)', type: 'AIRPORT', lat: 42.1763, lng: 42.4824 },
  { id: 'bus-airport', nameEn: 'Batumi International Airport (BUS)', nameRu: 'Аэропорт Батуми (BUS)', nameKz: 'Batumi халықаралық әуежайы (BUS)', type: 'AIRPORT', lat: 41.6111, lng: 41.6102 },
  { id: 'mestia-airport', nameEn: 'Queen Tamar Airport (Mestia)', nameRu: 'Аэропорт Местиа', nameKz: 'Queen Tamar Airport (Mestia)', type: 'AIRPORT', lat: 43.0535, lng: 42.7483, isMountainous: true },
  { id: 'ambrolauri-airport', nameEn: 'Ambrolauri Airport', nameRu: 'Аэропорт Амбролаури', nameKz: 'Ambrolauri Airport', type: 'AIRPORT', lat: 42.5292, lng: 43.1256, isMountainous: true },
  { id: 'natakhtari-airport', nameEn: 'Natakhtari Airfield', nameRu: 'Аэродром Натахтари', nameKz: 'Natakhtari Airfield', type: 'AIRPORT', lat: 41.9195, lng: 44.7233 },
];

const OTHER_LOCATIONS: LocationOption[] = [
  // Railway Hubs (Highly requested on Gotrip)
  { id: 'tbs-railway', nameEn: 'Tbilisi Railway Station', nameRu: 'Ж/Д Вокзал Тбилиси', nameKz: 'Tbilisi теміржол вокзалы', type: 'LANDMARK', lat: 41.7225, lng: 44.7933 },
  { id: 'bus-railway', nameEn: 'Batumi Railway Station', nameRu: 'Ж/Д Вокзал Батуми', nameKz: 'Batumi теміржол вокзалы', type: 'LANDMARK', lat: 41.6578, lng: 41.6664 },
  { id: 'kut-railway', nameEn: 'Kutaisi Railway Station', nameRu: 'Ж/Д Вокзал Кутаиси', nameKz: 'Kutaisi теміржол вокзалы', type: 'LANDMARK', lat: 42.2536, lng: 42.7051 },

  // Essential Landmarks & Ski Resorts (Gotrip Parity)
  { id: 'goderdzi', nameEn: 'Goderdzi Ski Resort', nameRu: 'Курорт Годердзи', nameKz: 'Goderdzi тау шаңғысы курорты', type: 'RESORT', lat: 41.6322, lng: 42.5108, isMountainous: true },
  { id: 'hatsvali', nameEn: 'Hatsvali Ski Resort', nameRu: 'Курорт Хацвали', nameKz: 'Hatsvali тау шаңғысы курорты', type: 'RESORT', lat: 43.0232, lng: 42.7441, isMountainous: true },
  { id: 'gergeti', nameEn: 'Gergeti Trinity Church', nameRu: 'Гергетская церковь', nameKz: 'Gergeti Trinity шіркеуі', type: 'LANDMARK', lat: 42.6625, lng: 44.6202, isMountainous: true },
  { id: 'katskhi', nameEn: 'Katskhi Pillar', nameRu: 'Столп Кацхи', nameKz: 'Katskhi Pillar', type: 'LANDMARK', lat: 42.2875, lng: 43.2158 },
  { id: 'jvari', nameEn: 'Jvari Monastery', nameRu: 'Монастырь Джвари', nameKz: 'Jvari монастыры', type: 'LANDMARK', lat: 41.8383, lng: 44.7333 },
  { id: 'gelati', nameEn: 'Gelati Monastery', nameRu: 'Монастырь Гелати', nameKz: 'Gelati монастыры', type: 'LANDMARK', lat: 42.2950, lng: 42.7683 },
  { id: 'truso', nameEn: 'Truso Valley', nameRu: 'Долина Трусо', nameKz: 'Truso Valley', type: 'LANDMARK', lat: 42.5936, lng: 44.4372, isMountainous: true },
  { id: 'juta', nameEn: 'Juta', nameRu: 'Джута', nameKz: 'Juta', type: 'RESORT', lat: 42.5769, lng: 44.7431, isMountainous: true },
  { id: 'mtirala', nameEn: 'Mtirala National Park', nameRu: 'Нац. парк Мтирала', nameKz: 'Mtirala ұлттық паркі', type: 'LANDMARK', lat: 41.6789, lng: 41.8711, isMountainous: true },
  { id: 'paravani', nameEn: 'Lake Paravani', nameRu: 'Озеро Паравани', nameKz: 'көлі Paravani', type: 'LANDMARK', lat: 41.4500, lng: 43.8167 },
  { id: 'gveleti', nameEn: 'Gveleti Waterfall', nameRu: 'Гвелетский водопад', nameKz: 'Gveleti сарқырамасы', type: 'LANDMARK', lat: 42.7058, lng: 44.6258, isMountainous: true },
  { id: 'keda', nameEn: 'Keda', nameRu: 'Кеда', nameKz: 'Keda', type: 'CITY', lat: 41.5658, lng: 41.9392 },
  { id: 'makhinjauri', nameEn: 'Makhinjauri', nameRu: 'Махинджаури', nameKz: 'Makhinjauri', type: 'RESORT', lat: 41.6744, lng: 41.7011 },

  // Major Cities & Towns with Approximate Coordinates
  { id: 'abastumani', nameEn: 'Abastumani', nameRu: 'Абастумани', nameKz: 'Abastumani', type: 'RESORT', lat: 41.7562, lng: 42.8437, isMountainous: true },
  { id: 'akhalkalaki', nameEn: 'Akhalkalaki', nameRu: 'Ахалкалаки', nameKz: 'Akhalkalaki', type: 'CITY', lat: 41.4056, lng: 43.4862 },
  { id: 'akhaltsikhe', nameEn: 'Akhaltsikhe', nameRu: 'Ахалцихе', nameKz: 'Akhaltsikhe', type: 'CITY', lat: 41.6390, lng: 42.9826, isSemiMountainous: true },
  { id: 'ambrolauri', nameEn: 'Ambrolauri', nameRu: 'Амбролаури', nameKz: 'Ambrolauri', type: 'CITY', lat: 42.5146, lng: 43.1506, isMountainous: true },
  { id: 'anaklia', nameEn: 'Anaklia', nameRu: 'Анаклия', nameKz: 'Anaklia', type: 'RESORT', lat: 42.3941, lng: 41.5607 },
  { id: 'ananuri', nameEn: 'Ananuri', nameRu: 'Ананури', nameKz: 'Ananuri', type: 'LANDMARK', lat: 42.1642, lng: 44.7042 },
  { id: 'aspinza', nameEn: 'Aspindza', nameRu: 'Аспиндза', nameKz: 'Aspindza', type: 'CITY', lat: 41.5744, lng: 43.2483 },
  { id: 'bagdati', nameEn: 'Bagdati', nameRu: 'Багдати', nameKz: 'Bagdati', type: 'CITY', lat: 42.0673, lng: 42.8226 },
  { id: 'bakhmaro', nameEn: 'Bakhmaro', nameRu: 'Бахмаро', nameKz: 'Bakhmaro', type: 'RESORT', lat: 41.8592, lng: 42.3387, isMountainous: true },
  { id: 'bakuriani', nameEn: 'Bakuriani', nameRu: 'Бакуриани', nameKz: 'Bakuriani', type: 'RESORT', lat: 41.7525, lng: 43.5283, isMountainous: true },
  { id: 'batumi', nameEn: 'Batumi', nameRu: 'Батуми', nameKz: 'Batumi', type: 'CITY', lat: 41.6168, lng: 41.6367 },
  { id: 'beshumi', nameEn: 'Beshumi', nameRu: 'Бешуми', nameKz: 'Beshumi', type: 'RESORT', lat: 41.6163, lng: 42.5338, isMountainous: true },
  { id: 'bodbe', nameEn: 'Bodbe', nameRu: 'Бодбе', nameKz: 'Bodbe', type: 'LANDMARK', lat: 41.6067, lng: 45.9328 },
  { id: 'bolnisi', nameEn: 'Bolnisi', nameRu: 'Болниси', nameKz: 'Bolnisi', type: 'CITY', lat: 41.4463, lng: 44.5372 },
  { id: 'borjomi', nameEn: 'Borjomi', nameRu: 'Боржоми', nameKz: 'Боржоми', type: 'RESORT', lat: 41.8412, lng: 43.3831, isSemiMountainous: true },
  { id: 'chakvi', nameEn: 'Chakvi', nameRu: 'Чакви', nameKz: 'Chakvi', type: 'RESORT', lat: 41.7183, lng: 41.7332 },
  { id: 'chiatura', nameEn: 'Chiatura', nameRu: 'Чиатура', nameKz: 'Chiatura', type: 'CITY', lat: 42.2902, lng: 43.2842, isMountainous: true },
  { id: 'dashbashi', nameEn: 'Dashbashi Canyon', nameRu: 'Каньон Дашбаши', nameKz: 'Dashbashi каньоны', type: 'LANDMARK', lat: 41.5947, lng: 44.1278 },
  { id: 'david-gareji', nameEn: 'David Gareji', nameRu: 'Давид Гареджи', nameKz: 'David Gareji', type: 'LANDMARK', lat: 41.4475, lng: 45.3764 },
  { id: 'dedoplistskaro', nameEn: 'Dedoplistskaro', nameRu: 'Дедоплисцкаро', nameKz: 'Dedoplistskaro', type: 'CITY', lat: 41.4647, lng: 46.1044 },
  { id: 'dmanisi', nameEn: 'Dmanisi', nameRu: 'Дманиси', nameKz: 'Dmanisi', type: 'CITY', lat: 41.3323, lng: 44.2057 },
  { id: 'dusheti', nameEn: 'Dusheti', nameRu: 'Душети', nameKz: 'Dusheti', type: 'CITY', lat: 42.0875, lng: 44.6953 },
  { id: 'enguri', nameEn: 'Enguri Dam', nameRu: 'Ингурская ГЭС', nameKz: 'Enguri Dam', type: 'LANDMARK', lat: 42.7594, lng: 42.0322 },
  { id: 'gonio', nameEn: 'Gonio', nameRu: 'Гонио', nameKz: 'Gonio', type: 'RESORT', lat: 41.5653, lng: 41.5703 },
  { id: 'gori', nameEn: 'Gori', nameRu: 'Гори', nameKz: 'Gori', type: 'CITY', lat: 41.9842, lng: 44.1158 },
  { id: 'gudauri', nameEn: 'Gudauri', nameRu: 'Гудаури', nameKz: 'Gudauri', type: 'RESORT', lat: 42.4770, lng: 44.4842, isMountainous: true },
  { id: 'gurjaani', nameEn: 'Gurjaani', nameRu: 'Гурджаани', nameKz: 'Gurjaani', type: 'CITY', lat: 41.7441, lng: 45.7975 },
  { id: 'kareli', nameEn: 'Kareli', nameRu: 'Карели', nameKz: 'Kareli', type: 'CITY', lat: 42.0236, lng: 43.8967 },
  { id: 'kaspi', nameEn: 'Kaspi', nameRu: 'Каспи', nameKz: 'Kaspi', type: 'CITY', lat: 41.9256, lng: 44.4222 },
  { id: 'kazbegi', nameEn: 'Kazbegi (Stepantsminda)', nameRu: 'Казбеги (Степанцминда)', nameKz: 'Kazbegi (Stepantsminda)', type: 'RESORT', lat: 42.6567, lng: 44.6433, isMountainous: true },
  { id: 'khashuri', nameEn: 'Khashuri', nameRu: 'Хашури', nameKz: 'Khashuri', type: 'CITY', lat: 41.9964, lng: 43.5986 },
  { id: 'khevsureti', nameEn: 'Khevsureti', nameRu: 'Хевсурети', nameKz: 'Khevsureti', type: 'LANDMARK', lat: 42.5978, lng: 44.8972, isMountainous: true },
  { id: 'khulo', nameEn: 'Khulo', nameRu: 'Хуло', nameKz: 'Khulo', type: 'CITY', lat: 41.6447, lng: 42.3164, isMountainous: true },
  { id: 'khvanchkara', nameEn: 'Khvanchkara', nameRu: 'Хванчкара', nameKz: 'Khvanchkara', type: 'CITY', lat: 42.5333, lng: 43.0500, isMountainous: true },
  { id: 'kinchkha', nameEn: 'Kinchkha Waterfall', nameRu: 'Водопад Кинчха', nameKz: 'Kinchkha сарқырамасы', type: 'LANDMARK', lat: 42.4939, lng: 42.5517 },
  { id: 'kobuleti', nameEn: 'Kobuleti', nameRu: 'Кобулети', nameKz: 'Kobuleti', type: 'RESORT', lat: 41.8197, lng: 41.7778 },
  { id: 'kutaisi', nameEn: 'Kutaisi', nameRu: 'Кутаиси', nameKz: 'Kutaisi', type: 'CITY', lat: 42.2662, lng: 42.7180 },
  { id: 'kvariati', nameEn: 'Kvariati', nameRu: 'Квариати', nameKz: 'Kvariati', type: 'RESORT', lat: 41.5458, lng: 41.5628 },
  { id: 'kvareli', nameEn: 'Kvareli', nameRu: 'Кварели', nameKz: 'Kvareli', type: 'CITY', lat: 41.9475, lng: 45.8153 },
  { id: 'lagodekhi', nameEn: 'Lagodekhi', nameRu: 'Лагодехи', nameKz: 'Lagodekhi', type: 'CITY', lat: 41.8268, lng: 46.2797 },
  { id: 'lentekhi', nameEn: 'Lentekhi', nameRu: 'Лентехи', nameKz: 'Lentekhi', type: 'CITY', lat: 42.7889, lng: 42.7222, isMountainous: true },
  { id: 'likani', nameEn: 'Likani', nameRu: 'Ликани', nameKz: 'Likani', type: 'RESORT', lat: 41.8319, lng: 43.3619, isSemiMountainous: true },
  { id: 'lopota', nameEn: 'Lopota Lake', nameRu: 'Озеро Лопота', nameKz: 'Lopota көлі', type: 'RESORT', lat: 42.0525, lng: 45.6267 },
  { id: 'manglisi', nameEn: 'Manglisi', nameRu: 'Манглиси', nameKz: 'Manglisi', type: 'RESORT', lat: 41.6964, lng: 44.3644 },
  { id: 'marneuli', nameEn: 'Marneuli', nameRu: 'Марнеули', nameKz: 'Marneuli', type: 'CITY', lat: 41.4756, lng: 44.8081 },
  { id: 'martvili', nameEn: 'Martvili Canyon', nameRu: 'Каньон Мартвили', nameKz: 'Martvili каньоны', type: 'LANDMARK', lat: 42.4573, lng: 42.3776 },
  { id: 'mestia', nameEn: 'Mestia', nameRu: 'Местиа', nameKz: 'Mestia', type: 'RESORT', lat: 43.0444, lng: 42.7264, isMountainous: true },
  { id: 'motsameta', nameEn: 'Motsameta', nameRu: 'Моцамета', nameKz: 'Motsameta', type: 'LANDMARK', lat: 42.2825, lng: 42.7592 },
  { id: 'mtskheta', nameEn: 'Mtskheta', nameRu: 'Мцхета', nameKz: 'Mtskheta', type: 'CITY', lat: 41.8409, lng: 44.7072 },
  { id: 'nokalakevi', nameEn: 'Nokalakevi', nameRu: 'Нокалакеви', nameKz: 'Nokalakevi', type: 'LANDMARK', lat: 42.3553, lng: 42.1953 },
  { id: 'nunisi', nameEn: 'Nunisi', nameRu: 'Нуниси', nameKz: 'Nunisi', type: 'RESORT', lat: 42.0231, lng: 43.3969, isMountainous: true },
  { id: 'okatse', nameEn: 'Okatse Canyon', nameRu: 'Каньон Окаце', nameKz: 'Okatse каньоны', type: 'LANDMARK', lat: 42.4553, lng: 42.5486 },
  { id: 'omalo', nameEn: 'Omalo (Tusheti)', nameRu: 'Омало (Тушети)', nameKz: 'Omalo (Tusheti)', type: 'LANDMARK', lat: 42.3717, lng: 45.6339, isMountainous: true },
  { id: 'oni', nameEn: 'Oni', nameRu: 'Они', nameKz: 'Oni', type: 'CITY', lat: 42.5794, lng: 43.4425, isMountainous: true },
  { id: 'ozurgeti', nameEn: 'Ozurgeti', nameRu: 'Озургети', nameKz: 'Ozurgeti', type: 'CITY', lat: 41.9269, lng: 42.0006 },
  { id: 'pasanauri', nameEn: 'Pasanauri', nameRu: 'Пасанаури', nameKz: 'Pasanauri', type: 'CITY', lat: 42.3517, lng: 44.6872, isMountainous: true },
  { id: 'poti', nameEn: 'Poti', nameRu: 'Поти', nameKz: 'Poti', type: 'CITY', lat: 42.1578, lng: 41.6723 },
  { id: 'prometheus', nameEn: 'Prometheus Cave', nameRu: 'Пещера Прометея', nameKz: 'Prometheus Cave', type: 'LANDMARK', lat: 42.3767, lng: 42.6008 },
  { id: 'rabati', nameEn: 'Rabati Fortress', nameRu: 'Крепость Рабат', nameKz: 'Rabati қамалы', type: 'LANDMARK', lat: 41.6425, lng: 42.9839 },
  { id: 'rustavi', nameEn: 'Rustavi', nameRu: 'Рустави', nameKz: 'Rustavi', type: 'CITY', lat: 41.5381, lng: 45.0078 },
  { id: 'sadakhlo', nameEn: 'Sadakhlo (Border)', nameRu: 'Садахло (Граница)', nameKz: 'Sadakhlo (шекарасы)', type: 'BORDER', lat: 41.2428, lng: 44.7878 },
  { id: 'sagarejo', nameEn: 'Sagarejo', nameRu: 'Сагареджо', nameKz: 'Sagarejo', type: 'CITY', lat: 41.7333, lng: 45.3333 },
  { id: 'sairme', nameEn: 'Sairme', nameRu: 'Саирме', nameKz: 'Sairme', type: 'RESORT', lat: 41.9056, lng: 42.7461, isMountainous: true },
  { id: 'samtrdia', nameEn: 'Samtredia', nameRu: 'Самтредиа', nameKz: 'Samtredia', type: 'CITY', lat: 42.1542, lng: 42.3367 },
  { id: 'sarpi', nameEn: 'Sarpi (Border)', nameRu: 'Сарпи (Граница)', nameKz: 'Sarpi (шекарасы)', type: 'BORDER', lat: 41.5211, lng: 41.5492 },
  { id: 'sataplia', nameEn: 'Sataplia', nameRu: 'Сатаплиа', nameKz: 'Sataplia', type: 'LANDMARK', lat: 42.3125, lng: 42.6744 },
  { id: 'senaki', nameEn: 'Senaki', nameRu: 'Сенаки', nameKz: 'Senaki', type: 'CITY', lat: 42.2697, lng: 42.0689 },
  { id: 'shatili', nameEn: 'Shatili', nameRu: 'Шатили', nameKz: 'Shatili', type: 'LANDMARK', lat: 42.6586, lng: 45.1558, isMountainous: true },
  { id: 'shekvetili', nameEn: 'Shekvetili', nameRu: 'Шекветили', nameKz: 'Shekvetili', type: 'RESORT', lat: 41.9214, lng: 41.7681 },
  { id: 'shovi', nameEn: 'Shovi', nameRu: 'Шови', nameKz: 'Shovi', type: 'RESORT', lat: 42.7042, lng: 43.6875, isMountainous: true },
  { id: 'signagi', nameEn: 'Signagi', nameRu: 'Сигнахи', nameKz: 'Signagi', type: 'CITY', lat: 41.6211, lng: 45.9217 },
  { id: 'sioni', nameEn: 'Sioni', nameRu: 'Сиони', nameKz: 'Sioni', type: 'RESORT', lat: 41.9961, lng: 45.0217 },
  { id: 'surami', nameEn: 'Surami', nameRu: 'Сурами', nameKz: 'Surami', type: 'CITY', lat: 42.0233, lng: 43.5517, isSemiMountainous: true },
  { id: 'tbilisi', nameEn: 'Tbilisi', nameRu: 'Тбилиси', nameKz: 'Tbilisi', type: 'CITY', lat: 41.7151, lng: 44.8271 },
  { id: 'telavi', nameEn: 'Telavi', nameRu: 'Телави', nameKz: 'Telavi', type: 'CITY', lat: 41.9198, lng: 45.4731 },
  { id: 'tetnuldi', nameEn: 'Tetnuldi', nameRu: 'Тетнулди', nameKz: 'Tetnuldi', type: 'RESORT', lat: 43.0333, lng: 42.8833, isMountainous: true },
  { id: 'tianeti', nameEn: 'Tianeti', nameRu: 'Тианети', nameKz: 'Tianeti', type: 'CITY', lat: 42.1083, lng: 44.9639 },
  { id: 'tsageri', nameEn: 'Tsageri', nameRu: 'Цагери', nameKz: 'Tsageri', type: 'CITY', lat: 42.6483, lng: 42.7700, isMountainous: true },
  { id: 'tsalka', nameEn: 'Tsalka', nameRu: 'Цалка', nameKz: 'Tsalka', type: 'CITY', lat: 41.6008, lng: 44.0906 },
  { id: 'tskaltubo', nameEn: 'Tskaltubo', nameRu: 'Цхалтубо', nameKz: 'Tskaltubo', type: 'RESORT', lat: 42.3264, lng: 42.6000 },
  { id: 'tsinandali', nameEn: 'Tsinandali', nameRu: 'Цیناндали', nameKz: 'Tsinandali', type: 'LANDMARK', lat: 41.8953, lng: 45.5750 },
  { id: 'uplistsikhe', nameEn: 'Uplistsikhe', nameRu: 'Уплисцихе', nameKz: 'Uplistsikhe', type: 'LANDMARK', lat: 41.9672, lng: 44.2072 },
  { id: 'ureki', nameEn: 'Ureki', nameRu: 'Уреки', nameKz: 'Ureki', type: 'RESORT', lat: 41.9950, lng: 41.7775 },
  { id: 'ushguli', nameEn: 'Ushguli', nameRu: 'Ушгули', nameKz: 'Ushguli', type: 'LANDMARK', lat: 42.9178, lng: 43.0164, isMountainous: true },
  { id: 'vardzia', nameEn: 'Vardzia', nameRu: 'Вардзия', nameKz: 'Vardzia', type: 'LANDMARK', lat: 41.375369, lng: 43.273187 },
  { id: 'vashlovani', nameEn: 'Vashlovani National Park', nameRu: 'Нац. парк Вашловани', nameKz: 'Vashlovani ұлттық паркі', type: 'LANDMARK', lat: 41.2167, lng: 46.5500 },
  { id: 'zestafoni', nameEn: 'Zestafoni', nameRu: 'Зестафони', nameKz: 'Zestafoni', type: 'CITY', lat: 42.1081, lng: 43.0231 },
  { id: 'zugdidi', nameEn: 'Zugdidi', nameRu: 'Зугдиди', nameKz: 'Zugdidi', type: 'CITY', lat: 42.5088, lng: 41.8708 },

  // INTERNATIONAL (500KM RADIUS)
  // ARMENIA
  { id: 'yerevan', nameEn: 'Yerevan', nameRu: 'Ереван', nameKz: 'Yerevan', type: 'CITY', lat: 40.1872, lng: 44.5152, isInternational: true },
  { id: 'gyumri', nameEn: 'Gyumri', nameRu: 'Гюмри', nameKz: 'Gyumri', type: 'CITY', lat: 40.7942, lng: 43.8453, isInternational: true },
  { id: 'sevan', nameEn: 'Lake Sevan', nameRu: 'Озеро Севан', nameKz: 'көлі Sevan', type: 'LANDMARK', lat: 40.5550, lng: 44.9542, isInternational: true },
  { id: 'dilijan', nameEn: 'Dilijan', nameRu: 'Дилижан', nameKz: 'Dilijan', type: 'CITY', lat: 40.7408, lng: 44.8631, isInternational: true },
  // AZERBAIJAN
  { id: 'baku', nameEn: 'Baku', nameRu: 'Баку', nameKz: 'Baku', type: 'CITY', lat: 40.4093, lng: 49.8671, isInternational: true },
  { id: 'ganja', nameEn: 'Ganja', nameRu: 'Гянджа', nameKz: 'Ganja', type: 'CITY', lat: 40.6828, lng: 46.3606, isInternational: true },
  { id: 'sheki', nameEn: 'Sheki', nameRu: 'Шеки', nameKz: 'Sheki', type: 'CITY', lat: 41.1975, lng: 47.1694, isInternational: true },
  // TURKEY
  { id: 'trabzon', nameEn: 'Trabzon', nameRu: 'Трабзон', nameKz: 'Trabzon', type: 'CITY', lat: 41.0027, lng: 39.7168, isInternational: true },
  { id: 'rize', nameEn: 'Rize', nameRu: 'Ризе', nameKz: 'Rize', type: 'CITY', lat: 41.0201, lng: 40.5234, isInternational: true },
  { id: 'kars', nameEn: 'Kars', nameRu: 'Карс', nameKz: 'Kars', type: 'CITY', lat: 40.6013, lng: 43.0975, isInternational: true },
  { id: 'hopa', nameEn: 'Hopa', nameRu: 'Хопа', nameKz: 'Hopa', type: 'CITY', lat: 41.3917, lng: 41.4208, isInternational: true },
  // RUSSIA
  { id: 'vladikavkaz', nameEn: 'Vladikavkaz', nameRu: 'Владикавказ', nameKz: 'Vladikavkaz', type: 'CITY', lat: 43.0367, lng: 44.6678, isInternational: true },
  { id: 'vladikavkaz-airport', nameEn: 'Vladikavkaz Airport (Beslan)', nameRu: 'Аэропорт Владикавказ (Беслан)', nameKz: 'Vladikavkaz Airport (Beslan)', type: 'AIRPORT', lat: 43.2051, lng: 44.6066, isInternational: true },
  { id: 'min_vody', nameEn: 'Mineralnye Vody', nameRu: 'Минеральные Воды', nameKz: 'Mineralnye Vody', type: 'CITY', lat: 44.2106, lng: 43.1353, isInternational: true },
  { id: 'sochi', nameEn: 'Sochi', nameRu: 'Сочи', nameKz: 'Sochi', type: 'CITY', lat: 43.5855, lng: 39.7231, isInternational: true }
];

import { SCRAPED_LOCATIONS } from './gotrip_locations';

export const RAW_COMBINED = [
  ...AIRPORTS,
  ...OTHER_LOCATIONS
];

// Merge scraped locations without duplicating our high-fidelity existing locations
const deduplicatedScraped = SCRAPED_LOCATIONS.filter(scraped => {
  // CRITICAL: Exclude any location that still has the standard Tbilisi placeholder coordinates
  if (scraped.lat === 41.7151 && scraped.lng === 44.8271) return false;
  
  const sName = scraped.nameEn.toLowerCase().trim();
  
  return !RAW_COMBINED.some(existing => {
    const eName = existing.nameEn.toLowerCase().trim();
    // Aggressive matching: exact match, or one is a significant substring of the other
    return eName === sName || 
           (eName.includes(sName) && sName.length > 5) || 
           (sName.includes(eName) && eName.length > 5);
  });
});

// Combine and sort ALL locations alphabetically by English name for default
export const GEORGIAN_LOCATIONS: LocationOption[] = [
  ...RAW_COMBINED,
  ...deduplicatedScraped
].sort((a, b) => {
    // Priority cities first
    const priority = ['tbilisi', 'kutaisi', 'batumi', 'kut-airport', 'tbs-airport', 'bus-airport'];
    const aPri = priority.indexOf(a.id);
    const bPri = priority.indexOf(b.id);
    if (aPri !== -1 && bPri !== -1) return aPri - bPri;
    if (aPri !== -1) return -1;
    if (bPri !== -1) return 1;
    return (a.nameEn || "").localeCompare(b.nameEn || "");
});
