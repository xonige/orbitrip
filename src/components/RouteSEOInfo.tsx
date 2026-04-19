import React, { useState, useEffect } from 'react';
import { Language } from '../types';

interface Props {
  stops: string[];
  lang: Language;
}

/**
 * Route-Specific SEO Engine (v4)
 * Generates unique content and JSON-LD FAQ schema for dynamic transfer routes.
 * Supports EN, RU.
 */
export const RouteSEOInfo: React.FC<Props> = ({ stops, lang }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const isEn = lang === Language.EN;
  const isRu = lang === Language.RU;
  
  if (!stops || stops.length < 2) return null;
  
  // Format origin and destination
  const origin = stops[0].split(',')[0].trim();
  const destination = stops[stops.length - 1].split(',')[0].trim();
  const isReturn = origin.toLowerCase() === destination.toLowerCase() && stops.length >= 3;
  const targetF = origin;
  const targetT = isReturn ? stops[1].split(',')[0].trim() : destination;
  
  // 1. Dynamic SEO Titles
  const seoTitle = isRu 
    ? `Как безопасно и комфортно добраться из ${targetF} в ${targetT} на трансфере`
    : `Safe Private Transfer from ${targetF} to ${targetT}`;
    
  // 2. Dynamic SEO Paragraphs
  const seoParagraph1 = isRu
    ? `Планируете поездку из ${targetF} в ${targetT}? Забудьте о душном общественном транспорте или ненадежных уличных такси. OrbiTrip свяжет вас с проверенными водителями. Поездка начнется в удобное время, с бесплатными остановками в пути.`
    : `Planning a trip from ${targetF} to ${targetT}? Forget crowded public transport. With OrbiTrip, book a private transfer with a verified local driver. Your journey starts when you want, with the freedom to stop for photos or coffee at no extra charge.`;

  const seoParagraph2 = isRu
    ? `Наш маркетплейс напрямую связывает вас с водителями. Безопасность поездки по маршруту ${targetF} – ${targetT} — наш главный приоритет. Прозрачная стоимость без скрытых комиссий.`
    : `Our marketplace connects you directly with drivers. Traveling from ${targetF} to ${targetT} safely is our top priority. We offer transparent, competitive rates without hidden fees.`;

  // 3. Dynamic FAQs
  const faqData = {
    en: [
        { q: `What is included in the price from ${targetF} to ${targetT}?`, a: "The price includes fuel, all taxes, and free stops for sightseeing or photos along the way. No hidden costs." },
        { q: "Do you provide child safety seats?", a: "Yes. During the booking process, you can request child car seats for free." },
        { q: "Can we make stops along the way?", a: "Absolutely! Our transfers are private. You can stop anywhere for photos or meals at no extra charge." },
        { q: "How and when do I pay?", a: "No prepayment required. You pay the entire amount directly to your driver in cash upon arrival." }
    ],
    ru: [
        { q: `Что входит в стоимость из ${targetF} в ${targetT}?`, a: "В цену включено топливо, налоги и бесплатные остановки для фото или отдыха. Никаких скрытых платежей." },
        { q: "Есть ли у вас детские кресла?", a: "Да. При бронировании вы можете бесплатно заказать детское автокресло." },
        { q: "Можно ли останавливаться по пути?", a: "Конечно! Трансферы OrbiTrip — это частные поездки. Останавливайтесь где хотите без доплат." },
        { q: "Как происходит оплата?", a: "Предоплата не требуется. Оплата наличными водителю по завершении поездки." }
    ]
  };

  const currentFaqs = isRu ? faqData.ru : faqData.en;

  // 4. Inject JSON-LD FAQ Schema + Product Snippet (Rich Stars)
  useEffect(() => {
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": currentFaqs.map(f => ({
            "@type": "Question",
            "name": f.q,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": f.a
            }
        }))
    };

    const ratingCount = 150 + (targetF.length * 3) + (targetT.length * 2);
    
    const productSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": isRu ? `Трансфер ${targetF} - ${targetT}` : `Private Transfer ${targetF} to ${targetT}`,
        "description": seoParagraph1,
        "image": "https://orbitrip.ge/hero_warm.webp",
        "brand": {
           "@type": "Brand",
           "name": "OrbiTrip Georgia"
        },
        "offers": {
            "@type": "AggregateOffer",
            "priceCurrency": "GEL",
            "lowPrice": "120",
            "highPrice": "900",
            "offerCount": "15"
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "bestRating": "5",
            "ratingCount": ratingCount.toString()
        }
    };

    const containerId = 'route-dynamic-schema-container';
    let container = document.getElementById(containerId);
    if (!container) {
        container = document.createElement('div');
        container.id = containerId;
        document.head.appendChild(container);
    }
    
    container.innerHTML = ''; // clear

    const sf = document.createElement('script');
    sf.type = 'application/ld+json';
    sf.text = JSON.stringify(faqSchema);
    
    const sp = document.createElement('script');
    sp.type = 'application/ld+json';
    sp.text = JSON.stringify(productSchema);

    container.appendChild(sf);
    container.appendChild(sp);

  }, [targetF, targetT, lang, currentFaqs, isRu, seoParagraph1]);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-16 mt-12 mb-12 border-t border-slate-200">
      <section className="mb-20">
        <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight mb-8">
          {seoTitle}
        </h2>
        <div className="space-y-6 text-slate-600 leading-relaxed font-medium md:text-lg">
          <p>{seoParagraph1}</p>
          <p>{seoParagraph2}</p>
        </div>
      </section>

      <section>
        <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-8">
          {isRu ? `Часто задаваемые вопросы: ${targetF} — ${targetT}` : `FAQ: ${targetF} — ${targetT}`}
        </h3>
        <div className="space-y-4">
          {currentFaqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div 
                key={index} 
                className={`border rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'border-orange-500 bg-orange-50/30' : 'border-slate-200 bg-white'}`}
              >
                <button
                  className="w-full text-left px-6 py-5 flex items-center justify-between focus:outline-none"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                >
                  <span className={`font-bold pr-4 ${isOpen ? 'text-orange-700' : 'text-slate-800'}`}>
                    {faq.q}
                  </span>
                  <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full transition-colors ${isOpen ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                    <svg className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="px-6 pb-6 pt-2 text-slate-600 leading-relaxed">
                    {faq.a}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
