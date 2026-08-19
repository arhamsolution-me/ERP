/**
 * Resilient In-Memory Dev Store for NexERP
 * Automatically active when local PostgreSQL is offline during development.
 */

export interface DevProduct {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  hsnCode?: string;
  defaultPrice: number;
  unitPrice: number;
  totalQuantity: number;
  variants: Array<{
    id: string;
    product_id: string;
    size?: string;
    color?: string;
    barcode?: string;
    sellingPrice: number;
    unitPrice: number;
  }>;
}

export interface DevCustomer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  customer_type: 'retail' | 'wholesale';
  credit_limit?: string;
}

export interface DevShift {
  id: string;
  terminalCode: string;
  cashierId: string;
  openingCash: string;
  closingCash?: string;
  expectedCash?: string;
  variance?: string;
  openedAt: string;
  closedAt?: string;
  status: 'open' | 'closed';
}

export interface DevTransaction {
  id: string;
  receiptNumber: string;
  cashierId: string;
  terminalId: string;
  customer?: { id: string; name: string; phone?: string } | null;
  subtotal: string;
  tax: string;
  discount: string;
  total: string;
  totalRefunded: string;
  remainingRefundable: string;
  paymentMethod: string;
  syncStatus: string;
  createdAt: string;
  status: 'completed' | 'partially_refunded' | 'refunded';
  items: Array<{
    id: string;
    variantId: string;
    productName: string;
    sku: string;
    size?: string;
    color?: string;
    quantity: number;
    unitPrice: string;
    lineTotal: string;
  }>;
  refundHistory: any[];
}

export interface DevWholesaleOrder {
  id: string;
  orderNumber: string;
  status: 'draft' | 'confirmed' | 'fulfilled' | 'invoiced';
  totalAmount: string;
  createdAt: string;
  customer: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    creditLimit?: string;
  } | null;
  invoice?: {
    id: string;
    invoiceNumber: string;
    status: string;
  } | null;
  items: Array<{
    id: string;
    variantId: string;
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: string;
    lineTotal: string;
  }>;
}

// Global in-memory storage singleton
class DevStore {
  public products: DevProduct[] = [
    {
      id: 'prod-001',
      sku: 'SKU-SHIRT-BLK',
      name: 'Premium Oxford Cotton Shirt',
      category: 'Apparel',
      unit: 'pcs',
      hsnCode: '6205.20',
      defaultPrice: 2450,
      unitPrice: 2450,
      totalQuantity: 150,
      variants: [
        {
          id: 'var-001-m',
          product_id: 'prod-001',
          size: 'M',
          color: 'Black',
          barcode: '8901234567890',
          sellingPrice: 2450,
          unitPrice: 2450,
        },
        {
          id: 'var-001-l',
          product_id: 'prod-001',
          size: 'L',
          color: 'Black',
          barcode: '8901234567891',
          sellingPrice: 2450,
          unitPrice: 2450,
        },
      ],
    },
    {
      id: 'prod-002',
      sku: 'SKU-JEANS-SLM',
      name: 'Slim Fit Denim Jeans',
      category: 'Apparel',
      unit: 'pcs',
      hsnCode: '6203.42',
      defaultPrice: 3800,
      unitPrice: 3800,
      totalQuantity: 85,
      variants: [
        {
          id: 'var-002-32',
          product_id: 'prod-002',
          size: '32',
          color: 'Indigo',
          barcode: '8901234567892',
          sellingPrice: 3800,
          unitPrice: 3800,
        },
      ],
    },
    {
      id: 'prod-003',
      sku: 'SKU-LEATHER-BELT',
      name: 'Genuine Leather Executive Belt',
      category: 'Accessories',
      unit: 'pcs',
      hsnCode: '4203.30',
      defaultPrice: 1200,
      unitPrice: 1200,
      totalQuantity: 240,
      variants: [
        {
          id: 'var-003-std',
          product_id: 'prod-003',
          size: 'Standard',
          color: 'Brown',
          barcode: '8901234567893',
          sellingPrice: 1200,
          unitPrice: 1200,
        },
      ],
    },
    {
      id: 'prod-004',
      sku: 'SKU-SNEAKER-WHT',
      name: 'Classic Urban Leather Sneakers',
      category: 'Footwear',
      unit: 'pairs',
      hsnCode: '6403.99',
      defaultPrice: 6500,
      unitPrice: 6500,
      totalQuantity: 42,
      variants: [
        {
          id: 'var-004-42',
          product_id: 'prod-004',
          size: '42',
          color: 'White',
          barcode: '8901234567894',
          sellingPrice: 6500,
          unitPrice: 6500,
        },
      ],
    },
  ];

  public customers: DevCustomer[] = [
    {
      id: 'cust-001',
      name: 'Al-Madina Departmental Store',
      phone: '+92 300 1234567',
      email: 'procurement@almadina.pk',
      customer_type: 'wholesale',
      credit_limit: '500000',
    },
    {
      id: 'cust-002',
      name: 'Kashif Trading Co.',
      phone: '+92 321 9876543',
      email: 'orders@kashiftrade.com',
      customer_type: 'wholesale',
      credit_limit: '1000000',
    },
    {
      id: 'cust-003',
      name: 'Ahmed Retail Customer',
      phone: '+92 333 5551234',
      email: 'ahmed@gmail.com',
      customer_type: 'retail',
    },
  ];

  public activeShift: DevShift | null = {
    id: 'shift-dev-001',
    terminalCode: 'POS-01',
    cashierId: '00000000-0000-0000-0000-000000000002',
    openingCash: '0',
    openedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    status: 'open',
  };

  public transactions: DevTransaction[] = [
    {
      id: 'tx-dev-001',
      receiptNumber: 'INV-A8F19B02',
      cashierId: '00000000-0000-0000-0000-000000000002',
      terminalId: 'POS-01',
      customer: { id: 'cust-003', name: 'Ahmed Retail Customer', phone: '+92 333 5551234' },
      subtotal: '2450',
      tax: '417',
      discount: '0',
      total: '2867',
      totalRefunded: '0',
      remainingRefundable: '2867',
      paymentMethod: 'cash',
      syncStatus: 'synced',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      items: [
        {
          id: 'item-001',
          variantId: 'var-001-m',
          productName: 'Premium Oxford Cotton Shirt',
          sku: 'SKU-SHIRT-BLK',
          quantity: 1,
          unitPrice: '2450',
          lineTotal: '2450',
        },
      ],
      refundHistory: [],
    },
  ];

  public wholesaleOrders: DevWholesaleOrder[] = [
    {
      id: 'wo-dev-001',
      orderNumber: 'WO-7F9C2B10',
      status: 'confirmed',
      totalAmount: '49000',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      customer: {
        id: 'cust-001',
        name: 'Al-Madina Departmental Store',
        phone: '+92 300 1234567',
        email: 'procurement@almadina.pk',
        creditLimit: '500000',
      },
      items: [
        {
          id: 'wo-it-001',
          variantId: 'var-001-m',
          productName: 'Premium Oxford Cotton Shirt (M)',
          sku: 'SKU-SHIRT-BLK',
          quantity: 20,
          unitPrice: '2450',
          lineTotal: '49000',
        },
      ],
    },
  ];
}

// Global persistence across hot reloads
const globalForDevStore = globalThis as unknown as { devStore?: DevStore };
export const devStore = globalForDevStore.devStore || new DevStore();
if (process.env.NODE_ENV !== 'production') globalForDevStore.devStore = devStore;
