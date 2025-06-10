import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { Calendar, ArrowRight } from 'lucide-react';
import { getNews } from '../lib/supabase';
import { format } from 'date-fns';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  image_url: string;
  created_at: string;
  source: string;
  url: string;
}

const NewsSlider: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const { data, error } = await getNews();
        if (error) throw error;
        setNews(data || []);
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  // If no news data is available yet, use placeholder data
  const placeholderNews: NewsItem[] = [
    {
      id: '1',
      title: 'COVID-19 Update: NB.1.8.1 Variant Spreading',
      content: 'Doctors are warning about NB.1.8.1, a new COVID variant spreading fast with unusual gut symptoms like nausea and diarrhea.',
      image_url: 'https://images.unsplash.com/photo-1584118624012-df056829fbd0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      created_at: new Date().toISOString(),
      source: 'World Health Organization',
      url: 'https://www.thesun.ie/health/15343219/health-warning-doctors-new-covid-strain-symptoms',
    },
    {
      id: '2',
      title: 'Dengue Fever Cases Spike in Ernakulam',
      content: 'Nearly 300 cases reported in one week in Ernakulam, India. Public health officials intensify mosquito control efforts.',
      image_url: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      created_at: new Date().toISOString(),
      source: 'Times of India',
      url: 'https://timesofindia.indiatimes.com/city/kochi/dengue-cases-on-the-rise-in-ernakulam/articleshow/121735695.cms',
    },
    {
      id: '3',
      title: 'Cook Islands Declare Dengue Outbreak',
      content: 'Health officials confirm a dengue outbreak in Rarotonga with 17 cases reported. Enhanced surveillance in progress.',
      image_url: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      created_at: new Date().toISOString(),
      source: 'Cook Islands Ministry of Health',
      url: 'https://www.health.gov.ck/',
    },
    {
      id: '4',
      title: 'New Bat Coronavirus Nears Human Transmission',
      content: 'HKU5-CoV-2, a bat virus, is one small mutation away from infecting humans, say scientists. Surveillance recommended.',
      image_url: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      created_at: new Date().toISOString(),
      source: 'Nature Communications',
      url: 'https://www.nature.com/articles/s41467-024-48716-0',
    },
    {
      id: '5',
      title: 'Ayurvedic Remedies Ease Allergy Symptoms',
      content: 'Experts suggest neti pot, turmeric, and herbal steam can help reduce seasonal allergy issues naturally.',
      image_url: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&w=1000&q=80',
      created_at: new Date().toISOString(),
      source: 'Ayush Ministry',
      url: 'https://www.ayush.gov.in/',
    },
    {
      id: '6',
      title: 'Measles Vaccination Rates Fall Post-Pandemic',
      content: 'New U.S. data shows childhood measles shots dropped in over 80% of counties, raising fears of outbreaks.',
      image_url: 'https://images.unsplash.com/photo-1576765608866-5b51046452be?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      created_at: new Date().toISOString(),
      source: 'JAMA / AP News',
      url: 'https://apnews.com/article/87cbfe44d8599b68408861f9b62421ed',
    },
    {
      id: '7',
      title: 'Texas Reports Measles Death in Child',
      content: 'An unvaccinated child in Lubbock, TX died from measles, marking the first U.S. death in over a decade.',
      image_url: 'https://images.unsplash.com/photo-1576765608866-5b51046452be?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      created_at: new Date().toISOString(),
      source: 'Texas Department of Health',
      url: 'https://www.dshs.texas.gov/',
    },
    {
      id: '8',
      title: 'China Mandates Epidurals in Tertiary Hospitals',
      content: 'China will require all top-level hospitals to offer epidural anesthesia to promote safer childbirth nationwide.',
      image_url: 'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
      created_at: new Date().toISOString(),
      source: 'Reuters Health',
      url: 'https://www.reuters.com/business/healthcare-pharmaceuticals/china-make-all-hospitals-offer-epidurals-incentivise-childbirth-2025-06-09',
    },
    {
      id: '9',
      title: 'WHO Keeps Mpox a Global Health Emergency',
      content: 'WHO continues global health emergency status for mpox, urging prevention despite case declines.',
      image_url: 'https://st3.depositphotos.com/11486624/34906/i/450/depositphotos_349061954-stock-photo-world-health-organization-glass-building.jpg',
      created_at: new Date().toISOString(),
      source: 'World Health Organization',
      url: 'https://www.reuters.com/business/healthcare-pharmaceuticals/mpox-is-still-health-emergency-who-says-2025-06-09',
    },
    {
      id: '10',
      title: 'AI Predicts Child Malnutrition 6 Months Early',
      content: 'A new AI model helps forecast malnutrition in kids well in advance, aiding faster global response.',
      image_url: 'https://scx2.b-cdn.net/gfx/news/hires/2022/food-tracking-ai-syste.jpg',
      created_at: new Date().toISOString(),
      source: 'Lancet Global Health',
      url: 'https://www.thelancet.com/journals/langlo/home',
    }
  ];

  const displayNews = news.length > 0 ? news : placeholderNews;

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  return (
    <section className="py-20 bg-gray-900 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-red-600/20 via-pink-500/20 to-orange-500/20"
            animate={{
              x: [Math.random() * window.innerWidth, Math.random() * window.innerWidth],
              y: [Math.random() * window.innerHeight, Math.random() * window.innerHeight],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "linear",
            }}
            style={{
              width: `${Math.random() * 400 + 200}px`,
              height: `${Math.random() * 400 + 200}px`,
              filter: 'blur(80px)',
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-white"
          >
            Health <span className="bg-gradient-to-r from-red-600 via-pink-500 to-orange-500 text-transparent bg-clip-text">News</span> & Updates
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 max-w-2xl mx-auto text-xl text-gray-300"
          >
            Stay informed about the latest health news and viral diseases
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-white border-r-transparent"></div>
              <span className="ml-2 text-white">Loading news...</span>
            </div>
          ) : (
            <Swiper
              spaceBetween={30}
              centeredSlides={true}
              autoplay={{
                delay: 5000,
                disableOnInteraction: false,
              }}
              pagination={{
                clickable: true,
              }}
              navigation={true}
              modules={[Autoplay, Pagination, Navigation]}
              className="mySwiper"
            >
              {displayNews.map((item) => (
                <SwiperSlide key={item.id}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-gray-800/50 backdrop-blur-sm rounded-xl p-8">
                    <div className="h-64 md:h-96 overflow-hidden rounded-lg">
                      <img 
                        src={item.image_url} 
                        alt={item.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center text-gray-400 mb-2">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span className="text-sm">{formatDate(item.created_at)}</span>
                        <span className="mx-2">•</span>
                        <span className="text-sm">{item.source}</span>
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
                      <p className="text-gray-300 mb-6">{item.content}</p>
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-white bg-gradient-to-r from-red-600 via-pink-500 to-orange-500 px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
                      >
                        Read More <ArrowRight className="ml-2 h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default NewsSlider;