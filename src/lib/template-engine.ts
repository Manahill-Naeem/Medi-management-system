export type TemplateFieldDefaults = Record<string, string>;

export type KeywordRule = {
  match: string[];
  field: string;
  text: string;
};

export type ReportTemplateData = {
  id: string;
  name: string;
  testTypeId: string | null;
  content: string;
  fieldDefaults: TemplateFieldDefaults;
  keywordRules: KeywordRule[];
};

export type PatientContext = {
  patientName: string;
  patientNumber: string;
  patientAge: number;
  patientGender: string;
  testName: string;
  departmentName: string;
  clinicalNotes?: string | null;
  referringDoctor?: string;
  sonologist?: string;
};

export type GenerateFromTemplateInput = {
  template: ReportTemplateData;
  patient: PatientContext;
  keywords: string;
  fieldValues?: TemplateFieldDefaults;
};

export function parseJsonField<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

function genderLabel(gender: string) {
  if (gender === "MALE") return "Male";
  if (gender === "FEMALE") return "Female";
  return "Other";
}

function formatReportDate() {
  return new Intl.DateTimeFormat("en-PK", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

function extractSize(text: string): string | null {
  const match = text.match(/(\d+(?:\.\d+)?)\s*(?:mm|cm|ml|cc)\b/i);
  return match ? match[0] : null;
}

function extractSide(text: string): string | null {
  if (/\bleft\b/i.test(text)) return "left";
  if (/\bright\b/i.test(text)) return "right";
  if (/\bbilateral\b/i.test(text)) return "bilateral";
  return null;
}

function applyRuleText(text: string, source: string): string {
  const size = extractSize(source);
  const side = extractSide(source);

  let result = text;
  if (size) {
    result = result.replace(/\{\{size\}\}/gi, size);
  } else {
    result = result.replace(/\{\{size\}\}/gi, "");
  }

  if (side) {
    result = result.replace(/\{\{side\}\}/gi, side);
  } else {
    result = result.replace(/\{\{side\}\}/gi, "");
  }

  return result.replace(/\s{2,}/g, " ").trim();
}

function parseFieldOverrides(keywords: string): TemplateFieldDefaults {
  const overrides: TemplateFieldDefaults = {};
  const parts = keywords.split(/[,;\n]+/).map((p) => p.trim()).filter(Boolean);

  for (const part of parts) {
    const colonMatch = part.match(/^([a-z_]+)\s*:\s*(.+)$/i);
    if (colonMatch) {
      overrides[colonMatch[1].toLowerCase()] = colonMatch[2].trim();
    }
  }

  return overrides;
}

export function applyKeywordRules(
  keywords: string,
  defaults: TemplateFieldDefaults,
  rules: KeywordRule[]
): TemplateFieldDefaults {
  const fields = { ...defaults };
  const overrides = parseFieldOverrides(keywords);
  Object.assign(fields, overrides);

  const keywordParts = keywords
    .split(/[,;\n]+/)
    .map((k) => k.trim())
    .filter(Boolean);

  for (const part of keywordParts) {
    if (/^[a-z_]+\s*:/i.test(part)) continue;

    const partLower = part.toLowerCase();

    for (const rule of rules) {
      const matched = rule.match.some(
        (m) =>
          partLower.includes(m.toLowerCase()) ||
          m.toLowerCase().includes(partLower)
      );

      if (matched) {
        fields[rule.field] = applyRuleText(rule.text, part);
      }
    }
  }

  if (
    keywordParts.some((p) => /^normal$/i.test(p) || /^all normal$/i.test(p)) &&
    Object.keys(overrides).length === 0
  ) {
    return { ...defaults };
  }

  return fields;
}

export function buildTemplateVariables(
  patient: PatientContext,
  fields: TemplateFieldDefaults
): Record<string, string> {
  return {
    patient_name: patient.patientName,
    patient_number: patient.patientNumber,
    patient_age: String(patient.patientAge),
    patient_gender: genderLabel(patient.patientGender),
    test_name: patient.testName,
    department_name: patient.departmentName,
    report_date: formatReportDate(),
    clinical_notes: patient.clinicalNotes ?? "Not provided",
    referring_doctor: patient.referringDoctor ?? "Self / OPD",
    sonologist: patient.sonologist ?? "Reporting Sonologist",
    ...fields,
  };
}

export function renderTemplate(
  templateContent: string,
  variables: Record<string, string>
): string {
  let output = templateContent;

  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, "gi");
    output = output.replace(regex, value || "");
  }

  output = output.replace(/\{\{[^}]+\}\}/g, "");
  return output.replace(/\n{3,}/g, "\n\n").trim();
}

export function generateFromTemplate(input: GenerateFromTemplateInput): {
  content: string;
  fieldValues: TemplateFieldDefaults;
} {
  const afterKeywords = applyKeywordRules(
    input.keywords,
    input.template.fieldDefaults,
    input.template.keywordRules
  );

  const fieldValues = {
    ...afterKeywords,
    ...(input.fieldValues ?? {}),
  };

  const variables = buildTemplateVariables(input.patient, fieldValues);
  const content = renderTemplate(input.template.content, variables);

  return { content, fieldValues };
}

export function getFieldLabels(defaults: TemplateFieldDefaults): Record<string, string> {
  const labels: Record<string, string> = {
    liver: "Liver",
    gallbladder: "Gall Bladder",
    pancreas: "Pancreas",
    spleen: "Spleen",
    kidneys: "Kidneys",
    bladder: "Urinary Bladder",
    others: "Others",
    impression: "Impression",
    prostate: "Prostate",
    uterus: "Uterus",
    ovaries: "Ovaries",
    appendix: "Appendix",
    findings: "Findings",
    technique: "Technique",
  };

  return Object.keys(defaults).reduce(
    (acc, key) => {
      acc[key] =
        labels[key] ??
        key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      return acc;
    },
    {} as Record<string, string>
  );
}
