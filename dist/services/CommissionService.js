"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommissionService = void 0;
class CommissionService {
    /**
     * Calculate commission details for a given basket value.
     * Rules:
     * Basket Value <= $500        → 15%
     * $501 - $1500               → 12%
     * Above $1500                → 10%
     */
    static calculate(basketValue) {
        let commissionPercentage = 10;
        if (basketValue <= 500) {
            commissionPercentage = 15;
        }
        else if (basketValue <= 1500) {
            commissionPercentage = 12;
        }
        else {
            commissionPercentage = 10;
        }
        // Round to two decimal places
        const commissionAmount = parseFloat(((basketValue * commissionPercentage) / 100).toFixed(2));
        return {
            basketValue,
            commissionPercentage,
            commissionAmount,
        };
    }
}
exports.CommissionService = CommissionService;
