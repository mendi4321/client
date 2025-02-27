// פונקציה להמרת מטבע
export async function convertCurrency(amount, fromCurrency = 'ILS', toCurrency) {
    try {
        // אם המטבעות זהים, אין צורך בהמרה
        if (fromCurrency === toCurrency) {
            return amount;
        }

        const response = await fetch(
            `https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${fromCurrency.toLowerCase()}.json`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch exchange rates');
        }

        const data = await response.json();
        const rate = data[fromCurrency.toLowerCase()][toCurrency.toLowerCase()];

        if (!rate) {
            throw new Error(`Could not find exchange rate for ${fromCurrency} to ${toCurrency}`);
        }

        return amount * rate;
    } catch (error) {
        console.error('Error converting currency:', error);
        // במקרה של שגיאה, נחזיר את הסכום המקורי
        return amount;
    }
} 