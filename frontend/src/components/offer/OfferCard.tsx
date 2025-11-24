"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ExternalLink, Clock, CheckCircle, Star } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CouponCode } from "./CouponCode";
import type { Offer } from "@/types";
import { formatCurrency, isExpiringSoon, formatDate } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";

interface OfferCardProps {
  offer: Offer;
  onClickTrack?: (offerId: number) => void;
}

export function OfferCard({ offer, onClickTrack }: OfferCardProps) {
  const [showCode, setShowCode] = useState(false);

  const handleClick = () => {
    onClickTrack?.(offer.id);
    if (offer.offer_type === "code") {
      setShowCode(true);
    } else {
      // Redirect to affiliate URL
      window.open(offer.affiliate_url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Card className="group relative overflow-hidden transition-shadow hover:shadow-lg">
      {/* Offer Image */}
      {offer.image_url && (
        <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-primary/10 to-primary/5">
          <Image
            src={offer.image_url}
            alt={offer.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>
      )}

      {/* Badges */}
      <div className="absolute right-2 top-2 z-10 flex flex-col gap-1">
        {offer.is_exclusive && <Badge variant="exclusive">Exclusive</Badge>}
        {offer.is_verified && (
          <Badge variant="success" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            Verified
          </Badge>
        )}
        {offer.is_featured && (
          <Badge variant="warning" className="gap-1">
            <Star className="h-3 w-3" />
            Featured
          </Badge>
        )}
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {/* Merchant Logo */}
          {offer.merchant?.logo_url ? (
            <Image
              src={offer.merchant.logo_url}
              alt={offer.merchant.name}
              width={64}
              height={64}
              className="h-16 w-16 rounded-lg border object-contain p-1"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-lg border bg-muted text-lg font-bold">
              {offer.merchant?.name.charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            {offer.merchant && (
              <Link
                href={ROUTES.merchantDetail(offer.merchant.slug)}
                className="text-sm text-muted-foreground hover:text-primary hover:underline"
              >
                {offer.merchant.name}
              </Link>
            )}
            <h3 className="font-semibold leading-tight line-clamp-2">{offer.title}</h3>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        {offer.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{offer.description}</p>
        )}

        {/* Cashback/Discount Info */}
        <div className="mt-3 flex flex-wrap gap-2">
          {offer.discount_value && (
            <Badge variant="info">
              {offer.discount_type === "percentage"
                ? `${offer.discount_value}% Off`
                : `${formatCurrency(offer.discount_value)} Off`}
            </Badge>
          )}
          {offer.cashback_value && (
            <Badge variant="success">
              {offer.cashback_type === "percentage"
                ? `${offer.cashback_value}% Cashback`
                : `${formatCurrency(offer.cashback_value)} Cashback`}
            </Badge>
          )}
        </div>

        {/* Expiry Warning */}
        {offer.end_date && isExpiringSoon(offer.end_date) && (
          <div className="mt-2 flex items-center gap-1 text-xs text-orange-600">
            <Clock className="h-3 w-3" />
            Expires {formatDate(offer.end_date)}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        {showCode && offer.offer_type === "code" && offer.coupon_code ? (
          <CouponCode
            code={offer.coupon_code}
            affiliateUrl={offer.affiliate_url}
            onClick={() => onClickTrack?.(offer.id)}
            className="w-full"
          />
        ) : (
          <Button className="w-full gap-2" onClick={handleClick}>
            {offer.offer_type === "code" ? (
              "Reveal Code"
            ) : (
              <>
                Get Deal
                <ExternalLink className="h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
