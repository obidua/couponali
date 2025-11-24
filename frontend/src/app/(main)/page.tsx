"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Tag,
  Gift,
  Wallet,
  TrendingUp,
  Shield,
  ArrowRight,
  Star,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ROUTES, CATEGORIES } from "@/lib/constants";
import { useMerchants } from "@/lib/hooks/use-merchants";
import { useOffers } from "@/lib/hooks/use-offers";

const howItWorks = [
  {
    icon: Search,
    title: "Find Offers",
    description: "Browse coupons, deals & cashback offers from 1000+ stores",
  },
  {
    icon: Tag,
    title: "Use Coupons",
    description: "Copy codes or click deals to shop at your favorite stores",
  },
  {
    icon: Wallet,
    title: "Earn Cashback",
    description: "Get cashback credited to your wallet on every purchase",
  },
  {
    icon: TrendingUp,
    title: "Withdraw & Save",
    description: "Transfer earnings to bank, UPI, or get gift cards",
  },
];

export default function HomePage() {
  // Fetch merchants and offers from API
  const { data: merchantsData } = useMerchants({ limit: 6, is_featured: true });
  const { data: offersData } = useOffers({ limit: 4 });
  
  const featuredMerchants = merchantsData?.data || [];
  const topOffers = offersData?.data || [];

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-background py-12 md:py-20">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="secondary" className="mb-4">
              Save up to 50% on your favorite brands
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              Coupons, Cashback &{" "}
              <span className="text-primary">Discounted Gift Cards</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground md:text-xl">
              India&apos;s #1 platform for verified coupons, exclusive cashback offers, and
              discounted gift cards from 1000+ stores.
            </p>

            {/* Search Bar */}
            <div className="mx-auto mt-8 max-w-xl">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search stores, coupons, gift cards..."
                    className="h-12 pl-10 pr-4 text-base"
                  />
                </div>
                <Button size="lg" className="h-12">
                  Search
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500" />
                1000+ Stores
              </span>
              <span className="flex items-center gap-1">
                <Tag className="h-4 w-4 text-primary" />
                50,000+ Coupons
              </span>
              <span className="flex items-center gap-1">
                <Gift className="h-4 w-4 text-green-500" />
                200+ Gift Cards
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="border-b py-6">
        <div className="container">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map((category) => (
              <Link
                key={category.id}
                href={`${ROUTES.coupons}?category=${category.slug}`}
                className="flex shrink-0 items-center gap-2 rounded-full border bg-background px-4 py-2 text-sm font-medium hover:border-primary hover:text-primary"
              >
                <span>{category.icon}</span>
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Merchants */}
      <section className="py-12">
        <div className="container">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Popular Stores</h2>
              <p className="text-muted-foreground">Shop with cashback at your favorite brands</p>
            </div>
            <Link
              href={ROUTES.merchants}
              className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {featuredMerchants.map((merchant) => (
              <Link key={merchant.id} href={ROUTES.merchantDetail(merchant.slug)}>
                <Card className="group h-full transition-shadow hover:shadow-lg">
                  <CardContent className="flex flex-col items-center p-4 text-center">
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-lg border bg-white p-2">
                      {merchant.logo_url ? (
                        <Image
                          src={merchant.logo_url}
                          alt={merchant.name}
                          width={64}
                          height={64}
                          className="object-contain"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-primary">
                          {merchant.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-3 font-medium group-hover:text-primary">{merchant.name}</h3>
                    {merchant.default_cashback_value > 0 && (
                      <Badge variant="success" className="mt-2 text-xs">
                        {merchant.default_cashback_type === "percentage"
                          ? `Up to ${merchant.default_cashback_value}%`
                          : `₹${merchant.default_cashback_value}`}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Top Offers */}
      <section className="bg-muted/50 py-12">
        <div className="container">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Top Offers Today</h2>
              <p className="text-muted-foreground">Hand-picked deals verified by our team</p>
            </div>
            <Link
              href={ROUTES.coupons}
              className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {topOffers.map((offer) => (
              <Card key={offer.id} className="group overflow-hidden transition-shadow hover:shadow-lg">
                <CardContent className="p-0">
                  {/* Offer Image */}
                  {offer.image_url && (
                    <div className="relative h-32 w-full overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
                      <Image
                        src={offer.image_url}
                        alt={offer.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="p-4">
                    <Badge variant="secondary" className="mb-2">
                      {offer.merchant.name}
                    </Badge>
                    <h3 className="font-semibold line-clamp-2">{offer.title}</h3>
                    <div className="mt-4">
                      {offer.code ? (
                        <div className="flex items-center gap-2 rounded-lg border-2 border-dashed border-primary bg-primary/5 p-2">
                          <code className="flex-1 font-mono text-sm font-bold text-primary">
                            {offer.code}
                          </code>
                          <Button size="sm" variant="default">
                            Copy
                          </Button>
                        </div>
                      ) : (
                        <Button className="w-full">Get Deal</Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Gift Cards Section */}
      <section className="py-12">
        <div className="container">
          <div className="rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 p-8 text-white md:p-12">
            <div className="flex flex-col items-center gap-8 md:flex-row">
              <div className="flex-1">
                <Badge className="bg-white/20 text-white hover:bg-white/30">
                  Save Extra
                </Badge>
                <h2 className="mt-4 text-3xl font-bold md:text-4xl">
                  Buy Gift Cards at Discount
                </h2>
                <p className="mt-2 text-green-100">
                  Get up to 10% off on gift cards from Amazon, Flipkart, Myntra, Swiggy,
                  Zomato and 200+ more brands.
                </p>
                <div className="mt-6 flex flex-wrap gap-4">
                  <Link href={ROUTES.products}>
                    <Button size="lg" variant="secondary">
                      <Gift className="mr-2 h-5 w-5" />
                      Shop Gift Cards
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="rounded-lg bg-white p-4 shadow-lg">
                  <span className="text-4xl">🎁</span>
                </div>
                <div className="rounded-lg bg-white p-4 shadow-lg">
                  <span className="text-4xl">🛍️</span>
                </div>
                <div className="rounded-lg bg-white p-4 shadow-lg">
                  <span className="text-4xl">💳</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted/50 py-12">
        <div className="container">
          <div className="text-center">
            <h2 className="text-2xl font-bold">How It Works</h2>
            <p className="mt-2 text-muted-foreground">
              Start saving money in just 4 simple steps
            </p>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {howItWorks.map((step, index) => (
              <div key={index} className="relative text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>
                <div className="absolute left-1/2 top-8 hidden h-0.5 w-full -translate-y-1/2 bg-primary/20 lg:block" />
                <h3 className="mt-4 font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-12">
        <div className="container">
          <div className="flex flex-wrap items-center justify-center gap-8 text-center">
            <div>
              <Shield className="mx-auto h-8 w-8 text-green-600" />
              <p className="mt-2 font-semibold">100% Verified</p>
              <p className="text-sm text-muted-foreground">All coupons tested</p>
            </div>
            <div>
              <Wallet className="mx-auto h-8 w-8 text-blue-600" />
              <p className="mt-2 font-semibold">Secure Payments</p>
              <p className="text-sm text-muted-foreground">Razorpay secured</p>
            </div>
            <div>
              <TrendingUp className="mx-auto h-8 w-8 text-purple-600" />
              <p className="mt-2 font-semibold">10L+ Saved</p>
              <p className="text-sm text-muted-foreground">By our users</p>
            </div>
            <div>
              <Star className="mx-auto h-8 w-8 text-yellow-500" />
              <p className="mt-2 font-semibold">4.8/5 Rating</p>
              <p className="text-sm text-muted-foreground">From 50K+ reviews</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-primary py-12 text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-2xl font-bold md:text-3xl">Start Saving Today!</h2>
          <p className="mt-2 text-primary-foreground/80">
            Join 1 million+ smart shoppers who save money with BIDUA Coupons
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link href={ROUTES.register}>
              <Button size="lg" variant="secondary">
                Create Free Account
              </Button>
            </Link>
            <Link href={ROUTES.coupons}>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                Browse Coupons
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
