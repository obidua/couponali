"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import type { ProductVariant } from "@/types";
import { formatCurrency, calculateDiscount } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariant: ProductVariant | null;
  onVariantChange: (variant: ProductVariant) => void;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onAddToCart: () => void;
  maxQuantity?: number;
}

export function VariantSelector({
  variants,
  selectedVariant,
  onVariantChange,
  quantity,
  onQuantityChange,
  onAddToCart,
  maxQuantity = 10,
}: VariantSelectorProps) {
  return (
    <div className="space-y-6">
      {/* Variant Selection */}
      <div>
        <Label className="text-base font-semibold">Select Denomination</Label>
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
          {variants.map((variant) => {
            const isSelected = selectedVariant?.id === variant.id;
            const discount = calculateDiscount(variant.denomination, variant.selling_price);

            return (
              <button
                key={variant.id}
                onClick={() => variant.is_available && onVariantChange(variant)}
                disabled={!variant.is_available}
                className={cn(
                  "relative flex flex-col items-center justify-center rounded-lg border-2 p-3 transition-all",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-input hover:border-primary/50",
                  !variant.is_available && "cursor-not-allowed opacity-50"
                )}
              >
                {discount > 0 && (
                  <Badge
                    variant="success"
                    className="absolute -right-2 -top-2 text-[10px] px-1.5"
                  >
                    {discount}% off
                  </Badge>
                )}
                <span className="text-lg font-semibold">
                  {formatCurrency(variant.denomination)}
                </span>
                <span className="text-xs text-muted-foreground">
                  Pay {formatCurrency(variant.selling_price)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quantity Selector */}
      <div>
        <Label className="text-base font-semibold">Quantity</Label>
        <div className="mt-3 flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Input
            type="number"
            value={quantity}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 1;
              onQuantityChange(Math.min(Math.max(1, val), maxQuantity));
            }}
            className="w-20 text-center"
            min={1}
            max={maxQuantity}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => onQuantityChange(Math.min(quantity + 1, maxQuantity))}
            disabled={quantity >= maxQuantity}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">(Max {maxQuantity})</span>
        </div>
      </div>

      {/* Price Summary */}
      {selectedVariant && (
        <div className="rounded-lg bg-muted p-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Unit Price</span>
            <span>{formatCurrency(selectedVariant.selling_price)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Quantity</span>
            <span>x {quantity}</span>
          </div>
          <hr className="my-2" />
          <div className="flex items-center justify-between text-lg font-semibold">
            <span>Total</span>
            <span>{formatCurrency(selectedVariant.selling_price * quantity)}</span>
          </div>
          {calculateDiscount(
            selectedVariant.denomination * quantity,
            selectedVariant.selling_price * quantity
          ) > 0 && (
            <p className="mt-1 text-sm text-green-600">
              You save{" "}
              {formatCurrency(
                selectedVariant.denomination * quantity -
                  selectedVariant.selling_price * quantity
              )}
            </p>
          )}
        </div>
      )}

      {/* Add to Cart Button */}
      <Button
        size="xl"
        className="w-full gap-2"
        onClick={onAddToCart}
        disabled={!selectedVariant?.is_available}
      >
        <ShoppingCart className="h-5 w-5" />
        Add to Cart
      </Button>
    </div>
  );
}
