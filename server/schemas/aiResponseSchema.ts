import { z } from 'zod';

export const VerificationStatusSchema = z.enum([
  'user_reported',
  'ai_extracted',
  'corroborated',
  'independently_verified',
  'unverified',
  'conflicting',
]);

export const IncidentCategorySchema = z.enum([
  'medical',
  'transport',
  'civic',
  'disaster',
  'hazard',
  'safety',
  'accessibility',
  'general',
]);

export const UrgencyLevelSchema = z.enum(['low', 'moderate', 'high', 'critical']);

export const ExtractedClaimSchema = z.object({
  id: z.string(),
  claim: z.string(),
  sourceType: z.enum(['raw_text', 'audio', 'image', 'document']),
  confidence: z.number().min(0).max(1),
  verificationStatus: VerificationStatusSchema,
  notes: z.string().optional(),
});

export const UncertaintyItemSchema = z.object({
  id: z.string(),
  question: z.string(),
  impactOnAction: z.string(),
  suggestedWayToResolve: z.string(),
  isBlocking: z.boolean(),
});

export const AlternativeActionSchema = z.object({
  id: z.string(),
  title: z.string(),
  tradeOffs: z.array(z.string()),
  whyNotPreferred: z.string(),
  estimatedResolutionTime: z.string().optional(),
  riskAssessment: z.string(),
});

export const NextStepTimelineItemSchema = z.object({
  stepNumber: z.number(),
  description: z.string(),
  responsibleParty: z.string(),
  estimatedMinutes: z.number().optional(),
  status: z.enum(['pending', 'in_progress', 'completed']),
});

export const RecommendedActionSchema = z.object({
  id: z.string(),
  title: z.string(),
  whyAppropriate: z.string(),
  urgency: UrgencyLevelSchema,
  supportingEvidenceIds: z.array(z.string()).default([]),
  missingOrUncertainDetails: z.array(UncertaintyItemSchema).default([]),
  responsibleAuthority: z.object({
    name: z.string(),
    department: z.string(),
    contactChannel: z.string().optional(),
    isVerifiedService: z.boolean().default(true),
  }),
  alternativesConsidered: z.array(AlternativeActionSchema).default([]),
  nextStepsTimeline: z.array(NextStepTimelineItemSchema).default([]),
  actionStatus: z.enum(['not_started', 'dispatched', 'in_progress', 'verified_resolved']).default('not_started'),
});

export const RouteComparisonDataSchema = z.object({
  preferredRoute: z.object({
    name: z.string(),
    distanceKm: z.number().optional(),
    etaMinutes: z.number().optional(),
    conditionSummary: z.string(),
    safetyScore: z.number(),
    whySelected: z.string(),
  }),
  alternatives: z.array(
    z.object({
      name: z.string(),
      distanceKm: z.number().optional(),
      etaMinutes: z.number().optional(),
      tradeOff: z.string(),
      whyNotRecommended: z.string(),
    })
  ),
  missingInformationForBetterComparison: z.array(z.string()).optional(),
  dataFreshness: z.string(),
  isSimulatedDemoData: z.boolean(),
}).optional();

// Complete Structured Gemini Output Schema
export const StructuredAnalysisResultSchema = z.object({
  incidentTitle: z.string(),
  category: IncidentCategorySchema,
  summary: z.string(),
  reportedLocation: z.object({
    address: z.string(),
    coordinates: z.object({
      latitude: z.number(),
      longitude: z.number(),
    }).optional(),
    landmark: z.string().optional(),
    source: z.enum(['gps', 'user_input', 'extracted', 'unknown']),
    isUnknown: z.boolean(),
  }),
  reportedAt: z.string(),
  urgency: UrgencyLevelSchema,
  urgencyReason: z.string(),
  affectedPeople: z.string(),
  keyFacts: z.array(z.string()),
  extractedClaims: z.array(ExtractedClaimSchema),
  supportingEvidence: z.array(z.string()),
  missingInformation: z.array(UncertaintyItemSchema),
  conflictingClaims: z.array(z.string()).default([]),
  verificationStatus: z.string().default('ai_extracted'),
  recommendedAction: RecommendedActionSchema,
  routeComparison: RouteComparisonDataSchema,
  nextSteps: z.array(z.string()).default([]),
  followUpRequirements: z.array(z.string()).default([]),
  limitations: z.array(z.string()).default([]),
  modelInformation: z.object({
    modelName: z.string(),
    timestamp: z.string(),
    isLiveGemini: z.boolean(),
  }),
});

export type StructuredAnalysisResult = z.infer<typeof StructuredAnalysisResultSchema>;

// Submission Input Validation Schema
export const SubmissionInputSchema = z.object({
  rawText: z.string().max(10000).optional().default(''),
  language: z.string().default('English'),
  location: z.object({
    address: z.string().default(''),
    landmark: z.string().optional(),
    isUnknown: z.boolean().default(false),
  }).default({ address: '', isUnknown: false }),
  sensitiveConsentGiven: z.boolean().default(true),
  isSimulatedDemo: z.boolean().optional().default(false),
});
