import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold } from "@google/genai";
import Tesseract from 'tesseract.js';

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
            items: { type: Type.OBJECT, properties: { chiave: { type: Type.STRING }, valore: { type: Type.STRING } }, required: ["chiave", "valore"] }
        },
        documentCorners: {
            type: Type.ARRAY, description: "Array di 4 punti [{x, y}] con le coordinate normalizzate (0.0-1.0) degli angoli del documento. Ordine: tl, tr, br, bl. Se il documento è a schermo intero, usa [[0,0], [1,0], [1,1], [0,1]].",
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

export const ugoExperienceSchema = {
    type: Type.OBJECT,
    properties: {
        isDocumentVisible: { type: Type.BOOLEAN, description: "True se un oggetto simile a un documento è chiaramente visibile." },
        shotQuality: {
            type: Type.OBJECT,
            properties: {
                lighting: { type: Type.STRING, enum: ['good', 'poor', 'ok'], description: "Qualità dell'illuminazione sul documento." },
                stability: { type: Type.STRING, enum: ['stable', 'blurry'], description: "Stabilità dell'immagine. 'blurry' se c'è motion blur." },
                framing: { type: Type.STRING, enum: ['good', 'partial', 'far'], description: "'good' se ben inquadrato, 'partial' se tagliato, 'far' se troppo distante." }
            },
            required: ["lighting", "stability", "framing"]
        },
        userFeedback: { type: Type.STRING, description: "Un'istruzione molto breve e diretta per l'utente in italiano (es. 'Avvicinati', 'Tieni fermo', 'Migliora la luce')." },
        documentCorners: {
            type: Type.ARRAY,
            description: "Se un documento è visibile, array di 4 punti [{x, y}] con coordinate normalizzate (0.0-1.0) degli angoli del documento. Ordine: top-left, top-right, bottom-right, bottom-left.",
            items: { type: Type.OBJECT, properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } }, required: ["x", "y"] }
        }
    },
    required: ["isDocumentVisible", "shotQuality", "userFeedback"]
};


export async function processPage(base64Data: string, mimeType: string, mode: ProcessingMode, extractImages: boolean): Promise<{ analysis: any, securityCheck: any, tokenUsage: TokenUsage }> {
    let systemInstruction: string;
    let schema: object;

    switch (mode) {
        case 'book':
            let bookImageInstruction = '';
            if (extractImages) {
                bookImageInstruction = "Estrai anche una lista di immagini rilevanti (solo loghi, firme o foto chiare), fornendo un bounding box MOLTO preciso.";
            } else {
                bookImageInstruction = "NON estrarre alcuna immagine. Lascia il campo 'immaginiEstratte' vuoto.";
            }
            systemInstruction = `Sei un assistente OCR. Estrai l'intero testo da questa pagina e identifica la lingua. Fornisci un titolo e identificativi per raggruppare questa pagina con altre dello stesso documento. Rispondi SOLO in JSON. ${bookImageInstruction}`;
            schema = bookResponseSchema;
            break;
        case 'scontrino':
            let receiptImageInstruction = '';
            if (extractImages) {
                receiptImageInstruction = "Identifica anche il bounding box STRETTO del logo/intestazione principale dello scontrino, se presente.";
            } else {
                receiptImageInstruction = "NON identificare alcun logo. Lascia il campo 'logoBoundingBox' vuoto.";
            }
            systemInstruction = `Sei un assistente per la contabilità. Estrai tutti i dati da questo scontrino, incluse tutte le voci. Rispondi SOLO in JSON. ${receiptImageInstruction}`;
            schema = scontrinoResponseSchema;
            break;
        case 'identity':
            systemInstruction = `Sei un esperto nell'estrazione di dati da documenti d'identità (carte d'identità, patenti, permessi). Analizza l'immagine e estrai tutti i campi rilevanti. Il numero del documento è il dato più importante per il raggruppamento. Rispondi SOLO con un oggetto JSON valido.`;
            schema = identityResponseSchema;
            break;
        case 'quality':
        case 'speed':
        case 'business':
        default:
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
            },
        });
        
        const jsonText = response.text;
        const result = JSON.parse(jsonText);

        let finalResult = { analysis: result, securityCheck: result.securityCheck || { isSafe: true, threatType: 'Nessuna', explanation: 'N/A' }, tokenUsage: { promptTokenCount: 0, candidatesTokenCount: 0, totalTokenCount: 0 } };
        
        // Handle mode-specific transformations
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
                groupingSubjectNormalized: finalResult.analysis.esercente.replace(/\s+/g, ''),
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
                systemInstruction: "Sei un esperto nell'analisi del sentiment e del feedback degli utenti. Valuta il testo fornito e rispondi solo con il JSON richiesto."
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
        const responseText = response.text;
        const result = JSON.parse(responseText);
        return result;
    } catch (e) {
        console.error("Error during sentiment analysis for gamification:", e);
        return { sentiment: 'neutral' }; // Default to neutral on error
    }
};

/**
 * Suggerisce la modalità di elaborazione basandosi su una rapida analisi del nome del file.
 */
export async function suggestProcessingMode(file: File): Promise<ProcessingMode | null> {
    const fileName = file.name.toLowerCase();
    
    // Simula una latenza di rete per il suggerimento
    await new Promise(resolve => setTimeout(resolve, 500));

    if (fileName.includes('scontrino') || fileName.includes('ricevuta')) {
        return 'scontrino';
    }
    if (fileName.includes('identità') || fileName.includes('patente') || fileName.includes('passaporto')) {
        return 'identity';
    }
    if (fileName.includes('contratto') || fileName.includes('lettera')) {
        return 'book';
    }
     if (file.type === 'application/pdf' && file.size > 1000 * 1000) { // PDF > 1MB
        return 'business';
    }
    if (file.type.startsWith('image/')) {
        return 'quality';
    }

    return null; // Nessun suggerimento forte
}

/**
 * Esegue un'elaborazione OCR offline utilizzando Tesseract.js.
 */
export async function processPageOffline(imageDataUrl: string): Promise<Pick<ProcessedPageResult, 'analysis' | 'securityCheck' | 'tokenUsage' | 'costInCoins' | 'processedOffline'>> {
    try {
        const worker = await Tesseract.createWorker('ita');
        const { data: { text } } = await worker.recognize(imageDataUrl);
        await worker.terminate();

        const riassunto = text ? `Testo estratto offline: ${text.substring(0, 150)}...` : "Documento acquisito offline. Impossibile estrarre il testo.";

        return {
            analysis: {
                categoria: "Offline",
                dataDocumento: new Date().toISOString().split('T')[0],
                soggetto: "Elaborazione Locale",
                riassunto: riassunto,
                qualitaScansione: "N/A",
                lingua: "Italiano",
                documentoCompleto: true,
                numeroPaginaStimato: "N/A",
                titoloFascicolo: "Documento Offline",
                groupingSubjectNormalized: 'Offline',
                groupingIdentifier: `offline-${Date.now()}`,
                datiEstratti: [{ chiave: "Testo Estratto", valore: text || "Nessun testo rilevato." }],
                documentCorners: [],
            },
            securityCheck: { isSafe: true, threatType: "Nessuna", explanation: "Analisi di sicurezza non eseguita in modalità offline." },
            tokenUsage: { promptTokenCount: 0, candidatesTokenCount: 0, totalTokenCount: 0 },
            costInCoins: 0,
            processedOffline: true,
        };
    } catch (error) {
        console.error("Errore durante l'OCR offline con Tesseract:", error);
        return {
             analysis: {
                categoria: "ERRORE",
                dataDocumento: new Date().toISOString().split('T')[0],
                soggetto: "Errore OCR Offline",
                riassunto: "L'elaborazione locale del documento è fallita. Il motore OCR potrebbe non essersi caricato correttamente.",
                qualitaScansione: "ERRORE",
                datiEstratti: [],
            },
            securityCheck: { isSafe: false, threatType: "N/A", explanation: "Analisi fallita." },
            tokenUsage: { promptTokenCount: 0, candidatesTokenCount: 0, totalTokenCount: 0 },
            costInCoins: 0,
            processedOffline: true,
        };
    }
}


/**
 * Esegue una ricerca semantica sui documenti forniti utilizzando Gemini.
 */
export async function performSemanticSearch(query: string, docs: ProcessedPageResult[]): Promise<ProcessedPageResult[]> {
    if (docs.length === 0) {
        return [];
    }

    // 1. Prepara i dati per l'AI, rendendoli concisi
    const documentsForPrompt = docs.map(doc => ({
        uuid: doc.uuid,
        title: doc.analysis.soggetto || doc.analysis.titoloFascicolo || 'Senza Titolo',
        summary: doc.analysis.riassunto || '',
        data: doc.analysis.datiEstratti?.map((d: any) => `${d.chiave}: ${d.valore}`).join('; ') || ''
    }));

    // 2. Definisci lo schema di risposta atteso
    const searchSchema = {
        type: Type.OBJECT,
        properties: {
            relevantUuids: {
                type: Type.ARRAY,
                description: "Un array di stringhe UUID dei documenti più pertinenti, ordinati dal più al meno rilevante.",
                items: { type: Type.STRING }
            }
        },
        required: ["relevantUuids"]
    };

    // 3. Esegui la chiamata a Gemini
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `USER QUERY: "${query}"\n\nAVAILABLE DOCUMENTS:\n${JSON.stringify(documentsForPrompt)}`,
            config: {
                systemInstruction: "Sei un motore di ricerca semantica. Analizza la query dell'utente e la lista di documenti JSON. Restituisci SOLO un oggetto JSON contenente un array di UUID dei documenti che meglio corrispondono alla query, ordinati per pertinenza decrescente. Non includere documenti irrilevanti.",
                responseMimeType: "application/json",
                responseSchema: searchSchema,
                safetySettings
            }
        });

        const jsonText = response.text;
        const result = JSON.parse(jsonText);
        const orderedUuids = result.relevantUuids as string[] || [];
        
        // 4. Mappa gli UUID ordinati ai documenti originali
        const docsMap = new Map(docs.map(doc => [doc.uuid, doc]));
        const sortedDocs = orderedUuids.map(uuid => docsMap.get(uuid)).filter((doc): doc is ProcessedPageResult => !!doc);

        return sortedDocs;

    } catch (error) {
        console.error("Errore durante la ricerca semantica con Gemini:", error);
        throw new Error("L'analisi della ricerca è fallita. Riprova più tardi.");
    }
}

export async function suggestFolderForDocument(
    documentContext: { title: string; summary: string },
    existingFolders: { id: string; name: string; path: string }[]
): Promise<{ bestFolderId: string | null; reasoning: string } | null> {
    if (existingFolders.length === 0) {
        return { bestFolderId: null, reasoning: 'Nessuna cartella esistente.' };
    }

    const folderSuggestionSchema = {
        type: Type.OBJECT,
        properties: {
            bestFolderId: {
                type: Type.STRING,
                description: "L'ID della cartella più adatta. Restituisci 'root' se nessuna cartella è una buona corrispondenza."
            },
            reasoning: {
                type: Type.STRING,
                description: "Una breve motivazione (massimo 10 parole) per la scelta."
            }
        },
        required: ["bestFolderId", "reasoning"]
    };

    const prompt = `Dato il seguente documento e una lista di cartelle, scegli la cartella più adatta in cui archiviarlo.
Documento:
- Titolo: "${documentContext.title}"
- Riassunto: "${documentContext.summary}"

Cartelle disponibili (formato 'ID: Percorso/Nome'):
${existingFolders.map(f => `- ${f.id}: ${f.path}`).join('\n')}

Rispondi SOLO con un oggetto JSON che indica 'bestFolderId' e 'reasoning'. Se nessuna cartella sembra adatta, usa 'root' come ID.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: folderSuggestionSchema,
                safetySettings
            }
        });
        const jsonText = response.text;
        const result = JSON.parse(jsonText);
        return {
            bestFolderId: result.bestFolderId === 'root' ? null : result.bestFolderId,
            reasoning: result.reasoning
        };
    } catch (error) {
        console.error("Errore durante il suggerimento della cartella:", error);
        return null;
    }
}

/**
 * Avvia uno stream con Gemini per l'analisi in tempo reale di un frame della fotocamera.
 * Fornisce feedback sulla qualità dello scatto e sulla posizione del documento.
 */
export async function startUgoExperienceStream(base64Data: string, onChunk: (chunk: any) => void): Promise<void> {
    const systemInstruction = `Sei "Ugo Vision", un assistente AI per la fotocamera di scansioni.ch. Analizza il frame in tempo reale e fornisci un feedback JSON per aiutare l'utente a scattare una foto perfetta. Sii veloce e conciso. Rispondi SOLO in JSON. Identifica gli angoli del documento se possibile. Fornisci un feedback anche se il documento non è visibile.`;

    try {
        const responseStream = await ai.models.generateContentStream({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/jpeg', data: base64Data } }
                ]
            },
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: ugoExperienceSchema,
                safetySettings,
                // Configurazione per bassa latenza
                thinkingConfig: { thinkingBudget: 0 }
            },
        });

        let buffer = '';
        for await (const chunk of responseStream) {
            buffer += chunk.text;
        }

        if (buffer) {
            try {
                const parsed = JSON.parse(buffer);
                onChunk(parsed);
            } catch (e) {
                console.error("Impossibile analizzare il JSON completo dallo stream di Ugo Experience:", e, "Buffer ricevuto:", buffer);
            }
        }

    } catch (error) {
        console.error("Errore durante lo streaming di Ugo Experience:", error);
        throw error;
    }
}
