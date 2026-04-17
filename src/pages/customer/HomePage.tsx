import Navbar from '@/components/customer/Navbar';
import HeroSection from '@/components/customer/HeroSection';
import CategoriesSection from '@/components/customer/CategoriesSection';
import FeaturedSection from '@/components/customer/FeaturedSection';
import OffersSection from '@/components/customer/OffersSection';
import AboutSection from '@/components/customer/AboutSection';
import Footer from '@/components/customer/Footer';
import CartBubble from '@/components/customer/CartBubble';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <CategoriesSection />
        <FeaturedSection />
        <OffersSection />
      </main>
      <CartBubble />
      <Footer />
    </div>
  );
};

export default HomePage;
