import { ChangeEvent } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
    minPrice: string | null;
    maxprice: string | null;
    onMinPriceChange: (value: string) => void;
    onMaxPriceChange: (value: string) => void; 
}

export const formatAsCurrency = (value: string) => {
    const numericValue = value.replace(/[^0-9.]/g, "");
    
    const parts = numericValue.split(".");
    const formattedValue = parts[0] + (parts.length > 1 ? "." + parts[1]?.slice(0, 2) : "");

    if (!formattedValue) return "";
    
    const numberValue = parseFloat(formattedValue);
    if (isNaN(numberValue)) return "";

    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(numberValue);
};

export const PriceFilter = ({
    minPrice,
    maxprice,
    onMinPriceChange,
    onMaxPriceChange,
}: Props) => {
    const handleMinPriceChange = (e: ChangeEvent<HTMLInputElement>) => {
        const numericValue = e.target.value.replace(/[^0-9.]/g, "");
        onMinPriceChange(numericValue);
    };

    const handleMaxPriceChange = (e: ChangeEvent<HTMLInputElement>) => {
        const numericValue = e.target.value.replace(/[^0-9.]/g, "");
        onMaxPriceChange(numericValue);
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <Label className="font-medium">Minimum Price</Label>
                <Input
                    placeholder="$0.00"
                    type="text"
                    value={minPrice ? formatAsCurrency(minPrice) : ""}
                    onChange={handleMinPriceChange}
                />
            </div>
            <div>
                <Label htmlFor="max-price">Maximum Price</Label>
                <Input
                    placeholder="∞"
                    type="text"
                    value={ maxprice? formatAsCurrency(maxprice) : ""}
                    onChange={handleMaxPriceChange}
                />
            </div>
        </div>
    );
};                                            