import type { Product, Category, Order, User, ProductionOrder, Coupon } from './types';

export const categories: Category[] = [
  { id: 'crowns', name: 'Crowns', icon: '👑' },
  { id: 'implants', name: 'Implants', icon: '🔩' },
  { id: 'veneers', name: 'Veneers', icon: '✨' },
  { id: 'dentures', name: 'Dentures', icon: '😁' },
  { id: 'aligners', name: 'Aligners', icon: '📏' },
  { id: 'resins', name: 'Resins', icon: '🎨' },
];

export const products: Product[] = [
  {
    id: 'p1',
    name: 'Zirconia Crown',
    code: 'ZIRC-001',
    description: 'High-translucency multilayered zirconia crown, perfect for aesthetic and functional results.',
    price: 150.00,
    categoryId: 'crowns',
    imageId: 'product-zirconia',
    images: ['product-zirconia', 'product-zirconia-2', 'product-zirconia-3'],
    requiresStl: true,
    variants: {
      materials: ['Multilayer Zirconia', 'Monolithic Zirconia'],
      shades: ['A1', 'A2', 'A3', 'B1', 'B2', 'C1'],
    },
    technicalSpecs: {
      'Flexural Strength': '1200 MPa',
      'Translucency': '48%',
      'Material': 'Zirconium Dioxide',
    },
    productionTime: '5-7 business days',
  },
  {
    id: 'p2',
    name: 'E-Max Veneer',
    code: 'EMAX-V01',
    description: 'Lithium disilicate glass-ceramic veneer for ultimate aesthetics.',
    price: 180.00,
    categoryId: 'veneers',
    imageId: 'product-emax',
    images: ['product-emax', 'product-emax-2', 'product-emax-3'],
    requiresStl: true,
    variants: {
      materials: ['IPS E-Max Press', 'IPS E-Max CAD'],
      shades: ['BL1', 'BL2', 'A1', 'A2'],
    },
    technicalSpecs: {
      'Flexural Strength': '500 MPa',
      'Material': 'Lithium Disilicate',
    },
    productionTime: '7-10 business days',
  },
  {
    id: 'p3',
    name: 'Titanium Implant',
    code: 'TI-IMP-001',
    description: 'Grade 5 titanium implant with an SLA surface for enhanced osseointegration.',
    price: 250.00,
    categoryId: 'implants',
    imageId: 'product-implant',
    images: ['product-implant', 'product-implant-2'],
    requiresStl: false,
    variants: {
      materials: ['Grade 5 Titanium'],
      shades: [],
      implantSystems: ['Straumann', 'Nobel Biocare', 'Neodent'],
    },
    technicalSpecs: {
      'Material': 'Ti-6Al-4V',
      'Surface': 'Sand-blasted, Large-grit, Acid-etched (SLA)',
      'Connection': 'Internal Hex',
    },
    productionTime: 'Ships in 24 hours',
  },
  {
    id: 'p4',
    name: 'Full Denture',
    code: 'DENT-F01',
    description: 'High-impact acrylic full denture with premium teeth.',
    price: 400.00,
    categoryId: 'dentures',
    imageId: 'product-denture',
    images: ['product-denture', 'product-denture-2'],
    requiresStl: true,
    variants: {
      materials: ['High-Impact Acrylic', 'Flexible Acrylic'],
      shades: ['A1', 'A2', 'A3', 'B1'],
    },
    technicalSpecs: {
      'Base Material': 'PMMA',
      'Teeth Material': 'Composite Resin',
    },
    productionTime: '10-12 business days',
  },
  // Add more products to reach at least 12
  {
    id: 'p5',
    name: 'Clear Aligner Set',
    code: 'ALIGN-01',
    description: 'Complete set of custom clear aligners for orthodontic treatment.',
    price: 1200.00,
    categoryId: 'aligners',
    imageId: 'product-aligner',
    images: ['product-aligner', 'product-aligner-2'],
    requiresStl: true,
    variants: {
      materials: ['Zendura FLX'],
      shades: [],
    },
    technicalSpecs: {
      'Material': 'Medical-grade polyurethane',
      'Thickness': '0.76mm',
    },
    productionTime: '15 business days',
  },
  {
    id: 'p6',
    name: 'Composite Resin Kit',
    code: 'COMP-R01',
    description: 'Universal composite resin kit for anterior and posterior restorations.',
    price: 95.00,
    categoryId: 'resins',
    imageId: 'product-resin',
    images: ['product-resin', 'product-resin-2'],
    requiresStl: false,
    variants: {
      materials: [],
      shades: ['A1', 'A2', 'A3', 'B2', 'Translucent'],
    },
    technicalSpecs: {
      'Filler Content': '78.5% by weight',
      'Curing Time': '20 seconds',
    },
    productionTime: 'Ships in 24 hours',
  },
  {
    id: 'p7',
    name: 'PFM Crown',
    code: 'PFM-C01',
    description: 'Porcelain-fused-to-metal crown for a balance of strength and aesthetics.',
    price: 120.00,
    categoryId: 'crowns',
    imageId: 'product-pfm',
    images: ['product-pfm', 'product-pfm-2'],
    requiresStl: true,
    variants: {
      materials: ['High-Noble Gold', 'Semi-Precious', 'Non-Precious'],
      shades: ['A1', 'A2', 'A3.5', 'B3', 'C2'],
    },
    technicalSpecs: {
      'Substructure': 'Co-Cr Alloy',
      'Porcelain': 'Feldspathic Ceramic',
    },
    productionTime: '6-8 business days',
  },
  {
    id: 'p8',
    name: 'Custom Abutment',
    code: 'CUST-ABUT-01',
    description: 'CAD/CAM custom abutment for a perfect implant restoration fit.',
    price: 220.00,
    categoryId: 'implants',
    imageId: 'product-abutment',
    images: ['product-abutment', 'product-abutment-2'],
    requiresStl: true,
    variants: {
      materials: ['Titanium', 'Zirconia'],
      shades: [],
      implantSystems: ['Straumann', 'Nobel Biocare', 'Neodent', 'Zimmer Biomet'],
    },
    technicalSpecs: {
      'Manufacturing': 'CNC Milled',
      'Compatibility': 'Specific to implant system',
    },
    productionTime: '4-5 business days',
  },
  {
    id: 'p9',
    name: 'Surgical Guide',
    code: 'SURG-G01',
    description: '3D printed surgical guide for precise implant placement.',
    price: 100.00,
    categoryId: 'implants',
    imageId: 'product-guide',
    images: ['product-guide'],
    requiresStl: true,
    variants: {
      materials: ['Biocompatible Resin Class I'],
      shades: [],
    },
    technicalSpecs: {
      'Technology': 'SLA 3D Printing',
      'Accuracy': '± 50 microns',
    },
    productionTime: '3-4 business days',
  },
  {
    id: 'p10',
    name: 'Night Guard',
    code: 'NG-01',
    description: 'Custom-fit night guard for bruxism and clenching.',
    price: 85.00,
    categoryId: 'dentures',
    imageId: 'product-nightguard',
    images: ['product-nightguard'],
    requiresStl: true,
    variants: {
      materials: ['Hard Acrylic', 'Soft EVA', 'Dual Laminate'],
      shades: [],
    },
    technicalSpecs: {
      'Thickness': '2mm - 3mm',
    },
    productionTime: '4-5 business days',
  },
  {
    id: 'p11',
    name: 'Maryland Bridge',
    code: 'MB-01',
    description: 'Resin-bonded bridge, a conservative option for replacing a single tooth.',
    price: 210.00,
    categoryId: 'crowns',
    imageId: 'product-bridge',
    images: ['product-bridge', 'product-bridge-2'],
    requiresStl: true,
    variants: {
      materials: ['Zirconia', 'E-Max'],
      shades: ['A1', 'A2', 'A3', 'B1'],
    },
    technicalSpecs: {
      'Pontic Material': 'Multilayer Zirconia',
      'Wing Material': 'Zirconia',
    },
    productionTime: '6-8 business days',
  },
  {
    id: 'p12',
    name: 'Diagnostic Wax-Up',
    code: 'WAX-01',
    description: 'Digital or analog diagnostic wax-up for treatment planning.',
    price: 50.00,
    categoryId: 'veneers',
    imageId: 'product-waxup',
    images: ['product-waxup'],
    requiresStl: true,
    variants: {
      materials: ['Digital (3D Model)', 'Analog (Stone Model)'],
      shades: [],
    },
    technicalSpecs: {
      'Delivery': 'Digital file or physical model',
    },
    productionTime: '2-3 business days',
  },
];

export const users: User[] = [
  {
    id: 'u1',
    name: 'Dr. John Doe',
    email: 'john.doe@clinic.com',
    role: 'customer',
    isPJ: true,
    cnpj: '12.345.678/0001-99',
    clinicName: 'Doe Dental Clinic',
  },
  {
    id: 'u2',
    name: 'Admin User',
    email: 'admin@dentalflow.com',
    role: 'admin',
    isPJ: false,
  },
];

export const orders: Order[] = [
  {
    id: 'ORD-001',
    userId: 'u1',
    items: [
      {
        id: 'ci1',
        product: products[0],
        quantity: 2,
        material: 'Multilayer Zirconia',
        shade: 'A2',
        teeth: [11, 21],
      },
      {
        id: 'ci2',
        product: products[2],
        quantity: 1,
        implantSystem: 'Straumann',
      },
    ],
    status: 'Shipped',
    total: 550.00,
    orderDate: '2023-10-20T10:00:00Z',
    shippingAddress: {
      id: 'a1',
      street: '123 Dental Ave',
      city: 'Smileville',
      state: 'CA',
      zip: '90210',
      country: 'USA',
    },
    invoiceId: 'INV-001',
    timeline: [
        { status: 'Received', date: '2023-10-20' },
        { status: 'In Production', date: '2023-10-21' },
        { status: 'Finalized', date: '2023-10-25' },
        { status: 'Shipped', date: '2023-10-26' },
    ]
  },
  {
    id: 'ORD-002',
    userId: 'u1',
    items: [
      {
        id: 'ci3',
        product: products[1],
        quantity: 6,
        material: 'IPS E-Max Press',
        shade: 'BL1',
        teeth: [13, 12, 11, 21, 22, 23],
      },
    ],
    status: 'In Production',
    total: 1080.00,
    orderDate: '2023-10-28T14:30:00Z',
    shippingAddress: {
      id: 'a1',
      street: '123 Dental Ave',
      city: 'Smileville',
      state: 'CA',
      zip: '90210',
      country: 'USA',
    },
    invoiceId: 'INV-002',
     timeline: [
        { status: 'Received', date: '2023-10-28' },
        { status: 'In Production', date: '2023-10-29' },
    ]
  },
];

export const productionOrders: ProductionOrder[] = [
  { id: 'po1', orderId: 'ORD-002', productName: 'E-Max Veneer (x6)', quantity: 6, status: 'In Production', dueDate: '2023-11-08' },
  { id: 'po2', orderId: 'ORD-003', productName: 'Zirconia Crown (x1)', quantity: 1, status: 'Received', dueDate: '2023-11-05' },
  { id: 'po3', orderId: 'ORD-004', productName: 'Full Denture (x1)', quantity: 1, status: 'Received', dueDate: '2023-11-12' },
  { id: 'po4', orderId: 'ORD-001', productName: 'Zirconia Crown (x2)', quantity: 2, status: 'Shipped', dueDate: '2023-10-26' },
  { id: 'po5', orderId: 'ORD-005', productName: 'Surgical Guide (x1)', quantity: 1, status: 'Finalized', dueDate: '2023-11-01' },
];

export const coupons: Coupon[] = [
    { code: 'ITLAB25', discount: 25, expiryDate: '2024-12-31' },
    { code: 'NEWCLINIC15', discount: 15, expiryDate: '2024-12-31' },
];
