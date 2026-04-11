import Navbar from '@/components/customer/Navbar';
import HeroSection from '@/components/customer/HeroSection';
import CategoriesSection from '@/components/customer/CategoriesSection';
import FeaturedSection from '@/components/customer/FeaturedSection';
import OffersSection from '@/components/customer/OffersSection';
import Footer from '@/components/customer/Footer';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <CategoriesSection />
        <FeaturedSection />
        <OffersSection />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
