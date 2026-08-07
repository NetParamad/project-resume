"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useResumeStore } from "@/lib/store/resume-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { uploadAvatar, withAvatarOptimizations } from "@/lib/imagekit-client";

export function PersonalInfoForm() {
  const t = useTranslations("builder.personalInfo");
  const personalInfo = useResumeStore((s) => s.data.personalInfo);
  const updatePersonalInfo = useResumeStore((s) => s.updatePersonalInfo);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [removingBg, setRemovingBg] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadAvatar(file);
      updatePersonalInfo({ avatar: withAvatarOptimizations(url) });
    } catch (err) {
      console.error("Failed to upload image:", err);
    } finally {
      setUploading(false);
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleRemoveBg = () => {
    if (!personalInfo.avatar) return;
    setRemovingBg(true);
    const [baseUrl, query = ""] = personalInfo.avatar.split("?");
    const params = new URLSearchParams(query);
    const tr = (params.get("tr") ?? "").split(",").filter(Boolean);
    const hasBgRemoved = tr.includes("e-bgremove");
    const nextTr = hasBgRemoved
      ? tr.filter((p) => p !== "e-bgremove")
      : [...tr, "e-bgremove"];
    if (nextTr.length) {
      params.set("tr", nextTr.join(","));
    } else {
      params.delete("tr");
    }
    const nextQuery = params.toString();
    updatePersonalInfo({ avatar: nextQuery ? `${baseUrl}?${nextQuery}` : baseUrl });
  };

  const handleRemovePhoto = () => {
    updatePersonalInfo({ avatar: "" });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden border border-border bg-muted shrink-0 flex items-center justify-center">
            {personalInfo.avatar ? (
              <img
                src={personalInfo.avatar}
                alt={t("avatarAlt")}
                className="w-full h-full object-cover"
                onLoad={() => setRemovingBg(false)}
                onError={() => setRemovingBg(false)}
              />
            ) : (
              <ImagePlus size={24} className="text-muted-foreground" />
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <div className="flex gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? <Loader2 size={12} className="mr-1 animate-spin" /> : null}
                {t("uploadPhoto")}
              </Button>
              {personalInfo.avatar && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={handleRemoveBg}
                    disabled={removingBg}
                  >
                    {removingBg ? <Loader2 size={12} className="mr-1 animate-spin" /> : null}
                    {t("removeBg")}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs text-destructive"
                    onClick={handleRemovePhoto}
                  >
                    <Trash2 size={12} />
                  </Button>
                </>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="fullName" className="text-xs">{t("fullName")}</Label>
            <Input
              id="fullName"
              value={personalInfo.fullName}
              onChange={(e) => updatePersonalInfo({ fullName: e.target.value })}
              placeholder={t("fullNamePlaceholder")}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="occupation" className="text-xs">{t("occupation")}</Label>
            <Input
              id="occupation"
              value={personalInfo.occupation}
              onChange={(e) => updatePersonalInfo({ occupation: e.target.value })}
              placeholder={t("occupationPlaceholder")}
              className="h-8 text-sm"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="email" className="text-xs">{t("email")}</Label>
            <Input
              id="email"
              type="email"
              value={personalInfo.email}
              onChange={(e) => updatePersonalInfo({ email: e.target.value })}
              placeholder={t("emailPlaceholder")}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="phone" className="text-xs">{t("phone")}</Label>
            <Input
              id="phone"
              value={personalInfo.phone}
              onChange={(e) => updatePersonalInfo({ phone: e.target.value })}
              placeholder={t("phonePlaceholder")}
              className="h-8 text-sm"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="location" className="text-xs">{t("location")}</Label>
            <Input
              id="location"
              value={personalInfo.location}
              onChange={(e) => updatePersonalInfo({ location: e.target.value })}
              placeholder={t("locationPlaceholder")}
              className="h-8 text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="linkedin" className="text-xs">{t("linkedin")}</Label>
            <Input
              id="linkedin"
              value={personalInfo.linkedin}
              onChange={(e) => updatePersonalInfo({ linkedin: e.target.value })}
              placeholder={t("linkedinPlaceholder")}
              className="h-8 text-sm"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="portfolio" className="text-xs">{t("portfolio")}</Label>
            <Input
              id="portfolio"
              value={personalInfo.portfolio}
              onChange={(e) => updatePersonalInfo({ portfolio: e.target.value })}
              placeholder={t("portfolioPlaceholder")}
              className="h-8 text-sm"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
