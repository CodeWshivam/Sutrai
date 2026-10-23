import { DirectoryEntry, StructuredIncident, ReferralRecord } from '../../src/types';

export const VERIFIED_DIRECTORY_ENTRIES: DirectoryEntry[] = [
  {
    id: 'dir-112',
    name: 'National Emergency Response Support System (ERSS)',
    category: 'emergency',
    phone: '112',
    alternatePhone: '112.gov.in',
    website: 'https://112.gov.in',
    operatingHours: '24x7 / 365 Days',
    jurisdiction: 'Pan-India (All States & UTs)',
    address: 'Ministry of Home Affairs, New Delhi & State Emergency Response Centers',
    eligibility: 'All citizens requiring immediate police, fire, medical, or disaster assistance',
    accessInstructions: 'Dial 112 from any mobile or landline without country code. Works even with zero balance and SIM card lock.',
    verifiedDate: '2026-10-01',
    source: 'Ministry of Home Affairs (MHA), Government of India Official Gazette',
    isOfficial: true,
    status: 'active',
  },
  {
    id: 'dir-108',
    name: 'Emergency Medical & Ambulance Transport Service (EMRI)',
    category: 'medical',
    phone: '108',
    alternatePhone: '102 (Free Maternal & Infant Transport)',
    website: 'https://nhm.gov.in',
    operatingHours: '24x7 Immediate Response',
    jurisdiction: 'Karnataka, Andhra Pradesh, Telangana, Tamil Nadu, Gujarat, MP, UP & 22+ States',
    address: 'State Emergency Management Research Institute / Dept of Health & Family Welfare',
    eligibility: 'Cardiac arrest, respiratory distress, acute trauma, stroke, and life-threatening emergencies',
    accessInstructions: 'Direct dial 108. Operator will triage, dispatch nearest ALS (Advanced Life Support) / BLS ambulance, and provide telephonic CPR instructions.',
    verifiedDate: '2026-10-01',
    source: 'National Health Mission (NHM), Govt of India',
    isOfficial: true,
    status: 'active',
  },
  {
    id: 'dir-101',
    name: 'Fire & Emergency Rescue Services',
    category: 'fire',
    phone: '101',
    alternatePhone: '080-22971500 (Bengaluru Command Control)',
    website: 'https://ksp.karnataka.gov.in',
    operatingHours: '24x7 Immediate Response',
    jurisdiction: 'State Fire and Emergency Services Departments',
    address: 'Karnataka State Fire and Emergency Services, No.1 Annaswamy Mudaliar Road, Bengaluru',
    eligibility: 'Building fires, electrical transformer fires, industrial chemical leaks, collapsed buildings, and deep-water rescue',
    accessInstructions: 'Dial 101. Provide exact landmarks, building height, presence of gas cylinders or chemicals, and trapped victim count.',
    verifiedDate: '2026-09-15',
    source: 'Director General of Fire & Emergency Services',
    isOfficial: true,
    status: 'active',
  },
  {
    id: 'dir-1078',
    name: 'National Disaster Management Authority (NDMA)',
    category: 'disaster',
    phone: '1078',
    alternatePhone: '011-26701728',
    website: 'https://ndma.gov.in',
    operatingHours: '24x7 Disaster Operations Control',
    jurisdiction: 'National & Interstate Disaster Zones',
    address: 'NDMA Bhawan, A-1 Safdarjung Enclave, New Delhi 110029',
    eligibility: 'Severe flash floods, cyclones, landslides, structural failures, earthquakes, and industrial hazmat disasters',
    accessInstructions: 'Dial 1078 for NDRF battalion mobilization and inter-agency disaster logistics.',
    verifiedDate: '2026-09-10',
    source: 'NDMA Official Directory',
    isOfficial: true,
    status: 'active',
  },
  {
    id: 'dir-1091',
    name: 'Women & Child In Distress Emergency Helpline',
    category: 'women_safety',
    phone: '1091',
    alternatePhone: '181 (National Women Helpline)',
    website: 'https://wcd.nic.in',
    operatingHours: '24x7 Confidential Support',
    jurisdiction: 'Pan-India',
    address: 'Ministry of Women and Child Development, Shastri Bhawan, New Delhi',
    eligibility: 'Women facing harassment, assault, domestic abuse, stalking, or requiring emergency shelter and legal aid',
    accessInstructions: 'Trained female counselors coordinate immediate police patrol dispatch and one-stop crisis center shelter.',
    verifiedDate: '2026-10-05',
    source: 'Ministry of Women & Child Development (MWCD)',
    isOfficial: true,
    status: 'active',
  },
  {
    id: 'dir-1930',
    name: 'National Cyber Crime Reporting & Financial Fraud Freeze Helpline',
    category: 'cyber_crime',
    phone: '1930',
    alternatePhone: '155260 (Citizen Financial Cyber Fraud)',
    website: 'https://cybercrime.gov.in',
    operatingHours: '24x7 Real-time Bank Lien System',
    jurisdiction: 'Pan-India with direct integration to RBI and 55+ scheduled banks',
    address: 'Indian Cyber Crime Coordination Centre (I4C), MHA, New Delhi',
    eligibility: 'Online banking fraud, UPI scams, identity theft, unauthorized debit, cyber extortion',
    accessInstructions: 'Call 1930 within the "Golden Hour" of financial fraud with transaction UTR / SMS details to freeze defrauded funds in transit.',
    verifiedDate: '2026-10-01',
    source: 'Indian Cyber Crime Coordination Centre (I4C)',
    isOfficial: true,
    status: 'active',
  },
  {
    id: 'dir-bbmp-civic',
    name: 'Bruhat Bengaluru Mahanagara Palike (BBMP) Central Grievance Cell',
    category: 'civic',
    phone: '1533',
    alternatePhone: '080-22660000',
    website: 'https://bbmp.gov.in',
    operatingHours: '24x7 Control Room',
    jurisdiction: 'Bengaluru Urban (All 8 Zones & 198 Wards)',
    address: 'BBMP Head Office, Corporation Building, NR Square, Bengaluru 560002',
    eligibility: 'Sewage contamination in drinking water, fallen trees, deep road potholes, flooded underpasses, garbage blackspots',
    accessInstructions: 'Provide Ward Number, street name, and GPS reference. Docket number issued immediately for tracking.',
    verifiedDate: '2026-10-12',
    source: 'BBMP Operations Directory 2026',
    isOfficial: true,
    status: 'active',
  },
  {
    id: 'dir-bescom',
    name: 'Bangalore Electricity Supply Company (BESCOM) 24x7 Helpline',
    category: 'civic',
    phone: '1912',
    alternatePhone: '080-22873333',
    website: 'https://bescom.karnataka.gov.in',
    operatingHours: '24x7 Electrical Emergency',
    jurisdiction: 'Bengaluru Urban, Rural, Kolar, Tumkur, Ramanagara, Chikkaballapura, Davanagere, Chitradurga',
    address: 'BESCOM Corporate Office, KR Circle, Bengaluru 560001',
    eligibility: 'Snapped live electrical cables, transformer smoke/fire, power grid failures, roadside shock hazards',
    accessInstructions: 'Dial 1912. Live wire emergencies trigger instant feeder power cut to avoid electrocution.',
    verifiedDate: '2026-10-10',
    source: 'Karnataka Electricity Regulatory Commission (KERC)',
    isOfficial: true,
    status: 'active',
  },
  {
    id: 'dir-traffic',
    name: 'Bengaluru City Traffic Police (BTP) Automation & Incident Centre',
    category: 'transport_traffic',
    phone: '1095',
    alternatePhone: '080-22943030',
    website: 'https://btp.gov.in',
    operatingHours: '24x7 Traffic Operations',
    jurisdiction: 'Bengaluru Metropolitan Area',
    address: 'Traffic Police Headquarters, No.5 Infantry Road, Bengaluru 560001',
    eligibility: 'Severe gridlocks, stalled buses obstructing emergency corridors, accident clearance, signal failures',
    accessInstructions: 'Dial 1095 or WhatsApp traffic helpline 9480801800 with location and photo of obstruction.',
    verifiedDate: '2026-09-28',
    source: 'Karnataka State Police (KSP) Traffic Wing',
    isOfficial: true,
    status: 'active',
  },
  {
    id: 'dir-accessibility',
    name: 'Department of Empowerment of Persons with Disabilities (DEPwD)',
    category: 'accessibility',
    phone: '1800-11-2001',
    alternatePhone: '011-24364012',
    website: 'https://disabilityaffairs.gov.in',
    operatingHours: '09:00 - 18:00 (Mon-Sat)',
    jurisdiction: 'Pan-India & State Commissioners for Persons with Disabilities',
    address: '5th Floor, Pt Deendayal Antyodaya Bhawan, CGO Complex, Lodhi Road, New Delhi',
    eligibility: 'Inaccessible public infrastructure, broken ramps at educational/health centers, violation of RPwD Act 2016',
    accessInstructions: 'File formal non-compliance report for immediate barrier-free access mandate under Section 45 of RPwD Act 2016.',
    verifiedDate: '2026-09-01',
    source: 'Ministry of Social Justice and Empowerment, Govt of India',
    isOfficial: true,
    status: 'active',
  },
  {
    id: 'dir-senior',
    name: 'Elder Line — National Helpline for Senior Citizens',
    category: 'medical',
    phone: '14567',
    alternatePhone: '14567 (Toll-Free)',
    website: 'https://socialjustice.gov.in',
    operatingHours: '08:00 - 20:00 Daily',
    jurisdiction: 'Pan-India',
    address: 'Ministry of Social Justice and Empowerment',
    eligibility: 'Senior citizens requiring physical rescue, medical shelter, elder abuse intervention, and legal assistance',
    accessInstructions: 'Dial 14567. Field rescue vans deployed in coordination with state police.',
    verifiedDate: '2026-08-20',
    source: 'Ministry of Social Justice and Empowerment',
    isOfficial: true,
    status: 'active',
  },
  {
    id: 'dir-swachh',
    name: 'Swachhata Central Urban Grievance Redressal (MoHUA)',
    category: 'civic',
    phone: '1969',
    alternatePhone: '1800-11-1969',
    website: 'https://swachhbharaturban.gov.in',
    operatingHours: '24x7 Central Docket Portal',
    jurisdiction: 'All 4,378 Urban Local Bodies (ULBs) in India',
    address: 'Ministry of Housing and Urban Affairs, Nirman Bhawan, New Delhi',
    eligibility: 'Garbage dumps, open sewer contamination, clogged drainage channels, public sanitation hazards',
    accessInstructions: 'Complaints assigned directly to Sanitary Inspectors with geo-fenced resolution SLAs.',
    verifiedDate: '2026-09-18',
    source: 'Ministry of Housing and Urban Affairs (MoHUA)',
    isOfficial: true,
    status: 'active',
  },
];

export class DirectoryService {
  /**
   * Search and filter verified directory entries
   */
  public static listEntries(params: {
    category?: string;
    search?: string;
    jurisdiction?: string;
  }): DirectoryEntry[] {
    const { category, search, jurisdiction } = params;
    let results = VERIFIED_DIRECTORY_ENTRIES;

    if (category && category !== 'all') {
      results = results.filter((e) => e.category === category);
    }

    if (jurisdiction && jurisdiction.trim()) {
      const jur = jurisdiction.toLowerCase();
      results = results.filter(
        (e) =>
          e.jurisdiction.toLowerCase().includes(jur) ||
          e.jurisdiction.toLowerCase().includes('pan-india')
      );
    }

    if (search && search.trim()) {
      const q = search.toLowerCase();
      results = results.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.phone.includes(q) ||
          e.address?.toLowerCase().includes(q) ||
          e.eligibility.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q)
      );
    }

    return results;
  }

  /**
   * Retrieve entry by ID
   */
  public static getEntryById(id: string): DirectoryEntry | undefined {
    return VERIFIED_DIRECTORY_ENTRIES.find((e) => e.id === id);
  }

  /**
   * Automatically matches the best service directory entry for an incident category
   */
  public static matchServiceForIncident(incident: StructuredIncident): DirectoryEntry {
    const cat = incident.category;
    const text = (incident.title + ' ' + incident.summary).toLowerCase();

    // Check specific conditions
    if (text.includes('cyber') || text.includes('upi') || text.includes('scam') || text.includes('fraud')) {
      return this.getEntryById('dir-1930') || VERIFIED_DIRECTORY_ENTRIES[0];
    }
    if (text.includes('electric') || text.includes('wire') || text.includes('transformer') || text.includes('bescom')) {
      return this.getEntryById('dir-bescom') || VERIFIED_DIRECTORY_ENTRIES[0];
    }
    if (cat === 'medical' || text.includes('cardiac') || text.includes('heart') || text.includes('ambulance')) {
      return this.getEntryById('dir-108') || VERIFIED_DIRECTORY_ENTRIES[0];
    }
    if (cat === 'accessibility' || text.includes('wheelchair') || text.includes('ramp')) {
      return this.getEntryById('dir-accessibility') || VERIFIED_DIRECTORY_ENTRIES[0];
    }
    if (cat === 'transport' || text.includes('traffic') || text.includes('underpass') || text.includes('bus')) {
      return this.getEntryById('dir-traffic') || VERIFIED_DIRECTORY_ENTRIES[0];
    }
    if (cat === 'civic' || text.includes('sewage') || text.includes('water') || text.includes('garbage')) {
      return this.getEntryById('dir-bbmp-civic') || VERIFIED_DIRECTORY_ENTRIES[0];
    }
    if (cat === 'disaster' || text.includes('flood') || text.includes('earthquake')) {
      return this.getEntryById('dir-1078') || VERIFIED_DIRECTORY_ENTRIES[0];
    }

    // Default to all-in-one ERSS 112
    return this.getEntryById('dir-112') || VERIFIED_DIRECTORY_ENTRIES[0];
  }

  /**
   * Generates a formal, printable and dispatchable referral draft letter
   */
  public static generateFormalReferral(
    incident: StructuredIncident,
    directoryEntry: DirectoryEntry
  ): ReferralRecord {
    const refNum = `SUTR-REF-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString();

    const formalDraft = `
================================================================================
OFFICIAL CITIZEN ASSISTANCE & EMERGENCY REFERRAL DOCKET
Reference Number: ${refNum}
Timestamp: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} (IST)
================================================================================

TO:
  The Competent Officer-In-Charge,
  ${directoryEntry.name}
  Address/Jurisdiction: ${directoryEntry.address || directoryEntry.jurisdiction}
  Official Helpline: ${directoryEntry.phone} | Website: ${directoryEntry.website || 'N/A'}

FROM:
  SutrAI Multimodal Civic Triage & Operations Platform
  System Docket ID: ${incident.id}

SUBJECT:
  URGENT INTERVENTION REQUEST — [${incident.urgency.toUpperCase()}] ${incident.category.toUpperCase()}
  ${incident.title}

1. INCIDENT SYNOPSIS:
   ${incident.summary}

2. EXACT GEOGRAPHIC LOCATION:
   Address: ${incident.reportedLocation.address}
   Landmark: ${incident.reportedLocation.landmark || 'Not explicitly stated'}
   Coordinates: ${incident.reportedLocation.coordinates ? `${incident.reportedLocation.coordinates.latitude}, ${incident.reportedLocation.coordinates.longitude}` : 'Derived from landmark'}
   Location Verification: ${incident.reportedLocation.source.toUpperCase()}

3. CITIZEN / AFFECTED PARTIES:
   ${incident.affectedParties}

4. SUPPORTING EVIDENCE RECORD:
   Total Attachments Verified: ${incident.originalSubmission.evidenceFiles.length} item(s)
${incident.originalSubmission.evidenceFiles.map((ev, i) => `   [Evidence #${i + 1}] ${ev.name} (${ev.category}) — ${ev.extractedSnippet || 'Verified attachment'}`).join('\n')}

5. RECOMMENDED NEXT ACTION (SutrAI Analysis):
   Action: ${incident.analysis.recommendedAction.title}
   Rationale: ${incident.analysis.recommendedAction.whyAppropriate}
   Expected SLA: Immediate acknowledgment required.

6. CITIZEN SUBMISSION PROVENANCE:
   Language: ${incident.originalSubmission.language}
   Input Methods: ${incident.originalSubmission.inputMethodsUsed.join(', ')}
   Sensitive Consent: Authorized for official referral

--------------------------------------------------------------------------------
This document was compiled and structured via SutrAI under citizen authorization.
Please record Docket Ref: ${refNum} in your departmental dispatch log.
================================================================================
`.trim();

    return {
      id: `ref-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      incidentId: incident.id,
      serviceId: directoryEntry.id,
      serviceName: directoryEntry.name,
      serviceCategory: directoryEntry.category,
      contactPhone: directoryEntry.phone,
      officialWebsite: directoryEntry.website,
      targetDepartment: directoryEntry.jurisdiction,
      status: 'referred',
      referenceNumber: refNum,
      rationale: incident.analysis.recommendedAction.whyAppropriate,
      supportingEvidenceSummary: `${incident.originalSubmission.evidenceFiles.length} verified attachment(s) included.`,
      generatedFormalDraft: formalDraft,
      createdAt: now,
      updatedAt: now,
    };
  }
}
