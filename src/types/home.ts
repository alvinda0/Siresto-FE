// types/home.ts

export interface DateValue {
  date: string;
  value: number;
}

export interface BestSellingProduct {
  product_id: string;
  product_name: string;
  total_qty: number;
  total_amount: number;
}

export interface ComplimentaryItem {
  product_id: string;
  product_name: string;
  total_qty: number;
}

export interface HomeData {
  total_items_by_date: DateValue[];
  revenue_by_date: DateValue[];
  best_selling_daily: BestSellingProduct[];
  best_selling_weekly: BestSellingProduct[];
  best_selling_monthly: BestSellingProduct[];
  complimentary_items: ComplimentaryItem[];
}

export interface HomeResponse {
  data: HomeData;
  success: boolean;
}
