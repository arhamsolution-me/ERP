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
      totalQuantity: 0,
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
      totalQuantity: 0,
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
      totalQuantity: 0,
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
      totalQuantity: 0,
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

  public customers: DevCustomer[] = [];

  public activeShift: DevShift | null = null;

  public transactions: DevTransaction[] = [];

  public wholesaleOrders: DevWholesaleOrder[] = [];
}

// WARNING: devStore is for local development only and must NEVER be reachable
// or used as a fallback in production environments. All callers must be gated
// via isDevStoreFallbackAllowed() from @/lib/dev-store-guard.
const globalForDevStore = globalThis as unknown as { devStore?: DevStore };
export const devStore = globalForDevStore.devStore || new DevStore();
if (process.env.NODE_ENV !== 'production') globalForDevStore.devStore = devStore;
