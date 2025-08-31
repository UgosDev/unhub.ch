export type ProcessingMode = 'quality' | 'scontrino' | 'identity' | 'speed' | 'business' | 'book' | 'no-ai';

export interface UsageHistoryEntry {
    timestamp: string;
    description: string;
    costInCoins: number;
    mode: ProcessingMode;
}

export interface ScanHistoryEntry {
    timestamp: string;
    description: string;
    amountInCoins: number;
    status: 'Credited' | 'Debited';
    type: 'purchase' | 'usage' | 'promo' | 'refund';
}

export const COIN_TO_CHF_RATE = 0.01; // 1 ScanCoin = 0.01 CHF

// Mock implementation of Gemini streaming for the scanner fallback
export const startUgoExperienceStream = async (
    base64Image: string,
    onChunk: (jsonChunk: any) => void
): Promise<void> => {
    // In a real app, this would call the Gemini API
    console.log("AI Fallback: Simulating Gemini call for document detection.");
    
    // Simulate a delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    // Simulate a possible response
    const shouldFindDocument = Math.random() > 0.3; // 70% chance of finding something

    if (shouldFindDocument) {
        onChunk({ userFeedback: "Ho trovato i bordi del documento!" });
        await new Promise(resolve => setTimeout(resolve, 300));
        onChunk({
            documentCorners: [
                { x: 0.1 + Math.random() * 0.1, y: 0.1 + Math.random() * 0.1 },
                { x: 0.9 - Math.random() * 0.1, y: 0.15 + Math.random() * 0.1 },
                { x: 0.85 - Math.random() * 0.1, y: 0.9 - Math.random() * 0.1 },
                { x: 0.15 + Math.random() * 0.1, y: 0.85 - Math.random() * 0.1 },
            ]
        });
    } else {
        onChunk({ userFeedback: "Non riesco a trovare un documento chiaro. Prova con più luce." });
    }
};