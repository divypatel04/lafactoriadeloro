import React, { useState } from 'react';
import './LegalPages.css';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      category: "Orders & Shipping",
      questions: [
        {
          q: "How long does shipping take?",
          a: "Standard shipping typically takes 3-5 business days within the continental United States. Express shipping (1-2 business days) is also available. International shipping times vary by destination but generally take 7-14 business days."
        },
        {
          q: "Do you offer free shipping?",
          a: "Yes! We offer free standard shipping on all orders over $500. For orders under $500, a flat shipping fee of $15 applies."
        },
        {
          q: "Can I track my order?",
          a: "Absolutely! Once your order ships, you'll receive a tracking number via email. You can also track your order by logging into your account and visiting the 'My Orders' section."
        },
        {
          q: "Do you ship internationally?",
          a: "Yes, we ship to most countries worldwide. International shipping rates and times vary by destination. Please note that customers are responsible for any customs duties or taxes imposed by their country."
        }
      ]
    },
    {
      category: "Products & Sizing",
      questions: [
        {
          q: "How do I determine my ring size?",
          a: "We recommend visiting a local jeweler for professional sizing. Alternatively, you can use our printable ring sizer available in our Ring Size Guide. Remember that fingers can swell throughout the day, so measure at different times for the most accurate result."
        },
        {
          q: "Are your diamonds certified?",
          a: "Yes, all of our diamonds 0.5 carats and above come with certification from reputable gemological laboratories such as GIA, AGS, or IGI. The certificate details the diamond's cut, clarity, color, and carat weight."
        },
        {
          q: "What is the difference between natural and lab-grown diamonds?",
          a: "Lab-grown diamonds are chemically, physically, and optically identical to natural diamonds but are created in controlled laboratory conditions. They offer the same brilliance and durability at a more accessible price point. Both options are available in our collection."
        },
        {
          q: "Can I customize a jewelry piece?",
          a: "Yes! We offer custom design services. Contact our design team to discuss your vision, and we'll work with you to create a unique piece that reflects your personal style and preferences."
        }
      ]
    },
    {
      category: "Returns & Exchanges",
      questions: [
        {
          q: "What is your return policy?",
          a: "We offer a 30-day return policy on all purchases. Items must be in their original condition with all tags and packaging intact. Custom or engraved items are final sale and cannot be returned."
        },
        {
          q: "How do I initiate a return?",
          a: "Log into your account, go to 'My Orders,' find your order, and click 'Request Return.' Follow the prompts to complete your return request. You'll receive a prepaid return shipping label via email."
        },
        {
          q: "Can I exchange an item?",
          a: "Yes, exchanges are available within 30 days of purchase. The process is similar to returns - simply indicate you'd like an exchange when submitting your return request, and specify what you'd like instead."
        },
        {
          q: "When will I receive my refund?",
          a: "Once we receive and inspect your return, your refund will be processed within 5-7 business days. The refund will be credited to your original payment method."
        }
      ]
    },
    {
      category: "Care & Maintenance",
      questions: [
        {
          q: "How should I clean my jewelry?",
          a: "For most jewelry, use warm water with mild dish soap and a soft brush. Gently scrub and rinse thoroughly. Pat dry with a lint-free cloth. For specific metals or gemstones, refer to our detailed Jewelry Care Guide or contact us for personalized advice."
        },
        {
          q: "How should I store my jewelry?",
          a: "Store each piece separately in a soft pouch or jewelry box to prevent scratching. Keep jewelry away from moisture, direct sunlight, and extreme temperatures. Remove jewelry before swimming, exercising, or using harsh chemicals."
        },
        {
          q: "Do you offer jewelry repair services?",
          a: "Yes, we provide professional repair and maintenance services for all jewelry purchased from us. Contact our customer service team for details and pricing."
        },
        {
          q: "What is included in my warranty?",
          a: "Our lifetime warranty covers manufacturing defects and craftsmanship issues. It includes free cleaning, inspections, and minor repairs. Normal wear and tear, accidental damage, and lost stones are not covered."
        }
      ]
    },
    {
      category: "Payment & Security",
      questions: [
        {
          q: "What payment methods do you accept?",
          a: "We accept all major credit cards (Visa, MasterCard, American Express, Discover), PayPal, and Apple Pay. All transactions are processed securely through industry-standard encryption."
        },
        {
          q: "Is it safe to shop on your website?",
          a: "Absolutely. We use SSL encryption to protect your personal and payment information. Our website is PCI DSS compliant, ensuring the highest standards of payment security."
        },
        {
          q: "Do you offer financing options?",
          a: "Yes, we partner with financing providers to offer flexible payment plans. Options are available at checkout, subject to credit approval."
        },
        {
          q: "Can I change or cancel my order?",
          a: "Orders can be modified or cancelled within 1 hour of placement. After this window, we begin processing your order and changes may not be possible. Contact us immediately if you need to make changes."
        }
      ]
    },
    {
      category: "Account & Support",
      questions: [
        {
          q: "Do I need an account to make a purchase?",
          a: "While you can checkout as a guest, creating an account allows you to track orders, save favorites, manage your wishlist, and enjoy a faster checkout experience on future purchases."
        },
        {
          q: "How do I reset my password?",
          a: "Click 'Sign In' at the top of the page, then select 'Forgot Password.' Enter your email address, and we'll send you a link to create a new password."
        },
        {
          q: "How can I contact customer service?",
          a: "You can reach us via email at info@lafactoriadeloro.com, call us at (123) 456-7890, or use the contact form on our website. Our team is available Monday-Saturday, 10 AM - 7 PM EST."
        },
        {
          q: "Do you have a physical store?",
          a: "Yes! We welcome you to visit our showroom to see our collection in person. Please check our Contact page for location details and hours of operation. We recommend calling ahead to schedule an appointment for personalized service."
        }
      ]
    }
  ];

  const toggleQuestion = (categoryIndex, questionIndex) => {
    const index = `${categoryIndex}-${questionIndex}`;
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="legal-page faq-page">
      <div className="legal-container">
        <h1>Frequently Asked Questions</h1>
        <p className="intro-text">
          Find answers to common questions about our products, services, and policies. 
          Can't find what you're looking for? <a href="/contact">Contact us</a> - we're here to help!
        </p>

        {faqs.map((category, categoryIndex) => (
          <section key={categoryIndex} className="faq-category">
            <h2>{category.category}</h2>
            <div className="faq-list">
              {category.questions.map((item, questionIndex) => {
                const index = `${categoryIndex}-${questionIndex}`;
                const isOpen = openIndex === index;
                
                return (
                  <div key={questionIndex} className={`faq-item ${isOpen ? 'open' : ''}`}>
                    <button
                      className="faq-question"
                      onClick={() => toggleQuestion(categoryIndex, questionIndex)}
                      aria-expanded={isOpen}
                    >
                      <span>{item.q}</span>
                      <span className="faq-icon">{isOpen ? '−' : '+'}</span>
                    </button>
                    {isOpen && (
                      <div className="faq-answer">
                        <p>{item.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        <section className="faq-cta">
          <h2>Still Have Questions?</h2>
          <p>Our customer service team is here to help you with any additional questions or concerns.</p>
          <div className="cta-buttons">
            <a href="/contact" className="btn-primary">Contact Us</a>
            <a href="mailto:samitom11jewelry@gmail.com" className="btn-secondary">Email Support</a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default FAQ;
