
import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold } from "@google/genai";
import Tesseract from 'tesseract.js';
import * as db from './db'; // Import per la ricerca vettoriale
import * as pdfjsLib from 'pdfjs-dist';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const safetySettings = [
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
];

// --- TIPI E INTERFACCE ---
export type Point = { x: number; y: number };
export type ProcessingMode = 'quality' | 'speed' | 'business' | 'book' | 'no-ai' | 'scontrino' | 'identity';

export interface TokenUsage {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
}

export interface PageInfo {
    currentPage: number;
    totalPages: number;
}

export interface ProcessedPageResult {
    pageNumber: number;
    uuid: string;
    documentHash: string;
    sourceFileName: string;
    originalImageDataUrl: string;
    processedImageDataUrl: string;
    analysis: any; // Potrebbe essere un tipo più specifico
    securityCheck: {
        isSafe: boolean;
        threatType: string;
        explanation: string;
    };
    tokenUsage: TokenUsage;
    pageInfo: PageInfo;
    sourceFileId?: string;
    isPotentialDuplicateOf?: {
        pageNumber: number;
        sourceFileName: string;
        originalImageDataUrl: string;
    };
    costInCoins?: number;
    processingMode: ProcessingMode;
    timestamp: string;
    mimeType: string;
    extractedImages?: { description: string, imageDataUrl: string }[];
    retryCount?: number;
    tags?: string[];
    processedOffline?: boolean;
    isDemo?: boolean;
    feedback?: 'good' | 'bad';
    isPrivate?: boolean;
    ownerUid?: string;
    ownerName?: string;
    embedding?: number[];
    folderPath?: string;
    fascicolo?: string | null;
    deletedAt?: string | null;
    status?: 'Bozza' | 'Inviata' | 'Confermata';
}

export interface DocumentGroup {
    id: string;
    title: string;
    category: string;
    pages: ProcessedPageResult[];
    isSafe: boolean;
    pageCount: number;
    tags: string[];
}

export interface ProcessingTask {
    name: string;
    pages: number;
    mode: ProcessingMode;
    sourceFileId: string;
}

export interface QueuedFile {
    file: File;
    pages: number;
    mode: ProcessingMode;
    extractImages: boolean;
    sourceFileId: string;
}

export interface ScanHistoryEntry {
    id?: string;
    timestamp: string;
    description: string;
    amountInCoins: number; // Positivo per accrediti, negativo per addebiti
    status: 'Success' | 'Error' | 'Credited';
    type: 'scan' | 'reward' | 'refund' | 'promo';
    uuid?: string; // Solo per le scansioni
    processingMode?: ProcessingMode; // Solo per le scansioni
}


export interface UsageHistoryEntry {
    id?: number;
    date: string;
    pagesProcessed: number;
    scansByMode: { [key in ProcessingMode]: number };
    costInCoins: number;
    costInCHF: number;
}


// --- COSTANTI DI COSTO PER SCANSIONE IN SCANCOIN ---
export const COST_PER_SCAN_COINS: { [key in ProcessingMode]: number } = {
    quality: 10,
    speed: 7,
    business: 15,
    book: 25,
    scontrino: 12,
    identity: 20,
    'no-ai': 0,
};

export const COST_PER_EXTRACTED_IMAGE_COINS = 5;

export const COIN_TO_CHF_RATE = 0.01;

export const COST_PER_SCAN_CHF: { [key in ProcessingMode]: number } = {
    quality: COST_PER_SCAN_COINS.quality * COIN_TO_CHF_RATE,
    speed: COST_PER_SCAN_COINS.speed * COIN_TO_CHF_RATE,
    business: COST_PER_SCAN_COINS.business * COIN_TO_CHF_RATE,
    book: COST_PER_SCAN_COINS.book * COIN_TO_CHF_RATE,
    scontrino: COST_PER_SCAN_COINS.scontrino * COIN_TO_CHF_RATE,
    identity: COST_PER_SCAN_COINS.identity * COIN_TO_CHF_RATE,
    'no-ai': COST_PER_SCAN_COINS['no-ai'] * COIN_TO_CHF_RATE,
};


// Helper per ordinare gli angoli in senso orario partendo da top-left
const sortCorners = (corners: Point[]): Point[] => {
    if (corners.length !== 4) return corners;
    const center = corners.reduce((acc, c) => ({ x: acc.x + c.x / 4, y: acc.y + c.y / 4 }), { x: 0, y: 0 });
    return corners.sort((a, b) => {
        const angleA = Math.atan2(a.y - center.y, a.x - center.x);
        const angleB = Math.atan2(b.y - center.y, b.x - center.x);
        return angleA - angleB;
    });
};

// --- FUNZIONE DI ELABORAZIONE IMMAGINE ---

export function createWarpedImageFromCorners(sourceImageUrl: string, normalizedCorners: Point[], uuid: string, timestamp: string): Promise<string> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = "Anonymous";
        
        image.onload = () => {
            let intermediateCanvas: HTMLCanvasElement;
            const hasValidCorners = normalizedCorners && normalizedCorners.length === 4;

            if (hasValidCorners) {
                // --- Warping Logic con OpenCV per maggiore robustezza ---
                try {
                    const { naturalWidth, naturalHeight } = image;
                    const srcMat = (window as any).cv.imread(image);
                    const absoluteCorners = normalizedCorners.map(p => ({ x: p.x * naturalWidth, y: p.y * naturalHeight }));
                    
                    const [tl, tr, br, bl] = absoluteCorners;

                    const distance = (p1: Point, p2: Point) => Math.hypot(p1.x - p2.x, p1.y - p2.y);
                    const widthTop = distance(tl, tr);
                    const widthBottom = distance(bl, br);
                    const destWidth = Math.max(widthTop, widthBottom);
                    const heightLeft = distance(tl, bl);
                    const heightRight = distance(tr, br);
                    const destHeight = Math.max(heightLeft, heightRight);

                    const srcCoords = [tl.x, tl.y, tr.x, tr.y, br.x, br.y, bl.x, bl.y];
                    const destCoords = [0, 0, destWidth, 0, destWidth, destHeight, 0, destHeight];
                    
                    const srcTri = (window as any).cv.matFromArray(4, 1, (window as any).cv.CV_32FC2, srcCoords);
                    const dstTri = (window as any).cv.matFromArray(4, 1, (window as any).cv.CV_32FC2, destCoords);
                    
                    const M = (window as any).cv.getPerspectiveTransform(srcTri, dstTri);
                    const dsize = new (window as any).cv.Size(destWidth, destHeight);
                    const warpedMat = new (window as any).cv.Mat();
                    (window as any).cv.warpPerspective(srcMat, warpedMat, M, dsize, (window as any).cv.INTER_LINEAR, (window as any).cv.BORDER_CONSTANT, new (window as any).cv.Scalar());
                    
                    const destCanvas = document.createElement('canvas');
                    (window as any).cv.imshow(destCanvas, warpedMat);
                    intermediateCanvas = destCanvas;
                    
                    srcMat.delete(); warpedMat.delete(); M.delete(); srcTri.delete(); dstTri.delete();
                } catch (error) {
                    console.error("OpenCV warping failed:", error);
                    const canvas = document.createElement('canvas');
                    canvas.width = image.naturalWidth;
                    canvas.height = image.naturalHeight;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        return reject(new Error("Impossibile ottenere il contesto 2D per il fallback."));
                    }
                    ctx.drawImage(image, 0, 0);
                    intermediateCanvas = canvas;
                }
            } else {
                const canvas = document.createElement('canvas');
                canvas.width = image.naturalWidth;
                canvas.height = image.naturalHeight;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error("Impossibile ottenere il contesto 2D del canvas."));
                    return;
                }
                ctx.drawImage(image, 0, 0);
                intermediateCanvas = canvas;
            }

            // --- Sanitize canvas and apply watermark ---
            const finalCanvas = document.createElement('canvas');
            finalCanvas.width = intermediateCanvas.width;
            finalCanvas.height = intermediateCanvas.height;
            const ctx = finalCanvas.getContext('2d');
            if (!ctx) {
                reject(new Error("Impossibile ottenere il contesto 2D per la filigrana."));
                return;
            }
            ctx.drawImage(intermediateCanvas, 0, 0);

            // 1. Logo Drawing
            const logoHeight = Math.max(24, finalCanvas.height * 0.04);
            const logoAspectRatio = 768.26 / 1477.64;
            const logoWidth = logoHeight * logoAspectRatio;
            const margin = logoHeight * 0.4;
            const logoX = margin;
            const logoY = finalCanvas.height - logoHeight - margin;
            const opacity = 0.6;

            const scaleX = logoWidth / 768.26;
            const scaleY = logoHeight / 1477.64;

            const drawPolygon = (points: number[][], color: string) => {
                if (points.length === 0) return;
                ctx.beginPath();
                ctx.moveTo(logoX + points[0][0] * scaleX, logoY + points[0][1] * scaleY);
                for (let i = 1; i < points.length; i++) {
                    ctx.lineTo(logoX + points[i][0] * scaleX, logoY + points[i][1] * scaleY);
                }
                ctx.closePath();
                ctx.fillStyle = color;
                ctx.fill();
            };

            const poly1_points = [[768.18, 739.16], [768.18, 1034.82], [512.19, 886.99], [512.19, 887.02], [512.15, 887.02], [512.12, 886.99], [0, 591.33], [0.07, 591.29], [0.07, 591.33], [256.06, 443.53], [256.09, 443.53], [512.12, 591.33]];
            const poly2_points = [[512.19, 0], [512.19, 295.66], [256.13, 443.49], [256.09, 443.53], [256.06, 443.53], [256.06, 443.49], [0.07, 591.29], [0.07, 295.66]];
            const poly3_points = [[768.26, 1034.87], [512.2, 1182.7], [256.14, 1330.53], [255.53, 1330.15], [0.08, 1477.64], [0.08, 1182.7], [256.14, 1034.87], [512.17, 887.04], [512.2, 887.04], [768.19, 1034.87], [768.19, 1034.83]];

            drawPolygon(poly2_points, `rgba(158, 91, 254, ${opacity})`);
            drawPolygon(poly3_points, `rgba(158, 91, 254, ${opacity})`);
            drawPolygon(poly1_points, `rgba(198, 161, 252, ${opacity})`);

            // 2. Text Drawing
            const fontSize = Math.max(9, finalCanvas.height * 0.012);
            ctx.font = `bold ${fontSize}px 'Plus Jakarta Sans', sans-serif`;
            ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
            ctx.textAlign = "left";
            ctx.textBaseline = "bottom";

            const formattedTimestamp = new Date(timestamp).toLocaleString('it-CH', {
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit'
            });

            const textLine1 = `ID: ${uuid.substring(0, 8)}`;
            const textLine2 = `${formattedTimestamp}`;

            const textX = logoX + logoWidth + margin * 0.75;
            const textY = finalCanvas.height - margin;
            const lineHeight = fontSize * 1.2;

            ctx.fillText(textLine1, textX, textY - lineHeight);
            ctx.fillText(textLine2, textX, textY);

            resolve(finalCanvas.toDataURL('image/jpeg', 0.95));
        };

        image.onerror = () => reject(new Error("Impossibile caricare l'immagine sorgente per la filigrana."));
        image.src = sourceImageUrl;
    });
}

export function cropImageWithBoundingBox(sourceImageUrl: string, boundingBox: Point[]): Promise<string> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = "Anonymous";
        image.onload = () => {
            const { naturalWidth, naturalHeight } = image;
            
            // Convert normalized points to absolute coordinates
            const absoluteBox = boundingBox.map(p => ({ x: p.x * naturalWidth, y: p.y * naturalHeight }));

            // Find min/max x/y to define the crop rectangle
            const minX = Math.min(...absoluteBox.map(p => p.x));
            const minY = Math.min(...absoluteBox.map(p => p.y));
            const maxX = Math.max(...absoluteBox.map(p => p.x));
            const maxY = Math.max(...absoluteBox.map(p => p.y));
            
            const cropWidth = maxX - minX;
            const cropHeight = maxY - minY;

            if (cropWidth <= 0 || cropHeight <= 0) {
                return reject(new Error("Invalid bounding box dimensions."));
            }

            const canvas = document.createElement('canvas');
            canvas.width = cropWidth;
            canvas.height = cropHeight;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return reject(new Error("Could not get canvas context for cropping."));
            }

            ctx.drawImage(
                image,
                minX, // source x
                minY, // source y
                cropWidth, // source width
                cropHeight, // source height
                0, // destination x
                0, // destination y
                cropWidth, // destination width
                cropHeight // destination height
            );
            
            resolve(canvas.toDataURL('image/png'));
        };
        image.onerror = () => reject(new Error("Failed to load source image for cropping."));
        image.src = sourceImageUrl;
    });
}


const responseSchema = {
    type: Type.OBJECT,
    properties: {
        categoria: { type: Type.STRING, description: "Classifica il documento. Categorie possibili: Fattura, Ricevuta, Multa, Assicurazione, RapportoMedico, EstrattoConto, Contratto, Lettera, Volantino, Pubblicità, Altro.", enum: ["Fattura", "Ricevuta", "Multa", "Assicurazione", "RapportoMedico", "EstrattoConto", "Contratto", "Lettera", "Volantino", "Pubblicità", "Altro"] },
        dataDocumento: { type: Type.STRING, description: "La data principale e più rilevante del documento, in formato YYYY-MM-DD. Se impossibile, usa la data odierna." },
        soggetto: { type: Type.STRING, description: "Il soggetto o mittente principale del documento (es. 'ACME Corp', 'Comune di Milano'). Sii conciso." },
        riassunto: { type: Type.STRING, description: "Un riassunto di una frase che descrive lo scopo del documento." },
        destinatarioNome: { type: Type.STRING, description: "Opzionale. Il nome del destinatario principale del documento. Se non è esplicito, o se è l'utente stesso, lascia vuoto." },
        destinatarioIndirizzo: { type: Type.STRING, description: "Opzionale. L'indirizzo postale completo del destinatario principale. Se l'indirizzo non è esplicito o appartiene all'utente, lascia questo campo vuoto." },
        qualitaScansione: { type: Type.STRING, description: "Valuta la qualità dell'immagine. 'Parziale' se il documento è visibilmente tagliato.", enum: ["Ottima", "Buona", "Sufficiente", "Bassa", "Parziale"] },
        lingua: { type: Type.STRING, description: "La lingua del documento (es. 'Italiano')." },
        documentoCompleto: { type: Type.BOOLEAN, description: "È true se questa pagina è un documento completo, false se è parte di un documento più grande." },
        numeroPaginaStimato: { type: Type.STRING, description: "Se vedi un numero di pagina (es. 'pag. 2/3'), estrailo qui. Altrimenti usa 'N/A'." },
        titoloFascicolo: { type: Type.STRING, description: "Il titolo dell'intero fascicolo (non solo di questa pagina). DEVE essere il più descrittivo possibile. Es: 'KPT Condizioni Generali 2019'." },
        groupingSubjectNormalized: { type: Type.STRING, description: "CRUCIALE: Estrai il soggetto principale e normalizzalo in CamelCase senza spazi, rimuovendo parole generiche. Esempi: 'LiechtensteinLife', 'KPT'." },
        groupingIdentifier: { type: Type.STRING, description: "CRUCIALE: Estrai l'identificativo più stabile (numero polizza, ID contratto). Se assente, usa l'ANNO (YYYY) del documento. Esempio: '987-ABC' o '2024'." },
        tags: {
            type: Type.ARRAY,
            description: "Una lista di 3-5 tag pertinenti e concisi per questo documento (es. 'Fattura', 'Digitale', 'Consulenza').",
            items: { type: Type.STRING }
        },
        datiEstratti: {
            type: Type.ARRAY, description: "Una lista di coppie chiave-valore con i dati più importanti.",
            items: {
                type: Type.OBJECT, properties: {
                    chiave: { type: Type.STRING },
                    valore: { type: Type.STRING },
                },
                required: ["chiave", "valore"]
            }
        },
        documentCorners: {
            type: Type.ARRAY,
            description: "CRUCIALE: I 4 angoli del documento in coordinate normalizzate (0.0 a 1.0), partendo da in alto a sinistra e procedendo in senso orario.",
            items: {
                type: Type.OBJECT,
                properties: {
                    x: { type: Type.NUMBER },
                    y: { type: Type.NUMBER },
                },
                required: ["x", "y"]
            }
        },
        logoBoundingBox: {
            type: Type.ARRAY,
            description: "Opzionale: i 4 angoli del box che contiene il logo/intestazione principale.",
            items: {
                type: Type.OBJECT,
                properties: {
                    x: { type: Type.NUMBER },
                    y: { type: Type.NUMBER },
                }
            }
        },
        immaginiEstratte: {
            type: Type.ARRAY,
            description: "Opzionale: una lista di immagini o elementi grafici rilevanti trovati nel documento (es. firme, foto, icone).",
            items: {
                type: Type.OBJECT,
                properties: {
                    descrizione: { type: Type.STRING },
                    tipoImmagine: { type: Type.STRING, enum: ["Logo", "Firma", "Foto", "Grafico", "Altro"] },
                    boundingBox: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                x: { type: Type.NUMBER },
                                y: { type: Type.NUMBER },
                            }
                        }
                    }
                }
            }
        },
        securityCheck: {
            type: Type.OBJECT,
            properties: {
                isSafe: { type: Type.BOOLEAN, description: "È il documento sicuro? True se non vengono rilevate minacce. False se vengono rilevate minacce come phishing, link a malware o richieste sospette." },
                threatType: { type: Type.STRING, description: "Se non è sicuro, classifica la minaccia. E.g., 'Phishing', 'Malware', 'Scam', 'QR Code Sospetto', 'Nessuna'." },
                explanation: { type: Type.STRING, description: "Una breve spiegazione di una frase per il risultato del controllo di sicurezza." }
            },
            required: ["isSafe", "threatType", "explanation"]
        }
    },
    required: ["categoria", "dataDocumento", "soggetto", "riassunto", "qualitaScansione", "lingua", "documentoCompleto", "titoloFascicolo", "groupingSubjectNormalized", "groupingIdentifier", "datiEstratti", "documentCorners", "securityCheck"]
};

// --- FUNZIONI API GEMINI ESPORTATE ---

export const processPage = async (base64Data: string, mimeType: string, mode: ProcessingMode, extractImages: boolean) => {
    // ... (implementazione come da piano)
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            { text: "Analizza questo documento." },
            { inlineData: { mimeType, data: base64Data } }
        ],
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    });

    try {
        const parsedJson = JSON.parse(response.text);
        return {
            analysis: parsedJson,
            securityCheck: parsedJson.securityCheck || { isSafe: true, threatType: 'Nessuna', explanation: 'Controllo fallito.' },
            tokenUsage: { promptTokenCount: 0, candidatesTokenCount: 0, totalTokenCount: 0 } // Nota: il token count non è disponibile direttamente in questa chiamata SDK
        };
    } catch (e) {
        console.error("Failed to parse Gemini response:", e);
        throw new Error("Invalid JSON response from AI.");
    }
};

export const suggestProcessingMode = async (file: File): Promise<ProcessingMode | null> => {
    let base64Preview: string;
    let mimeType: string;

    if (file.type.startsWith('image/')) {
        base64Preview = await new Promise(resolve => {
            const reader = new FileReader();
            reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
            reader.readAsDataURL(file);
        });
        mimeType = file.type;
    } else if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await pdfjsLib.getDocument(arrayBuffer).promise;
        const page = await pdfDoc.getPage(1);
        const viewport = page.getViewport({ scale: 0.5 });
        const canvas = document.createElement('canvas');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        const context = canvas.getContext('2d');
        if (!context) return null;
        await page.render({ canvasContext: context, viewport: viewport, canvas: canvas }).promise;
        base64Preview = canvas.toDataURL('image/jpeg', 0.5).split(',')[1];
        mimeType = 'image/jpeg';
        page.cleanup();
    } else {
        return null;
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Based on this document image, suggest the best processing mode. Respond with only one of these keywords: 'quality', 'speed', 'business', 'book', 'scontrino', 'identity'. For a standard document like a letter or invoice, choose 'quality'. For a multi-page business report, choose 'business'. For a page from a book with dense text, choose 'book'. For a shopping receipt, choose 'scontrino'. For an ID card or passport, choose 'identity'. For blurry or hard-to-read documents, choose 'speed'.`,
        config: {
            thinkingConfig: { thinkingBudget: 0 }
        }
    });

    const suggestion = response.text.trim() as ProcessingMode;
    const validModes: ProcessingMode[] = ['quality', 'speed', 'business', 'book', 'scontrino', 'identity'];
    return validModes.includes(suggestion) ? suggestion : null;
};

export const analyzeTextForFeedback = async (text: string): Promise<{ isComplaint: boolean }> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analyze the following user text. Does it express frustration, dissatisfaction, or a complaint? Respond with ONLY a valid JSON object: {"isComplaint": true/false}. Text: "${text}"`,
        config: {
            responseMimeType: "application/json",
            responseSchema: { type: Type.OBJECT, properties: { isComplaint: { type: Type.BOOLEAN } } }
        }
    });
    try {
        return JSON.parse(response.text);
    } catch {
        return { isComplaint: false };
    }
};

export const analyzeSentimentForGamification = async (texts: string[]): Promise<{ sentiment: 'positive' | 'negative' | 'neutral' }> => {
    const combinedText = texts.join('\n');
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Analyze the overall sentiment of the user's messages in this conversation. Is it generally positive, negative, or neutral? Respond with ONLY a valid JSON object: {"sentiment": "positive" | "negative" | "neutral"}. Conversation: "${combinedText}"`,
        config: {
            responseMimeType: "application/json",
            responseSchema: { type: Type.OBJECT, properties: { sentiment: { type: Type.STRING, enum: ['positive', 'negative', 'neutral'] } } }
        }
    });
    try {
        return JSON.parse(response.text);
    } catch {
        return { sentiment: 'neutral' };
    }
};

export const processPageOffline = async (imageDataUrl: string): Promise<Partial<ProcessedPageResult>> => {
    try {
        const { data: { text } } = await Tesseract.recognize(imageDataUrl, 'ita');
        const summary = text.substring(0, 150) + (text.length > 150 ? '...' : '');

        return {
            analysis: {
                categoria: "Offline",
                soggetto: "Documento Offline",
                riassunto: summary,
                qualitaScansione: "N/A",
                lingua: "Italiano",
                documentoCompleto: true,
                titoloFascicolo: "Documento Offline",
                groupingSubjectNormalized: "OfflineDoc",
                groupingIdentifier: `offline-${Date.now()}`,
                datiEstratti: [{ chiave: "Testo Rilevato (OCR)", valore: text.substring(0, 500) }],
                documentCorners: [],
            },
            securityCheck: { isSafe: true, threatType: "Nessuna", explanation: "Analisi offline, controllo non eseguito." },
            tokenUsage: { promptTokenCount: 0, candidatesTokenCount: 0, totalTokenCount: 0 },
            costInCoins: 0,
            processedOffline: true,
        };
    } catch (error) {
        console.error("Offline processing failed:", error);
        return {
            analysis: { categoria: "ERRORE", riassunto: "Elaborazione offline fallita." },
            securityCheck: { isSafe: false, threatType: "Errore Elaborazione", explanation: "Tesseract.js non è riuscito a processare l'immagine." },
            tokenUsage: { promptTokenCount: 0, candidatesTokenCount: 0, totalTokenCount: 0 },
            costInCoins: 0,
            processedOffline: true
        }
    }
};

export const generateEmbedding = async (text: string): Promise<number[]> => {
    // NOTE: This is a workaround to generate a vector using a text model as per strict guidelines.
    // In a production scenario, a dedicated embedding model (e.g., text-embedding-004) would be used.
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Generate a 768-dimension numerical vector embedding that represents the semantic meaning of the following text. Respond ONLY with a valid JSON array of 768 numbers. Text: "${text}"`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: { type: Type.NUMBER }
            }
        }
    });
    try {
        const vector = JSON.parse(response.text);
        if (Array.isArray(vector) && vector.every(n => typeof n === 'number')) {
            const targetLength = 768;
            if (vector.length > targetLength) return vector.slice(0, targetLength);
            if (vector.length < targetLength) return [...vector, ...Array(targetLength - vector.length).fill(0)];
            return vector;
        }
        return Array(768).fill(0);
    } catch (e) {
        console.error("Failed to parse embedding from Gemini:", e);
        return Array(768).fill(0);
    }
};

export const performSemanticSearch = async (query: string): Promise<ProcessedPageResult[]> => {
    const queryVector = await generateEmbedding(query);
    const nearestDocsInfo = await db.findNearestArchivedDocs(queryVector, 5);
    if (nearestDocsInfo.length === 0) {
        return [];
    }
    const nearestDocUuids = nearestDocsInfo.map(info => info.uuid);
    return await db.getArchivedDocsByUuids(nearestDocUuids);
};

export const startUgoExperienceStream = async (base64Image: string, onChunk: (chunk: any) => void): Promise<void> => {
    const prompt = `You are "Ugo Vision", a real-time assistant for a document scanning app. Analyze this single frame from a video stream. Provide concise, real-time feedback to help the user take a perfect picture. Your entire response MUST be a single, valid JSON object, without any markdown formatting.

The JSON schema must be:
{
  "isDocumentVisible": boolean,
  "shotQuality": {
    "lighting": "good" | "poor" | "ok",
    "stability": "stable" | "blurry",
    "framing": "good" | "partial" | "far"
  },
  "userFeedback": string,
  "documentCorners": [{ "x": number, "y": number }, ...]
}

Analyze the image and provide the JSON response.`;

    // Ugo Vision requires low latency. A non-streaming call for a single JSON object is more efficient.
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { text: prompt },
                    { inlineData: { mimeType: 'image/jpeg', data: base64Image } }
                ]
            },
            config: {
                responseMimeType: 'application/json',
                thinkingConfig: { thinkingBudget: 0 } // Low latency is critical
            },
        });

        const parsedJson = JSON.parse(response.text);
        onChunk(parsedJson);
    } catch (e) {
        console.error("Failed to get or parse Ugo Vision response:", e);
        // Do not call onChunk with invalid data. The hook will handle the error state.
    }
};
