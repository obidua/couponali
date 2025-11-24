"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Merchant } from "@/types";
import { ROUTES } from "@/lib/constants";

interface MerchantCardProps {
  merchant: Merchant;
}

export function MerchantCard({ merchant }: MerchantCardProps) {
  return (
    <Link href={ROUTES.merchantDetail(merchant.slug)}>
      <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-white p-2">
              {merchant.logo_url ? (
                <Image
                  src={merchant.logo_url}
                  alt={merchant.name}
                  fill
                  className="object-contain"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-muted-foreground">
                  {merchant.name.charAt(0)}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold truncate group-hover:text-primary">
                  {merchant.name}
                </h3>
                {merchant.is_featured && (
                  <Badge variant="warning" className="shrink-0">
                    Featured
                  </Badge>
                )}
              </div>

              {/* Cashback Info */}
              {merchant.default_cashback_value > 0 && (
                <Badge variant="success" className="mt-1">
                  {merchant.default_cashback_type === "percentage"
                    ? `Up to ${merchant.default_cashback_value}% Cashback`
                    : `₹${merchant.default_cashback_value} Cashback`}
                </Badge>
              )}

              {/* Offers Count */}
              {merchant.total_offers !== undefined && merchant.total_offers > 0 && (
                <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                  <Tag className="h-4 w-4" />
                  {merchant.total_offers} offers available
                </div>
              )}
            </div>

            {/* Arrow */}
            <ExternalLink className="h-5 w-5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
