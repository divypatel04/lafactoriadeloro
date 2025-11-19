import React from 'react';
import './LegalPages.css';

const About = () => {
  return (
    <div className="legal-page about-page">
      <div className="legal-container">
        <h1>About La Factoria Del Oro</h1>
        <p className="intro-text">
          Welcome to La Factoria Del Oro, where timeless elegance meets exceptional craftsmanship. 
          We are passionate about creating exquisite jewelry pieces that celebrate life's most precious moments.
        </p>

        <section>
          <h2>Our Story</h2>
          <p>
            Founded with a vision to bring the finest quality jewelry to discerning customers, La Factoria Del Oro 
            has grown from a small workshop into a trusted name in fine jewelry. Our journey began with a simple 
            belief: that every piece of jewelry should tell a story and be crafted with uncompromising attention 
            to detail.
          </p>
          <p>
            Today, we continue to honor that tradition by sourcing the finest materials and working with master 
            craftsmen who share our passion for excellence. Each piece in our collection is carefully selected 
            or custom-designed to meet the highest standards of quality and beauty.
          </p>
        </section>

        <section>
          <h2>Our Commitment</h2>
          <p>We are committed to:</p>
          <ul>
            <li><strong>Quality Excellence:</strong> Every piece of jewelry undergoes rigorous quality checks to ensure it meets our exacting standards.</li>
            <li><strong>Ethical Sourcing:</strong> We responsibly source our materials, ensuring they meet ethical and environmental standards.</li>
            <li><strong>Customer Satisfaction:</strong> Your happiness is our priority. We provide personalized service and support throughout your journey with us.</li>
            <li><strong>Craftsmanship:</strong> We work with skilled artisans who bring decades of experience and passion to every creation.</li>
            <li><strong>Innovation:</strong> While respecting traditional techniques, we embrace modern design and technology to create unique pieces.</li>
          </ul>
        </section>

        <section>
          <h2>What We Offer</h2>
          <div className="offerings">
            <div className="offering-item">
              <h3>🌟 Engagement Rings</h3>
              <p>
                Our stunning collection of engagement rings features classic solitaires, vintage-inspired designs, 
                and modern masterpieces. Each ring is crafted to symbolize your unique love story.
              </p>
            </div>
            <div className="offering-item">
              <h3>💎 Fine Jewelry</h3>
              <p>
                From elegant necklaces to statement earrings, our fine jewelry collection offers pieces for 
                every occasion. Discover timeless designs that complement your personal style.
              </p>
            </div>
            <div className="offering-item">
              <h3>✨ Custom Design</h3>
              <p>
                Have a unique vision? Our expert designers work closely with you to bring your dream piece 
                to life, ensuring every detail reflects your personal taste and story.
              </p>
            </div>
            <div className="offering-item">
              <h3>💍 Wedding Bands</h3>
              <p>
                Complete your special day with the perfect wedding bands. Choose from our curated collection 
                or design custom bands that perfectly match your engagement ring.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2>Our Materials</h2>
          <p>
            We work exclusively with premium materials to ensure the longevity and beauty of our jewelry:
          </p>
          <ul>
            <li><strong>Gold:</strong> Available in yellow, white, and rose gold, sourced from responsible suppliers</li>
            <li><strong>Diamonds:</strong> Certified natural and lab-grown diamonds, ethically sourced</li>
            <li><strong>Gemstones:</strong> A curated selection of sapphires, emeralds, rubies, and more</li>
            <li><strong>Platinum:</strong> The finest platinum for those seeking ultimate luxury and durability</li>
          </ul>
        </section>

        <section>
          <h2>Why Choose Us?</h2>
          <div className="why-choose-grid">
            <div className="why-item">
              <h4>📦 Free Shipping</h4>
              <p>Complimentary shipping on all orders over $500</p>
            </div>
            <div className="why-item">
              <h4>🔒 Secure Shopping</h4>
              <p>Your transactions are protected with industry-leading security</p>
            </div>
            <div className="why-item">
              <h4>💬 Expert Guidance</h4>
              <p>Our jewelry consultants are here to help you make the perfect choice</p>
            </div>
            <div className="why-item">
              <h4>🎁 Elegant Packaging</h4>
              <p>Every piece arrives in beautiful, gift-ready packaging</p>
            </div>
            <div className="why-item">
              <h4>✅ Lifetime Warranty</h4>
              <p>We stand behind our craftsmanship with comprehensive warranties</p>
            </div>
            <div className="why-item">
              <h4>♻️ Easy Returns</h4>
              <p>30-day hassle-free returns on all purchases</p>
            </div>
          </div>
        </section>

        <section>
          <h2>Visit Us</h2>
          <p>
            We invite you to explore our collection online or visit our showroom to experience the quality 
            and craftsmanship firsthand. Our knowledgeable staff is ready to assist you in finding the 
            perfect piece or creating something uniquely yours.
          </p>
          <div className="contact-details">
            <p><strong>Email:</strong> info@lafactoriadeloro.com</p>
            <p><strong>Phone:</strong> (123) 456-7890</p>
            <p><strong>Hours:</strong> Monday - Saturday: 10:00 AM - 7:00 PM | Sunday: 12:00 PM - 5:00 PM</p>
          </div>
        </section>

        <section className="cta-section">
          <h2>Start Your Journey</h2>
          <p>
            Whether you're celebrating an engagement, anniversary, or simply treating yourself, 
            La Factoria Del Oro is here to make your jewelry dreams a reality.
          </p>
          <div className="cta-buttons">
            <a href="/shop" className="btn-primary">Browse Collection</a>
            <a href="/contact" className="btn-secondary">Contact Us</a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
