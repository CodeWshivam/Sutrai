import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { GeminiService } from '../services/geminiService';
import { parseUploadedFile, ParsedFileContent } from '../services/documentParser';
import { SupabaseService } from '../services/supabaseService';
import { WeatherService } from '../services/weatherService';
import { aiAnalysisRateLimiter } from '../middleware/security';
import { StructuredIncident, EvidenceItem, InputMethod, TaskItem } from '../../src/types';
import { sealAuditEvent } from '../../src/utils/cryptoAudit';

const router = Router();

// Configure Multer with strict limits
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB max per file
    files: 5, // Maximum 5 files per submission
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'audio/mpeg',
      'audio/wav',
      'audio/webm',
      'audio/ogg',
      'audio/mp4',
      'audio/x-m4a',
      'video/mp4',
      'video/webm',
      'video/quicktime',
      'application/pdf',
      'text/plain',
      'text/csv',
    ];

    if (
      allowedMimes.includes(file.mimetype) || 
      file.mimetype.startsWith('audio/') || 
      file.mimetype.startsWith('image/') ||
      file.mimetype.startsWith('video/')
    ) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type "${file.mimetype}". Allowed: Images, Audio, Video, PDF, Text.`));
    }
  },
});

/**
 * POST /api/analyze
 * Multimodal Analysis endpoint accepting text and up to 5 evidence files
 */
router.post(
  '/analyze',
  aiAnalysisRateLimiter,
  upload.array('evidenceFiles', 5),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sensitiveConsent = req.body.sensitiveConsent === 'true' || req.body.sensitiveConsent === true;
      if (!sensitiveConsent) {
        return res.status(400).json({
          success: false,
          error: 'Explicit consent is mandatory before processing personal signals and evidence attachments.',
        });
      }

      const rawText = req.body.rawText || '';
      const language = req.body.language || 'English';
      const forceDemo = req.body.isSimulatedDemo === 'true' || req.body.isSimulatedDemo === true;
      const clientSubmissionId = req.body.clientSubmissionId;

      // Idempotency: Prevent duplicate incidents on retry if clientSubmissionId was previously completed
      if (clientSubmissionId) {
        const existing = SupabaseService.getAll().find(
          (inc) => inc.originalSubmission?.id === clientSubmissionId
        );
        if (existing) {
          return res.json({
            success: true,
            incident: existing,
            modelInfo: {
              model: 'gemini-3.8-flash (idempotent)',
              isFallback: false,
              multimodalFilesCount: existing.originalSubmission?.evidenceFiles.length || 0,
            },
          });
        }
      }
      
      let location = {
        address: '',
        landmark: '',
        isUnknown: false,
      };

      if (req.body.location) {
        try {
          location = typeof req.body.location === 'string'
            ? JSON.parse(req.body.location)
            : req.body.location;
        } catch {
          location.address = String(req.body.location);
        }
      }

      // Parse uploaded files
      const files = (req.files as Express.Multer.File[]) || [];
      const parsedFiles: ParsedFileContent[] = [];
      const evidenceItems: EvidenceItem[] = [];

      for (const file of files) {
        const parsed = await parseUploadedFile(file.buffer, file.originalname, file.mimetype);
        parsedFiles.push(parsed);

        let category: EvidenceItem['category'] = 'document';
        if (parsed.category === 'photo') category = 'photo';
        else if (parsed.category === 'audio') category = 'audio_file';
        else if (parsed.category === 'video') category = 'video_clip';
        else if (file.mimetype.includes('pdf')) category = 'document';
        else category = 'text_log';

        evidenceItems.push({
          id: `ev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: file.originalname,
          type: file.mimetype,
          sizeBytes: file.size,
          uploadedAt: new Date().toISOString(),
          category,
          extractedSnippet: parsed.extractedText 
            ? parsed.extractedText.slice(0, 180) + '...' 
            : `${category.toUpperCase().replace('_', ' ')} attached for analysis.`,
        });
      }

      // Execute Gemini AI analysis
      const analysisResult = await GeminiService.analyzeSubmission({
        rawText,
        language,
        location,
        files: parsedFiles,
        forceDemo,
      });

      // Construct Structured Incident
      const incidentId = `inc-${Date.now().toString().slice(-6)}`;
      const inputMethods: InputMethod[] = [];
      if (rawText.trim()) inputMethods.push('text');
      if (evidenceItems.some((f) => f.category === 'audio_recording')) inputMethods.push('voice');
      if (evidenceItems.some((f) => f.category === 'audio_file')) inputMethods.push('audio');
      if (evidenceItems.some((f) => f.category === 'photo')) inputMethods.push('image');
      if (evidenceItems.some((f) => f.category === 'video_clip')) inputMethods.push('video');
      if (evidenceItems.some((f) => f.category === 'document' || f.category === 'text_log')) inputMethods.push('document');

      // Fetch live weather for the reported location
      let weatherData;
      try {
        const addressToQuery = analysisResult.reportedLocation.address || location.address;
        if (addressToQuery && addressToQuery !== 'Location Unknown') {
          weatherData = await WeatherService.getWeatherForLocationText(addressToQuery);
        }
      } catch (wErr) {
        console.warn('[AnalyzeRoute] Weather fetch skipped:', wErr);
      }

      // Generate initial operational task checklist
      const initialTasks: TaskItem[] = [
        {
          id: `tsk-${Date.now()}-1`,
          title: `Verify submitter contact and access points at ${analysisResult.reportedLocation.address || 'location'}`,
          description: 'Establish direct caller callback and verify physical site accessibility.',
          status: 'pending',
          priority: analysisResult.urgency === 'critical' ? 'urgent' : 'high',
          assignedTo: 'Triage Desk',
          dueDate: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
        },
        {
          id: `tsk-${Date.now()}-2`,
          title: `Dispatch alert to ${analysisResult.recommendedAction.responsibleAuthority.name}`,
          description: analysisResult.recommendedAction.whyAppropriate,
          status: 'pending',
          priority: analysisResult.urgency === 'critical' ? 'urgent' : 'high',
          assignedTo: analysisResult.recommendedAction.responsibleAuthority.department || 'Dispatch Command',
          dueDate: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
        },
      ];

      if (analysisResult.missingInformation && analysisResult.missingInformation.length > 0) {
        initialTasks.push({
          id: `tsk-${Date.now()}-3`,
          title: `Resolve uncertainty: ${analysisResult.missingInformation[0].question.slice(0, 80)}`,
          description: analysisResult.missingInformation[0].suggestedWayToResolve,
          status: 'pending',
          priority: 'medium',
          assignedTo: 'Field Liaison',
          dueDate: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
        });
      }

      const incident: StructuredIncident = {
        id: incidentId,
        title: analysisResult.incidentTitle || rawText.slice(0, 60) || `Incident ${incidentId}`,
        category: analysisResult.category,
        status: analysisResult.urgency === 'critical' ? 'needs_review' : 'in_progress',
        urgency: analysisResult.urgency,
        summary: analysisResult.summary,
        reportedLocation: {
          address: analysisResult.reportedLocation.address || location.address || 'Location Unknown',
          landmark: analysisResult.reportedLocation.landmark || location.landmark,
          source: location.isUnknown ? 'unknown' : 'user_input',
          isUnknown: location.isUnknown,
        },
        affectedParties: analysisResult.affectedPeople || 'Affected count unverified',
        originalSubmission: {
          id: clientSubmissionId || `sub-${Date.now()}`,
          rawText,
          inputMethodsUsed: inputMethods.length > 0 ? inputMethods : ['text'],
          evidenceFiles: evidenceItems,
          location: {
            address: location.address,
            landmark: location.landmark,
            source: location.isUnknown ? 'unknown' : 'user_input',
            isUnknown: location.isUnknown,
          },
          language,
          sensitiveConsentGiven: true,
          createdAt: new Date().toISOString(),
        },
        analysis: {
          ...analysisResult,
          structuredIncidentId: incidentId,
          extractedCategory: analysisResult.category,
          urgencyScore: analysisResult.urgency,
          uncertainties: analysisResult.missingInformation,
          isSimulatedDemo: !analysisResult.modelInformation.isLiveGemini,
          processingTimeMs: 420,
        },
        operatorNotes: [],
        tasks: initialTasks,
        weather: weatherData,
        isDemoData: forceDemo,
        auditChainVerified: true,
        auditTimeline: (() => {
          const ev1 = sealAuditEvent({
            id: `aud-${Date.now()}-1`,
            timestamp: new Date().toISOString(),
            action: 'Signal Captured',
            actor: 'SutrAI Multimodal API',
            details: `Ingested via ${inputMethods.join(', ')} with ${evidenceItems.length} evidence attachment(s).`,
            type: 'status_change',
          });
          const ev2 = sealAuditEvent({
            id: `aud-${Date.now()}-2`,
            timestamp: new Date().toISOString(),
            action: analysisResult.modelInformation.isLiveGemini 
              ? 'Real Gemini AI Analysis Completed' 
              : 'Deterministic Demo Analysis Completed',
            actor: analysisResult.modelInformation.isLiveGemini 
              ? `Gemini Model (${analysisResult.modelInformation.modelName})` 
              : 'SutrAI Demo Engine',
            details: `Categorized as ${analysisResult.category.toUpperCase()} (Urgency: ${analysisResult.urgency.toUpperCase()}). Initial task checklist generated.`,
            type: 'status_change',
          }, ev1);
          return [ev1, ev2];
        })(),
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      // Persist to Supabase / local resilient store
      await SupabaseService.saveIncident(incident);

      res.status(201).json({
        success: true,
        incident,
        analysis: incident.analysis,
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
