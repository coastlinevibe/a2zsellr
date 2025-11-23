// Default products for bulk upload - category-based product generation
// Each category gets 10 default products with realistic South African pricing

interface DefaultProduct {
  name: string
  description: string
  price_cents: number // Price in cents (R45.00 = 4500 cents)
  details: string
  image_url: string // Product image URL
}

interface CategoryProducts {
  [key: string]: DefaultProduct[]
}

const defaultProductsByCategory: CategoryProducts = {
  'business-to-business-service': [
    {
      name: 'Business Consultation',
      description: 'Professional business advisory services',
      price_cents: 150000, // R1500.00
      details: 'Strategic planning and business development',
      image_url: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Market Analysis Report',
      description: 'Comprehensive market research and analysis',
      price_cents: 250000, // R2500.00
      details: 'Industry trends and competitive analysis',
      image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Process Optimization',
      description: 'Streamline your business operations',
      price_cents: 200000, // R2000.00
      details: 'Efficiency improvements and cost reduction',
      image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Staff Training Program',
      description: 'Professional development workshops',
      price_cents: 180000, // R1800.00
      details: 'Skills development and team building',
      image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Financial Planning Service',
      description: 'Business financial strategy and planning',
      price_cents: 300000, // R3000.00
      details: 'Budget planning and financial forecasting',
      image_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Digital Transformation',
      description: 'Technology integration and automation',
      price_cents: 350000, // R3500.00
      details: 'Modernize your business processes',
      image_url: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Compliance Audit',
      description: 'Regulatory compliance assessment',
      price_cents: 220000, // R2200.00
      details: 'Ensure legal and regulatory compliance',
      image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Supply Chain Management',
      description: 'Optimize your supply chain operations',
      price_cents: 280000, // R2800.00
      details: 'Vendor management and logistics optimization',
      image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Quality Management System',
      description: 'ISO certification and quality control',
      price_cents: 320000, // R3200.00
      details: 'Quality assurance and certification support',
      image_url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Strategic Partnership Development',
      description: 'Build valuable business partnerships',
      price_cents: 400000, // R4000.00
      details: 'Network expansion and partnership facilitation',
      image_url: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&h=400&fit=crop&crop=center'
    }
  ],

  'guest-house': [
    {
      name: 'Standard Room (1 Night)',
      description: 'Comfortable accommodation with breakfast',
      price_cents: 85000, // R850.00
      details: 'Queen bed, en-suite bathroom, WiFi included',
      image_url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Deluxe Room (1 Night)',
      description: 'Spacious room with garden view',
      price_cents: 120000, // R1200.00
      details: 'King bed, balcony, premium amenities',
      image_url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Family Suite (1 Night)',
      description: 'Perfect for families with children',
      price_cents: 150000, // R1500.00
      details: 'Two bedrooms, kitchenette, living area',
      image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Continental Breakfast',
      description: 'Fresh breakfast served daily',
      price_cents: 12000, // R120.00
      details: 'Fresh fruits, pastries, coffee, juice',
      image_url: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Airport Transfer Service',
      description: 'Convenient transport to/from airport',
      price_cents: 35000, // R350.00
      details: 'Professional driver, comfortable vehicle',
      image_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Laundry Service',
      description: 'Professional cleaning and pressing',
      price_cents: 8000, // R80.00
      details: 'Same-day service available',
      image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Conference Room Rental',
      description: 'Professional meeting space',
      price_cents: 50000, // R500.00
      details: 'Projector, WiFi, catering available',
      image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Garden Wedding Package',
      description: 'Beautiful outdoor wedding venue',
      price_cents: 2500000, // R25000.00
      details: 'Ceremony setup, reception area, catering',
      image_url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Spa Treatment Package',
      description: 'Relaxing massage and wellness treatments',
      price_cents: 45000, // R450.00
      details: 'Full body massage, facial, aromatherapy',
      image_url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Extended Stay Package (7 nights)',
      description: 'Weekly accommodation discount',
      price_cents: 500000, // R5000.00
      details: 'Includes breakfast, cleaning service',
      image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=400&fit=crop&crop=center'
    }
  ],

  'business-management-consultant': [
    {
      name: 'Strategic Business Plan',
      description: 'Comprehensive 5-year business strategy',
      price_cents: 500000, // R5000.00
      details: 'Market analysis, financial projections, implementation roadmap',
      image_url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Operational Efficiency Audit',
      description: 'Complete business process review',
      price_cents: 350000, // R3500.00
      details: 'Identify bottlenecks and improvement opportunities',
      image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Leadership Development Program',
      description: 'Executive coaching and training',
      price_cents: 800000, // R8000.00
      details: '6-month program with one-on-one coaching',
      image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Change Management Consulting',
      description: 'Guide organizational transformation',
      price_cents: 450000, // R4500.00
      details: 'Change strategy, communication, training',
      image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Performance Management System',
      description: 'Employee evaluation and development',
      price_cents: 300000, // R3000.00
      details: 'KPI framework, review processes, training',
      image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Risk Assessment & Mitigation',
      description: 'Comprehensive business risk analysis',
      price_cents: 400000, // R4000.00
      details: 'Risk identification, mitigation strategies',
      image_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Digital Transformation Strategy',
      description: 'Technology adoption and integration',
      price_cents: 600000, // R6000.00
      details: 'Digital roadmap, system selection, implementation',
      image_url: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Financial Management Consulting',
      description: 'Cash flow and financial optimization',
      price_cents: 380000, // R3800.00
      details: 'Budget planning, cost reduction, profitability analysis',
      image_url: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Market Entry Strategy',
      description: 'New market expansion planning',
      price_cents: 550000, // R5500.00
      details: 'Market research, competitive analysis, go-to-market plan',
      image_url: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Succession Planning',
      description: 'Business continuity and leadership transition',
      price_cents: 700000, // R7000.00
      details: 'Leadership pipeline, knowledge transfer, transition planning',
      image_url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=400&fit=crop&crop=center'
    }
  ],

  'property-management-company': [
    {
      name: 'Residential Property Management',
      description: 'Full-service property management',
      price_cents: 80000, // R800.00 per month
      details: 'Tenant screening, rent collection, maintenance coordination',
      image_url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Commercial Property Management',
      description: 'Professional commercial property services',
      price_cents: 150000, // R1500.00 per month
      details: 'Lease management, facility maintenance, tenant relations',
      image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Property Maintenance Service',
      description: 'Regular maintenance and repairs',
      price_cents: 50000, // R500.00 per visit
      details: 'Plumbing, electrical, general repairs',
      image_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Tenant Screening Service',
      description: 'Comprehensive tenant background checks',
      price_cents: 25000, // R250.00 per application
      details: 'Credit check, employment verification, references',
      image_url: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Property Inspection Report',
      description: 'Detailed property condition assessment',
      price_cents: 35000, // R350.00 per inspection
      details: 'Move-in/out inspections, maintenance reports',
      image_url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Rent Collection Service',
      description: 'Automated rent collection and tracking',
      price_cents: 20000, // R200.00 per month
      details: 'Online payments, late fee management, reporting',
      image_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Property Marketing Package',
      description: 'Professional property advertising',
      price_cents: 40000, // R400.00 per listing
      details: 'Photography, online listings, marketing materials',
      image_url: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Legal Compliance Consulting',
      description: 'Property law and regulation guidance',
      price_cents: 60000, // R600.00 per consultation
      details: 'Lease agreements, eviction procedures, compliance',
      image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Emergency Response Service',
      description: '24/7 property emergency support',
      price_cents: 30000, // R300.00 per month
      details: 'After-hours maintenance, emergency repairs',
      image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Property Investment Analysis',
      description: 'Investment property evaluation',
      price_cents: 100000, // R1000.00 per analysis
      details: 'ROI analysis, market valuation, investment recommendations',
      image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=400&fit=crop&crop=center'
    }
  ],

  'solar-energy-company': [
    {
      name: 'Residential Solar Installation (5kW)',
      description: 'Complete home solar power system',
      price_cents: 12000000, // R120,000.00
      details: 'Panels, inverter, batteries, installation, 10-year warranty',
      image_url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Commercial Solar Installation (20kW)',
      description: 'Business solar power solution',
      price_cents: 40000000, // R400,000.00
      details: 'Industrial-grade panels, monitoring system, maintenance',
      image_url: 'https://images.unsplash.com/photo-1497440001374-f26997328c1b?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Solar Water Heating System',
      description: 'Efficient solar water heating',
      price_cents: 2500000, // R25,000.00
      details: 'Solar collectors, storage tank, installation',
      image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Battery Storage System (10kWh)',
      description: 'Energy storage for solar systems',
      price_cents: 8000000, // R80,000.00
      details: 'Lithium batteries, management system, installation',
      image_url: 'https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Solar System Maintenance',
      description: 'Annual maintenance and cleaning',
      price_cents: 150000, // R1,500.00
      details: 'Panel cleaning, system check, performance optimization',
      image_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Energy Audit & Consultation',
      description: 'Professional energy assessment',
      price_cents: 80000, // R800.00
      details: 'Energy usage analysis, solar potential assessment',
      image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Grid-Tie Inverter (5kW)',
      description: 'High-efficiency solar inverter',
      price_cents: 1200000, // R12,000.00
      details: 'MPPT technology, monitoring, 5-year warranty',
      image_url: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Solar Panel Upgrade',
      description: 'System expansion and upgrades',
      price_cents: 3000000, // R30,000.00
      details: 'Additional panels, system optimization',
      image_url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Solar Financing Package',
      description: 'Flexible payment solutions',
      price_cents: 50000, // R500.00 (monthly)
      details: 'Low-interest financing, flexible terms',
      image_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Emergency Backup System',
      description: 'Uninterrupted power supply',
      price_cents: 4500000, // R45,000.00
      details: 'Automatic switchover, battery backup, monitoring',
      image_url: 'https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=400&h=400&fit=crop&crop=center'
    }
  ],

  'electrical-installation-service': [
    {
      name: 'Home Electrical Installation',
      description: 'Complete residential wiring service',
      price_cents: 1500000, // R15,000.00
      details: 'New wiring, outlets, switches, safety compliance',
      image_url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Commercial Electrical Setup',
      description: 'Business electrical installation',
      price_cents: 5000000, // R50,000.00
      details: 'Three-phase power, lighting, emergency systems',
      image_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Electrical Safety Inspection',
      description: 'Comprehensive electrical audit',
      price_cents: 80000, // R800.00
      details: 'Safety check, compliance certificate, report',
      image_url: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'LED Lighting Installation',
      description: 'Energy-efficient lighting upgrade',
      price_cents: 250000, // R2,500.00
      details: 'LED fixtures, dimmer switches, smart controls',
      image_url: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Electrical Panel Upgrade',
      description: 'Modern distribution board installation',
      price_cents: 800000, // R8,000.00
      details: 'New panel, circuit breakers, safety switches',
      image_url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Emergency Electrical Repair',
      description: '24/7 electrical emergency service',
      price_cents: 120000, // R1,200.00
      details: 'Power outage repair, fault finding, urgent fixes',
      image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Smart Home Automation',
      description: 'Intelligent home electrical systems',
      price_cents: 2000000, // R20,000.00
      details: 'Smart switches, automated lighting, app control',
      image_url: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Industrial Motor Installation',
      description: 'Heavy-duty motor and control systems',
      price_cents: 3500000, // R35,000.00
      details: 'Motor installation, control panels, maintenance',
      image_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Electrical Maintenance Contract',
      description: 'Annual electrical maintenance service',
      price_cents: 300000, // R3,000.00 per year
      details: 'Regular inspections, preventive maintenance, priority service',
      image_url: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Generator Installation & Setup',
      description: 'Backup power generator installation',
      price_cents: 4000000, // R40,000.00
      details: 'Generator, automatic transfer switch, installation',
      image_url: 'https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=400&h=400&fit=crop&crop=center'
    }
  ],

  'car-dealer': [
    {
      name: 'New Vehicle Sales',
      description: 'Brand new vehicles with full warranty',
      price_cents: 35000000, // R350,000.00
      details: 'Latest models, financing available, trade-ins accepted',
      image_url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Pre-Owned Vehicle Sales',
      description: 'Quality used vehicles with guarantee',
      price_cents: 18000000, // R180,000.00
      details: 'Inspected vehicles, service history, warranty options',
      image_url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Vehicle Financing',
      description: 'Competitive vehicle finance packages',
      price_cents: 500000, // R5,000.00 (arrangement fee)
      details: 'Low interest rates, flexible terms, quick approval',
      image_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Vehicle Trade-In Service',
      description: 'Fair value for your current vehicle',
      price_cents: 15000000, // R150,000.00 (average trade value)
      details: 'Professional valuation, instant quotes, paperwork handled',
      image_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Extended Warranty Plans',
      description: 'Comprehensive vehicle protection',
      price_cents: 1200000, // R12,000.00
      details: 'Mechanical breakdown cover, roadside assistance',
      image_url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Vehicle Service & Maintenance',
      description: 'Professional vehicle servicing',
      price_cents: 150000, // R1,500.00
      details: 'Genuine parts, qualified technicians, service guarantee',
      image_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Vehicle Insurance Brokerage',
      description: 'Competitive insurance quotes',
      price_cents: 2400000, // R24,000.00 (annual premium)
      details: 'Multiple insurers, best rates, comprehensive cover',
      image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Vehicle Accessories & Parts',
      description: 'Genuine and aftermarket accessories',
      price_cents: 500000, // R5,000.00
      details: 'Tow bars, roof racks, sound systems, performance parts',
      image_url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Fleet Sales & Management',
      description: 'Business vehicle solutions',
      price_cents: 50000000, // R500,000.00 (fleet package)
      details: 'Volume discounts, fleet management, maintenance packages',
      image_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Vehicle Delivery Service',
      description: 'Convenient vehicle delivery',
      price_cents: 200000, // R2,000.00
      details: 'Home or office delivery, paperwork completion',
      image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center'
    }
  ],

  'auto-repair-shop': [
    {
      name: 'Engine Diagnostics & Repair',
      description: 'Complete engine diagnostic service',
      price_cents: 180000, // R1,800.00
      details: 'Computer diagnostics, engine repairs, performance tuning',
      image_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Brake System Service',
      description: 'Complete brake inspection and repair',
      price_cents: 120000, // R1,200.00
      details: 'Brake pads, discs, fluid replacement, safety check',
      image_url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Transmission Service',
      description: 'Automatic and manual transmission repair',
      price_cents: 350000, // R3,500.00
      details: 'Transmission rebuild, fluid service, clutch replacement',
      image_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Air Conditioning Service',
      description: 'Vehicle AC repair and maintenance',
      price_cents: 80000, // R800.00
      details: 'Gas recharge, compressor repair, system cleaning',
      image_url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Wheel Alignment & Balancing',
      description: 'Professional wheel alignment service',
      price_cents: 60000, // R600.00
      details: 'Computerized alignment, wheel balancing, tire inspection',
      image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Electrical System Repair',
      description: 'Vehicle electrical diagnostics and repair',
      price_cents: 150000, // R1,500.00
      details: 'Battery, alternator, starter motor, wiring repairs',
      image_url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Suspension & Steering Repair',
      description: 'Complete suspension system service',
      price_cents: 200000, // R2,000.00
      details: 'Shock absorbers, struts, steering components',
      image_url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Exhaust System Repair',
      description: 'Exhaust pipe and muffler service',
      price_cents: 100000, // R1,000.00
      details: 'Exhaust pipe replacement, muffler repair, emissions test',
      image_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Roadworthy Certificate',
      description: 'Official vehicle roadworthy inspection',
      price_cents: 50000, // R500.00
      details: 'Complete safety inspection, certificate issued',
      image_url: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Emergency Breakdown Service',
      description: '24/7 roadside assistance',
      price_cents: 80000, // R800.00
      details: 'Towing service, on-site repairs, battery jump-start',
      image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=400&fit=crop&crop=center'
    }
  ],

  'insurance-broker': [
    {
      name: 'Vehicle Insurance',
      description: 'Comprehensive car insurance coverage',
      price_cents: 2400000, // R24,000.00 per year
      details: 'Comprehensive, third party, accident cover',
      image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Home Insurance',
      description: 'Complete household insurance protection',
      price_cents: 1800000, // R18,000.00 per year
      details: 'Building, contents, personal liability cover',
      image_url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Business Insurance',
      description: 'Commercial business protection',
      price_cents: 3600000, // R36,000.00 per year
      details: 'Public liability, professional indemnity, assets',
      image_url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Life Insurance',
      description: 'Life and disability cover',
      price_cents: 1200000, // R12,000.00 per year
      details: 'Term life, whole life, disability benefits',
      image_url: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Medical Aid Consultation',
      description: 'Health insurance advisory service',
      price_cents: 50000, // R500.00 consultation
      details: 'Medical scheme comparison, benefit analysis',
      image_url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Travel Insurance',
      description: 'International and domestic travel cover',
      price_cents: 80000, // R800.00 per trip
      details: 'Medical emergencies, trip cancellation, baggage',
      image_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Investment Planning',
      description: 'Retirement and investment advice',
      price_cents: 200000, // R2,000.00 consultation
      details: 'Retirement annuities, unit trusts, tax planning',
      image_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Claims Assistance',
      description: 'Professional claims handling service',
      price_cents: 100000, // R1,000.00 per claim
      details: 'Claim submission, follow-up, dispute resolution',
      image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Risk Assessment',
      description: 'Comprehensive risk evaluation',
      price_cents: 150000, // R1,500.00
      details: 'Business risk analysis, coverage recommendations',
      image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Annual Policy Review',
      description: 'Insurance portfolio optimization',
      price_cents: 80000, // R800.00
      details: 'Coverage review, cost optimization, updates',
      image_url: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=400&fit=crop&crop=center'
    }
  ],

  'accounting-firm': [
    {
      name: 'Annual Financial Statements',
      description: 'Professional financial statement preparation',
      price_cents: 800000, // R8,000.00
      details: 'IFRS compliant, audited statements, CIPC filing',
      image_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Tax Return Preparation',
      description: 'Individual and company tax returns',
      price_cents: 250000, // R2,500.00
      details: 'SARS submissions, tax optimization, compliance',
      image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Monthly Bookkeeping',
      description: 'Professional bookkeeping services',
      price_cents: 150000, // R1,500.00 per month
      details: 'Transaction recording, reconciliations, reports',
      image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'VAT Returns & Compliance',
      description: 'VAT registration and return submissions',
      price_cents: 120000, // R1,200.00 per return
      details: 'VAT calculations, SARS submissions, compliance',
      image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Payroll Administration',
      description: 'Complete payroll processing service',
      price_cents: 200000, // R2,000.00 per month
      details: 'Salary calculations, UIF, PAYE, IRP5 certificates',
      image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Business Registration',
      description: 'Company and close corporation registration',
      price_cents: 180000, // R1,800.00
      details: 'CIPC registration, tax numbers, bank account setup',
      image_url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Financial Planning & Analysis',
      description: 'Business financial planning service',
      price_cents: 350000, // R3,500.00
      details: 'Cash flow projections, budgets, financial modeling',
      image_url: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Audit & Assurance Services',
      description: 'Independent audit and review services',
      price_cents: 1200000, // R12,000.00
      details: 'Statutory audits, management letters, compliance',
      image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'SARS Dispute Resolution',
      description: 'Tax dispute and objection handling',
      price_cents: 500000, // R5,000.00
      details: 'Tax objections, appeals, SARS correspondence',
      image_url: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Business Valuation',
      description: 'Professional business valuation service',
      price_cents: 800000, // R8,000.00
      details: 'Asset valuation, business worth assessment, reports',
      image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=400&fit=crop&crop=center'
    }
  ],

  'mill': [
    {
      name: 'Wheat Flour (50kg)',
      description: 'Premium quality wheat flour',
      price_cents: 85000, // R850.00
      details: 'Stone ground, high protein content, bakery grade',
      image_url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Maize Meal (25kg)',
      description: 'Traditional maize meal',
      price_cents: 45000, // R450.00
      details: 'Super fine, enriched with vitamins and minerals',
      image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Rice Flour (10kg)',
      description: 'Gluten-free rice flour',
      price_cents: 32000, // R320.00
      details: 'Fine texture, perfect for baking and cooking',
      image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Sorghum Flour (20kg)',
      description: 'Traditional sorghum flour',
      price_cents: 38000, // R380.00
      details: 'Nutritious, gluten-free, traditional grain',
      image_url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Cake Flour (12.5kg)',
      description: 'Premium cake flour',
      price_cents: 42000, // R420.00
      details: 'Low protein, fine texture, perfect for cakes',
      image_url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Bread Flour (25kg)',
      description: 'High protein bread flour',
      price_cents: 55000, // R550.00
      details: 'Strong flour, excellent gluten development',
      image_url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Bran (30kg)',
      description: 'Wheat bran for animal feed',
      price_cents: 28000, // R280.00
      details: 'High fiber, nutritious animal feed supplement',
      image_url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Custom Milling Service',
      description: 'Custom grain milling service',
      price_cents: 15000, // R150.00 per ton
      details: 'Bring your grain, we mill to specification',
      image_url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Bulk Flour Delivery',
      description: 'Bulk flour delivery service',
      price_cents: 25000, // R250.00 delivery fee
      details: 'Direct delivery to bakeries and businesses',
      image_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Grain Storage Service',
      description: 'Secure grain storage facility',
      price_cents: 8000, // R80.00 per ton per month
      details: 'Climate controlled, pest free storage',
      image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop&crop=center'
    }
  ],

  'mining-company': [
    {
      name: 'Coal Supply (1000 tons)',
      description: 'High-grade thermal coal',
      price_cents: 120000000, // R1,200,000.00
      details: 'Low sulfur content, high calorific value',
      image_url: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Iron Ore (500 tons)',
      description: 'Premium iron ore concentrate',
      price_cents: 85000000, // R850,000.00
      details: 'High iron content, low impurities',
      image_url: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Gold Mining Services',
      description: 'Gold extraction and processing',
      price_cents: 500000000, // R5,000,000.00
      details: 'Full mining operation, processing, refining',
      image_url: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Platinum Mining',
      description: 'Platinum group metals extraction',
      price_cents: 800000000, // R8,000,000.00
      details: 'PGM mining, processing, beneficiation',
      image_url: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Diamond Mining Services',
      description: 'Diamond extraction and sorting',
      price_cents: 1000000000, // R10,000,000.00
      details: 'Alluvial and kimberlite diamond mining',
      image_url: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Aggregate Supply (100 tons)',
      description: 'Construction aggregate materials',
      price_cents: 2500000, // R25,000.00
      details: 'Crushed stone, sand, gravel for construction',
      image_url: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Mining Equipment Rental',
      description: 'Heavy mining equipment rental',
      price_cents: 5000000, // R50,000.00 per month
      details: 'Excavators, dump trucks, drilling equipment',
      image_url: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Geological Survey',
      description: 'Professional geological assessment',
      price_cents: 1500000, // R15,000.00
      details: 'Site evaluation, mineral assessment, reports',
      image_url: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Environmental Compliance',
      description: 'Mining environmental compliance service',
      price_cents: 2000000, // R20,000.00
      details: 'Environmental impact assessments, permits',
      image_url: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Mine Safety Training',
      description: 'Comprehensive mine safety programs',
      price_cents: 800000, // R8,000.00
      details: 'Safety certification, training programs, compliance',
      image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop&crop=center'
    }
  ],

  'print-shop': [
    {
      name: 'Business Card Printing',
      description: 'Professional business cards',
      price_cents: 15000, // R150.00 per 500 cards
      details: 'Full color, premium paper, various finishes',
      image_url: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Flyer & Brochure Printing',
      description: 'Marketing material printing',
      price_cents: 25000, // R250.00 per 1000
      details: 'A4/A5 flyers, tri-fold brochures, full color',
      image_url: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Banner & Poster Printing',
      description: 'Large format printing service',
      price_cents: 35000, // R350.00 per m²
      details: 'Vinyl banners, posters, weather resistant',
      image_url: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Letterhead & Stationery',
      description: 'Corporate stationery printing',
      price_cents: 18000, // R180.00 per 500 sheets
      details: 'Letterheads, envelopes, compliment slips',
      image_url: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Book & Manual Binding',
      description: 'Professional binding services',
      price_cents: 12000, // R120.00 per book
      details: 'Spiral, perfect binding, hardcover options',
      image_url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Wedding Invitations',
      description: 'Custom wedding invitation printing',
      price_cents: 45000, // R450.00 per 100
      details: 'Custom design, premium paper, RSVP cards',
      image_url: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'T-Shirt Printing',
      description: 'Custom apparel printing',
      price_cents: 8000, // R80.00 per shirt
      details: 'Screen printing, vinyl transfer, embroidery',
      image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Digital Copying Service',
      description: 'High-volume copying and scanning',
      price_cents: 150, // R1.50 per page
      details: 'Black & white, color copying, scanning to PDF',
      image_url: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Lamination Service',
      description: 'Document lamination and protection',
      price_cents: 500, // R5.00 per A4 page
      details: 'Various sizes, matt or gloss finish',
      image_url: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Graphic Design Service',
      description: 'Professional design consultation',
      price_cents: 50000, // R500.00 per hour
      details: 'Logo design, layout design, artwork preparation',
      image_url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=400&fit=crop&crop=center'
    }
  ],

  'hotel': [
    {
      name: 'Standard Room (1 Night)',
      description: 'Comfortable hotel accommodation',
      price_cents: 120000, // R1,200.00
      details: 'Queen bed, en-suite, WiFi, breakfast included',
      image_url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Executive Suite (1 Night)',
      description: 'Luxury suite accommodation',
      price_cents: 250000, // R2,500.00
      details: 'Separate lounge, king bed, city view, premium amenities',
      image_url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Conference Room Rental',
      description: 'Professional meeting facilities',
      price_cents: 80000, // R800.00 per day
      details: 'Projector, WiFi, catering options, seating for 20',
      image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Wedding Venue Package',
      description: 'Complete wedding venue service',
      price_cents: 5000000, // R50,000.00
      details: 'Ceremony venue, reception hall, catering, coordination',
      image_url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Restaurant & Room Service',
      description: 'Fine dining and room service',
      price_cents: 35000, // R350.00 average meal
      details: 'À la carte menu, 24-hour room service, bar service',
      image_url: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Spa & Wellness Services',
      description: 'Relaxation and wellness treatments',
      price_cents: 60000, // R600.00 per treatment
      details: 'Massage, facial, sauna, fitness center access',
      image_url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Airport Shuttle Service',
      description: 'Convenient airport transportation',
      price_cents: 45000, // R450.00 per trip
      details: 'Scheduled shuttles, private transfers available',
      image_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Business Center Services',
      description: 'Business support facilities',
      price_cents: 15000, // R150.00 per hour
      details: 'Printing, fax, internet, secretarial services',
      image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Event Planning Service',
      description: 'Professional event coordination',
      price_cents: 200000, // R2,000.00 per event
      details: 'Corporate events, parties, full planning service',
      image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Laundry & Dry Cleaning',
      description: 'Professional cleaning services',
      price_cents: 12000, // R120.00 per load
      details: 'Same-day service, dry cleaning, pressing',
      image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center'
    }
  ],

  'butcher-shop': [
    {
      name: 'Lamb Chops 500g',
      description: 'Best quality chops, very soft cut',
      price_cents: 4500, // R45.00
      details: 'Clean, Nice red color, Juicy and soft, Not too boney',
      image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Beef Steaks 1kg',
      description: 'Premium cuts, tender and juicy',
      price_cents: 8500, // R85.00
      details: 'Fresh, Grade A beef, Perfect for grilling',
      image_url: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Chicken Breasts 500g',
      description: 'Fresh, lean protein',
      price_cents: 3500, // R35.00
      details: 'Skinless, boneless, farm fresh',
      image_url: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Pork Ribs 1kg',
      description: 'Succulent and flavorful',
      price_cents: 6500, // R65.00
      details: 'Meaty ribs, perfect for braai',
      image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Beef Mince 500g',
      description: 'Fresh ground beef',
      price_cents: 4000, // R40.00
      details: 'Lean mince, daily fresh preparation',
      image_url: 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Boerewors 1kg',
      description: 'Traditional South African sausage',
      price_cents: 5500, // R55.00
      details: 'Authentic recipe, coarse grind',
      image_url: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Bacon 500g',
      description: 'Crispy, smoky flavor',
      price_cents: 5000, // R50.00
      details: 'Streaky bacon, perfect thickness',
      image_url: 'https://images.unsplash.com/photo-1528607929212-2636ec44b982?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Chicken Thighs 1kg',
      description: 'Juicy and tender',
      price_cents: 4500, // R45.00
      details: 'Bone-in thighs, skin-on',
      image_url: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Beef Biltong 250g',
      description: 'Dried, seasoned meat',
      price_cents: 7500, // R75.00
      details: 'Traditional spices, air-dried',
      image_url: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Sosaties 500g',
      description: 'Marinated meat skewers',
      price_cents: 6000, // R60.00
      details: 'Mixed meat, traditional marinade',
      image_url: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&h=400&fit=crop&crop=center'
    }
  ],

  'restaurant': [
    {
      name: 'Grilled Chicken Burger',
      description: 'Juicy grilled chicken with fresh salad',
      price_cents: 8500, // R85.00
      details: 'Served with chips and sauce',
      image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Beef Steak 300g',
      description: 'Premium beef steak cooked to perfection',
      price_cents: 12500, // R125.00
      details: 'Choice of sauce, served with vegetables',
      image_url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Fish and Chips',
      description: 'Fresh fish with golden chips',
      price_cents: 9500, // R95.00
      details: 'Served with tartar sauce and lemon',
      image_url: 'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Chicken Schnitzel',
      description: 'Crispy breaded chicken breast',
      price_cents: 8000, // R80.00
      details: 'Served with mushroom sauce',
      image_url: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Pasta Bolognese',
      description: 'Traditional meat sauce pasta',
      price_cents: 7500, // R75.00
      details: 'Rich tomato and meat sauce',
      image_url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Caesar Salad',
      description: 'Fresh lettuce with Caesar dressing',
      price_cents: 6500, // R65.00
      details: 'Croutons, parmesan, grilled chicken',
      image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Pizza Margherita',
      description: 'Classic tomato and mozzarella pizza',
      price_cents: 8500, // R85.00
      details: 'Fresh basil, wood-fired oven',
      image_url: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Lamb Curry',
      description: 'Tender lamb in rich curry sauce',
      price_cents: 9500, // R95.00
      details: 'Served with rice and naan bread',
      image_url: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Seafood Platter',
      description: 'Mixed seafood selection',
      price_cents: 15500, // R155.00
      details: 'Prawns, calamari, fish, mussels',
      image_url: 'https://images.unsplash.com/photo-1559847844-d721426d6edc?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Chocolate Cake',
      description: 'Rich chocolate dessert',
      price_cents: 4500, // R45.00
      details: 'Served with vanilla ice cream',
      image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop&crop=center'
    }
  ],

  'bakery': [
    {
      name: 'Fresh White Bread',
      description: 'Daily baked white loaf',
      price_cents: 1500, // R15.00
      details: 'Soft, fresh, perfect for sandwiches',
      image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Whole Wheat Bread',
      description: 'Healthy whole wheat loaf',
      price_cents: 1800, // R18.00
      details: 'High fiber, nutritious',
      image_url: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Croissants (6 pack)',
      description: 'Buttery, flaky pastries',
      price_cents: 3500, // R35.00
      details: 'Perfect for breakfast',
      image_url: 'https://images.unsplash.com/photo-1555507036-ab794f4afe5e?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Chocolate Muffins (4 pack)',
      description: 'Rich chocolate chip muffins',
      price_cents: 2800, // R28.00
      details: 'Moist and delicious',
      image_url: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Meat Pies (2 pack)',
      description: 'Traditional South African pies',
      price_cents: 2500, // R25.00
      details: 'Beef mince filling, flaky pastry',
      image_url: 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Sausage Rolls (4 pack)',
      description: 'Savory sausage in pastry',
      price_cents: 3200, // R32.00
      details: 'Perfect snack or lunch',
      image_url: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Birthday Cake (Small)',
      description: 'Custom decorated cake',
      price_cents: 12000, // R120.00
      details: 'Vanilla or chocolate, serves 8-10',
      image_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Rusks (500g)',
      description: 'Traditional South African rusks',
      price_cents: 4500, // R45.00
      details: 'Perfect with coffee or tea',
      image_url: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Donuts (6 pack)',
      description: 'Fresh glazed donuts',
      price_cents: 3000, // R30.00
      details: 'Various flavors available',
      image_url: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Sandwich Platters',
      description: 'Assorted sandwich selection',
      price_cents: 8500, // R85.00
      details: 'Perfect for meetings or events',
      image_url: 'https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=400&h=400&fit=crop&crop=center'
    }
  ],

  'grocery': [
    {
      name: 'Fresh Milk 2L',
      description: 'Full cream fresh milk',
      price_cents: 2200, // R22.00
      details: 'Farm fresh, daily delivery',
      image_url: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Brown Eggs (18 pack)',
      description: 'Free range brown eggs',
      price_cents: 4500, // R45.00
      details: 'Large size, farm fresh',
      image_url: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'White Sugar 2.5kg',
      description: 'Pure white sugar',
      price_cents: 3500, // R35.00
      details: 'Premium quality',
      image_url: 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Cooking Oil 2L',
      description: 'Sunflower cooking oil',
      price_cents: 4200, // R42.00
      details: 'Light and healthy',
      image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Rice 2kg',
      description: 'Long grain white rice',
      price_cents: 2800, // R28.00
      details: 'Premium quality rice',
      image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Potatoes 2kg',
      description: 'Fresh local potatoes',
      price_cents: 2500, // R25.00
      details: 'Perfect for cooking and baking',
      image_url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Onions 2kg',
      description: 'Fresh yellow onions',
      price_cents: 2200, // R22.00
      details: 'Essential cooking ingredient',
      image_url: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Tomatoes 1kg',
      description: 'Fresh ripe tomatoes',
      price_cents: 2800, // R28.00
      details: 'Perfect for salads and cooking',
      image_url: 'https://images.unsplash.com/photo-1546470427-e5380e2047ca?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Bananas 1kg',
      description: 'Sweet ripe bananas',
      price_cents: 2000, // R20.00
      details: 'Healthy and nutritious',
      image_url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Apples 1kg',
      description: 'Fresh red apples',
      price_cents: 3500, // R35.00
      details: 'Crisp and sweet',
      image_url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=400&fit=crop&crop=center'
    }
  ]
}

// Fallback products for unknown categories
const fallbackProducts: DefaultProduct[] = [
  {
    name: 'Product 1',
    description: 'Quality product for your needs',
    price_cents: 5000, // R50.00
    details: 'High quality, great value',
    image_url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&crop=center'
  },
  {
    name: 'Product 2',
    description: 'Premium service offering',
    price_cents: 7500, // R75.00
    details: 'Professional service, excellent results',
    image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=400&fit=crop&crop=center'
  },
  {
    name: 'Product 3',
    description: 'Essential item',
    price_cents: 3500, // R35.00
    details: 'Must-have product',
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop&crop=center'
  },
  {
    name: 'Product 4',
    description: 'Popular choice',
    price_cents: 4500, // R45.00
    details: 'Customer favorite',
    image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&crop=center'
  },
  {
    name: 'Product 5',
    description: 'Special offer',
    price_cents: 6000, // R60.00
    details: 'Limited time special',
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&crop=center'
  },
  {
    name: 'Product 6',
    description: 'Value package',
    price_cents: 8000, // R80.00
    details: 'Great value for money',
    image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop&crop=center'
  },
  {
    name: 'Product 7',
    description: 'Premium option',
    price_cents: 9500, // R95.00
    details: 'Top quality choice',
    image_url: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=400&h=400&fit=crop&crop=center'
  },
  {
    name: 'Product 8',
    description: 'Standard service',
    price_cents: 4000, // R40.00
    details: 'Reliable and affordable',
    image_url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400&h=400&fit=crop&crop=center'
  },
  {
    name: 'Product 9',
    description: 'Deluxe package',
    price_cents: 12000, // R120.00
    details: 'Complete solution',
    image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop&crop=center'
  },
  {
    name: 'Product 10',
    description: 'Basic option',
    price_cents: 2500, // R25.00
    details: 'Simple and effective',
    image_url: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=400&h=400&fit=crop&crop=center'
  }
]

/**
 * Get default products for a specific category
 * Returns 10 products tailored to the business category
 */
export function getDefaultProductsForCategory(category: string): DefaultProduct[] {
  if (!category) {
    console.log('⚠️ No category provided, using fallback products')
    return fallbackProducts
  }

  // Normalize category name
  const normalizedCategory = category.toLowerCase().replace(/\s+/g, '-')
  
  console.log(`🔍 Looking for products for category: "${category}" (normalized: "${normalizedCategory}")`)
  
  // Try exact match first
  if (defaultProductsByCategory[normalizedCategory]) {
    console.log(`✅ Found exact match for category: ${normalizedCategory}`)
    return defaultProductsByCategory[normalizedCategory]
  }
  
  // Try partial matches for common variations
  const categoryMappings: { [key: string]: string } = {
    'butcher': 'butcher-shop',
    'butchery': 'butcher-shop',
    'meat': 'butcher-shop',
    'restaurant': 'restaurant',
    'food': 'restaurant',
    'cafe': 'restaurant',
    'bakery': 'bakery',
    'bread': 'bakery',
    'grocery': 'grocery',
    'shop': 'grocery',
    'store': 'grocery',
    'supermarket': 'grocery',
    'business-to-business': 'business-to-business-service',
    'b2b': 'business-to-business-service',
    'guest-house': 'guest-house',
    'guesthouse': 'guest-house',
    'accommodation': 'guest-house',
    'lodge': 'guest-house',
    'business-management': 'business-management-consultant',
    'management-consultant': 'business-management-consultant',
    'consultant': 'business-management-consultant',
    'consulting': 'business-management-consultant',
    'property-management': 'property-management-company',
    'property': 'property-management-company',
    'real-estate': 'property-management-company',
    'solar-energy': 'solar-energy-company',
    'solar': 'solar-energy-company',
    'renewable-energy': 'solar-energy-company',
    'electrical-installation': 'electrical-installation-service',
    'electrical': 'electrical-installation-service',
    'electrician': 'electrical-installation-service',
    'electric': 'electrical-installation-service',
    'car-dealer': 'car-dealer',
    'ford-dealer': 'car-dealer',
    'toyota-dealer': 'car-dealer',
    'bmw-dealer': 'car-dealer',
    'mercedes-dealer': 'car-dealer',
    'volkswagen-dealer': 'car-dealer',
    'nissan-dealer': 'car-dealer',
    'hyundai-dealer': 'car-dealer',
    'kia-dealer': 'car-dealer',
    'mazda-dealer': 'car-dealer',
    'honda-dealer': 'car-dealer',
    'dealer': 'car-dealer',
    'dealership': 'car-dealer',
    'automotive': 'car-dealer',
    'vehicle-sales': 'car-dealer',
    'auto-repair': 'auto-repair-shop',
    'auto-service': 'auto-repair-shop',
    'mechanic': 'auto-repair-shop',
    'garage': 'auto-repair-shop',
    'motor-repair': 'auto-repair-shop',
    'insurance-broker': 'insurance-broker',
    'insurance': 'insurance-broker',
    'broker': 'insurance-broker',
    'financial-advisor': 'insurance-broker',
    'accounting-firm': 'accounting-firm',
    'accounting': 'accounting-firm',
    'accountant': 'accounting-firm',
    'bookkeeper': 'accounting-firm',
    'tax-consultant': 'accounting-firm',
    'auditor': 'accounting-firm',
    'mill': 'mill',
    'flour-mill': 'mill',
    'grain-mill': 'mill',
    'mining-company': 'mining-company',
    'mining': 'mining-company',
    'mine': 'mining-company',

    'web-designer': 'website-designer',
    'web-developer': 'website-designer',
    'website-developer': 'website-designer',

    'software': 'software-company',
    'software-developer': 'software-company',
    'tech-company': 'software-company',

    'security': 'security-service',
    'security-company': 'security-service',
    'print-shop': 'print-shop',
    'printing': 'print-shop',
    'printer': 'print-shop',
    'household-goods-wholesaler': 'household-goods-wholesaler',
    'household-goods': 'household-goods-wholesaler',
    'wholesaler': 'household-goods-wholesaler',
    'corporate-office': 'corporate-office',
    'office': 'corporate-office',
    'business-center': 'corporate-office',

    'business-administration-service': 'business-management-consultant',
    'holding-company': 'business-management-consultant',

    'construction': 'construction-company',
    'builder': 'construction-company',

    'motor-vehicle-dealer': 'car-dealer',
    'computer-support-and-services': 'software-company',

    'supermarket': 'grocery',

    'real-estate-agent': 'property-management-company',

    'life-coach': 'business-management-consultant',

    'lawyer': 'business-management-consultant',
    'graphic-designer': 'website-designer',

    'serviced-accommodation': 'hotel',

    'used-car-dealer': 'car-dealer',

    'seafood-restaurant': 'restaurant',


    'investment-service': 'insurance-broker',
    'second-hand-store': 'grocery',
    'mens-clothing-store': 'clothing-store',
    'real-estate-agency': 'property-management-company',
    'pharmacy': 'pharmacy',
    'womens-clothing-store': 'clothing-store',
    'marketing-agency': 'website-designer'
  }
  
  // Check if any mapping key is contained in the category
  for (const [key, mappedCategory] of Object.entries(categoryMappings)) {
    if (normalizedCategory.includes(key)) {
      console.log(`✅ Found partial match: "${key}" -> "${mappedCategory}" for category "${category}"`)
      const products = defaultProductsByCategory[mappedCategory]
      if (products && products.length > 0) {
        console.log(`📦 Returning ${products.length} products for ${mappedCategory}`)
        return products
      } else {
        console.log(`⚠️ Mapped category "${mappedCategory}" has no products, using fallback`)
        return fallbackProducts
      }
    }
  }
  
  console.log(`⚠️ No match found for category: "${category}", using fallback products`)
  return fallbackProducts
}

/**
 * Get all available categories with products
 */
export function getAvailableCategories(): string[] {
  return Object.keys(defaultProductsByCategory)
}

/**
 * Check if a category has specific products defined
 */
export function hasCategoryProducts(category: string): boolean {
  const normalizedCategory = category.toLowerCase().replace(/\s+/g, '-')
  return normalizedCategory in defaultProductsByCategory
}

/**
 * Get default gallery image for a business category
 */
export function getDefaultGalleryImage(category: string): string {
  const normalizedCategory = category.toLowerCase().replace(/\s+/g, '-')
  
  const galleryImages: { [key: string]: string } = {
    'butcher-shop': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800&h=600&fit=crop&crop=center',
    'butchery': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800&h=600&fit=crop&crop=center',
    'restaurant': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop&crop=center',
    'bakery': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=600&fit=crop&crop=center',
    'grocery': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=600&fit=crop&crop=center'
  }
  
  // Try exact match first
  if (galleryImages[normalizedCategory]) {
    return galleryImages[normalizedCategory]
  }
  
  // Try partial matches
  for (const [key, imageUrl] of Object.entries(galleryImages)) {
    if (normalizedCategory.includes(key) || key.includes(normalizedCategory)) {
      return imageUrl
    }
  }
  
  // Default business image
  return 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop&crop=center'
}

// Additional categories for comprehensive coverage
const additionalCategories: CategoryProducts = {
  'website-designer': [
    {
      name: 'Custom Website Design',
      description: 'Professional website design and development',
      price_cents: 1500000, // R15,000.00
      details: 'Responsive design, SEO optimized, mobile friendly',
      image_url: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'E-commerce Website',
      description: 'Online store development',
      price_cents: 2500000, // R25,000.00
      details: 'Shopping cart, payment gateway, inventory management',
      image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Website Maintenance',
      description: 'Monthly website maintenance service',
      price_cents: 80000, // R800.00 per month
      details: 'Updates, backups, security monitoring, support',
      image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'SEO Optimization',
      description: 'Search engine optimization service',
      price_cents: 120000, // R1,200.00 per month
      details: 'Keyword research, content optimization, rankings',
      image_url: 'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Logo Design Package',
      description: 'Professional logo and branding',
      price_cents: 350000, // R3,500.00
      details: 'Logo concepts, brand guidelines, file formats',
      image_url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Website Hosting Service',
      description: 'Reliable web hosting solution',
      price_cents: 25000, // R250.00 per month
      details: 'Fast servers, SSL certificate, daily backups',
      image_url: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Content Management System',
      description: 'Easy-to-use CMS setup',
      price_cents: 500000, // R5,000.00
      details: 'WordPress, training, custom features',
      image_url: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Social Media Integration',
      description: 'Social media platform integration',
      price_cents: 180000, // R1,800.00
      details: 'Facebook, Instagram, Twitter integration',
      image_url: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Website Analytics Setup',
      description: 'Google Analytics and tracking setup',
      price_cents: 120000, // R1,200.00
      details: 'Analytics installation, reporting, insights',
      image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Website Speed Optimization',
      description: 'Performance optimization service',
      price_cents: 200000, // R2,000.00
      details: 'Page speed improvement, caching, optimization',
      image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=400&fit=crop&crop=center'
    }
  ],

  'software-company': [
    {
      name: 'Custom Software Development',
      description: 'Bespoke software solutions',
      price_cents: 5000000, // R50,000.00
      details: 'Custom applications, database design, integration',
      image_url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Mobile App Development',
      description: 'iOS and Android app development',
      price_cents: 8000000, // R80,000.00
      details: 'Native apps, cross-platform, app store deployment',
      image_url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Software Maintenance & Support',
      description: 'Ongoing software support service',
      price_cents: 300000, // R3,000.00 per month
      details: 'Bug fixes, updates, technical support, monitoring',
      image_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Database Design & Management',
      description: 'Professional database solutions',
      price_cents: 2500000, // R25,000.00
      details: 'Database architecture, optimization, backup systems',
      image_url: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Cloud Migration Services',
      description: 'Move your systems to the cloud',
      price_cents: 4000000, // R40,000.00
      details: 'AWS, Azure, Google Cloud migration and setup',
      image_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Software Training Programs',
      description: 'User training and documentation',
      price_cents: 150000, // R1,500.00 per session
      details: 'User manuals, training sessions, video tutorials',
      image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'API Development & Integration',
      description: 'Custom API development service',
      price_cents: 1800000, // R18,000.00
      details: 'REST APIs, third-party integrations, documentation',
      image_url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Software Testing & QA',
      description: 'Comprehensive software testing',
      price_cents: 1200000, // R12,000.00
      details: 'Automated testing, manual QA, performance testing',
      image_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'DevOps & Deployment',
      description: 'Continuous integration and deployment',
      price_cents: 2200000, // R22,000.00
      details: 'CI/CD pipelines, automated deployment, monitoring',
      image_url: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Software Licensing & Consultation',
      description: 'Software licensing and strategy consulting',
      price_cents: 800000, // R8,000.00
      details: 'License management, compliance, cost optimization',
      image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=center'
    }
  ],

  'security-service': [
    {
      name: 'Armed Security Guards',
      description: '24/7 armed security personnel',
      price_cents: 1200000, // R12,000.00 per month
      details: 'Trained armed guards, shift coverage, incident response',
      image_url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'CCTV Installation & Monitoring',
      description: 'Complete CCTV security system',
      price_cents: 2500000, // R25,000.00
      details: 'HD cameras, remote monitoring, cloud storage',
      image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Access Control Systems',
      description: 'Electronic access control installation',
      price_cents: 1800000, // R18,000.00
      details: 'Card readers, biometric systems, remote access',
      image_url: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Alarm System Installation',
      description: 'Professional alarm system setup',
      price_cents: 800000, // R8,000.00
      details: 'Motion sensors, panic buttons, monitoring service',
      image_url: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Event Security Services',
      description: 'Security for events and functions',
      price_cents: 500000, // R5,000.00 per event
      details: 'Crowd control, VIP protection, venue security',
      image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Mobile Patrol Service',
      description: 'Regular mobile security patrols',
      price_cents: 600000, // R6,000.00 per month
      details: 'Random patrols, incident response, reporting',
      image_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Security Risk Assessment',
      description: 'Comprehensive security evaluation',
      price_cents: 350000, // R3,500.00
      details: 'Vulnerability assessment, recommendations, reports',
      image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Cash-in-Transit Services',
      description: 'Secure cash transportation',
      price_cents: 200000, // R2,000.00 per trip
      details: 'Armored vehicles, trained personnel, insurance',
      image_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Security Training Programs',
      description: 'Professional security training',
      price_cents: 180000, // R1,800.00 per person
      details: 'PSIRA certification, firearms training, first aid',
      image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Executive Protection',
      description: 'VIP and executive protection service',
      price_cents: 2000000, // R20,000.00 per day
      details: 'Close protection, threat assessment, secure transport',
      image_url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&crop=center'
    }
  ],

  'household-goods-wholesaler': [
    { name: 'Kitchen Appliances Bulk', description: 'Wholesale kitchen appliances', price_cents: 500000, details: 'Microwaves, kettles, toasters - bulk pricing', image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=center' },
    { name: 'Cleaning Supplies Bulk', description: 'Wholesale cleaning products', price_cents: 200000, details: 'Detergents, disinfectants, bulk quantities', image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center' },
    { name: 'Home Textiles Wholesale', description: 'Bulk bedding and linens', price_cents: 300000, details: 'Sheets, towels, curtains - wholesale prices', image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop&crop=center' },
    { name: 'Furniture Wholesale', description: 'Bulk furniture supply', price_cents: 1500000, details: 'Tables, chairs, storage - wholesale pricing', image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop&crop=center' },
    { name: 'Kitchenware Bulk Supply', description: 'Wholesale kitchen utensils', price_cents: 150000, details: 'Pots, pans, cutlery - bulk orders', image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=center' },
    { name: 'Bathroom Accessories Bulk', description: 'Wholesale bathroom supplies', price_cents: 180000, details: 'Towels, mats, accessories - bulk pricing', image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center' },
    { name: 'Home Decor Wholesale', description: 'Bulk decorative items', price_cents: 250000, details: 'Vases, frames, ornaments - wholesale', image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop&crop=center' },
    { name: 'Garden Tools Bulk', description: 'Wholesale gardening equipment', price_cents: 120000, details: 'Spades, hoses, planters - bulk supply', image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop&crop=center' },
    { name: 'Storage Solutions Bulk', description: 'Wholesale storage containers', price_cents: 200000, details: 'Boxes, bins, organizers - bulk orders', image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop&crop=center' },
    { name: 'Seasonal Items Wholesale', description: 'Bulk seasonal merchandise', price_cents: 300000, details: 'Holiday decorations, seasonal goods', image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop&crop=center' }
  ],
  
  'corporate-office': [
    { name: 'Office Space Rental', description: 'Premium office space', price_cents: 2500000, details: 'Furnished offices, meeting rooms, reception', image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=400&fit=crop&crop=center' },
    { name: 'Virtual Office Service', description: 'Professional business address', price_cents: 150000, details: 'Mail handling, phone answering, meeting rooms', image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=400&fit=crop&crop=center' },
    { name: 'Meeting Room Rental', description: 'Professional meeting facilities', price_cents: 50000, details: 'Boardrooms, AV equipment, catering options', image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=400&fit=crop&crop=center' },
    { name: 'Co-working Space', description: 'Flexible workspace solutions', price_cents: 80000, details: 'Hot desks, WiFi, printing facilities', image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=400&fit=crop&crop=center' },
    { name: 'Business Registration Service', description: 'Company formation assistance', price_cents: 200000, details: 'CIPC registration, compliance, documentation', image_url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=400&fit=crop&crop=center' },
    { name: 'Secretarial Services', description: 'Professional administrative support', price_cents: 120000, details: 'Document preparation, correspondence, filing', image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop&crop=center' },
    { name: 'IT Support Services', description: 'Technology support and maintenance', price_cents: 300000, details: 'Network setup, computer maintenance, support', image_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop&crop=center' },
    { name: 'Reception Services', description: 'Professional reception and call handling', price_cents: 180000, details: 'Visitor management, call answering, mail handling', image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop&crop=center' },
    { name: 'Office Cleaning Service', description: 'Professional office cleaning', price_cents: 100000, details: 'Daily cleaning, sanitization, waste management', image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center' },
    { name: 'Document Storage', description: 'Secure document storage service', price_cents: 80000, details: 'Climate controlled, secure access, retrieval', image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=400&fit=crop&crop=center' }
  ],

  'construction-company': [
    { name: 'Residential Construction', description: 'Complete home building service', price_cents: 200000000, details: 'New homes, renovations, project management', image_url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=400&fit=crop&crop=center' },
    { name: 'Commercial Construction', description: 'Business building construction', price_cents: 500000000, details: 'Offices, warehouses, retail spaces', image_url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=400&fit=crop&crop=center' },
    { name: 'Renovation Services', description: 'Home and office renovations', price_cents: 15000000, details: 'Kitchen, bathroom, office renovations', image_url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=400&fit=crop&crop=center' },
    { name: 'Roofing Services', description: 'Professional roofing solutions', price_cents: 8000000, details: 'New roofs, repairs, waterproofing', image_url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=400&fit=crop&crop=center' },
    { name: 'Plumbing Installation', description: 'Complete plumbing services', price_cents: 2500000, details: 'New installations, repairs, maintenance', image_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop&crop=center' },
    { name: 'Electrical Installation', description: 'Professional electrical work', price_cents: 3000000, details: 'Wiring, lighting, safety compliance', image_url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=400&fit=crop&crop=center' },
    { name: 'Painting & Decorating', description: 'Interior and exterior painting', price_cents: 1200000, details: 'Professional painting, wallpaper, finishes', image_url: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&h=400&fit=crop&crop=center' },
    { name: 'Flooring Installation', description: 'All types of flooring', price_cents: 1800000, details: 'Tiles, laminate, hardwood, carpets', image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop&crop=center' },
    { name: 'Project Management', description: 'Construction project coordination', price_cents: 5000000, details: 'Planning, scheduling, quality control', image_url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=400&fit=crop&crop=center' },
    { name: 'Building Maintenance', description: 'Ongoing building maintenance', price_cents: 800000, details: 'Preventive maintenance, repairs, inspections', image_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop&crop=center' }
  ],

  'pharmacy': [
    {
      name: 'Prescription Medication Dispensing',
      description: 'Professional prescription filling service',
      price_cents: 15000, // R150.00 average
      details: 'Licensed pharmacist consultation, medication counseling, drug interaction checks',
      image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Over-the-Counter Medications',
      description: 'Wide range of OTC medicines',
      price_cents: 8500, // R85.00 average
      details: 'Pain relievers, cold medicine, allergy medication, vitamins',
      image_url: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Chronic Medication Management',
      description: 'Monthly chronic medication supply',
      price_cents: 45000, // R450.00 average
      details: 'Diabetes, hypertension, heart medication, repeat prescriptions',
      image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Blood Pressure Monitoring',
      description: 'Professional blood pressure checks',
      price_cents: 2500, // R25.00
      details: 'Digital monitoring, health record keeping, consultation',
      image_url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Vaccination Services',
      description: 'Flu shots and travel vaccinations',
      price_cents: 35000, // R350.00
      details: 'Seasonal flu, travel vaccines, COVID-19 boosters',
      image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Health Supplements & Vitamins',
      description: 'Premium health supplements',
      price_cents: 25000, // R250.00 average
      details: 'Multivitamins, omega-3, probiotics, immune boosters',
      image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Medical Equipment Rental',
      description: 'Home medical equipment rental',
      price_cents: 15000, // R150.00 per week
      details: 'Wheelchairs, crutches, nebulizers, blood glucose monitors',
      image_url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Diabetes Care Products',
      description: 'Complete diabetes management supplies',
      price_cents: 18000, // R180.00
      details: 'Test strips, lancets, glucose meters, insulin supplies',
      image_url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'First Aid Supplies',
      description: 'Complete first aid kits and supplies',
      price_cents: 12000, // R120.00
      details: 'Bandages, antiseptics, thermometers, emergency supplies',
      image_url: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Medication Consultation',
      description: 'Professional pharmacist consultation',
      price_cents: 8000, // R80.00
      details: 'Drug interactions, side effects, proper usage guidance',
      image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=400&fit=crop&crop=center'
    }
  ],

  'clothing-store': [
    {
      name: 'Men\'s Casual Shirts',
      description: 'Comfortable cotton casual shirts',
      price_cents: 35000, // R350.00
      details: 'Various sizes and colors, 100% cotton, machine washable',
      image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Women\'s Dresses',
      description: 'Elegant dresses for all occasions',
      price_cents: 45000, // R450.00
      details: 'Summer dresses, formal wear, various styles and sizes',
      image_url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Denim Jeans',
      description: 'Premium quality denim jeans',
      price_cents: 55000, // R550.00
      details: 'Skinny, straight, and bootcut styles, all sizes available',
      image_url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Children\'s Clothing',
      description: 'Comfortable kids clothing',
      price_cents: 25000, // R250.00
      details: 'Ages 2-12, play clothes, school uniforms, party wear',
      image_url: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Winter Jackets',
      description: 'Warm winter outerwear',
      price_cents: 75000, // R750.00
      details: 'Waterproof, insulated, various styles for men and women',
      image_url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Sports & Activewear',
      description: 'Athletic clothing and sportswear',
      price_cents: 40000, // R400.00
      details: 'Gym wear, running clothes, yoga pants, sports bras',
      image_url: 'https://images.unsplash.com/photo-1506629905607-d9c297d3d45b?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Formal Business Wear',
      description: 'Professional business attire',
      price_cents: 85000, // R850.00
      details: 'Suits, blazers, dress pants, professional shirts',
      image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Shoes & Footwear',
      description: 'Quality shoes for all occasions',
      price_cents: 65000, // R650.00
      details: 'Casual, formal, sports shoes, boots, sandals',
      image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Accessories',
      description: 'Fashion accessories and jewelry',
      price_cents: 15000, // R150.00
      details: 'Belts, bags, jewelry, scarves, hats, sunglasses',
      image_url: 'https://images.unsplash.com/photo-1506629905607-d9c297d3d45b?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Underwear & Lingerie',
      description: 'Comfortable undergarments',
      price_cents: 20000, // R200.00
      details: 'Quality underwear, bras, sleepwear, various sizes',
      image_url: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop&crop=center'
    }
  ],

  'hardware-store': [
    {
      name: 'Power Tools',
      description: 'Professional grade power tools',
      price_cents: 125000, // R1,250.00
      details: 'Drills, saws, sanders, grinders - various brands available',
      image_url: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Hand Tools',
      description: 'Essential hand tools for DIY',
      price_cents: 35000, // R350.00
      details: 'Hammers, screwdrivers, wrenches, pliers, measuring tools',
      image_url: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Building Materials',
      description: 'Construction and building supplies',
      price_cents: 85000, // R850.00
      details: 'Cement, bricks, sand, gravel, timber, roofing materials',
      image_url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Plumbing Supplies',
      description: 'Complete plumbing solutions',
      price_cents: 45000, // R450.00
      details: 'Pipes, fittings, taps, toilets, geysers, plumbing tools',
      image_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Electrical Supplies',
      description: 'Electrical components and wiring',
      price_cents: 55000, // R550.00
      details: 'Cables, switches, plugs, circuit breakers, lighting',
      image_url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Paint & Decorating',
      description: 'Interior and exterior paints',
      price_cents: 65000, // R650.00
      details: 'Wall paint, primer, brushes, rollers, decorating supplies',
      image_url: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Garden & Outdoor',
      description: 'Gardening tools and outdoor equipment',
      price_cents: 75000, // R750.00
      details: 'Lawnmowers, garden tools, hoses, fertilizers, outdoor furniture',
      image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Safety Equipment',
      description: 'Personal protective equipment',
      price_cents: 25000, // R250.00
      details: 'Hard hats, safety glasses, gloves, boots, high-vis clothing',
      image_url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Fasteners & Hardware',
      description: 'Nuts, bolts, screws, and fasteners',
      price_cents: 15000, // R150.00
      details: 'Various sizes, stainless steel, galvanized, brass fittings',
      image_url: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=400&fit=crop&crop=center'
    },
    {
      name: 'Tool Rental Service',
      description: 'Professional tool rental',
      price_cents: 20000, // R200.00 per day
      details: 'Heavy machinery, specialized tools, delivery available',
      image_url: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=400&fit=crop&crop=center'
    }
  ]
}

const missingCategories: CategoryProducts = {
  'construction-equipment-supplier': [
    { name: 'Excavator Rental', description: 'Heavy-duty excavator rental', price_cents: 250000, details: 'Daily rental\nOperator available\nFuel included', image_url: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=400&fit=crop&crop=center' },
    { name: 'Bulldozer Service', description: 'Professional bulldozer operations', price_cents: 300000, details: 'Site preparation\nLand clearing\nGrading work', image_url: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=400&fit=crop&crop=center' },
    { name: 'Crane Hire', description: 'Mobile crane rental service', price_cents: 400000, details: 'Certified operator\nInsurance included\nFlexible scheduling', image_url: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=400&fit=crop&crop=center' },
    { name: 'Dump Truck Service', description: 'Material transportation', price_cents: 180000, details: 'Debris removal\nMaterial delivery\nMultiple sizes available', image_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=400&fit=crop&crop=center' },
    { name: 'Compactor Rental', description: 'Soil compaction equipment', price_cents: 120000, details: 'Road construction\nFoundation work\nSite preparation', image_url: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=400&fit=crop&crop=center' },
    { name: 'Concrete Mixer', description: 'Portable concrete mixing', price_cents: 80000, details: 'On-site mixing\nFresh concrete\nVarious batch sizes', image_url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=400&fit=crop&crop=center' },
    { name: 'Scaffolding System', description: 'Complete scaffolding rental', price_cents: 150000, details: 'Safety certified\nEasy assembly\nWeekly rates available', image_url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=400&fit=crop&crop=center' },
    { name: 'Generator Rental', description: 'Portable power solutions', price_cents: 60000, details: 'Diesel powered\nQuiet operation\nFuel efficient', image_url: 'https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=400&h=400&fit=crop&crop=center' },
    { name: 'Welding Equipment', description: 'Professional welding tools', price_cents: 90000, details: 'Arc welding\nMIG/TIG capable\nPortable units', image_url: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=400&fit=crop&crop=center' },
    { name: 'Safety Equipment Package', description: 'Complete safety gear rental', price_cents: 40000, details: 'Hard hats\nSafety vests\nFall protection gear', image_url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&crop=center' }
  ],

  'computer-accessories-store': [
    { name: 'Wireless Mouse', description: 'Ergonomic wireless mouse', price_cents: 25000, details: 'Bluetooth connectivity\nLong battery life\nPrecision tracking', image_url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop&crop=center' },
    { name: 'Mechanical Keyboard', description: 'RGB mechanical keyboard', price_cents: 85000, details: 'Cherry MX switches\nCustomizable lighting\nProgrammable keys', image_url: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=400&fit=crop&crop=center' },
    { name: 'USB-C Hub', description: 'Multi-port USB-C adapter', price_cents: 45000, details: 'HDMI output\nUSB 3.0 ports\nSD card reader', image_url: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=400&h=400&fit=crop&crop=center' },
    { name: 'Webcam HD', description: 'High-definition webcam', price_cents: 65000, details: '1080p resolution\nAuto-focus\nBuilt-in microphone', image_url: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400&h=400&fit=crop&crop=center' },
    { name: 'External Hard Drive', description: '1TB portable storage', price_cents: 120000, details: 'USB 3.0 interface\nCompact design\nPlug and play', image_url: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&h=400&fit=crop&crop=center' },
    { name: 'Monitor Stand', description: 'Adjustable monitor stand', price_cents: 35000, details: 'Height adjustable\nTilt and swivel\nCable management', image_url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop&crop=center' },
    { name: 'Laptop Cooling Pad', description: 'Cooling pad for laptops', price_cents: 28000, details: 'Dual fans\nUSB powered\nErgonomic design', image_url: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=400&fit=crop&crop=center' },
    { name: 'Cable Management Kit', description: 'Desk cable organizer set', price_cents: 15000, details: 'Cable clips\nCable sleeves\nAdhesive mounts', image_url: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=400&h=400&fit=crop&crop=center' },
    { name: 'Bluetooth Speaker', description: 'Portable Bluetooth speaker', price_cents: 55000, details: 'Wireless connectivity\nLong battery life\nWater resistant', image_url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop&crop=center' },
    { name: 'Phone Stand', description: 'Adjustable phone holder', price_cents: 18000, details: 'Universal compatibility\nAdjustable angle\nNon-slip base', image_url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop&crop=center' }
  ],

  'auto-glass-shop': [
    { name: 'Windshield Replacement', description: 'Complete windshield replacement', price_cents: 180000, details: 'OEM quality glass\nProfessional installation\nWarranty included', image_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=400&fit=crop&crop=center' },
    { name: 'Side Window Repair', description: 'Side window glass replacement', price_cents: 120000, details: 'Tempered glass\nSame-day service\nMobile service available', image_url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=400&fit=crop&crop=center' },
    { name: 'Windshield Chip Repair', description: 'Small chip and crack repair', price_cents: 35000, details: 'Prevents spreading\nQuick 30-minute service\nInvisible repair', image_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=400&fit=crop&crop=center' },
    { name: 'Rear Window Replacement', description: 'Back window glass service', price_cents: 150000, details: 'Heated glass available\nDefogger repair\nProfessional fitting', image_url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=400&fit=crop&crop=center' },
    { name: 'Mirror Replacement', description: 'Side mirror glass replacement', price_cents: 45000, details: 'Heated mirrors\nBlind spot detection\nOEM specifications', image_url: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=400&fit=crop&crop=center' },
    { name: 'Sunroof Repair', description: 'Sunroof glass and seal service', price_cents: 200000, details: 'Glass replacement\nSeal repair\nMotor adjustment', image_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=400&fit=crop&crop=center' },
    { name: 'Window Tinting', description: 'Professional window tinting', price_cents: 80000, details: 'UV protection\nHeat reduction\nPrivacy enhancement', image_url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=400&fit=crop&crop=center' },
    { name: 'Mobile Glass Service', description: 'On-site glass replacement', price_cents: 220000, details: 'Come to your location\nFully equipped van\nSame quality service', image_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=400&fit=crop&crop=center' },
    { name: 'Insurance Claims', description: 'Insurance claim assistance', price_cents: 0, details: 'Direct billing\nClaim processing\nPaperwork handling', image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=center' },
    { name: 'Emergency Service', description: '24/7 emergency glass repair', price_cents: 250000, details: 'After-hours service\nEmergency response\nTemporary solutions', image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=400&fit=crop&crop=center' }
  ],

  'kitchen-supply-store': [
    { name: 'Professional Chef Knives', description: 'High-quality kitchen knives', price_cents: 85000, details: 'Stainless steel blades\nErgonomic handles\nSharpening service included', image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=center' },
    { name: 'Commercial Cookware Set', description: 'Restaurant-grade pots and pans', price_cents: 150000, details: 'Heavy-duty construction\nNon-stick coating\nDishwasher safe', image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=center' },
    { name: 'Industrial Mixer', description: 'Heavy-duty stand mixer', price_cents: 280000, details: '20-quart capacity\nMultiple attachments\nCommercial warranty', image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=center' },
    { name: 'Refrigeration Units', description: 'Commercial refrigerators', price_cents: 450000, details: 'Energy efficient\nStainless steel\nDigital temperature control', image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=center' },
    { name: 'Food Prep Tables', description: 'Stainless steel work tables', price_cents: 120000, details: 'Easy to clean\nScratch resistant\nVarious sizes available', image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=center' },
    { name: 'Commercial Blender', description: 'High-power blending system', price_cents: 95000, details: 'Variable speed control\nSound enclosure\nBPA-free containers', image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=center' },
    { name: 'Dishwashing System', description: 'Commercial dishwasher', price_cents: 380000, details: 'High-temperature wash\nEnergy efficient\nQuick cycle times', image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=center' },
    { name: 'Food Storage Containers', description: 'Professional storage solutions', price_cents: 45000, details: 'Airtight seals\nStackable design\nFood-grade materials', image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=center' },
    { name: 'Cutting Boards', description: 'Commercial cutting boards', price_cents: 35000, details: 'NSF approved\nColor-coded system\nEasy sanitization', image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=center' },
    { name: 'Kitchen Utensil Set', description: 'Professional kitchen tools', price_cents: 65000, details: 'Stainless steel construction\nHeat resistant\nCommercial grade', image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=center' }
  ],

  'courier-service': [
    { name: 'Same-Day Delivery', description: 'Express same-day courier service', price_cents: 15000, details: 'Within city limits\nReal-time tracking\nProof of delivery', image_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=400&fit=crop&crop=center' },
    { name: 'Overnight Delivery', description: 'Next-day delivery service', price_cents: 8500, details: 'Nationwide coverage\nInsurance included\nSignature required', image_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=400&fit=crop&crop=center' },
    { name: 'Document Delivery', description: 'Secure document courier', price_cents: 12000, details: 'Confidential handling\nChain of custody\nUrgent delivery', image_url: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=400&fit=crop&crop=center' },
    { name: 'Medical Courier', description: 'Medical specimen transport', price_cents: 25000, details: 'Temperature controlled\nCertified handling\nHIPAA compliant', image_url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop&crop=center' },
    { name: 'Bulk Delivery', description: 'Large volume courier service', price_cents: 35000, details: 'Multiple packages\nScheduled routes\nVolume discounts', image_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=400&fit=crop&crop=center' },
    { name: 'International Shipping', description: 'Global courier service', price_cents: 45000, details: 'Customs clearance\nDoor-to-door service\nTracking included', image_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=400&fit=crop&crop=center' },
    { name: 'Fragile Item Delivery', description: 'Specialized fragile handling', price_cents: 28000, details: 'Custom packaging\nExtra care handling\nInsurance coverage', image_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=400&fit=crop&crop=center' },
    { name: 'Scheduled Pickup', description: 'Regular pickup service', price_cents: 18000, details: 'Weekly schedules\nFlexible timing\nRoute optimization', image_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=400&fit=crop&crop=center' },
    { name: 'Rush Delivery', description: 'Emergency courier service', price_cents: 40000, details: '2-hour delivery\nPriority handling\n24/7 availability', image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=400&fit=crop&crop=center' },
    { name: 'Return Service', description: 'Return pickup and delivery', price_cents: 22000, details: 'Prepaid returns\nPackaging service\nTracking provided', image_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=400&fit=crop&crop=center' }
  ],

  'tire-shop': [
    { name: 'Tire Installation', description: 'Professional tire mounting', price_cents: 15000, details: 'Wheel balancing\nValve stem replacement\nDisposal of old tires', image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center' },
    { name: 'Wheel Alignment', description: 'Precision wheel alignment', price_cents: 80000, details: 'Computer-guided alignment\nSteering adjustment\nTire wear prevention', image_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=400&fit=crop&crop=center' },
    { name: 'Tire Rotation', description: 'Tire rotation service', price_cents: 25000, details: 'Extends tire life\nEven wear patterns\nPressure check included', image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center' },
    { name: 'Puncture Repair', description: 'Tire puncture patching', price_cents: 18000, details: 'Professional patch\nSafety inspection\nPressure testing', image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center' },
    { name: 'New Tire Sales', description: 'Quality tire selection', price_cents: 120000, details: 'Multiple brands\nSize availability\nWarranty included', image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center' },
    { name: 'Wheel Balancing', description: 'Dynamic wheel balancing', price_cents: 35000, details: 'Vibration elimination\nSmooth ride\nExtended tire life', image_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=400&fit=crop&crop=center' },
    { name: 'Tire Pressure Check', description: 'Comprehensive pressure service', price_cents: 5000, details: 'All tires checked\nNitrogen fill available\nTPMS reset', image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center' },
    { name: 'Seasonal Tire Change', description: 'Winter/summer tire swap', price_cents: 40000, details: 'Tire storage available\nSeasonal recommendations\nPressure adjustment', image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center' },
    { name: 'Rim Repair', description: 'Alloy wheel restoration', price_cents: 85000, details: 'Crack welding\nStraightening service\nCosmetic refinishing', image_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&h=400&fit=crop&crop=center' },
    { name: 'Mobile Tire Service', description: 'On-site tire service', price_cents: 95000, details: 'Come to your location\nEmergency service\nFull equipment mobile', image_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=400&fit=crop&crop=center' }
  ],

  'laboratory-equipment-supplier': [
    { name: 'Microscopes', description: 'Professional laboratory microscopes', price_cents: 450000, details: 'High magnification\nLED illumination\nDigital imaging capability', image_url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop&crop=center' },
    { name: 'Centrifuge', description: 'High-speed laboratory centrifuge', price_cents: 380000, details: 'Variable speed control\nSafety features\nMultiple rotor options', image_url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop&crop=center' },
    { name: 'Analytical Balance', description: 'Precision weighing scale', price_cents: 280000, details: '0.1mg precision\nCalibration weights included\nData logging capability', image_url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop&crop=center' },
    { name: 'Spectrophotometer', description: 'UV-Vis spectrophotometer', price_cents: 650000, details: 'Wide wavelength range\nSoftware included\nCuvette holder set', image_url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop&crop=center' },
    { name: 'Incubator', description: 'Laboratory incubator', price_cents: 320000, details: 'Temperature control\nCO2 monitoring\nStainless steel interior', image_url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop&crop=center' },
    { name: 'Pipettes Set', description: 'Precision pipette collection', price_cents: 85000, details: 'Variable volumes\nAutoclavable tips\nCalibration certificate', image_url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop&crop=center' },
    { name: 'Fume Hood', description: 'Laboratory fume extraction', price_cents: 850000, details: 'Variable air flow\nSafety monitoring\nChemical resistant', image_url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop&crop=center' },
    { name: 'Autoclave', description: 'Steam sterilization system', price_cents: 420000, details: 'Automatic cycle\nValidation ports\nSafety interlocks', image_url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop&crop=center' },
    { name: 'pH Meter', description: 'Digital pH measurement', price_cents: 95000, details: 'Automatic calibration\nTemperature compensation\nData storage', image_url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop&crop=center' },
    { name: 'Laboratory Glassware', description: 'Complete glassware set', price_cents: 120000, details: 'Borosilicate glass\nGraduated measurements\nAutoclave safe', image_url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop&crop=center' }
  ],

  'tile-store': [
    { name: 'Ceramic Floor Tiles', description: 'Durable ceramic flooring', price_cents: 45000, details: 'Water resistant\nEasy maintenance\nVarious sizes available', image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop&crop=center' },
    { name: 'Porcelain Wall Tiles', description: 'Premium porcelain tiles', price_cents: 65000, details: 'Stain resistant\nFrost proof\nModern designs', image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop&crop=center' },
    { name: 'Natural Stone Tiles', description: 'Authentic stone flooring', price_cents: 85000, details: 'Marble and granite\nUnique patterns\nProfessional sealing', image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop&crop=center' },
    { name: 'Mosaic Tiles', description: 'Decorative mosaic patterns', price_cents: 55000, details: 'Glass and ceramic\nCustom patterns\nBacksplash specialist', image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop&crop=center' },
    { name: 'Tile Installation', description: 'Professional tile laying', price_cents: 35000, details: 'Expert installation\nLevel surface guarantee\nGrouting included', image_url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=400&fit=crop&crop=center' },
    { name: 'Tile Adhesive & Grout', description: 'Quality installation materials', price_cents: 25000, details: 'Waterproof adhesive\nStain-resistant grout\nColor matching service', image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop&crop=center' },
    { name: 'Bathroom Tile Package', description: 'Complete bathroom solution', price_cents: 120000, details: 'Wall and floor tiles\nWaterproof system\nDesign consultation', image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop&crop=center' },
    { name: 'Kitchen Backsplash', description: 'Custom kitchen backsplash', price_cents: 75000, details: 'Heat resistant tiles\nEasy clean surface\nModern designs', image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop&crop=center' },
    { name: 'Outdoor Paving Tiles', description: 'Weather-resistant paving', price_cents: 95000, details: 'Non-slip surface\nFrost resistant\nPool area suitable', image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop&crop=center' },
    { name: 'Tile Cutting Service', description: 'Precision tile cutting', price_cents: 15000, details: 'Custom shapes\nClean edges\nMinimal waste', image_url: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=400&fit=crop&crop=center' }
  ],

  'transportation-service': [
    { name: 'Airport Transfer', description: 'Reliable airport transportation', price_cents: 35000, details: 'Flight monitoring\nMeet and greet\nLuggage assistance', image_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=400&fit=crop&crop=center' },
    { name: 'Corporate Transport', description: 'Business transportation service', price_cents: 45000, details: 'Executive vehicles\nProfessional drivers\nFlexible scheduling', image_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=400&fit=crop&crop=center' },
    { name: 'Event Transportation', description: 'Group event transport', price_cents: 80000, details: 'Wedding transport\nParty buses\nGroup coordination', image_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=400&fit=crop&crop=center' },
    { name: 'Medical Transport', description: 'Non-emergency medical trips', price_cents: 55000, details: 'Wheelchair accessible\nTrained drivers\nInsurance covered', image_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=400&fit=crop&crop=center' },
    { name: 'School Transport', description: 'Safe school transportation', price_cents: 25000, details: 'Licensed drivers\nSafety equipment\nRoute optimization', image_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=400&fit=crop&crop=center' },
    { name: 'Freight Delivery', description: 'Goods transportation service', price_cents: 65000, details: 'Local and long distance\nInsured cargo\nTracking available', image_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=400&fit=crop&crop=center' },
    { name: 'Moving Service', description: 'Household moving transport', price_cents: 120000, details: 'Packing service\nFurniture protection\nStorage options', image_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=400&fit=crop&crop=center' },
    { name: 'Tour Transport', description: 'Sightseeing transportation', price_cents: 95000, details: 'Knowledgeable guides\nComfortable vehicles\nCustom itineraries', image_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=400&fit=crop&crop=center' },
    { name: 'Emergency Transport', description: '24/7 emergency service', price_cents: 75000, details: 'Rapid response\nAlways available\nPriority service', image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&h=400&fit=crop&crop=center' },
    { name: 'Luxury Transport', description: 'Premium vehicle service', price_cents: 150000, details: 'High-end vehicles\nChauffeur service\nVIP treatment', image_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=400&fit=crop&crop=center' }
  ],

  'building-materials-store': [
    { name: 'Cement & Concrete', description: 'Quality cement products', price_cents: 15000, details: 'Portland cement\nReady-mix concrete\nBulk delivery available', image_url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=400&fit=crop&crop=center' },
    { name: 'Bricks & Blocks', description: 'Construction bricks and blocks', price_cents: 8000, details: 'Clay bricks\nConcrete blocks\nVarious sizes', image_url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=400&fit=crop&crop=center' },
    { name: 'Roofing Materials', description: 'Complete roofing solutions', price_cents: 45000, details: 'Tiles and sheets\nInsulation materials\nGuttering systems', image_url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=400&fit=crop&crop=center' },
    { name: 'Timber & Lumber', description: 'Quality wood products', price_cents: 35000, details: 'Treated timber\nHardwood options\nCustom cutting', image_url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=400&fit=crop&crop=center' },
    { name: 'Steel & Metal', description: 'Structural steel products', price_cents: 55000, details: 'Reinforcement bars\nSteel beams\nMetal sheets', image_url: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=400&fit=crop&crop=center' },
    { name: 'Insulation Materials', description: 'Thermal and sound insulation', price_cents: 25000, details: 'Fiberglass batts\nFoam boards\nReflective insulation', image_url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=400&fit=crop&crop=center' },
    { name: 'Plumbing Supplies', description: 'Pipes and plumbing fittings', price_cents: 30000, details: 'PVC and copper pipes\nFittings and joints\nPlumbing tools', image_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop&crop=center' },
    { name: 'Electrical Supplies', description: 'Wiring and electrical components', price_cents: 40000, details: 'Cables and conduits\nSwitches and outlets\nCircuit breakers', image_url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=400&fit=crop&crop=center' },
    { name: 'Paint & Finishes', description: 'Interior and exterior paints', price_cents: 28000, details: 'Primer and paint\nBrushes and rollers\nColor matching', image_url: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&h=400&fit=crop&crop=center' },
    { name: 'Hardware & Fasteners', description: 'Nuts, bolts, and hardware', price_cents: 12000, details: 'Screws and nails\nHinges and locks\nConstruction hardware', image_url: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=400&fit=crop&crop=center' }
  ],

  'sewing-company': [
    { name: 'Custom Tailoring', description: 'Bespoke clothing alterations', price_cents: 85000, details: 'Perfect fit guarantee\nQuality fabrics\nExpert craftsmanship', image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop&crop=center' },
    { name: 'Wedding Dress Alterations', description: 'Bridal gown fitting service', price_cents: 120000, details: 'Delicate handling\nPrecision fitting\nRush service available', image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop&crop=center' },
    { name: 'Curtain Making', description: 'Custom window treatments', price_cents: 65000, details: 'Fabric selection\nProfessional hanging\nMeasurement service', image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop&crop=center' },
    { name: 'Upholstery Repair', description: 'Furniture reupholstering', price_cents: 150000, details: 'Fabric restoration\nFoam replacement\nFrame repair', image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop&crop=center' },
    { name: 'Uniform Manufacturing', description: 'Corporate uniform production', price_cents: 45000, details: 'Bulk orders\nLogo embroidery\nSize range available', image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop&crop=center' },
    { name: 'Leather Repair', description: 'Leather goods restoration', price_cents: 75000, details: 'Jacket repairs\nBag restoration\nColor matching', image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop&crop=center' },
    { name: 'Embroidery Service', description: 'Custom embroidery work', price_cents: 35000, details: 'Logo embroidery\nPersonalization\nBulk pricing', image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop&crop=center' },
    { name: 'Zipper Replacement', description: 'Zipper repair and replacement', price_cents: 25000, details: 'All garment types\nQuality zippers\nSame-day service', image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop&crop=center' },
    { name: 'Hemming Service', description: 'Professional hemming', price_cents: 18000, details: 'Pants and skirts\nInvisible hems\nQuick turnaround', image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop&crop=center' },
    { name: 'Pattern Making', description: 'Custom pattern creation', price_cents: 95000, details: 'Original designs\nSize grading\nTechnical drawings', image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop&crop=center' }
  ],

  'electronics-store': [
    { name: 'Smartphones', description: 'Latest smartphone models', price_cents: 850000, details: 'Multiple brands\nWarranty included\nTrade-in options', image_url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=400&fit=crop&crop=center' },
    { name: 'Laptops', description: 'Professional and gaming laptops', price_cents: 1200000, details: 'Various specifications\nStudent discounts\nTechnical support', image_url: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=400&fit=crop&crop=center' },
    { name: 'Televisions', description: 'Smart TV collection', price_cents: 950000, details: '4K and 8K options\nSmart features\nInstallation service', image_url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop&crop=center' },
    { name: 'Gaming Consoles', description: 'Latest gaming systems', price_cents: 650000, details: 'PlayStation and Xbox\nGame bundles\nAccessories included', image_url: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=400&fit=crop&crop=center' },
    { name: 'Audio Equipment', description: 'Sound systems and headphones', price_cents: 280000, details: 'Hi-fi systems\nWireless options\nNoise cancellation', image_url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop&crop=center' },
    { name: 'Home Appliances', description: 'Kitchen and home electronics', price_cents: 450000, details: 'Energy efficient\nExtended warranties\nDelivery service', image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=center' },
    { name: 'Computer Accessories', description: 'PC peripherals and components', price_cents: 85000, details: 'Keyboards and mice\nMonitors\nStorage devices', image_url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop&crop=center' },
    { name: 'Cameras', description: 'Digital cameras and equipment', price_cents: 750000, details: 'DSLR and mirrorless\nLenses available\nPhotography courses', image_url: 'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&h=400&fit=crop&crop=center' },
    { name: 'Smart Home Devices', description: 'Home automation products', price_cents: 180000, details: 'Voice assistants\nSmart lighting\nSecurity systems', image_url: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400&h=400&fit=crop&crop=center' },
    { name: 'Repair Services', description: 'Electronic device repairs', price_cents: 120000, details: 'Screen replacements\nData recovery\nWarranty repairs', image_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop&crop=center' }
  ],

  'equipment-rental-agency': [
    { name: 'Construction Equipment', description: 'Heavy machinery rental', price_cents: 180000, details: 'Excavators and bulldozers\nDaily and weekly rates\nOperator available', image_url: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=400&fit=crop&crop=center' },
    { name: 'Party Equipment', description: 'Event and party rentals', price_cents: 85000, details: 'Tents and tables\nSound systems\nLighting equipment', image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop&crop=center' },
    { name: 'Tool Rental', description: 'Professional tool hire', price_cents: 45000, details: 'Power tools\nSpecialty equipment\nSafety gear included', image_url: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=400&fit=crop&crop=center' },
    { name: 'Vehicle Rental', description: 'Commercial vehicle hire', price_cents: 120000, details: 'Trucks and vans\nTrailers available\nInsurance options', image_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=400&fit=crop&crop=center' },
    { name: 'Cleaning Equipment', description: 'Industrial cleaning rentals', price_cents: 65000, details: 'Pressure washers\nFloor cleaners\nCarpet cleaners', image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&crop=center' },
    { name: 'Landscaping Equipment', description: 'Garden and lawn equipment', price_cents: 55000, details: 'Mowers and trimmers\nChain saws\nStump grinders', image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop&crop=center' },
    { name: 'Audio Visual Equipment', description: 'AV equipment rental', price_cents: 95000, details: 'Projectors and screens\nSound systems\nMicrophones', image_url: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop&crop=center' },
    { name: 'Medical Equipment', description: 'Healthcare equipment rental', price_cents: 150000, details: 'Wheelchairs and beds\nOxygen equipment\nMobility aids', image_url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop&crop=center' },
    { name: 'Catering Equipment', description: 'Commercial kitchen rentals', price_cents: 75000, details: 'Ovens and refrigerators\nServing equipment\nChafing dishes', image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop&crop=center' },
    { name: 'Specialty Equipment', description: 'Unique equipment rental', price_cents: 200000, details: 'Custom requirements\nRare equipment\nExpert consultation', image_url: 'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=400&h=400&fit=crop&crop=center' }
  ],

  'office-equipment-supplier': [
    { name: 'Office Furniture', description: 'Complete office furniture solutions', price_cents: 180000, details: 'Desks and chairs\nErgonomic design\nBulk pricing available', image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=400&fit=crop&crop=center' },
    { name: 'Printers & Copiers', description: 'Business printing solutions', price_cents: 350000, details: 'Multifunction devices\nMaintenance included\nLeasing options', image_url: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=400&fit=crop&crop=center' },
    { name: 'Computer Systems', description: 'Business computer packages', price_cents: 450000, details: 'Desktop and laptop\nBusiness software\nTechnical support', image_url: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=400&fit=crop&crop=center' },
    { name: 'Office Supplies', description: 'Stationery and consumables', price_cents: 25000, details: 'Paper and pens\nFiling systems\nRegular delivery', image_url: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400&h=400&fit=crop&crop=center' },
    { name: 'Phone Systems', description: 'Business communication systems', price_cents: 280000, details: 'VoIP solutions\nConference systems\nInstallation service', image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=400&fit=crop&crop=center' },
    { name: 'Security Systems', description: 'Office security solutions', price_cents: 320000, details: 'Access control\nCCTV systems\nAlarm systems', image_url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop&crop=center' },
    { name: 'Storage Solutions', description: 'Office storage systems', price_cents: 95000, details: 'Filing cabinets\nShelving units\nMobile storage', image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=400&fit=crop&crop=center' },
    { name: 'Presentation Equipment', description: 'Meeting room equipment', price_cents: 150000, details: 'Projectors and screens\nWhiteboards\nVideo conferencing', image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=400&fit=crop&crop=center' },
    { name: 'Lighting Solutions', description: 'Office lighting systems', price_cents: 120000, details: 'LED lighting\nTask lighting\nEnergy efficient', image_url: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400&h=400&fit=crop&crop=center' },
    { name: 'Maintenance Services', description: 'Equipment maintenance contracts', price_cents: 80000, details: 'Regular servicing\nRepair services\nReplacement parts', image_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop&crop=center' }
  ]
}

// Merge additional categories with main categories
Object.assign(defaultProductsByCategory, additionalCategories);
Object.assign(defaultProductsByCategory, missingCategories);