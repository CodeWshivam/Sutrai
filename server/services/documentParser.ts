import * as pdfParseModule from 'pdf-parse';

const pdfParse: (dataBuffer: Buffer) => Promise<{ text: string }> = 
  (pdfParseModule as any).default || pdfParseModule;

export interface ParsedFileContent {
  filename: string;
  mimetype: string;
  sizeBytes: number;
  extractedText?: string;
  base64Data?: string;
  isMultimodalSupported: boolean;
  category: 'photo' | 'audio' | 'video' | 'document' | 'other';
}

/**
 * Extracts text and prepares multimodal payload from an uploaded file buffer
 */
export async function parseUploadedFile(
  buffer: Buffer,
  filename: string,
  mimetype: string
): Promise<ParsedFileContent> {
  const sizeBytes = buffer.length;
  let category: ParsedFileContent['category'] = 'other';
  let extractedText: string | undefined;
  let isMultimodalSupported = false;

  // 1. Images
  if (mimetype.startsWith('image/')) {
    category = 'photo';
    isMultimodalSupported = true; // Gemini supports direct image understanding
  }
  // 2. Audio
  else if (mimetype.startsWith('audio/')) {
    category = 'audio';
    isMultimodalSupported = true; // Gemini supports direct audio understanding
  }
  // 3. Video
  else if (mimetype.startsWith('video/')) {
    category = 'video';
    isMultimodalSupported = true; // Multimodal container payload
    extractedText = `[Video Evidence: ${filename} (${(sizeBytes / (1024 * 1024)).toFixed(1)} MB)] Video clip attached for motion sequence and contextual hazard inspection.`;
  }
  // 3. PDF Documents
  else if (mimetype === 'application/pdf' || filename.toLowerCase().endsWith('.pdf')) {
    category = 'document';
    isMultimodalSupported = true; // Gemini supports direct PDF understanding
    try {
      const pdfData = await pdfParse(buffer);
      if (pdfData && pdfData.text) {
        extractedText = pdfData.text.slice(0, 15000).trim();
      }
    } catch (err) {
      console.warn(`[DocumentParser] Failed to extract text from ${filename}, will pass raw PDF to Gemini`, err);
    }
  }
  // 4. Plain Text / CSV / Log files
  else if (
    mimetype === 'text/plain' ||
    mimetype === 'text/csv' ||
    filename.toLowerCase().endsWith('.txt') ||
    filename.toLowerCase().endsWith('.csv')
  ) {
    category = 'document';
    extractedText = buffer.toString('utf-8').slice(0, 20000).trim();
  }

  const base64Data = buffer.toString('base64');

  return {
    filename,
    mimetype,
    sizeBytes,
    extractedText,
    base64Data,
    isMultimodalSupported,
    category,
  };
}
