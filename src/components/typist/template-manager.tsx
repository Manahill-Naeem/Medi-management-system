"use client";

import { useState, useTransition } from "react";
import { Plus, Save, Trash2 } from "lucide-react";
import {
  createTemplateAction,
  deleteTemplateAction,
  updateTemplateAction,
} from "@/actions/templates";
import type { KeywordRule, TemplateFieldDefaults } from "@/lib/template-engine";
import { WHOLE_ABDOMEN_USG_TEMPLATE } from "@/lib/default-templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Template = {
  id: string;
  name: string;
  testTypeId: string | null;
  testTypeName: string | null;
  content: string;
  fieldDefaults: TemplateFieldDefaults;
  keywordRules: KeywordRule[];
};

type TestType = { id: string; name: string };

const PLACEHOLDER_HELP = `Use {{patient_name}}, {{patient_age}}, {{patient_gender}}, {{report_date}}, {{patient_number}}, {{test_name}}, {{clinical_notes}}, {{referring_doctor}}, {{sonologist}}

Organ fields: {{liver}}, {{gallbladder}}, {{pancreas}}, {{spleen}}, {{kidneys}}, {{bladder}}, {{others}}, {{impression}}`;

export function TemplateManager({
  templates,
  testTypes,
}: {
  templates: Template[];
  testTypes: TestType[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(
    templates[0]?.id ?? null
  );
  const [isNew, setIsNew] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const selected = templates.find((t) => t.id === selectedId);

  const [form, setForm] = useState({
    name: selected?.name ?? "",
    testTypeId: selected?.testTypeId ?? "",
    content: selected?.content ?? WHOLE_ABDOMEN_USG_TEMPLATE,
    fieldDefaults: JSON.stringify(selected?.fieldDefaults ?? {}, null, 2),
    keywordRules: JSON.stringify(selected?.keywordRules ?? [], null, 2),
  });

  function loadTemplate(t: Template) {
    setSelectedId(t.id);
    setIsNew(false);
    setForm({
      name: t.name,
      testTypeId: t.testTypeId ?? "",
      content: t.content,
      fieldDefaults: JSON.stringify(t.fieldDefaults, null, 2),
      keywordRules: JSON.stringify(t.keywordRules, null, 2),
    });
    setMessage(null);
  }

  function startNew() {
    setSelectedId(null);
    setIsNew(true);
    setForm({
      name: "",
      testTypeId: "",
      content: WHOLE_ABDOMEN_USG_TEMPLATE,
      fieldDefaults: JSON.stringify({}, null, 2),
      keywordRules: JSON.stringify([], null, 2),
    });
    setMessage(null);
  }

  function handleSave() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("name", form.name);
      formData.set("testTypeId", form.testTypeId);
      formData.set("content", form.content);
      formData.set("fieldDefaults", form.fieldDefaults);
      formData.set("keywordRules", form.keywordRules);

      if (isNew) {
        const result = await createTemplateAction(formData);
        if (result.error) setMessage(result.error);
        else setMessage("Template created successfully!");
        return;
      }

      if (!selectedId) return;
      formData.set("id", selectedId);
      const result = await updateTemplateAction(formData);
      if (result.error) setMessage(result.error);
      else setMessage("Template saved successfully!");
    });
  }

  function handleDelete() {
    if (!selectedId || !confirm("Delete this template?")) return;
    startTransition(async () => {
      await deleteTemplateAction(selectedId);
      setSelectedId(null);
      setMessage("Template removed.");
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <Card className="lg:col-span-3">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">My Formats</CardTitle>
          <Button size="sm" variant="outline" onClick={startNew}>
            <Plus className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => loadTemplate(t)}
              className={`w-full rounded-lg border p-3 text-left ${
                selectedId === t.id && !isNew
                  ? "border-teal-500 bg-teal-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <p className="text-sm font-medium">{t.name}</p>
              {t.testTypeName && (
                <Badge variant="info" className="mt-1">
                  {t.testTypeName}
                </Badge>
              )}
            </button>
          ))}
        </CardContent>
      </Card>

      <Card className="lg:col-span-9">
        <CardHeader>
          <CardTitle>
            {isNew ? "New Report Format" : "Edit Report Format"}
          </CardTitle>
          <p className="text-sm text-slate-500">
            Apna poora report format yahan paste karein. Organ fields ke liye {"{{liver}}"}, {"{{gallbladder}}"} waghera use karein.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Template Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Whole Abdomen USG - My Format"
            />
            <Select
              label="Link to Test Type (optional)"
              value={form.testTypeId}
              onChange={(e) => setForm({ ...form, testTypeId: e.target.value })}
              options={[
                { value: "", label: "Any test type" },
                ...testTypes.map((t) => ({ value: t.id, label: t.name })),
              ]}
            />
          </div>

          <Textarea
            label="Report Format (your full template)"
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            rows={14}
            className="font-mono text-xs"
          />

          <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
            {PLACEHOLDER_HELP}
          </div>

          <Textarea
            label="Normal Default Values (JSON — har organ ki normal line)"
            value={form.fieldDefaults}
            onChange={(e) => setForm({ ...form, fieldDefaults: e.target.value })}
            rows={10}
            className="font-mono text-xs"
            placeholder='{"liver": "Normal...", "gallbladder": "Normal..."}'
          />

          <Textarea
            label="Keyword Rules (JSON — keyword se auto change)"
            value={form.keywordRules}
            onChange={(e) => setForm({ ...form, keywordRules: e.target.value })}
            rows={8}
            className="font-mono text-xs"
            placeholder='[{"match":["cholelithiasis"],"field":"gallbladder","text":"Cholelithiasis {{size}}..."}]'
          />

          {message && (
            <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              {message}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleSave} disabled={isPending}>
              <Save className="h-4 w-4" />
              {isPending ? "Saving..." : "Save Format"}
            </Button>
            {!isNew && selectedId && (
              <Button variant="danger" onClick={handleDelete} disabled={isPending}>
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
