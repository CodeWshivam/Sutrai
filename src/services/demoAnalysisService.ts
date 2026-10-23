import {
  InputSubmission,
  AnalysisResult,
  IncidentCategory,
  UrgencyLevel,
  RecommendedAction,
  ExtractedClaim,
  UncertaintyItem,
  RouteComparisonData,
} from '../types';

/**
 * Deterministic Demo Analysis Engine for Phase 1.
 * Clearly labelled as simulated AI analysis.
 * Prepared for clean replacement with Google Gemini API in Phase 2.
 */
export function analyzeSubmissionDemo(submission: InputSubmission): AnalysisResult {
  const text = (submission.rawText || '').toLowerCase();
  const fileNames = submission.evidenceFiles.map((f) => f.name.toLowerCase()).join(' ');
  const combinedContext = `${text} ${fileNames}`;

  // 1. Detect Category
  let category: IncidentCategory = 'general';
  if (
    combinedContext.includes('chest') ||
    combinedContext.includes('breath') ||
    combinedContext.includes('bleed') ||
    combinedContext.includes('heart') ||
    combinedContext.includes('collapse') ||
    combinedContext.includes('doctor') ||
    combinedContext.includes('patient') ||
    combinedContext.includes('stroke') ||
    combinedContext.includes('unconscious')
  ) {
    category = 'medical';
  } else if (
    combinedContext.includes('flood') ||
    combinedContext.includes('traffic') ||
    combinedContext.includes('bus') ||
    combinedContext.includes('underpass') ||
    combinedContext.includes('detour') ||
    combinedContext.includes('road') ||
    combinedContext.includes('accident') ||
    combinedContext.includes('bridge')
  ) {
    category = 'transport';
  } else if (
    combinedContext.includes('water') ||
    combinedContext.includes('sewage') ||
    combinedContext.includes('garbage') ||
    combinedContext.includes('pothole') ||
    combinedContext.includes('pipe') ||
    combinedContext.includes('drain') ||
    combinedContext.includes('street light')
  ) {
    category = 'civic';
  } else if (
    combinedContext.includes('smoke') ||
    combinedContext.includes('fire') ||
    combinedContext.includes('chemical') ||
    combinedContext.includes('gas') ||
    combinedContext.includes('toxic') ||
    combinedContext.includes('leak')
  ) {
    category = 'hazard';
  } else if (
    combinedContext.includes('cyclone') ||
    combinedContext.includes('storm') ||
    combinedContext.includes('earthquake') ||
    combinedContext.includes('landslide')
  ) {
    category = 'disaster';
  } else if (
    combinedContext.includes('wheelchair') ||
    combinedContext.includes('ramp') ||
    combinedContext.includes('blind') ||
    combinedContext.includes('braille') ||
    combinedContext.includes('disabled') ||
    combinedContext.includes('accessibility')
  ) {
    category = 'accessibility';
  }

  // 2. Detect Urgency
  let urgency: UrgencyLevel = 'moderate';
  if (
    combinedContext.includes('collapse') ||
    combinedContext.includes('not breathing') ||
    combinedContext.includes('severe bleeding') ||
    combinedContext.includes('explosion') ||
    combinedContext.includes('toxic plume') ||
    combinedContext.includes('unconscious') ||
    combinedContext.includes('heart attack') ||
    combinedContext.includes('fire trapped')
  ) {
    urgency = 'critical';
  } else if (
    combinedContext.includes('flooded') ||
    combinedContext.includes('submerged') ||
    combinedContext.includes('contamination') ||
    combinedContext.includes('fracture') ||
    combinedContext.includes('chemical') ||
    combinedContext.includes('blocking emergency')
  ) {
    urgency = 'high';
  } else if (
    combinedContext.includes('minor') ||
    combinedContext.includes('survey') ||
    combinedContext.includes('information')
  ) {
    urgency = 'low';
  }

  // 3. Extract Facts & Claims
  const extractedClaims: ExtractedClaim[] = [
    {
      id: `clm-${Date.now()}-1`,
      claim: submission.rawText.slice(0, 140) || 'Primary incident description provided by reporter',
      sourceType: submission.inputMethodsUsed.includes('voice') ? 'audio' : 'raw_text',
      confidence: 0.94,
      verificationStatus: 'user_reported',
      notes: 'Initial direct observation from source.',
    },
  ];

  if (submission.evidenceFiles.length > 0) {
    extractedClaims.push({
      id: `clm-${Date.now()}-2`,
      claim: `Corroborated by ${submission.evidenceFiles.length} uploaded evidence file(s): ${submission.evidenceFiles.map((f) => f.name).join(', ')}`,
      sourceType: 'image',
      confidence: 0.91,
      verificationStatus: 'corroborated',
      notes: 'Metadata and visual tokens match reported timeline.',
    });
  }

  // 4. Missing Information / Uncertainties
  const uncertainties: UncertaintyItem[] = [];
  if (submission.location.isUnknown) {
    uncertainties.push({
      id: `unc-${Date.now()}-loc`,
      question: 'Exact geographic coordinates or nearest civic landmark unknown',
      impactOnAction: 'Prevents automatic geofenced responder dispatch to exact physical point.',
      suggestedWayToResolve: 'Request landmark, street name, or enable browser geolocation.',
      isBlocking: urgency === 'critical',
    });
  }

  if (category === 'medical') {
    uncertainties.push({
      id: `unc-${Date.now()}-med`,
      question: 'Patient medication history and drug allergies (e.g. Aspirin, Penicillin)?',
      impactOnAction: 'Guides paramedic pre-hospital medication choices.',
      suggestedWayToResolve: 'Verify with immediate caregiver upon arrival.',
      isBlocking: false,
    });
  }

  // 5. Build Recommended Action & Alternatives
  let recommendedAction: RecommendedAction;
  let routeComparison: RouteComparisonData | undefined;

  if (category === 'medical') {
    recommendedAction = {
      id: `act-${Date.now()}`,
      title: urgency === 'critical' 
        ? 'Dispatch Emergency Medical Service (ALS Ambulance) & Pre-Hospital Triage' 
        : 'Connect with Local Healthcare Facility & Arrange Safe Medical Transport',
      whyAppropriate: 'Clinical symptoms require urgent hemodynamic assessment and sterile transport. Direct emergency dispatch eliminates dangerous delays.',
      urgency,
      supportingEvidenceIds: submission.evidenceFiles.map((f) => f.id),
      missingOrUncertainDetails: uncertainties,
      responsibleAuthority: {
        name: 'Emergency Medical Services (108 / 112 Command Network)',
        department: 'Pre-Hospital Trauma & Medical Care',
        contactChannel: 'Emergency Tele-Triage Desk (Demo)',
        isVerifiedService: true,
      },
      alternativesConsidered: [
        {
          id: 'alt-m1',
          title: 'Unassisted Private Transport',
          tradeOffs: ['Leaves immediately', 'No oxygen or resuscitation equipment', 'High risk during traffic delays'],
          whyNotPreferred: 'Patient instability requires monitoring by trained EMTs with defibrillator on board.',
          riskAssessment: 'Unsafe in acute episodes',
        },
        {
          id: 'alt-m2',
          title: 'Wait for In-Person Clinic Appointment',
          tradeOffs: ['Non-emergency workflow', 'Unacceptable diagnostic delay'],
          whyNotPreferred: 'Symptoms demand immediate emergency rule-out.',
          riskAssessment: 'Severe time penalty',
        },
      ],
      nextStepsTimeline: [
        {
          stepNumber: 1,
          description: 'Keep patient in semi-upright seated position; keep air circulating; do not offer solid food or drink.',
          responsibleParty: 'First-Contact Onlooker / Reporter',
          estimatedMinutes: 1,
          status: 'completed',
        },
        {
          stepNumber: 2,
          description: 'Dispatch Nearest ALS Ambulance unit with siren and GPS tracking.',
          responsibleParty: 'Emergency Medical Dispatcher',
          estimatedMinutes: 7,
          status: 'in_progress',
        },
        {
          stepNumber: 3,
          description: 'Notify receiving emergency department triage team with patient vital indicators.',
          responsibleParty: 'Hospital ER Coordinator',
          estimatedMinutes: 10,
          status: 'pending',
        },
      ],
      actionStatus: 'dispatched',
    };
  } else if (category === 'transport') {
    recommendedAction = {
      id: `act-${Date.now()}`,
      title: 'Deploy Immediate Traffic Diversion & Barricade Flooded/Impassable Corridor',
      whyAppropriate: 'Preventing traffic pile-up reduces accident risk and frees emergency access lanes for rescue and dewatering units.',
      urgency,
      supportingEvidenceIds: submission.evidenceFiles.map((f) => f.id),
      missingOrUncertainDetails: uncertainties,
      responsibleAuthority: {
        name: 'City Traffic Management Center & Emergency Road Clearing Wing',
        department: 'Urban Mobility & Emergency Response',
        contactChannel: 'Traffic Incident Hotline (Demo)',
        isVerifiedService: true,
      },
      alternativesConsidered: [
        {
          id: 'alt-t1',
          title: 'Passive Signage Only',
          tradeOffs: ['Low effort', 'Motorists continue attempting dangerous crossing', 'High likelihood of stalled vehicles'],
          whyNotPreferred: 'Physical barricade and active detour guidance are needed to stop incoming heavy vehicles.',
          riskAssessment: 'High Gridlock Hazard',
        },
      ],
      nextStepsTimeline: [
        {
          stepNumber: 1,
          description: 'Place physical safety cones and signage at upstream intersections.',
          responsibleParty: 'Traffic Wardens',
          estimatedMinutes: 10,
          status: 'completed',
        },
        {
          stepNumber: 2,
          description: 'Issue public traffic alert across navigation and radio channels.',
          responsibleParty: 'Traffic Information Center',
          estimatedMinutes: 15,
          status: 'in_progress',
        },
      ],
      actionStatus: 'in_progress',
    };

    routeComparison = {
      preferredRoute: {
        name: 'Elevated Arterial Bypass (Detour)',
        distanceKm: 5.4,
        etaMinutes: 20,
        conditionSummary: 'Clear surface, elevated bridges, active signal synchronization.',
        safetyScore: 9,
        whySelected: 'Guaranteed avoidance of low-lying water stagnation points.',
      },
      alternatives: [
        {
          name: 'Direct Underpass Corridor',
          distanceKm: 2.1,
          etaMinutes: 65,
          tradeOff: 'Submerged / heavily congested; dangerous for low-clearance vehicles.',
          whyNotRecommended: 'Direct threat of vehicle stalling and passenger stranding.',
        },
      ],
      missingInformationForBetterComparison: ['Live lane closure updates from metro construction site.'],
      dataFreshness: 'Updated 2 minutes ago via Traffic Sensor Matrix (Demo)',
      isSimulatedDemoData: true,
    };
  } else {
    // Civic, Hazard, Accessibility, or General
    recommendedAction = {
      id: `act-${Date.now()}`,
      title: `Notify ${category.toUpperCase()} Authority & Deploy Field Verification Unit`,
      whyAppropriate: 'Ground evidence and structured details warrant high-priority municipal triage to safeguard public well-being.',
      urgency,
      supportingEvidenceIds: submission.evidenceFiles.map((f) => f.id),
      missingOrUncertainDetails: uncertainties,
      responsibleAuthority: {
        name: 'Municipal Rapid Action Cell',
        department: `${category.charAt(0).toUpperCase() + category.slice(1)} Operations Division`,
        contactChannel: 'Citizen Grievance & Public Safety Hub (Demo)',
        isVerifiedService: true,
      },
      alternativesConsidered: [
        {
          id: 'alt-g1',
          title: 'Standard 48-Hour Civic Queue',
          tradeOffs: ['Standard administrative pipeline', 'Unaddressed hazard may escalate or cause injury'],
          whyNotPreferred: 'The reported severity level justifies immediate field team mobilization.',
          riskAssessment: 'Risk of escalation',
        },
      ],
      nextStepsTimeline: [
        {
          stepNumber: 1,
          description: 'Log incident in public safety register and allocate field ticket.',
          responsibleParty: 'Civic Helpdesk',
          estimatedMinutes: 5,
          status: 'completed',
        },
        {
          stepNumber: 2,
          description: 'Dispatch nearest municipal mobile response vehicle.',
          responsibleParty: 'Field Inspection Squad',
          estimatedMinutes: 25,
          status: 'in_progress',
        },
      ],
      actionStatus: 'in_progress',
    };
  }

  return {
    structuredIncidentId: `inc-${Date.now()}`,
    extractedCategory: category,
    urgencyScore: urgency,
    summary: submission.rawText
      ? `Analysis of report: ${submission.rawText.slice(0, 180)}...`
      : 'Multimodal report captured with evidence attachments.',
    keyFacts: [
      `Input channels: ${submission.inputMethodsUsed.join(', ')}`,
      `Reported location: ${submission.location.address || 'Location unknown (requires clarification)'}`,
      `Evidence attachments: ${submission.evidenceFiles.length} file(s) scrutinized`,
    ],
    extractedClaims,
    uncertainties,
    recommendedAction,
    routeComparison,
    isSimulatedDemo: true,
    processingTimeMs: Math.floor(Math.random() * 200) + 320,
  };
}
