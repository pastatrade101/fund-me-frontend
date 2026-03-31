import type { PlatformFeeSettings } from "../types/api";

function roundMoney(value: number) {
    return Number((Number.isFinite(value) ? value : 0).toFixed(2));
}

function formatMinimumContributionMessage(minimumContributionAmount: number) {
    return `Minimum contribution is TSh ${Math.round(roundMoney(minimumContributionAmount)).toLocaleString()} due to mobile money processing costs.`;
}

export function calculateContributionPaymentPreview(
    contributionAmount: number,
    settings: PlatformFeeSettings | null
) {
    const normalizedContributionAmount = roundMoney(contributionAmount);

    if (normalizedContributionAmount <= 0) {
        return {
            contribution_amount: normalizedContributionAmount,
            platform_fee: 0,
            gateway_fee: 0,
            total_to_pay: normalizedContributionAmount,
            minimum_contribution_amount: roundMoney(Number(settings?.minimum_contribution_amount || 0)),
            minimum_amount_met: false,
            minimum_amount_message: settings
                ? formatMinimumContributionMessage(Number(settings.minimum_contribution_amount || 0))
                : null
        };
    }

    if (!settings) {
        return {
            contribution_amount: normalizedContributionAmount,
            platform_fee: 0,
            gateway_fee: 0,
            total_to_pay: normalizedContributionAmount,
            minimum_contribution_amount: 0,
            minimum_amount_met: true,
            minimum_amount_message: null
        };
    }

    const platformFee = roundMoney(
        (normalizedContributionAmount * Number(settings.platform_fee_percentage || 0)) / 100
    );
    const gatewayFee = roundMoney(
        ((normalizedContributionAmount * Number(settings.gateway_fee_percentage || 0)) / 100)
            + Number(settings.gateway_flat_fee || 0)
    );
    const totalToPay = roundMoney(normalizedContributionAmount + platformFee + gatewayFee);
    const minimumContributionAmount = roundMoney(Number(settings.minimum_contribution_amount || 0));
    const minimumAmountMet = normalizedContributionAmount >= minimumContributionAmount;

    return {
        contribution_amount: normalizedContributionAmount,
        platform_fee: platformFee,
        gateway_fee: gatewayFee,
        total_to_pay: totalToPay,
        minimum_contribution_amount: minimumContributionAmount,
        minimum_amount_met: minimumAmountMet,
        minimum_amount_message: minimumAmountMet
            ? null
            : formatMinimumContributionMessage(minimumContributionAmount)
    };
}
