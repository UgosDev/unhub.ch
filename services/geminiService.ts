import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold } from "@google/genai";
import Tesseract from 'tesseract.js';
// FIX: import firebase to use firebase.firestore.Timestamp type
import { firebase } from './firebase';

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
// INTEGRAZIONE: aggiunta 'fotografia'
export type ProcessingMode = 'quality' | 'speed' | 'business' | 'book' | 'no-ai' | 'scontrino' | 'identity' | 'fotografia';

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
    timestamp: any;
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
    folderId?: string | null;
    // FIX: Add missing properties for `disdette` feature.
    status?: string;
    reminderDate?: string;
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
    timestamp: any;
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

export interface Folder {
    id: string;
    name: string;
    parentId: string | null;
    color: string;
    description: string;
    ownerUid: string;
}

export interface AddressBookEntry {
    id: string; // Firestore document ID (normalized name)
    name: string;
    address: string;
    lastUsed: firebase.firestore.Timestamp;
}

// --- COSTANTI DI COSTO PER SCANSIONE IN SCANCOIN ---
// INTEGRAZIONE: aggiunta 'fotografia'
export const COST_PER_SCAN_COINS: { [key in ProcessingMode]: number } = {
    quality: 10,
    speed: 2,
    business: 15,
    book: 25,
    scontrino: 12,
    identity: 20,
    fotografia: 50,
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
    fotografia: COST_PER_SCAN_COINS.fotografia * COIN_TO_CHF_RATE,
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
            const cv = (window as any).cv;
            let intermediateCanvas: HTMLCanvasElement;
            const hasValidCorners = normalizedCorners && normalizedCorners.length === 4;

            if (hasValidCorners && cv && typeof cv.imread === 'function') {
                // --- Warping Logic con OpenCV per maggiore robustezza ---
                try {
                    const { naturalWidth, naturalHeight } = image;
                    const srcMat = cv.imread(image);
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
                    
                    const srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, srcCoords);
                    const dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, destCoords);
                    
                    const M = cv.getPerspectiveTransform(srcTri, dstTri);
                    const dsize = new cv.Size(destWidth, destHeight);
                    const warpedMat = new cv.Mat();
                    cv.warpPerspective(srcMat, warpedMat, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());
                    
                    const destCanvas = document.createElement('canvas');
                    cv.imshow(destCanvas, warpedMat);
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
                 if (hasValidCorners) {
                    console.warn("OpenCV not ready for warping, using original image.");
                }
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

            // 2. Text Drawing (più informativo)
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

// --- SCHEMI (ricchi dalla prima) ---

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        categoria: { type: Type.STRING, description: "Classifica il documento. Categorie possibili: Fattura, Ricevuta, Multa, Assicurazione, RapportoMedico, EstrattoConto, Contratto, Lettera, Volantino, Pubblicità, Altro.", enum: ["Fattura", "Ricevuta", "Multa", "Assicurazione", "RapportoMedico", "EstrattoConto", "Contratto", "Lettera", "Volantino", "Pubblicità", "Altro"] },
        dataDocumento: { type: Type.STRING, description: "La data principale e più rilevante del documento, in formato YYYY-MM-DD. Se impossibile, usa la data odierna." },
        dataScadenza: { type: Type.STRING, description: "Opzionale. La data di scadenza del documento (es. per fatture, polizze), se chiaramente indicata. Formato YYYY-MM-DD." },
        soggetto: { type: Type.STRING, description: "Il soggetto o mittente principale del documento (es. 'ACME Corp', 'Comune di Milano'). Sii conciso." },
        riassunto: { type: Type.STRING, description: "Un riassunto di una frase che descrive lo scopo del documento." },
        mittenteNome: { type: Type.STRING, description: "Opzionale. Il nome completo del mittente del documento (chi ha inviato la lettera/fattura)." },
        mittenteIndirizzo: { type: Type.STRING, description: "Opzionale. L'indirizzo postale completo del mittente del documento." },
        destinatarioNome: { type: Type.STRING, description: "Opzionale. Il nome del destinatario principale del documento. Se non è esplicito, o se è l'utente stesso, lascia vuoto." },
        destinatarioIndirizzo: { type: Type.STRING, description: "Opzionale. L'indirizzo postale completo del destinatario principale. Se l'indirizzo non è esplicito o appartiene all'utente, lascia questo campo vuoto." },
        numeroContratto: { type: Type.STRING, description: "Opzionale. Il numero di contratto o di polizza, se chiaramente identificabile." },
        qualitaScansione: { type: Type.STRING, description: "Valuta la qualità dell'immagine. 'Parziale' se il documento è visibilmente tagliato. Se non vedi un'immagine, usa 'N/A'.", enum: ["Ottima", "Buona", "Sufficiente", "Bassa", "Parziale", "N/A", "ERRORE"] },
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
            items: { type: Type.OBJECT, properties: { chiave: { type: Type.STRING }, valore: { type: Type.STRING } }, required: ["chiave", "valore"] }
        },
        documentCorners: {
            type: Type.ARRAY, description: "Array di 4 punti [{x, y}] con le coordinate normalizzate (0.0-1.0) degli angoli del documento. Ordine: tl, tr, br, bl. Se non vedi un'immagine o il documento è a schermo intero, usa [[0,0], [1,0], [1,1], [0,1]].",
            items: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } }, required: ["x", "y"] }
        },
        securityCheck: {
            type: Type.OBJECT,
            description: "Analisi di sicurezza del documento.",
            properties: {
                isSafe: { type: Type.BOOLEAN, description: "È true se il testo NON contiene minacce (SQL Injection, Phishing)." },
                threatType: { type: Type.STRING, description: "Il tipo di minaccia rilevata, o 'Nessuna'.", enum: ["Nessuna", "SQL Injection", "Phishing"] },
                explanation: { type: Type.STRING, description: "Breve spiegazione della minaccia o valutazione di sicurezza." }
            },
            required: ["isSafe", "threatType", "explanation"]
        },
        immaginiEstratte: {
            type: Type.ARRAY,
            description: "Opzionale. Se richiesto, estrai una lista di immagini RILEVANTI (solo loghi, firme, foto chiare). Ignora elementi grafici decorativi o di layout.",
            items: {
                type: Type.OBJECT,
                properties: {
                    descrizione: { type: Type.STRING, description: "Breve descrizione dell'immagine (es. 'Logo ACME Corp', 'Firma del contraente')." },
                    tipoImmagine: { type: Type.STRING, description: "Il tipo di immagine.", enum: ["Logo", "Firma", "Foto", "Grafico", "Altro"] },
                    boundingBox: {
                        type: Type.ARRAY,
                        description: "Un array di 4 punti [{x, y}] che definisce un rettangolo MOLTO ADERENTE attorno all'immagine. Le coordinate devono essere normalizzate (0.0-1.0).",
                        items: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } }, required: ["x", "y"] }
                    }
                },
                required: ["descrizione", "tipoImmagine", "boundingBox"]
            }
        },
        logoBoundingBox: {
             type: Type.ARRAY,
             description: "Opzionale. Se immaginiEstratte non è richiesto, identifica comunque il bounding box STRETTO del logo principale del mittente, se presente. Altrimenti, lascia vuoto.",
             items: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } }, required: ["x", "y"] }
        }
    },
    required: ["categoria", "dataDocumento", "soggetto", "riassunto", "qualitaScansione", "lingua", "documentoCompleto", "numeroPaginaStimato", "titoloFascicolo", "groupingSubjectNormalized", "groupingIdentifier", "datiEstratti", "documentCorners", "securityCheck", "tags"]
};

const bookResponseSchema = {
    type: Type.OBJECT,
    properties: {
        titoloFascicolo: { type: Type.STRING, description: "Crea un titolo descrittivo per l'intero documento (non solo questa pagina). Es: 'Contratto di Locazione Rossi 2024'." },
        groupingSubjectNormalized: { type: Type.STRING, description: "CRUCIALE: Estrai il soggetto principale e normalizzalo in CamelCase. Esempi: 'ContrattoLocazione', 'CondizioniGenerali'." },
        groupingIdentifier: { type: Type.STRING, description: "CRUCIALE: Estrai l'identificativo più stabile (ID contratto, data). Se assente, usa l'ANNO (YYYY). Esempio: 'Rossi2024'." },
        testoCompleto: { type: Type.STRING, description: "L'intero testo estratto dalla pagina, parola per parola, preservando i paragrafi e gli a capo." },
        qualitaScansione: { type: Type.STRING, description: "Valuta la qualità dell'immagine. 'Parziale' se il documento è visibilmente tagliato.", enum: ["Ottima", "Buona", "Sufficiente", "Bassa", "Parziale"] },
        lingua: { type: Type.STRING, description: "La lingua del documento (es. 'Italiano')." },
        documentCorners: {
            type: Type.ARRAY, description: "Array di 4 punti [{x, y}] con le coordinate normalizzate (0.0-1.0) degli angoli del documento. Ordine: tl, tr, br, bl. Se il documento è a schermo intero, usa [[0,0], [1,0], [1,1], [0,1]].",
            items: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } }, required: ["x", "y"] }
        },
         securityCheck: {
            type: Type.OBJECT,
            description: "Analisi di sicurezza del documento basata sul testo estratto.",
            properties: {
                isSafe: { type: Type.BOOLEAN, description: "È true se il testo NON contiene minacce (SQL Injection, Phishing)." },
                threatType: { type: Type.STRING, description: "Il tipo di minaccia rilevata, o 'Nessuna'.", enum: ["Nessuna", "SQL Injection", "Phishing"] },
                explanation: { type: Type.STRING, description: "Breve spiegazione della minaccia o valutazione di sicurezza." }
            },
            required: ["isSafe", "threatType", "explanation"]
        },
        immaginiEstratte: {
            type: Type.ARRAY,
            description: "Opzionale. Se richiesto, estrai una lista di immagini RILEVANTI (solo loghi, firme, foto chiare). Ignora elementi grafici decorativi o di layout.",
            items: {
                type: Type.OBJECT,
                properties: {
                    descrizione: { type: Type.STRING, description: "Breve descrizione dell'immagine (es. 'Logo ACME Corp', 'Firma del contraente')." },
                    tipoImmagine: { type: Type.STRING, description: "Il tipo di immagine.", enum: ["Logo", "Firma", "Foto", "Grafico", "Altro"] },
                    boundingBox: {
                        type: Type.ARRAY,
                        description: "Un array di 4 punti [{x, y}] che definisce un rettangolo MOLTO ADERENTE attorno all'immagine. Le coordinate devono essere normalizzate (0.0-1.0).",
                        items: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } }, required: ["x", "y"] }
                    }
                },
                required: ["descrizione", "tipoImmagine", "boundingBox"]
            }
        },
    },
    required: ["titoloFascicolo", "groupingSubjectNormalized", "groupingIdentifier", "testoCompleto", "qualitaScansione", "lingua", "documentCorners", "securityCheck"]
};

const scontrinoResponseSchema = {
    type: Type.OBJECT,
    properties: {
        esercente: { type: Type.STRING, description: "Il nome dell'esercente o del negozio." },
        dataDocumento: { type: Type.STRING, description: "La data dello scontrino, in formato YYYY-MM-DD." },
        totale: { type: Type.NUMBER, description: "L'importo totale dello scontrino." },
        iva: { type: Type.NUMBER, description: "L'importo dell'IVA, se specificato. Altrimenti 0." },
        voci: {
            type: Type.ARRAY,
            description: "Elenco di tutti gli articoli acquistati.",
            items: {
                type: Type.OBJECT,
                properties: {
                    descrizione: { type: Type.STRING },
                    quantita: { type: Type.NUMBER },
                    prezzo: { type: Type.NUMBER }
                },
                required: ["descrizione", "quantita", "prezzo"]
            }
        },
        documentCorners: {
            type: Type.ARRAY,
            description: "Coordinate normalizzate (0.0-1.0) degli angoli. Ordine: tl, tr, br, bl. Se a schermo intero, usa [[0,0], [1,0], [1,1], [0,1]].",
            items: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } }, required: ["x", "y"] }
        },
        securityCheck: {
            type: Type.OBJECT,
            description: "Analisi di sicurezza del documento.",
            properties: {
                isSafe: { type: Type.BOOLEAN },
                threatType: { type: Type.STRING, enum: ["Nessuna", "SQL Injection", "Phishing"] },
                explanation: { type: Type.STRING }
            },
            required: ["isSafe", "threatType", "explanation"]
        },
        logoBoundingBox: {
             type: Type.ARRAY,
             description: "Identifica il bounding box del logo/intestazione principale dello scontrino, se presente.",
             items: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } }, required: ["x", "y"] }
        }
    },
    required: ["esercente", "dataDocumento", "totale", "iva", "voci", "documentCorners", "securityCheck"]
};

const identityResponseSchema = {
    type: Type.OBJECT,
    properties: {
        tipoDocumento: { type: Type.STRING, description: "Il tipo di documento (es. 'Carta d'Identità', 'Patente di Guida', 'Passaporto', 'Permesso di Soggiorno')." },
        nome: { type: Type.STRING },
        cognome: { type: Type.STRING },
        dataNascita: { type: Type.STRING, description: "Data di nascita in formato YYYY-MM-DD." },
        luogoNascita: { type: Type.STRING },
        numeroDocumento: { type: Type.STRING, description: "Il numero identificativo univoco del documento. CRUCIALE per il raggruppamento." },
        autoritaEmissione: { type: Type.STRING },
        dataEmissione: { type: Type.STRING, description: "Data di emissione in formato YYYY-MM-DD." },
        dataScadenza: { type: Type.STRING, description: "Data di scadenza in formato YYYY-MM-DD." },
        nazionalita: { type: Type.STRING },
        sesso: { type: Type.STRING, enum: ["M", "F", "Altro"] },
        indirizzo: { type: Type.STRING, description: "Indirizzo completo, se presente." },
        documentCorners: {
            type: Type.ARRAY, description: "Coordinate normalizzate (0.0-1.0) degli angoli. Ordine: tl, tr, br, bl.",
            items: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } }, required: ["x", "y"] }
        },
        securityCheck: {
            type: Type.OBJECT,
            description: "Analisi di sicurezza del documento.",
            properties: {
                isSafe: { type: Type.BOOLEAN },
                threatType: { type: Type.STRING, enum: ["Nessuna", "SQL Injection", "Phishing"] },
                explanation: { type: Type.STRING }
            },
            required: ["isSafe", "threatType", "explanation"]
        }
    },
    required: ["tipoDocumento", "nome", "cognome", "dataNascita", "numeroDocumento", "dataScadenza", "documentCorners", "securityCheck"]
};

// INTEGRAZIONE: nuovo schema per modalità fotografia
const fotografiaResponseSchema = {
    type: Type.OBJECT,
    properties: {
        soggetto: { type: Type.STRING, description: "Titolo breve (max 10 parole) dell'immagine." },
        categoria: { type: Type.STRING, description: "Categoria (Paesaggio, Ritratto, Architettura, Cibo, Documento, Grafico, Arte, Astratto, Natura Morta)." },
        riassunto: { type: Type.STRING, description: "2-3 frasi su contenuto/emozioni/contesto dell'immagine." },
        tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "5-10 tag pertinenti per ricerca semantica." }
    },
    required: ["soggetto", "categoria", "riassunto", "tags"]
};

// --- PROCESSORS ---

export async function processPage(base64Data: string, mimeType: string, mode: ProcessingMode, extractImages: boolean): Promise<{ analysis: any, securityCheck: any, tokenUsage: TokenUsage }> {
    let systemInstruction: string;
    let schema: object;

    switch (mode) {
        case 'fotografia': {
            systemInstruction = "Sei un AI esperta in analisi di immagini per catalogazione. Ignora eventuale testo. Descrivi SOLO contenuto visivo, colori, forme, emozioni e contesto. Rispondi SOLO in JSON secondo schema.";
            schema = fotografiaResponseSchema;
            break;
        }
        case 'book': {
            let bookImageInstruction = '';
            if (extractImages) {
                bookImageInstruction = "Estrai anche una lista di immagini rilevanti (solo loghi, firme o foto chiare), fornendo un bounding box MOLTO preciso.";
            } else {
                bookImageInstruction = "NON estrarre alcuna immagine. Lascia il campo 'immaginiEstratte' vuoto.";
            }
            systemInstruction = `Sei un assistente OCR. Estrai l'intero testo da questa pagina e identifica la lingua. Fornisci un titolo e identificativi per raggruppare questa pagina con altre dello stesso documento. Rispondi SOLO in JSON. ${bookImageInstruction}`;
            schema = bookResponseSchema;
            break;
        }
        case 'scontrino': {
            let receiptImageInstruction = '';
            if (extractImages) {
                receiptImageInstruction = "Identifica anche il bounding box STRETTO del logo/intestazione principale dello scontrino, se presente.";
            } else {
                receiptImageInstruction = "NON identificare alcun logo. Lascia il campo 'logoBoundingBox' vuoto.";
            }
            systemInstruction = `Sei un assistente per la contabilità. Estrai tutti i dati da questo scontrino, incluse tutte le voci. Rispondi SOLO in JSON. ${receiptImageInstruction}`;
            schema = scontrinoResponseSchema;
            break;
        }
        case 'identity': {
            systemInstruction = `Sei un esperto nell'estrazione di dati da documenti d'identità (carte d'identità, patenti, permessi). Analizza l'immagine e estrai tutti i campi rilevanti. Il numero del documento è il dato più importante per il raggruppamento. Rispondi SOLO con un oggetto JSON valido.`;
            schema = identityResponseSchema;
            break;
        }
        case 'quality':
        case 'speed':
        case 'business':
        default: {
            let imageInstruction = '';
            if (extractImages) {
                imageInstruction = "Estrai anche una lista di immagini rilevanti (solo loghi, firme o foto chiare), fornendo un bounding box MOLTO preciso. Ignora elementi decorativi.";
            } else {
                imageInstruction = "NON estrarre alcuna immagine o logo. Lascia i campi 'immaginiEstratte' e 'logoBoundingBox' vuoti.";
            }
            systemInstruction = `Sei un esperto archivista. Analizza l'immagine e rispondi SOLO con un oggetto JSON valido. ${imageInstruction}`;
            schema = responseSchema;
            break;
        }
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { inlineData: { mimeType, data: base64Data } }
                ]
            },
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: schema,
                safetySettings,
                ...(mode === 'speed' ? { thinkingConfig: { thinkingBudget: 0 } } : {})
            },
        });
        
        const jsonText = response.text;
        const result = JSON.parse(jsonText);

        // INTEGRAZIONE: token usage reali se disponibili
        const tokenUsage: TokenUsage = {
            promptTokenCount: (response as any).usageMetadata?.promptTokenCount || 0,
            candidatesTokenCount: (response as any).usageMetadata?.candidatesTokenCount || 0,
            totalTokenCount: (response as any).usageMetadata?.totalTokenCount || 0
        };

        let finalResult = { 
            analysis: result, 
            securityCheck: result.securityCheck || { isSafe: true, threatType: 'Nessuna', explanation: 'N/A' }, 
            tokenUsage 
        };
        
        // Handle mode-specific transformations (ricchezza della prima + fotografia nuova)
        if (mode === 'book') {
            finalResult.analysis = {
                ...finalResult.analysis,
                categoria: "Testo",
                soggetto: finalResult.analysis.titoloFascicolo,
                riassunto: `Testo estratto: ${finalResult.analysis.testoCompleto.substring(0, 100)}...`,
                documentoCompleto: false,
                datiEstratti: [{ chiave: "Testo Completo", valore: finalResult.analysis.testoCompleto }]
            };
        } else if (mode === 'scontrino') {
             finalResult.analysis = {
                ...finalResult.analysis,
                categoria: "Ricevuta",
                soggetto: finalResult.analysis.esercente,
                riassunto: `Scontrino per un totale di ${finalResult.analysis.totale}.`,
                qualitaScansione: 'Ottima',
                lingua: 'Italiano',
                documentoCompleto: true,
                titoloFascicolo: `Scontrino ${finalResult.analysis.esercente} ${finalResult.analysis.dataDocumento}`,
                groupingSubjectNormalized: String(finalResult.analysis.esercente || '').replace(/\s+/g, ''),
                groupingIdentifier: finalResult.analysis.dataDocumento,
                datiEstratti: [
                    { chiave: "Esercente", valore: String(finalResult.analysis.esercente) },
                    { chiave: "Totale", valore: String(finalResult.analysis.totale) },
                    { chiave: "IVA", valore: String(finalResult.analysis.iva) },
                    { chiave: "Voci", valore: JSON.stringify(finalResult.analysis.voci, null, 2) }
                ]
            };
        } else if (mode === 'identity') {
            const idData = finalResult.analysis;
            const fullName = `${idData.nome || ''} ${idData.cognome || ''}`.trim();
            finalResult.analysis = {
                ...idData,
                categoria: "Documento Identità",
                soggetto: `${idData.tipoDocumento} di ${fullName}`,
                riassunto: `Documento n. ${idData.numeroDocumento}, scade il ${idData.dataScadenza}`,
                qualitaScansione: 'Ottima',
                lingua: 'N/A',
                documentoCompleto: false, // Assume front/back are separate pages
                titoloFascicolo: `Documento ${fullName}`,
                groupingSubjectNormalized: (idData.tipoDocumento || 'Documento').replace(/\s+/g, '') + `_${(idData.cognome || 'Ignoto').replace(/\s+/g, '')}`,
                groupingIdentifier: idData.numeroDocumento,
                datiEstratti: Object.entries(idData)
                    .filter(([key]) => !['documentCorners', 'securityCheck'].includes(key))
                    .map(([chiave, valore]) => ({ chiave, valore: String(valore) }))
            };
        } else if (mode === 'fotografia') {
            const photo = finalResult.analysis;
            finalResult.analysis = {
                categoria: "Fotografia",
                dataDocumento: new Date().toISOString().split('T')[0],
                soggetto: photo.soggetto,
                riassunto: photo.riassunto,
                qualitaScansione: "N/A",
                lingua: "N/A",
                documentoCompleto: true,
                numeroPaginaStimato: "N/A",
                titoloFascicolo: photo.soggetto || "Fotografia",
                groupingSubjectNormalized: (photo.soggetto || 'Fotografia').replace(/\s+/g, ''),
                groupingIdentifier: `foto-${Date.now()}`,
                datiEstratti: [],
                documentCorners: [],
                securityCheck: { isSafe: true, threatType: "Nessuna", explanation: "Contenuto visivo." },
                tags: Array.isArray(photo.tags) ? photo.tags : []
            };
        }

        return finalResult;
    } catch (error) {
        console.error("Errore durante l'analisi con Gemini:", error);
        return {
            analysis: {
                categoria: "ERRORE",
                dataDocumento: new Date().toISOString().split('T')[0],
                soggetto: "Analisi Fallita",
                riassunto: error instanceof Error ? error.message : "Errore sconosciuto",
                qualitaScansione: "ERRORE",
            },
            securityCheck: { isSafe: false, threatType: "N/A", explanation: "Analisi AI fallita." },
            tokenUsage: { promptTokenCount: 0, candidatesTokenCount: 0, totalTokenCount: 0 },
        };
    }
}

export const analyzeTextForFeedback = async (text: string): Promise<{ isComplaint: boolean; isConstructive: boolean }> => {
    const feedbackSchema = {
        type: Type.OBJECT,
        properties: {
            isComplaint: { type: Type.BOOLEAN, description: "True se il testo esprime una lamentela, frustrazione o insoddisfazione riguardo al servizio." },
            isConstructive: { type: Type.BOOLEAN, description: "True se il testo, pur essendo una critica, offre suggerimenti, idee o descrive un problema in dettaglio per aiutare a migliorare." },
        },
        required: ["isComplaint", "isConstructive"],
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analizza il seguente testo di un utente per identificare lamentele o feedback costruttivo. Testo: "${text}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: feedbackSchema,
                systemInstruction: "Sei un esperto nell'analisi del sentiment e del feedback degli utenti. Valuta il testo fornito e rispondi solo con il JSON richiesto.",
                thinkingConfig: { thinkingBudget: 0 }
            }
        });
        const responseText = response.text;
        return JSON.parse(responseText);
    } catch (e) {
        console.error("Errore durante l'analisi del feedback:", e);
        return { isComplaint: false, isConstructive: false };
    }
};

export const analyzeSentimentForGamification = async (userMessages: string[]): Promise<{ sentiment: 'positive' | 'neutral' | 'negative' }> => {
    if (userMessages.length === 0) {
        return { sentiment: 'neutral' };
    }

    const sentimentSchema = {
        type: Type.OBJECT,
        properties: {
            sentiment: { 
                type: Type.STRING, 
                description: "The overall sentiment of the user's messages.",
                enum: ['positive', 'neutral', 'negative'] 
            },
        },
        required: ["sentiment"],
    };

    const conversationText = userMessages.join('\n- ');

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analyze the sentiment of the following messages from a user interacting with a helpful assistant. Is the user particularly friendly and polite?\n- ${conversationText}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: sentimentSchema,
                systemInstruction: "You are a sentiment analysis expert. Respond with 'positive' if the user is clearly friendly, polite, or kind. Use 'neutral' for standard, transactional messages. Use 'negative' only for rude or clearly frustrated messages. Respond ONLY with the requested JSON."
            }
        });
        return JSON.parse(response.text);
    } catch (e) {
        console.error("Error analyzing sentiment:", e);
        return { sentiment: 'neutral' };
    }
};

export const suggestProcessingMode = async (file: File): Promise<ProcessingMode | null> => {
    const fileName = file.name.toLowerCase();
    if (fileName.includes('scontrino') || fileName.includes('ricevuta')) {
        return 'scontrino';
    }
    if (fileName.includes('passaporto') || fileName.includes('carta d\'identità') || fileName.includes('patente')) {
        return 'identity';
    }
    if (fileName.includes('contratto') || fileName.includes('libro')) {
        return 'book';
    }
    if (file.type.startsWith('image/')) {
        if (file.size > 2 * 1024 * 1024) { // > 2MB
            return 'fotografia';
        }
    }
    if (file.type === 'application/pdf') {
        return 'business';
    }
    return 'quality';
};

// FIX: Add missing function processPageOffline
export const processPageOffline = async (imageDataUrl: string): Promise<{
    analysis: any,
    securityCheck: any,
    tokenUsage: TokenUsage,
    costInCoins: number,
    processedOffline: boolean
}> => {
    try {
        const worker = await Tesseract.createWorker('ita');
        const { data: { text } } = await worker.recognize(imageDataUrl);
        await worker.terminate();

        const analysis = {
            categoria: "Altro (Offline)",
            dataDocumento: new Date().toISOString().split('T')[0],
            soggetto: "Documento Elaborato Offline",
            riassunto: text.substring(0, 150) + (text.length > 150 ? '...' : ''),
            qualitaScansione: "N/A",
            lingua: "Italiano",
            titoloFascicolo: "Offline Document",
            groupingSubjectNormalized: 'Offline',
            groupingIdentifier: `offline-${Date.now()}`,
            documentoCompleto: true,
            numeroPaginaStimato: '1/1',
            datiEstratti: [{ chiave: "Testo Rilevato (OCR)", valore: text }],
            documentCorners: [],
        };

        const securityCheck = { isSafe: true, threatType: "Nessuna", explanation: "Analisi di sicurezza non eseguita in modalità offline." };
        const tokenUsage = { promptTokenCount: 0, candidatesTokenCount: 0, totalTokenCount: 0 };
        
        return {
            analysis,
            securityCheck,
            tokenUsage,
            costInCoins: 0,
            processedOffline: true,
        };
    } catch (error) {
        console.error("Offline processing failed:", error);
        const analysis = {
            categoria: "ERRORE",
            soggetto: "Errore Elaborazione Offline",
            riassunto: error instanceof Error ? error.message : "Impossibile elaborare il documento offline.",
            qualitaScansione: "ERRORE",
        };
        return {
            analysis,
            securityCheck: { isSafe: false, threatType: "N/A", explanation: "Elaborazione offline fallita." },
            tokenUsage: { promptTokenCount: 0, candidatesTokenCount: 0, totalTokenCount: 0 },
            costInCoins: 0,
            processedOffline: true,
        };
    }
};

// FIX: Add missing function processTextWithGemini
export const processTextWithGemini = async (ocrText: string): Promise<{
    analysis: any,
    securityCheck: any,
    tokenUsage: TokenUsage,
}> => {
    try {
        const prompt = `Analizza il seguente testo estratto da un documento e restituisci un oggetto JSON strutturato. Ignora gli errori OCR. Testo: """${ocrText}"""`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: "Sei un esperto archivista. Analizza il testo e rispondi SOLO con un oggetto JSON valido. Non puoi vedere l'immagine, quindi per 'qualitaScansione' usa 'N/A' e per 'documentCorners' usa un array vuoto.",
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                safetySettings,
                thinkingConfig: { thinkingBudget: 0 }
            }
        });

        const jsonText = response.text;
        const result = JSON.parse(jsonText);
        
        const tokenUsage: TokenUsage = {
            promptTokenCount: (response as any).usageMetadata?.promptTokenCount || 0,
            candidatesTokenCount: (response as any).usageMetadata?.candidatesTokenCount || 0,
            totalTokenCount: (response as any).usageMetadata?.totalTokenCount || 0
        };

        return {
            analysis: { ...result, documentCorners: [] },
            securityCheck: result.securityCheck || { isSafe: true, threatType: 'Nessuna', explanation: 'N/A' },
            tokenUsage
        };

    } catch (error) {
        console.error("Errore durante l'analisi del testo con Gemini:", error);
        return {
            analysis: {
                categoria: "ERRORE",
                soggetto: "Analisi Testo Fallita",
                riassunto: error instanceof Error ? error.message : "Errore sconosciuto",
                qualitaScansione: "ERRORE",
            },
            securityCheck: { isSafe: false, threatType: "N/A", explanation: "Analisi AI fallita." },
            tokenUsage: { promptTokenCount: 0, candidatesTokenCount: 0, totalTokenCount: 0 },
        };
    }
};

// FIX: Add missing function performSemanticSearch
export const performSemanticSearch = async (query: string, documents: ProcessedPageResult[]): Promise<ProcessedPageResult[]> => {
    if (!query || documents.length === 0) {
        return [];
    }

    try {
        const documentsSummary = documents.map(doc => ({
            uuid: doc.uuid,
            title: doc.analysis.titoloFascicolo || doc.analysis.soggetto,
            summary: doc.analysis.riassunto,
            tags: doc.tags || [],
        }));

        const searchSchema = {
            type: Type.OBJECT,
            properties: {
                matchingUuids: {
                    type: Type.ARRAY,
                    description: "Un array di stringhe contenente solo gli UUID dei documenti che corrispondono alla query di ricerca.",
                    items: { type: Type.STRING }
                }
            },
            required: ['matchingUuids']
        };

        const prompt = `Data la seguente query di ricerca e una lista di documenti, restituisci gli UUID dei documenti che sono semanticamente pertinenti alla query.
        
Query: "${query}"

Lista Documenti (JSON):
${JSON.stringify(documentsSummary, null, 2)}
`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: "Sei un motore di ricerca semantica. Analizza la query e la lista di documenti. Rispondi SOLO con un oggetto JSON contenente gli UUID dei documenti corrispondenti.",
                responseMimeType: "application/json",
                responseSchema: searchSchema,
                safetySettings
            }
        });
        
        const result = JSON.parse(response.text);
        const matchingUuids = result.matchingUuids as string[];
        
        return documents.filter(doc => matchingUuids.includes(doc.uuid));

    } catch (error) {
        console.error("Semantic search failed:", error);
        const lowerQuery = query.toLowerCase();
        return documents.filter(doc => 
            (doc.analysis.titoloFascicolo || '').toLowerCase().includes(lowerQuery) ||
            (doc.analysis.soggetto || '').toLowerCase().includes(lowerQuery) ||
            (doc.analysis.riassunto || '').toLowerCase().includes(lowerQuery) ||
            (doc.tags || []).some(tag => tag.toLowerCase().includes(lowerQuery))
        );
    }
};

// FIX: Add missing function analyzePoliciesForInsights
export const analyzePoliciesForInsights = async (policies: ProcessedPageResult[]): Promise<{
    insights: string[],
    upcomingRenewals: { title: string, date: string }[]
}> => {
    if (policies.length === 0) {
        return { insights: [], upcomingRenewals: [] };
    }
    
    try {
        const policiesSummary = policies.map(p => ({
            title: p.analysis.titoloFascicolo || p.analysis.soggetto,
            summary: p.analysis.riassunto,
            data: p.analysis.datiEstratti,
            expiryDate: p.analysis.dataScadenza,
        }));

        const analysisSchema = {
            type: Type.OBJECT,
            properties: {
                insights: {
                    type: Type.ARRAY,
                    description: "A list of 3-4 actionable insights or suggestions based on the provided insurance policies. For example, potential coverage overlaps, missing common coverages, or suggestions for consolidation.",
                    items: { type: Type.STRING }
                },
                upcomingRenewals: {
                    type: Type.ARRAY,
                    description: "A list of policies expiring within the next 90 days, sorted by date.",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            date: { type: Type.STRING, description: "Expiry date in YYYY-MM-DD format." }
                        },
                        required: ['title', 'date']
                    }
                }
            },
            required: ['insights', 'upcomingRenewals']
        };

        const prompt = `Analyze the following summary of insurance policies. Provide actionable insights and identify upcoming renewals. Today's date is ${new Date().toISOString().split('T')[0]}.

Policies (JSON):
${JSON.stringify(policiesSummary, null, 2)}
`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: "You are an expert insurance portfolio analyst. Your goal is to provide helpful, neutral advice to the user. Do not recommend specific companies. Respond ONLY with the requested JSON object.",
                responseMimeType: "application/json",
                responseSchema: analysisSchema,
                safetySettings
            }
        });
        
        return JSON.parse(response.text);

    } catch (error) {
        console.error("AI policy analysis failed:", error);
        throw error;
    }
};
