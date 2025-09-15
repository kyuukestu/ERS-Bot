export const formatCurrency = (
	amount: number,
	locale: string = 'ja-JP',
	currencyCode: string = 'JPY'
): string => {
	const formatter = new Intl.NumberFormat(locale, {
		style: 'currency',
		currency: currencyCode,
	}).format(amount);

	const formatted = formatter.replace('￥', '₱');

	return formatted;
};
