
import { Tour, Language } from '../types';

export const generateLocalBusinessSchema = (language: Language = Language.EN) => {
  const isRu = language === Language.RU;
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "OrbiTrip Georgia",
    "image": "https://orbitrip.ge/logo.webp",
    "description": language === Language.KZ 
      ? "Жергілікті жүргізушілерден Қазақстан мен Грузия бойынша жеке трансферлер мен экскурсиялар. Тбилиси, Кутаиси және Батумиден сенімді көлік."
      : language === Language.RU
      ? "Частные трансферы и экскурсии по Грузии напрямую от местных водителей. Надежный транспорт из Тбилиси, Кутаиси и Батуми."
      : "Private transfers and tours in Georgia directly from local drivers. Book reliable transport from Tbilisi, Kutaisi, and Batumi.",
    "@id": "https://orbitrip.ge",
    "url": "https://orbitrip.ge",
    "telephone": "+995593456876",
    "email": "support@orbitrip.ge",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Rustaveli 12/4",
      "addressLocality": "Kutaisi",
      "addressRegion": "Imereti",
      "postalCode": "4600",
      "addressCountry": "GE"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 42.2662,
      "longitude": 42.7180
    },
    "priceRange": "$$",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": 4.9,
      "bestRating": 5,
      "worstRating": 1,
      "reviewCount": 487
    }
  });
};

export const generateTourSchema = (tour: Tour) => {
  // Extract numeric price for schema
  const priceMatch = tour.price.match(/\d+/);
  const numericPrice = priceMatch ? priceMatch[0] : "100";
  
  // Format current date + 1 year for priceValidUntil
  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);
  const validUntil = nextYear.toISOString().split('T')[0];

  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": tour.titleEn,
    "description": tour.descriptionEn,
    "image": tour.image,
    "sku": `ORBI-${tour.id.substring(0, 8)}`,
    "mpn": tour.id,
    "brand": {
      "@type": "Brand",
      "name": "OrbiTrip"
    },
    "offers": {
      "@type": "Offer",
      "price": numericPrice,
      "priceCurrency": "GEL",
      "availability": "https://schema.org/InStock",
      "url": window.location.href,
      "priceValidUntil": validUntil,
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingRate": {
          "@type": "MonetaryAmount",
          "value": "0",
          "currency": "GEL"
        }
      }
    }
  };

  // Add Aggregate Rating if we have rating
  if (tour.rating) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": Number(tour.rating),
      "reviewCount": tour.reviews?.length || 1,
      "bestRating": 5,
      "worstRating": 1
    };
  }

  // Add individual reviews to make it "Review Snippet" compatible
  if (tour.reviews && tour.reviews.length > 0) {
    schema.review = tour.reviews.map(r => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": r.author
      },
      "datePublished": "2024-03-20",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": Number(r.rating),
        "bestRating": 5,
        "worstRating": 1
      },
      "reviewBody": r.textEn
    }));
  }

  return JSON.stringify(schema);
};

export const generateFAQSchema = (language: Language = Language.EN) => {
    const isRu = language === Language.RU;
    return JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": language === Language.EN ? "How do I book a transfer?" : language === Language.RU ? "Как забронировать трансфер?" : "Трансферге қалай тапсырыс беруге болады?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": language === Language.EN ? "Book directly on OrbiTrip. Choose your route, pick a driver, and pay at the end. No prepayment required." : language === Language.RU ? "Забронируйте напрямую на OrbiTrip. Выберите маршрут, водителя и оплатите в конце поездки. Предоплата не требуется." : "OrbiTrip-те тікелей брондаңыз. Маршрутты, жүргізушіні таңдап, сапар соңында төлеңіз. Алдын ала төлем қажет емес."
          }
        },
        {
          "@type": "Question",
          "name": language === Language.EN ? "Do you provide airport pickup?" : language === Language.RU ? "Встречаете ли вы в аэропорту?" : "Әуежайдан күтіп аласыз ба?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": language === Language.EN ? "Yes, we provide 24/7 private transfers from Tbilisi, Kutaisi, and Batumi airports with free waiting time." : language === Language.RU ? "Да, мы предоставляем круглосуточный частный трансфер из аэропортов Тбилиси, Кутаиси и Батуми с бесплатным временем ожидания." : "Иә, біз Тбилиси, Кутаиси және Батуми әуежайларынан тегін күту уақытымен тәулік бойы жеке трансферлерді ұсынамыз."
          }
        },
        {
          "@type": "Question",
          "name": language === Language.EN ? "Can we stop for photos?" : language === Language.RU ? "Можно ли делать остановки для фото?" : "Суретке түсу үшін тоқтауға бола ма?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": language === Language.EN ? "Yes! You can stop anywhere for free to take photos, eat, or rest. The price is fixed." : language === Language.RU ? "Да! Вы можете бесплатно останавливаться где угодно, чтобы сделать фото, перекусить или отдохнуть. Цена фиксирована." : "Иә! Сіз фотосуретке түсу, тамақтану немесе демалу үшін кез келген жерде тегін тоқтай аласыз. Бағасы бекітілген."
          }
        },
        {
          "@type": "Question",
          "name": language === Language.EN ? "Do you provide child seats?" : language === Language.RU ? "Предоставляете ли вы детские кресла?" : "Балалар орындықтарын бересіз бе?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": language === Language.EN ? "Yes, child seats are available upon request completely free of charge. You can specify it during booking." : language === Language.RU ? "Да, детские кресла предоставляются по запросу совершенно бесплатно. Вы можете указать это при бронировании." : "Иә, балалар орындықтары сұраныс бойынша мүлдем тегін беріледі. Оны брондау кезінде көрсетуге болады."
          }
        },
        {
          "@type": "Question",
          "name": isRu ? "Цена указана за человека или за машину?" : "Is the price per person or per car?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": isRu ? "Цена всегда указана за автомобиль, а не за человека. Она включает топливо, услуги водителя и не требует предоплаты." : "The price is per vehicle (car), not per person. It includes fuel, driver services, and no prepayment is required."
          }
        }
      ]
    });
};

export const generateBreadcrumbSchema = (items: { name: string, item: string }[]) => {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.item
    }))
  });
};
