import React, { useState } from 'react';
import { Language, BlogPost } from '../types';
import SEO from './SEO'; 

interface BlogListProps {
  language: Language;
  onBookRoute?: (from: string, to: string) => void;
}

const AUTHOR_NAME_EN = "Vlada Marsheva";
const AUTHOR_NAME_RU = "Влада Маршева";
const EDITORIAL_TEAM_EN = "OrbiTrip Editorial";
const EDITORIAL_TEAM_RU = "Редакция OrbiTrip";

import { MOCK_POSTS } from '../data/blogPosts';
const TAGS_EN = ["Transfer", "Tbilisi", "Batumi", "Kutaisi", "Kazbegi", "Svaneti", "Mtskheta", "Signagi", "Telavi", "Gudauri", "Bakuriani", "Borjomi", "Vardzia", "Rabati", "Martvili", "Omalo", "Shatili", "Juta", "Safety", "Tips", "Budget", "4x4", "Nature"];
const TAGS_RU = ["Трансфер", "Тбилиси", "Батуми", "Кутаиси", "Казбеги", "Сванетия", "Мцхета", "Сигнахи", "Телави", "Гудаури", "Бакуриани", "Боржоми", "Вардзия", "Рабати", "Мартвили", "Омало", "Шатили", "Джута", "Безопасность", "Советы", "Бюджет", "4x4", "Природа"];

const BlogList: React.FC<BlogListProps> = ({ language, onBookRoute }) => {
  const [email, setEmail] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  
  const tags = language === Language.EN ? TAGS_EN : TAGS_RU;
  const isEn = language === Language.EN;
  
  const filteredPosts = selectedTag 
    ? MOCK_POSTS.filter(p => p.tags?.some(t => t.toLowerCase() === selectedTag.toLowerCase()) || p.category.toLowerCase() === selectedTag.toLowerCase())
    : MOCK_POSTS;

  const featuredPost = MOCK_POSTS[0]; 
  const regularPosts = filteredPosts.filter(p => p.id !== featuredPost.id);

  if (selectedPost) {
    return (
        <div className="bg-white min-h-screen py-16 px-4">
            <div className="max-w-4xl mx-auto">
                <button 
                  onClick={() => { setSelectedPost(null); window.scrollTo(0,0); }}
                  className="mb-8 flex items-center gap-2 text-slate-500 font-black uppercase text-xs hover:text-[var(--primary)] transition-colors"
                >
                    <span className="text-xl">←</span> {isEn ? "Back to Blog" : "Назад в блог"}
                </button>
                
                <div className="mb-10">
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--primary)] mb-4">{selectedPost.category}</div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tighter leading-[0.9] italic uppercase">{isEn ? selectedPost.titleEn : selectedPost.titleRu}</h1>
                    <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400 border-y border-slate-100 py-6">
                        <span>{selectedPost.date}</span>
                        <div className="flex items-center gap-2">
                             <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">{selectedPost.authorEn?.charAt(0)}</div>
                             <span>{isEn ? selectedPost.authorEn : selectedPost.authorRu}</span>
                        </div>
                    </div>
                </div>

                <div className="relative h-[300px] md:h-[500px] rounded-[40px] overflow-hidden mb-12 shadow-2xl">
                    <img src={selectedPost.image} className="w-full h-full object-cover" alt="Cover" />
                </div>

                <div 
                    className="prose prose-lg max-w-none text-slate-700 font-medium leading-relaxed blog-content"
                    dangerouslySetInnerHTML={{ __html: (isEn ? selectedPost.contentEn : selectedPost.contentRu) || (isEn ? selectedPost.excerptEn : selectedPost.excerptRu) }}
                />
                
                {selectedPost.relatedRoute && (
                  <div className="mt-20 p-10 bg-slate-900 rounded-[40px] text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary)]/20 rounded-full blur-[100px]"></div>
                      <div className="relative z-10 text-center md:text-left">
                          <h2 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter mb-4 leading-none">{isEn ? "Inspired to travel?" : "Вдохновились?"}</h2>
                          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{isEn ? "Book this private transfer now" : "Забронируйте этот маршрут сейчас"}</p>
                      </div>
                      <button 
                        onClick={() => onBookRoute && onBookRoute(selectedPost.relatedRoute!.from, selectedPost.relatedRoute!.to)}
                        className="relative z-10 bg-[var(--primary)] text-white px-10 py-5 rounded-[24px] font-black uppercase tracking-tight italic hover:scale-105 transition-all shadow-2xl"
                      >
                          {isEn ? "Book Now" : "Забронировать"}
                      </button>
                  </div>
                )}
            </div>
        </div>
    );
  }

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    alert(isEn ? 'Subscribed successfully!' : 'Вы успешно подписались!');
    setEmail('');
  };

  return (
    <div className="bg-transparent min-h-screen font-sans">
      
      <SEO 
        title={selectedPost 
            ? (isEn ? selectedPost.titleEn : selectedPost.titleRu)
            : (isEn ? "Georgia Travel Blog & Transfer Guide | OrbiTrip" : "Блог о Грузии и Гид по Трансферам | OrbiTrip")
        }
        description={selectedPost
            ? (isEn ? selectedPost.excerptEn : selectedPost.excerptRu)
            : (isEn 
                ? "Expert travel guides for Georgia. How to get from Tbilisi to Batumi, airport transfers, safety tips, and hidden gems." 
                : "Гид по путешествиям в Грузии. Как добраться из Тбилиси в Батуми, трансферы из аэропорта, советы по безопасности.")
        }
        keywords={selectedPost ? selectedPost.tags?.join(', ') : "Georgia travel, Tbilisi transfers, Batumi guide"}
        type="article"
      />

      {/* Structured Data (Schema.org) for SEO */}
      {selectedPost && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": isEn ? selectedPost.titleEn : selectedPost.titleRu,
            "image": [selectedPost.image],
            "datePublished": selectedPost.date,
            "author": [{
                "@type": "Person",
                "name": isEn ? selectedPost.authorEn : selectedPost.authorRu
              }]
          })}
        </script>
      )}

      {/* --- HERO SECTION --- */}
      <div className="relative h-[600px] w-full overflow-hidden group cursor-pointer" onClick={() => setSelectedPost(featuredPost)}>
          <div className="absolute inset-0">
              <img 
                src={featuredPost.image} 
                alt="Featured" 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
          </div>
          
          <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 max-w-7xl mx-auto flex flex-col justify-end h-full">
              <span className="inline-block bg-[var(--primary)] text-white text-[10px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-full mb-6 w-fit shadow-xl shadow-[var(--primary)]/20">
                  {isEn ? "FEATURED GUIDE" : "ЛУЧШИЙ ГИД"}
              </span>
              <h1 className="text-4xl md:text-7xl font-black text-white mb-6 leading-[0.9] tracking-tighter max-w-4xl drop-shadow-2xl">
                  {isEn ? featuredPost.titleEn : featuredPost.titleRu}
              </h1>
              <p className="text-gray-200 text-lg md:text-2xl line-clamp-2 max-w-3xl mb-10 font-medium opacity-90">
                  {isEn ? featuredPost.excerptEn : featuredPost.excerptRu}
              </p>
              
              <div className="flex items-center space-x-8 text-xs font-black uppercase tracking-widest text-white/70">
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-3xl flex items-center justify-center border border-white/20">
                          {featuredPost.authorEn?.charAt(0)}
                      </div>
                      <span className="text-white">{isEn ? featuredPost.authorEn : featuredPost.authorRu}</span>
                  </div>
                  <span className="px-4 py-1 rounded-full border border-white/20 backdrop-blur-sm">{featuredPost.date}</span>
                  <div className="flex items-center gap-2 text-[var(--primary-light)] group-hover:text-white transition-colors">
                      {isEn ? "START PLANNING" : "НАЧАТЬ ПЛАНИРОВАНИЕ"}
                      <span className="text-xl">→</span>
                  </div>
              </div>
          </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="flex flex-col lg:flex-row gap-20">
          
          <div className="lg:w-2/3">
            <div className="flex items-center justify-between mb-12">
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
                    {selectedTag ? (isEn ? `Topic: ${selectedTag}` : `Тема: ${selectedTag}`) : (isEn ? "Latest Stories" : "Последние Истории")}
                </h2>
                {selectedTag && (
                    <button onClick={() => setSelectedTag(null)} className="text-sm text-red-500 font-bold hover:underline bg-red-50 px-4 py-2 rounded-xl">
                        {isEn ? "Clear Filter" : "Сбросить"}
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {regularPosts.map(post => (
                    <div key={post.id} onClick={() => { setSelectedPost(post); window.scrollTo(0, 0); }} className="bg-white rounded-[32px] overflow-hidden shadow-2xl shadow-black/[0.02] hover:shadow-black/[0.08] transition-all duration-500 border border-gray-100/50 flex flex-col h-full group hover:-translate-y-2 cursor-pointer">
                        <div className="relative h-64 overflow-hidden">
                            <img 
                                src={post.image} 
                                alt={post.titleEn} 
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                            />
                            <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-xl px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-gray-900 shadow-xl">
                                {post.category}
                            </div>
                        </div>
                        
                        <div className="p-10 flex flex-col flex-grow">
                            <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center space-x-3">
                                <span>{post.date}</span>
                                <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                                <span>{isEn ? post.authorEn : post.authorRu}</span>
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-5 tracking-tight group-hover:text-[var(--primary)] transition-colors leading-tight">
                                {isEn ? post.titleEn : post.titleRu}
                            </h3>
                            <p className="text-base text-gray-500 line-clamp-3 mb-8 flex-grow font-medium leading-relaxed">
                                {isEn ? post.excerptEn : post.excerptRu}
                            </p>
                            
                            {post.relatedRoute && (
                                <button 
                                    onClick={() => onBookRoute && onBookRoute(post.relatedRoute!.from, post.relatedRoute!.to)}
                                    className="w-full bg-[var(--primary)] text-white font-black py-4 px-6 rounded-2xl text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center group/btn shadow-xl shadow-[var(--primary)]/10 hover:shadow-[var(--primary)]/30"
                                >
                                    {isEn ? "Book This Route" : "Забронировать Маршрут"}
                                    <span className="ml-3 text-lg group-hover:translate-x-1 transition-transform">→</span>
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
          </div>

          {/* --- SIDEBAR --- */}
          <div className="lg:w-1/3">
             <div className="sticky top-32 space-y-12">
                
                {/* Newsletter */}
                <div className="bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute -top-10 -right-10 w-48 h-48 bg-[var(--primary)] rounded-full blur-[100px] opacity-20 animate-pulse"></div>
                    <div className="relative z-10">
                        <h3 className="text-2xl font-black mb-4 tracking-tight">{isEn ? "Join the Inner Circle" : "Не пропустите!"}</h3>
                        <p className="text-gray-400 text-sm mb-8 font-medium leading-relaxed">
                            {isEn ? "Get exclusive routes and hidden gems discovered by our local experts." : "Эксклюзивные маршруты и скрытые локации от наших экспертов."}
                        </p>
                        <form onSubmit={handleSubscribe} className="space-y-4">
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                className="w-full bg-white/10 border border-white/10 rounded-2xl px-6 py-4 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm font-medium transition-all"
                            />
                            <button type="submit" className="w-full bg-white text-slate-900 font-black py-4 rounded-2xl hover:bg-[var(--primary)] hover:text-white transition-all duration-500 uppercase tracking-widest text-[10px]">
                                {isEn ? "Subscribe Now" : "Подписаться"}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Topics */}
                <div className="bg-white rounded-[40px] p-10 shadow-2xl shadow-black/[0.02] border border-gray-100">
                    <h4 className="font-black text-slate-900 mb-8 text-[10px] uppercase tracking-[0.3em]">
                        {isEn ? "Curated Topics" : "Все Темы"}
                    </h4>
                    <div className="flex flex-wrap gap-3">
                        {tags.map((tag, idx) => (
                            <span 
                                key={idx} 
                                onClick={() => setSelectedTag(tag)}
                                className={`text-[10px] font-black uppercase tracking-widest px-5 py-3 rounded-xl border transition-all cursor-pointer ${selectedTag === tag ? 'bg-slate-900 text-white border-slate-900' : 'bg-gray-50 text-gray-500 border-gray-100 hover:bg-white hover:border-[var(--primary)] hover:text-[var(--primary)] hover:shadow-lg'}`}
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogList;