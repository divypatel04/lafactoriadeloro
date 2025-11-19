import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import { Link } from 'react-router-dom';
import { sliderService } from '../../services';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './HeroSlider.css';

const HeroSlider = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSliders();
  }, []);

  const loadSliders = async () => {
    try {
      const response = await sliderService.getAllSliders();
      setSlides(response);
    } catch (error) {
      console.error('Error loading sliders:', error);
      // Fallback to default slides if API fails
      setSlides([
        {
          _id: '1',
          image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1920&h=800&fit=crop',
          title: 'Exquisite Diamond Rings',
          subtitle: 'Handcrafted with Love',
          description: 'Discover our stunning collection of engagement rings',
          buttonText: 'Shop Now',
          buttonLink: '/shop'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    fade: true,
    pauseOnHover: true,
    arrows: true,
  };

  if (loading) {
    return <div className="hero-slider-loading">Loading...</div>;
  }

  if (slides.length === 0) {
    return null;
  }

  return (
    <div className="hero-slider-container">
      <Slider {...settings}>
        {slides.map((slide) => (
          <div key={slide._id} className="hero-slide">
            <div 
              className="hero-slide-image"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="hero-overlay"></div>
              <div className="container">
                <div className="hero-content">
                  <p className="hero-subtitle">{slide.subtitle}</p>
                  <h1 className="hero-title">{slide.title}</h1>
                  <p className="hero-description">{slide.description}</p>
                  <Link to={slide.buttonLink} className="hero-btn">
                    {slide.buttonText}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default HeroSlider;
