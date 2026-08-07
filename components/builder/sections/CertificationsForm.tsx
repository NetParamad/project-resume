"use client";

import { useTranslations } from "next-intl";
import { useResumeStore } from "@/lib/store/resume-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

export function CertificationsForm() {
  const t = useTranslations("builder.certifications");
  const certs = useResumeStore((s) => s.data.certifications);
  const add = useResumeStore((s) => s.addCertification);
  const update = useResumeStore((s) => s.updateCertification);
  const remove = useResumeStore((s) => s.removeCertification);

  return (
    <Card>
      <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">{t("title")}</CardTitle>
        <Button variant="outline" size="sm" onClick={add}>
          <Plus size={14} className="mr-1" />
          {t("add")}
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {certs.map((cert) => (
          <div key={cert.id} className="border border-border rounded-md p-3 space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">{t("name")}</Label>
                <Input
                  value={cert.name}
                  onChange={(e) => update(cert.id, { name: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{t("issuer")}</Label>
                <Input
                  value={cert.issuer}
                  onChange={(e) => update(cert.id, { issuer: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div className="w-full max-w-48 space-y-1">
                <Label className="text-xs">{t("date")}</Label>
                <Input
                  type="month"
                  value={cert.date}
                  onChange={(e) => update(cert.id, { date: e.target.value })}
                  className="h-8 text-sm"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => remove(cert.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
