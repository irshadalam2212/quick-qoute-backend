import type { PaymentStatus, QuotationStatus } from "@prisma/client";

/** Numeric fields arrive from JSON / form bodies as either numbers or strings. */
export type Numeric = number | string;

export interface LineItemInput {
  description: string;
  unitId: Numeric;
  quantity: Numeric;
  price: Numeric;
  taxRate?: Numeric;
  total: Numeric;
}

export interface RegisterUserBody {
  name: string;
  email: string;
  password: string;
  companyName?: string;
  mobileNumber?: string;
  alternateMobile?: string;
  website?: string;
  gstNumber?: string;
  panNumber?: string;
  services?: string;
  address?: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface RefreshTokenBody {
  refreshToken?: string;
}

export interface UpdateProfileBody {
  name?: string;
  companyName?: string;
  mobileNumber?: string;
  alternateMobile?: string;
  website?: string;
  gstNumber?: string;
  panNumber?: string;
  services?: string;
  address?: string;
  logo?: string;
  signature?: string;
}

export interface CreateCategoryBody {
  name: string;
  code: string;
  description?: string;
}

export interface UpdateCategoryBody {
  name?: string;
  code?: string;
  description?: string;
  isActive?: boolean;
}

export interface ItemBody {
  description: string;
  categoryId: Numeric;
  unitId: Numeric;
  baseRate: Numeric;
  taxRate?: Numeric;
  notes?: string;
}

export interface QuotationBody {
  quotationNo: string;
  date?: string;
  clientName?: string;
  projectName?: string;
  address: string;
  instructions?: string;
  quotation: LineItemInput[];
  subtotal: number;
  taxRate?: number;
  taxAmount?: number;
  discount?: number;
  grandTotal: number;
  status?: QuotationStatus;
}

export interface InvoiceBody {
  clientName: string;
  address: string;
  items: LineItemInput[];
  subtotal: number;
  taxRate?: number;
  taxAmount?: number;
  discount?: number;
  grandTotal: number;
  paymentStatus?: PaymentStatus;
  quotationId: Numeric;
}

export interface GenerateDescriptionBody {
  prompt?: string;
}
