"use client";

import { useState } from "react";
import { ProductGrid } from "@/components/product/ProductGrid";
import { CategoryNav } from "@/components/common/CategoryNav";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { Pagination } from "@/components/common/Pagination";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { ROUTES } from "@/lib/constants";
import type { Product } from "@/types";

// Mock data
const mockProducts: Product[] = [
  {
    id: 1,
    name: "Amazon Pay Gift Card",
    slug: "amazon-pay-gift-card",
    sku: "AMZN-GC-001",
    description: "Amazon Pay Gift Card for shopping on Amazon.in",
    is_bestseller: true,
    is_active: true,
    variants: [
      { id: 1, product_id: 1, denomination: 100, selling_price: 95, cost_price: 92, discount_percentage: 5, is_available: true },
      { id: 2, product_id: 1, denomination: 250, selling_price: 237, cost_price: 230, discount_percentage: 5, is_available: true },
      { id: 3, product_id: 1, denomination: 500, selling_price: 475, cost_price: 460, discount_percentage: 5, is_available: true },
      { id: 4, product_id: 1, denomination: 1000, selling_price: 950, cost_price: 920, discount_percentage: 5, is_available: true },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Flipkart Gift Card",
    slug: "flipkart-gift-card",
    sku: "FK-GC-001",
    description: "Flipkart Gift Card for shopping on Flipkart",
    is_bestseller: true,
    is_active: true,
    variants: [
      { id: 5, product_id: 2, denomination: 100, selling_price: 96, cost_price: 93, discount_percentage: 4, is_available: true },
      { id: 6, product_id: 2, denomination: 500, selling_price: 480, cost_price: 465, discount_percentage: 4, is_available: true },
      { id: 7, product_id: 2, denomination: 1000, selling_price: 960, cost_price: 930, discount_percentage: 4, is_available: true },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    name: "Swiggy Gift Card",
    slug: "swiggy-gift-card",
    sku: "SWG-GC-001",
    description: "Swiggy Gift Card for food delivery",
    is_bestseller: false,
    is_active: true,
    variants: [
      { id: 8, product_id: 3, denomination: 250, selling_price: 237, cost_price: 230, discount_percentage: 5, is_available: true },
      { id: 9, product_id: 3, denomination: 500, selling_price: 475, cost_price: 460, discount_percentage: 5, is_available: true },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 4,
    name: "Zomato Gift Card",
    slug: "zomato-gift-card",
    sku: "ZMT-GC-001",
    description: "Zomato Gift Card for food delivery",
    is_bestseller: false,
    is_active: true,
    variants: [
      { id: 10, product_id: 4, denomination: 250, selling_price: 240, cost_price: 233, discount_percentage: 4, is_available: true },
      { id: 11, product_id: 4, denomination: 500, selling_price: 480, cost_price: 465, discount_percentage: 4, is_available: true },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 5,
    name: "Myntra Gift Card",
    slug: "myntra-gift-card",
    sku: "MYN-GC-001",
    description: "Myntra Gift Card for fashion shopping",
    is_bestseller: true,
    is_active: true,
    variants: [
      { id: 12, product_id: 5, denomination: 500, selling_price: 470, cost_price: 455, discount_percentage: 6, is_available: true },
      { id: 13, product_id: 5, denomination: 1000, selling_price: 940, cost_price: 910, discount_percentage: 6, is_available: true },
      { id: 14, product_id: 5, denomination: 2000, selling_price: 1880, cost_price: 1820, discount_percentage: 6, is_available: true },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 6,
    name: "MakeMyTrip Gift Card",
    slug: "makemytrip-gift-card",
    sku: "MMT-GC-001",
    description: "MakeMyTrip Gift Card for travel booking",
    is_bestseller: false,
    is_active: true,
    variants: [
      { id: 15, product_id: 6, denomination: 1000, selling_price: 930, cost_price: 900, discount_percentage: 7, is_available: true },
      { id: 16, product_id: 6, denomination: 2000, selling_price: 1860, cost_price: 1800, discount_percentage: 7, is_available: true },
      { id: 17, product_id: 6, denomination: 5000, selling_price: 4650, cost_price: 4500, discount_percentage: 7, is_available: true },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredProducts = mockProducts.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container py-6">
      <Breadcrumbs items={[{ label: "Gift Cards" }]} />

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Gift Cards</h1>
        <p className="mt-1 text-muted-foreground">
          Buy discounted gift cards from your favorite brands
        </p>
      </div>

      {/* Categories */}
      <div className="mb-6">
        <CategoryNav basePath={ROUTES.products} />
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search gift cards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="price_low">Price: Low to High</SelectItem>
              <SelectItem value="price_high">Price: High to Low</SelectItem>
              <SelectItem value="discount">Highest Discount</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      <div className="mb-4 text-sm text-muted-foreground">
        Showing {filteredProducts.length} gift cards
      </div>

      <ProductGrid products={filteredProducts} />

      {/* Pagination */}
      <div className="mt-8">
        <Pagination
          currentPage={currentPage}
          totalPages={3}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
