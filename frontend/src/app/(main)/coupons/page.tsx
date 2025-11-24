"use client";

import { useState } from "react";
import { OfferGrid } from "@/components/offer/OfferGrid";
import { OfferFilters } from "@/components/offer/OfferFilters";
import { CategoryNav } from "@/components/common/CategoryNav";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { Pagination } from "@/components/common/Pagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal } from "lucide-react";
import type { Offer } from "@/types";

// Mock data
const mockOffers: Offer[] = [
  {
    id: 1,
    merchant_id: 1,
    merchant: { id: 1, name: "Amazon", slug: "amazon", website_url: "", affiliate_url: "", default_cashback_type: "percentage", default_cashback_value: 10, is_featured: true, is_active: true, created_at: "", updated_at: "" },
    title: "50% Off on Electronics",
    description: "Get up to 50% discount on laptops, mobiles, and accessories",
    offer_type: "code",
    coupon_code: "ELEC50",
    discount_type: "percentage",
    discount_value: 50,
    cashback_type: "percentage",
    cashback_value: 5,
    affiliate_url: "https://amazon.in",
    start_date: new Date().toISOString(),
    is_exclusive: true,
    is_verified: true,
    is_featured: true,
    is_active: true,
    click_count: 1250,
    success_count: 890,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    merchant_id: 2,
    merchant: { id: 2, name: "Flipkart", slug: "flipkart", website_url: "", affiliate_url: "", default_cashback_type: "percentage", default_cashback_value: 8, is_featured: true, is_active: true, created_at: "", updated_at: "" },
    title: "Big Billion Days Special - Extra 10% Off",
    description: "Additional discount during sale period",
    offer_type: "code",
    coupon_code: "BBD10",
    discount_type: "percentage",
    discount_value: 10,
    affiliate_url: "https://flipkart.com",
    start_date: new Date().toISOString(),
    is_exclusive: false,
    is_verified: true,
    is_featured: true,
    is_active: true,
    click_count: 2500,
    success_count: 1890,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    merchant_id: 3,
    merchant: { id: 3, name: "Myntra", slug: "myntra", website_url: "", affiliate_url: "", default_cashback_type: "percentage", default_cashback_value: 12, is_featured: false, is_active: true, created_at: "", updated_at: "" },
    title: "Flat 40% Off on Fashion",
    description: "Shop the latest trends at discounted prices",
    offer_type: "deal",
    discount_type: "percentage",
    discount_value: 40,
    affiliate_url: "https://myntra.com",
    start_date: new Date().toISOString(),
    is_exclusive: true,
    is_verified: true,
    is_featured: false,
    is_active: true,
    click_count: 980,
    success_count: 720,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 4,
    merchant_id: 4,
    merchant: { id: 4, name: "Swiggy", slug: "swiggy", website_url: "", affiliate_url: "", default_cashback_type: "percentage", default_cashback_value: 5, is_featured: true, is_active: true, created_at: "", updated_at: "" },
    title: "30% Off on First 3 Orders",
    description: "New user offer on food delivery",
    offer_type: "code",
    coupon_code: "WELCOME30",
    discount_type: "percentage",
    discount_value: 30,
    affiliate_url: "https://swiggy.com",
    start_date: new Date().toISOString(),
    is_exclusive: false,
    is_verified: true,
    is_featured: false,
    is_active: true,
    click_count: 1500,
    success_count: 1100,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export default function CouponsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredOffers = mockOffers.filter(
    (o) =>
      o.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.merchant?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container py-6">
      <Breadcrumbs items={[{ label: "Coupons & Deals" }]} />

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Coupons & Deals</h1>
        <p className="mt-1 text-muted-foreground">
          Browse verified coupons and exclusive deals from top stores
        </p>
      </div>

      {/* Categories */}
      <div className="mb-6">
        <CategoryNav />
      </div>

      {/* Search & Filter Bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search coupons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          className="gap-2 lg:hidden"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Filters Sidebar - Desktop */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <OfferFilters />
        </aside>

        {/* Filters Sidebar - Mobile */}
        {showFilters && (
          <div className="fixed inset-0 z-50 bg-background p-6 lg:hidden">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Filters</h2>
              <Button variant="ghost" onClick={() => setShowFilters(false)}>
                Close
              </Button>
            </div>
            <OfferFilters />
          </div>
        )}

        {/* Offers Grid */}
        <div className="flex-1">
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {filteredOffers.length} offers
          </div>
          <OfferGrid offers={filteredOffers} />

          {/* Pagination */}
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={5}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
