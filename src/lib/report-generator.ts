type ReportContext = {
  patientName: string;
  patientAge: number;
  patientGender: string;
  testName: string;
  departmentName: string;
  clinicalNotes?: string | null;
  keywords: string;
};

const FINDING_TEMPLATES: Record<string, string> = {
  normal:
    "The study demonstrates findings within normal limits for the patient's age and clinical presentation.",
  abnormal:
    "The study reveals abnormal findings that correlate with the provided clinical history and require clinical correlation.",
  mild:
    "Mild changes are noted which may represent early or minimal pathological process.",
  moderate:
    "Moderate abnormalities are identified and should be correlated with clinical symptoms.",
  severe:
    "Significant/severe abnormalities are present and warrant urgent clinical attention.",
  enlarged:
    "Organ/structure appears enlarged compared to expected normal dimensions.",
  reduced:
    "Reduced size/volume is noted compared to expected normal parameters.",
  opacity:
    "Areas of increased opacity are identified in the examined region.",
  clear:
    "The visualized structures appear clear without significant obstructive findings.",
  fracture:
    "Discontinuity consistent with fracture is identified at the described location.",
  inflammation:
    "Features suggestive of inflammatory changes are present.",
  infection:
    "Findings are suggestive of infective/inflammatory etiology.",
  mass:
    "A space-occupying lesion/mass-like area is identified requiring further evaluation.",
  effusion:
    "Collection/fluid effusion is noted in the examined compartment.",
  calcification:
    "Calcific foci are identified within the examined structures.",
  degenerative:
    "Degenerative changes are noted, likely age-related or chronic in nature.",
  no_acute:
    "No acute or significant abnormality is identified on this examination.",
};

const IMPRESSION_RULES: Array<{ match: RegExp; text: string }> = [
  {
    match: /normal|clear|no acute|unremarkable/i,
    text: "Essentially normal study within the limits of this examination.",
  },
  {
    match: /fracture|discontinuity/i,
    text: "Findings consistent with fracture — clinical correlation and follow-up advised.",
  },
  {
    match: /mass|lesion|tumor|neoplasm/i,
    text: "Space-occupying lesion identified — further evaluation and specialist review recommended.",
  },
  {
    match: /infection|inflammatory|effusion/i,
    text: "Findings suggestive of inflammatory/infective process — correlate clinically.",
  },
  {
    match: /severe|significant|marked/i,
    text: "Significant abnormality noted — prompt clinical correlation advised.",
  },
  {
    match: /mild|minimal|early/i,
    text: "Mild/minimal changes noted — clinical follow-up as indicated.",
  },
  {
    match: /degenerative|chronic|age/i,
    text: "Degenerative/chronic changes identified — correlate with symptoms.",
  },
];

function parseKeywords(keywords: string): string[] {
  return keywords
    .split(/[,;\n]+/)
    .map((k) => k.trim().toLowerCase())
    .filter(Boolean);
}

function buildFindings(keywordList: string[]): string[] {
  const findings: string[] = [];
  const used = new Set<string>();

  for (const keyword of keywordList) {
    for (const [key, template] of Object.entries(FINDING_TEMPLATES)) {
      if (keyword.includes(key) || key.includes(keyword)) {
        if (!used.has(key)) {
          findings.push(`• ${template}`);
          used.add(key);
        }
      }
    }
  }

  if (findings.length === 0) {
    for (const keyword of keywordList) {
      findings.push(
        `• ${keyword.charAt(0).toUpperCase() + keyword.slice(1)} noted on examination.`
      );
    }
  }

  return findings;
}

function buildImpression(keywords: string, keywordList: string[]): string {
  for (const rule of IMPRESSION_RULES) {
    if (rule.match.test(keywords)) {
      return rule.text;
    }
  }

  if (keywordList.some((k) => k.includes("normal") || k.includes("clear"))) {
    return "Study within normal limits for the examined region.";
  }

  return `Findings as described above (${keywordList.join(", ")}) — clinical correlation recommended.`;
}

function buildTechnique(testName: string, departmentName: string): string {
  const testLower = testName.toLowerCase();

  if (testLower.includes("x-ray") || testLower.includes("xray")) {
    return "Standard radiographic views were obtained using appropriate technique and positioning.";
  }
  if (testLower.includes("ultrasound") || testLower.includes("usg")) {
    return "Real-time ultrasonographic examination was performed using high-frequency transducer with standard protocol.";
  }
  if (testLower.includes("ct")) {
    return "Multislice CT examination was performed following standard departmental protocol with appropriate windowing.";
  }
  if (testLower.includes("mri")) {
    return "MRI examination was performed using standard sequences as per departmental protocol.";
  }
  if (testLower.includes("ecg") || testLower.includes("ekg")) {
    return "12-lead electrocardiogram was recorded at standard speed and calibration.";
  }
  if (testLower.includes("blood") || testLower.includes("lab")) {
    return "Laboratory analysis was performed on collected specimen using standard validated methods.";
  }

  return `${testName} was performed in the ${departmentName} using standard institutional protocol.`;
}

export function generateReport(context: ReportContext): string {
  const keywordList = parseKeywords(context.keywords);
  const genderLabel =
    context.patientGender === "MALE"
      ? "Male"
      : context.patientGender === "FEMALE"
        ? "Female"
        : "Other";

  const findings = buildFindings(keywordList);
  const impression = buildImpression(context.keywords, keywordList);
  const technique = buildTechnique(context.testName, context.departmentName);

  const clinicalSection = context.clinicalNotes
    ? `\nCLINICAL HISTORY:\n${context.clinicalNotes}\n`
    : "";

  return `MEDI HOSPITAL — DIAGNOSTIC REPORT
================================

PATIENT: ${context.patientName}
AGE/GENDER: ${context.patientAge} years / ${genderLabel}
EXAMINATION: ${context.testName}
DEPARTMENT: ${context.departmentName}
DATE: ${new Intl.DateTimeFormat("en-PK", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date())}
${clinicalSection}
TECHNIQUE:
${technique}

FINDINGS:
${findings.join("\n")}

IMPRESSION:
${impression}

---
Report generated from keywords: ${context.keywords}
Note: This draft should be reviewed and finalized by the reporting physician/typist before release.
`.trim();
}
