import { useState } from "react";
import Header from "@/components/Header";
import LoginOverlay from "@/components/LoginOverlay";
import TextPressure from "@/components/TextPressure";
import { Star } from "lucide-react";

export default function Index() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <Header onLoginClick={() => setIsLoginOpen(true)} />
      <LoginOverlay isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />

      {/* Hero Section */}
      <div className="relative min-h-[calc(100vh-69px)] flex items-center overflow-hidden bg-[#EAE9EA]">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://api.builder.io/api/v1/image/assets/TEMP/5f09d536d4c482425dd1dc2d93cc5204362c2c46?width=2880')`,
            backgroundPosition: 'right center',
          }}
        />

        <div className="relative z-10 w-full">
          <div className="container mx-auto px-4 sm:px-8 py-12 md:py-20">
            <div className="w-full">
              <div className="mb-8 md:mb-16 text-center">
                <h1
                  className="text-[#12953A] text-[90px] sm:text-[108px] md:text-[120px] lg:text-[210px] font-extrabold leading-tight"
                  style={{ fontFamily: '\"Gravitas One\", serif', fontWeight: 800 }}
                >
                  <span className="relative inline-block">
                    <TextPressure text="NutriWise" textColor="#12953A" strokeColor="#12953A" sizeMultiplier={6.5} />
                  </span>
                </h1>
              </div>

              <div className="space-y-6 max-w-2xl mx-0">
                <div className="relative">
                  <h2 className="text-[#181E4B] font-['Volkhov'] text-4xl sm:text-5xl md:text-5xl lg:text-[65px] font-bold leading-tight tracking-tight">
                    Affordable,{" "}
                    <span className="relative inline-block">
                      Healthy
                      <svg
                        className="absolute bottom-0 left-0 w-full"
                        style={{
                          height: '60px',
                          overflow: 'visible',
                          marginTop: '-20px',
                        }}
                        viewBox="0 0 341 60"
                        preserveAspectRatio="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M0 50 L341 10"
                          stroke="#DF6951"
                          strokeWidth="8"
                          fill="none"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                    ,
                    <br />
                    Personalized Nutrition
                    <br />
                    — For Everyone
                  </h2>
                </div>

                <p className="text-[#5E6282] font-['Poppins'] text-sm md:text-base font-medium leading-relaxed max-w-[430px] mt-8">
                  NutriWise creates AI meal plans by diet, budget, and local food culture.
                </p>

                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="inline-flex items-center justify-center bg-[#44A70F] text-white px-14 py-4 rounded-lg font-['Helvetica_Neue',sans-serif] text-base font-normal shadow-[0_18px_32px_rgba(241,165,1,0.15)] hover:bg-[#12953A] transition-colors mt-6 md:mt-8"
                >
                  Log In
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Smart Section */}
      <section id="features" className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-[#181E4B] font-['Volkhov'] text-4xl md:text-5xl font-bold leading-tight mb-6">
                Plan Smart. Eat Better.{" "}
                <span className="text-[#12953A]">Stay on Budget</span> with NutriWise.
              </h2>
              <p className="text-[#5E6282] font-['Poppins'] text-base font-medium leading-relaxed mb-6">
                AI-first designs your perfect meal plan—based on your goals, diet, and budget.
              </p>
              <p className="text-[#5E6282] font-['Poppins'] text-sm font-medium mb-8">
                Select your plan
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-[#12953A] text-white px-8 py-3 rounded-lg font-['Poppins'] font-medium hover:bg-[#44A70F] transition-colors">
                  Set My Budget
                </button>
                <button className="border border-[#5E6282] text-[#5E6282] px-8 py-3 rounded-lg font-['Poppins'] font-medium hover:bg-gray-50 transition-colors">
                  Generate My Plan
                </button>
              </div>
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop"
                alt="Healthy meal with vegetables and grains"
                className="w-full h-auto rounded-lg object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-8">
          <div className="text-center mb-16">
            <h2 className="text-[#181E4B] font-['Volkhov'] text-4xl md:text-5xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-[#5E6282] font-['Poppins'] text-base font-medium">
              Three simple steps to transform your eating habits
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "Step 1",
                title: "Set Your Budget",
                description: "Specify your meal and want to cover weeks of meals",
                icon: "💰",
              },
              {
                step: "Step 2",
                title: "Choose Preferences",
                description: "Select your diets, your diets, and fitness your budget",
                icon: "❤️",
              },
              {
                step: "Step 3",
                title: "AI Generates Meals",
                description: "Our personalized meal plans you to enjoy",
                icon: "⚙️",
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-8 rounded-lg text-center">
                <div className="text-sm font-['Poppins'] font-medium text-[#DF6951] mb-4">
                  {item.step}
                </div>
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-[#181E4B] font-['Volkhov'] text-xl font-bold mb-3">
                  {item.title}
                </h3>
                <p className="text-[#5E6282] font-['Poppins'] text-sm font-medium">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose NutriWise Section */}
      <section id="about" className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-8">
          <div className="text-center mb-16">
            <h2 className="text-[#181E4B] font-['Volkhov'] text-4xl md:text-5xl font-bold mb-4">
              Why Choose NutriWise?
            </h2>
            <p className="text-[#5E6282] font-['Poppins'] text-base font-medium">
              Smart meal planning powered by AI
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Personalized Plans",
                description: "Meal plans tailored to your unique diet, preferences, and lifestyle",
                icon: "👤",
              },
              {
                title: "Budget Tracking",
                description: "Stay on track for your target meal plan while maintaining quality meals",
                icon: "📊",
              },
              {
                title: "Nutrition Quality",
                description: "Well-sourced meals that deliver right nutrients with every bite",
                icon: "🥗",
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-8 rounded-lg border border-gray-100 text-center">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-[#181E4B] font-['Volkhov'] text-xl font-bold mb-3">
                  {item.title}
                </h3>
                <p className="text-[#5E6282] font-['Poppins'] text-sm font-medium">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-8">
          <div className="text-center mb-16">
            <h2 className="text-[#181E4B] font-['Volkhov'] text-4xl md:text-5xl font-bold mb-4">
              What Our Users Say
            </h2>
            <p className="text-[#5E6282] font-['Poppins'] text-base font-medium">
              Real stories from real people
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                rating: 5,
                text: "NutriWise helped me lose $250 a month on expensive groceries and feel great!",
                author: "Sarah Johnson",
                role: "Food Enthusiast",
              },
              {
                rating: 5,
                text: "This AI meal planner was perfect for my tight schedule and budget. Outstanding!",
                author: "Mike Chen",
                role: "Busy Professional",
              },
              {
                rating: 5,
                text: "Finally, healthy eating that doesn't break the bank. Love it!",
                author: "Emma Garcia",
                role: "Fitness Trainer",
              },
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-white p-8 rounded-lg">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} className="fill-[#DF6951] text-[#DF6951]" />
                  ))}
                </div>
                <p className="text-[#5E6282] font-['Poppins'] text-sm font-medium mb-6">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#12953A] rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.author[0]}
                  </div>
                  <div>
                    <p className="text-[#181E4B] font-['Poppins'] text-sm font-bold">
                      {testimonial.author}
                    </p>
                    <p className="text-[#5E6282] font-['Poppins'] text-xs">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-[#12953A]">
        <div className="container mx-auto px-4 sm:px-8 text-center">
          <h2 className="text-white font-['Volkhov'] text-4xl md:text-5xl font-bold mb-4">
            Start Your Healthy Journey Today
          </h2>
          <p className="text-white/90 font-['Poppins'] text-base font-medium mb-8">
            Stay fit and financially smart with NutriWise
          </p>
          <button
            onClick={() => setIsLoginOpen(true)}
            className="bg-white text-[#12953A] px-8 py-3 rounded-lg font-['Poppins'] font-medium hover:bg-gray-100 transition-colors inline-block"
          >
            Get Started Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#181E4B] text-white py-12">
        <div className="container mx-auto px-4 sm:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-['Gravitas_One'] text-xl mb-4">NutriWise</h3>
              <p className="text-gray-300 font-['Poppins'] text-sm">
                AI-powered meal planning for everyone
              </p>
            </div>
            <div>
              <h4 className="font-['Poppins'] font-bold text-sm mb-4">Quick Links</h4>
              <ul className="space-y-2 font-['Poppins'] text-sm text-gray-300">
                <li><button className="hover:text-white transition-colors">About Us</button></li>
                <li><button className="hover:text-white transition-colors">Pricing</button></li>
                <li><button className="hover:text-white transition-colors">Contact</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-['Poppins'] font-bold text-sm mb-4">Resources</h4>
              <ul className="space-y-2 font-['Poppins'] text-sm text-gray-300">
                <li><button className="hover:text-white transition-colors">Blog</button></li>
                <li><button className="hover:text-white transition-colors">FAQs</button></li>
                <li><button className="hover:text-white transition-colors">Privacy Policy</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-['Poppins'] font-bold text-sm mb-4">Contact</h4>
              <ul className="space-y-2 font-['Poppins'] text-sm text-gray-300">
                <li><button className="hover:text-white transition-colors">hello@nutriwise.io</button></li>
                <li><button className="hover:text-white transition-colors">+1 (555) 234-5678</button></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8">
            <p className="text-center text-gray-400 font-['Poppins'] text-sm">
              © 2025 NutriWise. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
