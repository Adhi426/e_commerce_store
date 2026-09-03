const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const { setMemoryProducts } = require('./controllers/productController');

dotenv.config();

const sampleProducts = [
  // 1. ELECTRONICS
  {
    name: 'Nexora Horizon ANC Wireless Headphones',
    description: 'Immersive spatial audio with hybrid active noise cancellation, 45-hour battery life, and ultra-soft memory foam earcups.',
    category: 'Electronics',
    price: 8999,
    originalPrice: 14999,
    discount: 40,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80'
    ],
    rating: 4.8,
    reviewsCount: 142,
    stock: 25,
    featured: true,
    specifications: {
      'Driver Size': '40mm Titanium Dynamic',
      'Battery Life': 'Up to 45 Hours',
      'Bluetooth': 'v5.3 Low Latency',
      'Weight': '240g'
    }
  },
  {
    name: 'Aura OLED Smartwatch Ultra Series 9',
    description: 'Precision health monitoring, AMOLED sapphire crystal display, dual-frequency GPS, and seamless iOS/Android sync.',
    category: 'Electronics',
    price: 12499,
    originalPrice: 18999,
    discount: 34,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80'
    ],
    rating: 4.9,
    reviewsCount: 98,
    stock: 18,
    featured: true,
    specifications: {
      'Display': '1.92 inch Sapphire AMOLED',
      'Water Resistance': '50M / 5 ATM',
      'Sensors': 'ECG, SpO2, Heart Rate, Temperature'
    }
  },
  {
    name: 'Pulse Pro True Wireless Earbuds',
    description: 'Custom acoustic driver, crystal clear quad-mic ENC calls, IPX7 water resistance, and wireless charging case.',
    category: 'Electronics',
    price: 3499,
    originalPrice: 5999,
    discount: 41,
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80'
    ],
    rating: 4.6,
    reviewsCount: 86,
    stock: 35,
    featured: false,
    specifications: {
      'Latency': '40ms Ultra Low',
      'Playtime': '32 Hours with Case'
    }
  },
  {
    name: 'Lumina 4K Portable Laser Projector',
    description: 'Cinematic 4K UHD projection, integrated Dolby Audio speakers, auto-keystone correction, and Android TV 11.',
    category: 'Electronics',
    price: 34999,
    originalPrice: 49999,
    discount: 30,
    images: [
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80'
    ],
    rating: 4.7,
    reviewsCount: 44,
    stock: 10,
    featured: true,
    specifications: {
      'Brightness': '2200 ANSI Lumens',
      'Resolution': '3840 x 2160 UHD'
    }
  },

  // 2. FASHION
  {
    name: 'Minimalist Charcoal Wool Overcoat',
    description: 'Crafted from premium Australian merino wool blend. Tailored modern fit designed for effortless sophistication.',
    category: 'Fashion',
    price: 6499,
    originalPrice: 9999,
    discount: 35,
    images: [
      'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=800&auto=format&fit=crop&q=80'
    ],
    rating: 4.7,
    reviewsCount: 65,
    stock: 14,
    featured: true,
    specifications: {
      'Material': '80% Merino Wool, 20% Cashmere',
      'Fit': 'Structured Slim Fit'
    }
  },
  {
    name: 'Urban Tech Stretch Blazer',
    description: 'Wrinkle-resistant 4-way stretch fabric tailored for modern executives. Breathable, lightweight, and versatile.',
    category: 'Fashion',
    price: 4299,
    originalPrice: 6999,
    discount: 38,
    images: [
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80'
    ],
    rating: 4.5,
    reviewsCount: 52,
    stock: 22,
    featured: false,
    specifications: {
      'Care': 'Dry Clean Recommended',
      'Color': 'Deep Midnight Navy'
    }
  },
  {
    name: 'Signature Organic Cotton Hoodie',
    description: 'Heavyweight 450 GSM organic French terry cotton. Ultra-soft interior with reinforced stitching and clean silhouette.',
    category: 'Fashion',
    price: 2499,
    originalPrice: 3999,
    discount: 37,
    images: [
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80'
    ],
    rating: 4.8,
    reviewsCount: 110,
    stock: 40,
    featured: false,
    specifications: {
      'Fabric': '100% GOTS Certified Organic Cotton',
      'Weight': '450 GSM Heavyweight'
    }
  },

  // 3. ACCESSORIES
  {
    name: 'Monaco Vintage Leather Chronograph Watch',
    description: 'Italian full-grain leather strap, sapphire crystal dome, precise Japanese quartz movement, and date window.',
    category: 'Accessories',
    price: 7999,
    originalPrice: 12999,
    discount: 38,
    images: [
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80'
    ],
    rating: 4.9,
    reviewsCount: 78,
    stock: 12,
    featured: true,
    specifications: {
      'Strap Width': '20mm Genuine Italian Leather',
      'Case Diameter': '41mm Stainless Steel'
    }
  },
  {
    name: 'Apex Carbon Fiber RFID Shield Wallet',
    description: 'Aerospace-grade real carbon fiber plates, quick-access pop-up card mechanism, and RFID blocking protection.',
    category: 'Accessories',
    price: 1899,
    originalPrice: 2999,
    discount: 36,
    images: [
      'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80'
    ],
    rating: 4.6,
    reviewsCount: 134,
    stock: 50,
    featured: false,
    specifications: {
      'Card Capacity': 'Up to 12 Cards',
      'Weight': '48g Light Weight'
    }
  },
  {
    name: 'Polarized Aviator Titan Sunglasses',
    description: 'Ultralight titanium frame, 100% UV400 polarized HD lenses with anti-reflective scratch coating.',
    category: 'Accessories',
    price: 2999,
    originalPrice: 4999,
    discount: 40,
    images: [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80'
    ],
    rating: 4.7,
    reviewsCount: 91,
    stock: 30,
    featured: true,
    specifications: {
      'Lens Technology': 'TAC 9-Layer Polarized Filter',
      'Frame Material': 'Beta Titanium'
    }
  },

  // 4. HOME & LIVING
  {
    name: 'Nordic Ceramic Coffee Pour-Over Set',
    description: 'Handcrafted ceramic carafe and dripper set with heat-resistant borosilicate glass and natural wood collar.',
    category: 'Home & Living',
    price: 2199,
    originalPrice: 3499,
    discount: 37,
    images: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80'
    ],
    rating: 4.8,
    reviewsCount: 68,
    stock: 20,
    featured: true,
    specifications: {
      'Capacity': '600ml / 4 Cups',
      'Material': 'High Temperature Ceramic & Wood'
    }
  },
  {
    name: 'Ergonomic Memory Foam Executive Desk Chair',
    description: 'Breathable 3D mesh backrest, adjustable 4D armrests, dynamic lumbar support, and heavy-duty steel base.',
    category: 'Home & Living',
    price: 14999,
    originalPrice: 22999,
    discount: 35,
    images: [
      'https://images.unsplash.com/photo-1580481072645-022f9a6d8310?w=800&auto=format&fit=crop&q=80'
    ],
    rating: 4.9,
    reviewsCount: 115,
    stock: 8,
    featured: true,
    specifications: {
      'Weight Capacity': '150 kg',
      'Recline': '90 - 135 Degrees Tilt'
    }
  },
  {
    name: 'Aroma Ultrasonic Diffuser & Ambient Lamp',
    description: 'Whisper-quiet ultrasonic mist technology, 7 warm LED light hues, auto shut-off, and real bamboo wood housing.',
    category: 'Home & Living',
    price: 1999,
    originalPrice: 2999,
    discount: 33,
    images: [
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=80'
    ],
    rating: 4.6,
    reviewsCount: 77,
    stock: 28,
    featured: false,
    specifications: {
      'Tank Capacity': '400ml',
      'Coverage Area': '350 sq ft'
    }
  },

  // 5. BEAUTY
  {
    name: 'Radiance Botanical Hydrating Face Serum',
    description: 'Infused with cold-pressed rosehip seed oil, hyaluronic acid, and Vitamin C for glowing youthful skin hydration.',
    category: 'Beauty',
    price: 1499,
    originalPrice: 2499,
    discount: 40,
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80'
    ],
    rating: 4.8,
    reviewsCount: 165,
    stock: 45,
    featured: true,
    specifications: {
      'Volume': '50ml',
      'Skin Type': 'All Skin Types (Dermatologist Tested)'
    }
  },
  {
    name: 'Velvet Rose Eau De Parfum Limited Edition',
    description: 'Seductive blend of Damask rose, smoked oud wood, warm amber, and subtle vanilla spices. Long-lasting luxury scent.',
    category: 'Beauty',
    price: 4999,
    originalPrice: 7999,
    discount: 37,
    images: [
      'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&auto=format&fit=crop&q=80'
    ],
    rating: 4.9,
    reviewsCount: 88,
    stock: 15,
    featured: true,
    specifications: {
      'Fragrance Type': 'Eau De Parfum (20% Essential Oils)',
      'Volume': '100ml'
    }
  },

  // 6. SPORTS
  {
    name: 'Vortex Cushion Pro Running Shoes',
    description: 'Engineered breathable mesh upper, responsive nitrogen-infused foam midsole, and high-traction rubber outsole.',
    category: 'Sports',
    price: 5499,
    originalPrice: 8499,
    discount: 35,
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&auto=format&fit=crop&q=80'
    ],
    rating: 4.8,
    reviewsCount: 128,
    stock: 22,
    featured: true,
    specifications: {
      'Arch Support': 'Neutral Cushioning',
      'Weight': '265g'
    }
  },
  {
    name: 'Pro-Grip Non-Slip Natural Rubber Yoga Mat',
    description: 'Eco-friendly 5mm thick natural tree rubber mat with alignment guide lines and sweat-activated grip surface.',
    category: 'Sports',
    price: 2299,
    originalPrice: 3499,
    discount: 34,
    images: [
      'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&auto=format&fit=crop&q=80'
    ],
    rating: 4.7,
    reviewsCount: 94,
    stock: 35,
    featured: false,
    specifications: {
      'Dimensions': '183cm x 68cm x 5mm',
      'Material': '100% Eco-Natural Rubber'
    }
  },
  {
    name: 'Titanium Hydro Vacuum Insulated Flask',
    description: 'Keep beverages piping hot for 18 hours or ice cold for 36 hours. Double-wall stainless steel with leakproof spout cap.',
    category: 'Sports',
    price: 1299,
    originalPrice: 1999,
    discount: 35,
    images: [
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80'
    ],
    rating: 4.8,
    reviewsCount: 210,
    stock: 60,
    featured: false,
    specifications: {
      'Capacity': '1000ml / 32 oz',
      'BPA Free': 'Yes'
    }
  }
];

const seedDB = async () => {
  try {
    const isDBConnected = mongoose.connection.readyState === 1;

    if (isDBConnected) {
      console.log('[NEXORA SEED] Purging existing products in MongoDB...');
      await Product.deleteMany({});
      const created = await Product.insertMany(sampleProducts);
      console.log(`[NEXORA SEED] Successfully inserted ${created.length} products into MongoDB database.`);
    } else {
      console.log('[NEXORA SEED] Populating in-memory product store for local operation...');
      const memoryFormat = sampleProducts.map((p, idx) => ({
        _id: `prod_${idx + 100}`,
        ...p,
        createdAt: new Date(),
      }));
      setMemoryProducts(memoryFormat);
      console.log(`[NEXORA SEED] Successfully populated ${memoryFormat.length} products in memory.`);
    }
  } catch (error) {
    console.error(`[NEXORA SEED ERROR]: ${error.message}`);
    // Populate memory fallback
    const memoryFormat = sampleProducts.map((p, idx) => ({
      _id: `prod_${idx + 100}`,
      ...p,
      createdAt: new Date(),
    }));
    setMemoryProducts(memoryFormat);
  }
};

if (require.main === module) {
  mongoose
    .connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nexora_db')
    .then(() => seedDB().then(() => mongoose.connection.close()))
    .catch(() => seedDB());
}

module.exports = { seedDB, sampleProducts };
