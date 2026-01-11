// Currency formatting utility for Indian Rupees
export const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toFixed(2)}`;
};

export const CURRENCY_SYMBOL = '₹';
