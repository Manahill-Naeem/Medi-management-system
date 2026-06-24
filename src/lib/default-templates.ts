export const NORMAL_WHOLE_ABDOMEN_IMPRESSION =
  "A normal whole abdomen ultrasound report indicates all major abdominal organs are of normal size, shape, and echotexture, with no masses, stones, or abnormal fluid collections.";

export const WHOLE_ABDOMEN_USG_TEMPLATE = `MEDI HOSPITAL
ULTRASOUND WHOLE ABDOMEN
================================

Patient Name     : {{patient_name}}
Patient ID       : {{patient_number}}
Age / Sex        : {{patient_age}} Years / {{patient_gender}}
Date             : {{report_date}}
Examination      : {{test_name}}
Ref. Physician   : {{referring_doctor}}

CLINICAL NOTES:
{{clinical_notes}}

FINDINGS:
-------------

LIVER:
{{liver}}

GALL BLADDER:
{{gallbladder}}

PANCREAS:
{{pancreas}}

SPLEEN:
{{spleen}}

KIDNEYS:
{{kidneys}}

URINARY BLADDER:
{{bladder}}

OTHER FINDINGS:
{{others}}

IMPRESSION:
{{impression}}

---------------------------------------------
Reporting Sonologist: {{sonologist}}
Department: {{department_name}}`;

export const WHOLE_ABDOMEN_FIELD_DEFAULTS = {
  liver:
    "Liver is of normal size, shape and echotexture. No focal mass identified. Portal vein normal in caliber.",
  gallbladder:
    "Gall bladder is normal in distension with normal wall thickness. No stones or sludge seen.",
  pancreas:
    "Pancreas is of normal size, shape and echotexture. No duct dilatation.",
  spleen: "Spleen is of normal size, shape and echotexture.",
  kidneys:
    "Both kidneys are of normal size, shape and cortical echotexture. Cortico-medullary differentiation preserved. No stones or hydronephrosis.",
  bladder:
    "Urinary bladder is normal in distension with normal wall thickness. No stones.",
  others:
    "No abnormal fluid collection in the peritoneal cavity. Visualized bowel loops unremarkable.",
  impression: NORMAL_WHOLE_ABDOMEN_IMPRESSION,
};

export const WHOLE_ABDOMEN_KEYWORD_RULES = [
  {
    match: ["cholelithiasis", "gallstone", "gb stone", "calculus gb", "gall bladder stone"],
    field: "gallbladder",
    text: "Cholelithiasis noted measuring {{size}}. No significant wall thickening.",
  },
  {
    match: ["gb wall thickening", "cholecystitis", "thickened gb"],
    field: "gallbladder",
    text: "Gall bladder wall thickening noted. Cholecystitis cannot be excluded — correlate clinically.",
  },
  {
    match: ["fatty liver", "hepatic steatosis", "bright liver"],
    field: "liver",
    text: "Increased echogenicity of liver parenchyma suggestive of fatty infiltration (Grade I).",
  },
  {
    match: ["hepatomegaly", "enlarged liver", "liver enlarged"],
    field: "liver",
    text: "Liver enlarged in size measuring {{size}}. Echotexture otherwise unremarkable.",
  },
  {
    match: ["liver mass", "hepatic mass", "liver lesion"],
    field: "liver",
    text: "A space occupying lesion noted in liver measuring {{size}}. Further evaluation advised.",
  },
  {
    match: ["splenomegaly", "enlarged spleen"],
    field: "spleen",
    text: "Spleen enlarged in size measuring {{size}}.",
  },
  {
    match: ["renal calculus", "kidney stone", "nephrolithiasis", "calculus kidney"],
    field: "kidneys",
    text: "Calculus noted in {{side}} kidney measuring {{size}}. No hydronephrosis.",
  },
  {
    match: ["hydronephrosis", "pelvicalyceal dilatation", "pcd"],
    field: "kidneys",
    text: "Pelvicalyceal system dilatation (hydronephrosis) noted in {{side}} kidney.",
  },
  {
    match: ["polycystic", "renal cyst", "simple cyst"],
    field: "kidneys",
    text: "Simple cyst noted in {{side}} kidney measuring {{size}}.",
  },
  {
    match: ["pancreatitis", "enlarged pancreas"],
    field: "pancreas",
    text: "Pancreas bulky in size with altered echotexture — findings suggestive of pancreatitis.",
  },
  {
    match: ["ascites", "free fluid", "fluid in abdomen"],
    field: "others",
    text: "Free fluid noted in peritoneal cavity (ascites).",
  },
  {
    match: ["bladder calculus", "vesical calculus"],
    field: "bladder",
    text: "Calculus noted in urinary bladder measuring {{size}}.",
  },
  {
    match: ["bph", "enlarged prostate", "prostatomegaly"],
    field: "others",
    text: "Prostate enlarged in size — features suggestive of BPH.",
  },
  {
    match: ["cholelithiasis", "gallstone", "gb stone"],
    field: "impression",
    text: "Cholelithiasis as described. Clinical correlation advised.",
  },
  {
    match: ["fatty liver", "hepatic steatosis"],
    field: "impression",
    text: "Fatty infiltration of liver (Grade I). Clinical and lab correlation advised.",
  },
  {
    match: ["renal calculus", "kidney stone", "nephrolithiasis"],
    field: "impression",
    text: "Renal calculus as described. Adequate hydration advised.",
  },
  {
    match: ["normal", "all normal", "wnl", "within normal limits"],
    field: "impression",
    text: NORMAL_WHOLE_ABDOMEN_IMPRESSION,
  },
  {
    match: ["normal gb", "normal gallbladder", "gb normal"],
    field: "gallbladder",
    text: "Gall bladder is normal in distension with normal wall thickness. No stones or sludge seen.",
  },
  {
    match: ["normal liver", "liver normal"],
    field: "liver",
    text: "Liver is of normal size, shape and echotexture. No focal mass identified. Portal vein normal in caliber.",
  },
  {
    match: ["normal kidneys", "kidneys normal"],
    field: "kidneys",
    text: "Both kidneys are of normal size, shape and cortical echotexture. No stones or hydronephrosis.",
  },
];

export const WHOLE_ABDOMEN_QUICK_KEYWORDS = [
  "normal",
  "cholelithiasis 12mm",
  "gb stone 8mm",
  "fatty liver",
  "renal calculus right 5mm",
  "hydronephrosis left",
  "splenomegaly",
  "ascites",
  "gallbladder: cholelithiasis 10mm",
  "liver: normal, kidneys: calculus left 6mm",
];
