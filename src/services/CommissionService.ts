export class CommissionService {
  /**
   * Calculate commission details for a given basket value.
   * Rules:
   * Basket Value <= $500        → 15%
   * $501 - $1500               → 12%
   * Above $1500                → 10%
   */
  public static calculate(basketValue: number): {
    basketValue: number;
    commissionPercentage: number;
    commissionAmount: number;
  } {
    let commissionPercentage = 10;

    if (basketValue <= 500) {
      commissionPercentage = 15;
    } else if (basketValue <= 1500) {
      commissionPercentage = 12;
    } else {
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
