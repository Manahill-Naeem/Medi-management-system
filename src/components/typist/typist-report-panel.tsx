"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { FileText, Sparkles, Wand2 } from "lucide-react";
import Link from "next/link";
import {
  generateTemplateReportAction,
  updateReportAction,
} from "@/actions/templates";
import { applyKeywordRules, getFieldLabels, parseJsonField } from "@/lib/template-engine";
import type { KeywordRule, TemplateFieldDefaults } from "@/lib/template-engine";
import { WHOLE_ABDOMEN_QUICK_KEYWORDS } from "@/lib/default-templates";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";

type Template = {
  id: string;
  name: string;
  testTypeId: string | null;
  testTypeName: string | null;
  content: string;
  fieldDefaults: TemplateFieldDefaults;
  keywordRules: KeywordRule[];
};

type TestOrder = {
  id: string;
  orderNumber: string;
  status: string;
  clinicalNotes: string | null;
  createdAt: Date;
  testTypeId: string;
  patient: { name: string; patientNumber: string; age: number };
  testType: { id: string; name: string };
  department: { name: string };
  report: {
    id: string;
    templateId: string | null;
    keywords: string;
    fieldValues: string;
    content: string;
    status: string;
  } | null;
};

export function TypistReportPanel({
  testOrders,
  templates,
}: {
  testOrders: TestOrder[];
  templates: Template[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [templateId, setTemplateId] = useState<string>(
    templates[0]?.id ?? ""
  );
  const [keywords, setKeywords] = useState("");
  const [fieldValues, setFieldValues] = useState<TemplateFieldDefaults>({});
  const [content, setContent] = useState("");
  const [reportId, setReportId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selected = testOrders.find((o) => o.id === selectedId);
  const selectedTemplate = templates.find((t) => t.id === templateId);

  const fieldLabels = useMemo(() => {
    if (!selectedTemplate) return {};
    return getFieldLabels(selectedTemplate.fieldDefaults);
  }, [selectedTemplate]);

  function pickTemplateForOrder(order: TestOrder) {
    const matched = templates.find((t) => t.testTypeId === order.testTypeId);
    return matched?.id ?? templates[0]?.id ?? "";
  }

  function selectOrder(order: TestOrder) {
    setSelectedId(order.id);
    const tplId = order.report?.templateId ?? pickTemplateForOrder(order);
    setTemplateId(tplId);
    setKeywords(order.report?.keywords ?? "");
    setContent(order.report?.content ?? "");

    const tpl = templates.find((t) => t.id === tplId);
    const savedFields = order.report?.fieldValues
      ? parseJsonField<TemplateFieldDefaults>(order.report.fieldValues, {})
      : {};

    setFieldValues(
      Object.keys(savedFields).length > 0
        ? savedFields
        : { ...(tpl?.fieldDefaults ?? {}) }
    );
    setReportId(order.report?.id ?? null);
    setMessage(null);
  }

  useEffect(() => {
    if (testOrders[0] && templates.length > 0 && !selectedId) {
      selectOrder(testOrders[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testOrders, templates, selectedId]);

  function handleTemplateChange(id: string) {
    setTemplateId(id);
    const tpl = templates.find((t) => t.id === id);
    if (tpl) {
      setFieldValues({ ...tpl.fieldDefaults });
    }
  }

  function applyKeywordsToFields() {
    if (!selectedTemplate || !keywords.trim()) return;

    const updated = applyKeywordRules(
      keywords,
      selectedTemplate.fieldDefaults,
      selectedTemplate.keywordRules
    );

    setFieldValues((prev) => ({ ...updated, ...prev }));
    setMessage("Fields updated from keywords. Click Generate Report to preview.");
  }

  function updateField(key: string, value: string) {
    setFieldValues((prev) => ({ ...prev, [key]: value }));
  }

  function generateReport() {
    if (!selectedId || !templateId) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.set("testOrderId", selectedId);
      formData.set("templateId", templateId);
      formData.set("keywords", keywords);
      formData.set("fieldValues", JSON.stringify(fieldValues));

      const result = await generateTemplateReportAction(formData);
      if (result.error) {
        setMessage(result.error);
      } else if (result.success) {
        setContent(result.content ?? "");
        setReportId(result.reportId ?? null);
        if (result.fieldValues) setFieldValues(result.fieldValues);
        setMessage("Report generated in your template format. Review and finalize.");
      }
    });
  }

  function saveReport(status: "DRAFT" | "FINAL") {
    if (!reportId || !content.trim()) {
      setMessage("Generate a report first before saving.");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("reportId", reportId);
      formData.set("content", content);
      formData.set("status", status);
      formData.set("fieldValues", JSON.stringify(fieldValues));
      await updateReportAction(formData);
      setMessage(
        status === "FINAL"
          ? "Report finalized and released."
          : "Draft saved successfully."
      );
    });
  }

  if (templates.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-slate-600">No report templates found.</p>
          <Link href="/dashboard/typist/templates">
            <Button className="mt-4">Create Your Report Format</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          Apna format select karein, keywords ya organ values dalen — report khud usi format mein ban jayegi
        </p>
        <Link href="/dashboard/typist/templates">
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4" />
            Manage Formats
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Pending Reports</CardTitle>
          </CardHeader>
          <CardContent className="max-h-[520px] space-y-2 overflow-y-auto">
            {testOrders.length === 0 ? (
              <p className="text-sm text-slate-500">No tests awaiting reports.</p>
            ) : (
              testOrders.map((order) => (
                <button
                  key={order.id}
                  onClick={() => selectOrder(order)}
                  className={`w-full rounded-lg border p-3 text-left transition-colors ${
                    selectedId === order.id
                      ? "border-teal-500 bg-teal-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{order.orderNumber}</span>
                    <Badge
                      variant={
                        order.report?.status === "FINAL" ? "success" : "warning"
                      }
                    >
                      {order.report?.status ?? "NEW"}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-700">{order.patient.name}</p>
                  <p className="text-xs text-teal-700">{order.testType.name}</p>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Wand2 className="h-4 w-4 text-teal-600" />
              Keywords & Fields
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selected ? (
              <p className="text-sm text-slate-500">Select a patient test first.</p>
            ) : (
              <>
                <div className="rounded-lg bg-slate-50 p-3 text-sm">
                  <p>
                    <strong>{selected.patient.name}</strong> (
                    {selected.patient.patientNumber})
                  </p>
                  <p>{selected.testType.name}</p>
                  <p className="text-xs text-slate-500">
                    {formatDateTime(selected.createdAt)}
                  </p>
                </div>

                <Select
                  label="Report Format (Template)"
                  value={templateId}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  options={templates.map((t) => ({
                    value: t.id,
                    label: t.testTypeName
                      ? `${t.name} (${t.testTypeName})`
                      : t.name,
                  }))}
                />

                <Textarea
                  label="Quick Keywords / Changes"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  rows={2}
                  placeholder="e.g. cholelithiasis 12mm, fatty liver, kidneys normal"
                />

                <div className="flex flex-wrap gap-1.5">
                  {WHOLE_ABDOMEN_QUICK_KEYWORDS.slice(0, 6).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setKeywords(s)}
                      className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700 hover:bg-teal-100"
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={applyKeywordsToFields}
                  disabled={!keywords.trim()}
                >
                  Apply Keywords to Fields
                </Button>

                <div className="space-y-3 border-t border-slate-100 pt-4">
                  <p className="text-sm font-medium text-slate-700">
                    Organ / Section Values (edit directly)
                  </p>
                  <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
                    {Object.entries(fieldLabels).map(([key, label]) => (
                      <Textarea
                        key={key}
                        label={label}
                        value={fieldValues[key] ?? ""}
                        onChange={(e) => updateField(key, e.target.value)}
                        rows={key === "impression" ? 2 : 2}
                        className="text-xs"
                      />
                    ))}
                  </div>
                </div>

                <Button
                  onClick={generateReport}
                  disabled={isPending || !templateId}
                  className="w-full"
                >
                  <Sparkles className="h-4 w-4" />
                  {isPending ? "Generating..." : "Generate Report in My Format"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-5">
          <CardHeader>
            <CardTitle className="text-base">Generated Report Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={24}
              className="font-mono text-xs leading-relaxed"
              placeholder="Your formatted report will appear here..."
            />

            {message && (
              <div className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-800">
                {message}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                onClick={() => saveReport("DRAFT")}
                disabled={isPending || !content}
              >
                Save Draft
              </Button>
              <Button
                onClick={() => saveReport("FINAL")}
                disabled={isPending || !content}
              >
                Finalize Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
