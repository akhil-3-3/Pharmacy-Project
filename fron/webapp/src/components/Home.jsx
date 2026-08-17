import React from 'react';
import { Pill, Heart, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="bg-white min-h-screen font-sans">
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Pill size={28} className="text-emerald-600" />
              <span className="text-xl font-light tracking-tight text-gray-800">
                Pharma<span className="font-medium text-emerald-600">Care</span>
              </span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#" className="text-gray-600 hover:text-emerald-600 text-sm font-medium transition">Home</a>
              <a href="#" className="text-gray-600 hover:text-emerald-600 text-sm font-medium transition">Shop</a>
              <a href="#" className="text-gray-600 hover:text-emerald-600 text-sm font-medium transition">Health Blog</a>
            </div>

            <div className="hidden md:flex items-center gap-3">
             <Link to="/login">
                 <button className="text-gray-600 hover:text-emerald-600 text-sm font-medium transition">
                Sign In
              </button>
             </Link>
              <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-full text-sm font-medium transition">
                Get Started
              </button>
            </div>

            <button className="md:hidden text-gray-600">
                 <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      <section className="px-6 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-light tracking-tight text-gray-900 mb-6">
            Your Health,
            <span className="font-semibold text-emerald-600 block md:inline md:ml-3">
              Our Priority
            </span>
          </h1>

          <p className="text-gray-500 text-base md:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Licensed pharmacists, verified medicines, and free home delivery — because your health comes first.
            </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3.5 rounded-full text-sm font-medium transition shadow-sm hover:shadow-md">
              Order Medicines
            </button>
            <button className="border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 px-8 py-3.5 rounded-full text-sm font-medium transition">
              Consult Online
            </button>
          </div>

          <div className="flex items-center justify-center gap-6 mt-12 pt-4 text-xs text-gray-400">
            <span>✓ Free Delivery</span>
            <span>✓ 100% Authentic</span>
            <span>✓ 24/7 Support</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

