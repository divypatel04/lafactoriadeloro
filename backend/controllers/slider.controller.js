const Slider = require('../models/Slider.model');

// Get all sliders (public)
exports.getAllSliders = async (req, res) => {
  try {
    const sliders = await Slider.find({ isActive: true }).sort({ order: 1 });
    res.json(sliders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all sliders for admin (including inactive)
exports.getAdminSliders = async (req, res) => {
  try {
    const sliders = await Slider.find().sort({ order: 1 });
    res.json(sliders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get slider by ID
exports.getSliderById = async (req, res) => {
  try {
    const slider = await Slider.findById(req.params.id);
    if (!slider) {
      return res.status(404).json({ message: 'Slider not found' });
    }
    res.json(slider);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create slider
exports.createSlider = async (req, res) => {
  try {
    const { title, subtitle, description, image, buttonText, buttonLink, order, isActive } = req.body;

    const slider = new Slider({
      title,
      subtitle,
      description,
      image,
      buttonText,
      buttonLink,
      order,
      isActive
    });

    await slider.save();
    res.status(201).json(slider);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create slider', error: error.message });
  }
};

// Update slider
exports.updateSlider = async (req, res) => {
  try {
    const { title, subtitle, description, image, buttonText, buttonLink, order, isActive } = req.body;

    const slider = await Slider.findByIdAndUpdate(
      req.params.id,
      { title, subtitle, description, image, buttonText, buttonLink, order, isActive },
      { new: true, runValidators: true }
    );

    if (!slider) {
      return res.status(404).json({ message: 'Slider not found' });
    }

    res.json(slider);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update slider', error: error.message });
  }
};

// Delete slider
exports.deleteSlider = async (req, res) => {
  try {
    const slider = await Slider.findByIdAndDelete(req.params.id);
    
    if (!slider) {
      return res.status(404).json({ message: 'Slider not found' });
    }

    res.json({ message: 'Slider deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete slider', error: error.message });
  }
};

// Reorder sliders
exports.reorderSliders = async (req, res) => {
  try {
    const { sliders } = req.body; // Array of { id, order }

    const updatePromises = sliders.map(({ id, order }) =>
      Slider.findByIdAndUpdate(id, { order })
    );

    await Promise.all(updatePromises);

    res.json({ message: 'Sliders reordered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reorder sliders', error: error.message });
  }
};
