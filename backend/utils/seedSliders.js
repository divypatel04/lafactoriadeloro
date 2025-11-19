const mongoose = require('mongoose');
const Slider = require('../models/Slider.model');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

const defaultSliders = [
  {
    title: 'Exquisite Diamond Rings',
    subtitle: 'Handcrafted with Love',
    description: 'Discover our stunning collection of engagement rings',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1920&h=800&fit=crop',
    buttonText: 'Shop Now',
    buttonLink: '/shop',
    order: 1,
    isActive: true
  },
  {
    title: 'Luxury Gold Jewelry',
    subtitle: 'Timeless Elegance',
    description: 'Premium gold jewelry for your special moments',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1920&h=800&fit=crop',
    buttonText: 'Explore Collection',
    buttonLink: '/shop',
    order: 2,
    isActive: true
  },
  {
    title: 'Perfect Engagement Rings',
    subtitle: 'Say Yes Forever',
    description: 'Find the ring that tells your unique love story',
    image: 'https://images.unsplash.com/photo-1611591437611-0ee2e760877f?w=1920&h=800&fit=crop',
    buttonText: 'View Rings',
    buttonLink: '/shop',
    order: 3,
    isActive: true
  }
];

async function seedSliders() {
  try {
    // Check if sliders already exist
    const existingSliders = await Slider.countDocuments();
    
    if (existingSliders > 0) {
      console.log(`⏭️  Skipping seed - ${existingSliders} sliders already exist`);
      process.exit(0);
    }

    // Insert default sliders
    await Slider.insertMany(defaultSliders);
    console.log(`✅ Successfully seeded ${defaultSliders.length} sliders`);
    
  } catch (error) {
    console.error('❌ Error seeding sliders:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}

seedSliders();
