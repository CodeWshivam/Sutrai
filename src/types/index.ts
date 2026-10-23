/**
 * SutrAI Type Definitions
 * Phase 1 Architecture: Ready for Gemini API, vector database, and service integrations in future phases.
 */

export type InputMethod = 'text' | 'voice' | 'audio' | 'image' | 'video' | 'document';

export type IncidentCategory =
  | 'medical'
  | 'transport'
  | 'civic'
  | 'disaster'
  | 'hazard'
  | 'safety'
  | 'accessibility'
  | 'general';

export type UrgencyLevel = 'low' | 'moderate' | 'high' | 'critical';

export type IncidentStatus = 
  | 'new'
  | 'triaged'
  | 'needs_information'
  | 'ready_for_action'
  | 'assigned'
  | 'in_progress'
  | 'waiting_for_response'
  | 'resolved'
  | 'cancelled'
  | 'escalated'
  | 'failed'
  | 'needs_review'
  | 'dispatched';

export type VerificationStatus =
  | 'user_reported'
  | 'ai_extracted'
  | 'corroborated'
  | 'independently_verified'
  | 'unverified'
  | 'conflicting';

export interface LocationData {
  address: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  landmark?: string;
  source: 'gps' | 'user_input' | 'extracted' | 'unknown';
  isUnknown: boolean;
}

export interface EvidenceItem {
  id: string;
  name: string;
  type: string; // e.g. 'image/png', 'audio/webm', 'application/pdf', 'video/mp4'
  sizeBytes: number;
  previewUrl?: string;
  uploadedAt: string;
  category: 'audio_recording' | 'audio_file' | 'photo' | 'video_clip' | 'document' | 'text_log';
  extractedSnippet?: string;
}

export interface InputSubmission {
  id: string;
  rawText: string;
  inputMethodsUsed: InputMethod[];
  evidenceFiles: EvidenceItem[];
  location: LocationData;
  language: string;
  sensitiveConsentGiven: boolean;
  createdAt: string;
}

export interface ExtractedClaim {
  id: string;
  claim: string;
  sourceType: 'raw_text' | 'audio' | 'image' | 'document';
  confidence: number; // 0 to 1
  verificationStatus: VerificationStatus;
  notes?: string;
}

export interface UncertaintyItem {
  id: string;
  question: string;
  impactOnAction: string;
  suggestedWayToResolve: string;
  isBlocking: boolean;
}

export interface AlternativeAction {
  id: string;
  title: string;
  tradeOffs: string[];
  whyNotPreferred: string;
  estimatedResolutionTime?: string;
  riskAssessment: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  serviceType: 'ambulance' | 'police' | 'fire' | 'disaster' | 'helpline' | 'traffic';
  phoneNumber: string;
  isVerifiedContact: boolean;
  notes: string;
  jurisdiction: string;
}

export interface RecommendedAction {
  id: string;
  title: string;
  whyAppropriate: string;
  urgency: UrgencyLevel;
  supportingEvidenceIds: string[];
  missingOrUncertainDetails: UncertaintyItem[];
  responsibleAuthority: {
    name: string;
    department: string;
    contactChannel?: string;
    isVerifiedService: boolean;
  };
  alternativesConsidered: AlternativeAction[];
  nextStepsTimeline: {
    stepNumber: number;
    description: string;
    responsibleParty: string;
    estimatedMinutes?: number;
    status: 'pending' | 'in_progress' | 'completed';
  }[];
  actionStatus: 'not_started' | 'dispatched' | 'in_progress' | 'verified_resolved';
}

export interface RouteComparisonData {
  preferredRoute: {
    name: string;
    distanceKm?: number;
    etaMinutes?: number;
    conditionSummary: string;
    safetyScore: number; // 1-10
    whySelected: string;
  };
  alternatives: {
    name: string;
    distanceKm?: number;
    etaMinutes?: number;
    tradeOff: string;
    whyNotRecommended: string;
  }[];
  missingInformationForBetterComparison?: string[];
  dataFreshness: string;
  isSimulatedDemoData: boolean;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  details: string;
  type: 'status_change' | 'note_added' | 'evidence_attached' | 'dispatch_simulation';
  prevHash?: string;
  hash?: string;
}

export interface AnalysisResult {
  structuredIncidentId: string;
  extractedCategory: IncidentCategory;
  urgencyScore: UrgencyLevel;
  summary: string;
  keyFacts: string[];
  extractedClaims: ExtractedClaim[];
  uncertainties: UncertaintyItem[];
  recommendedAction: RecommendedAction;
  routeComparison?: RouteComparisonData;
  isSimulatedDemo: boolean;
  processingTimeMs: number;
}

export interface StructuredIncident {
  id: string;
  title: string;
  category: IncidentCategory;
  status: IncidentStatus;
  urgency: UrgencyLevel;
  summary: string;
  reportedLocation: LocationData;
  affectedParties: string;
  originalSubmission: InputSubmission;
  analysis: AnalysisResult;
  operatorNotes: {
    id: string;
    author: string;
    timestamp: string;
    text: string;
  }[];
  auditTimeline: AuditEvent[];
  tasks?: TaskItem[];
  referrals?: ReferralRecord[];
  weather?: WeatherData;
  reminders?: ScheduledReminder[];
  escalationReason?: string;
  escalatedAt?: string;
  assignedTo?: string;
  isDemoData?: boolean;
  auditChainVerified?: boolean;
  updatedAt: string;
  createdAt: string;
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  assignedTo?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  createdAt: string;
  completedAt?: string;
}

export interface ReferralRecord {
  id: string;
  incidentId: string;
  serviceId: string;
  serviceName: string;
  serviceCategory: string;
  contactPhone: string;
  officialWebsite?: string;
  targetDepartment: string;
  status: 'draft' | 'pending_confirmation' | 'referred' | 'acknowledged' | 'in_action' | 'closed';
  referenceNumber?: string;
  rationale: string;
  supportingEvidenceSummary: string;
  generatedFormalDraft: string;
  createdAt: string;
  updatedAt: string;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  weatherCode: number;
  precipitation: number;
  severeHazards: {
    type: string;
    severity: 'low' | 'moderate' | 'high' | 'severe';
    description: string;
    safetyGuidance: string;
  }[];
  locationName: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  timestamp: string;
  source: string;
  isLive: boolean;
}

export interface DirectoryEntry {
  id: string;
  name: string;
  category: 'emergency' | 'medical' | 'police' | 'fire' | 'disaster' | 'civic' | 'women_safety' | 'cyber_crime' | 'transport_traffic' | 'accessibility';
  phone: string;
  contactNumber?: string;
  alternatePhone?: string;
  description?: string;
  acronym?: string;
  isEmergencyHotline?: boolean;
  website?: string;
  operatingHours: string;
  jurisdiction: string;
  address?: string;
  eligibility: string;
  accessInstructions: string;
  verifiedDate: string;
  source: string;
  verificationSource?: string;
  isOfficial: boolean;
  status: 'active' | 'limited' | 'unverified';
}

export interface ScheduledReminder {
  id: string;
  incidentId: string;
  title: string;
  scheduledFor: string;
  channel: 'in_app' | 'email' | 'sms';
  recipient?: string;
  status: 'pending' | 'dispatched' | 'cancelled';
  createdAt: string;
  dispatchedAt?: string;
}

export interface NotificationItem {
  id: string;
  incidentId?: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  priority?: 'low' | 'normal' | 'high' | 'critical';
  category?: string;
  timestamp: string;
  createdAt?: string;
  read: boolean;
  isRead?: boolean;
  actionUrl?: string;
}

