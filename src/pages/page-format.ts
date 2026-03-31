export function formatCurrency(value?: number | null) {
    return new Intl.NumberFormat("en-TZ", {
        style: "currency",
        currency: "TZS",
        maximumFractionDigits: 0
    }).format(value || 0);
}

export function formatDate(value?: string | null) {
    if (!value) {
        return "N/A";
    }

    return new Intl.DateTimeFormat("en-TZ", {
        dateStyle: "medium"
    }).format(new Date(value));
}

export function formatDateTime(value?: string | null) {
    if (!value) {
        return "N/A";
    }

    return new Intl.DateTimeFormat("en-TZ", {
        dateStyle: "medium",
        timeStyle: "short"
    }).format(new Date(value));
}
