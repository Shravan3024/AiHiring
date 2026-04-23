"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { candidateApi } from "@/lib/api";
import PanelLayout from "@/components/shared/PanelLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  Phone, 
  MapPin, 
  GraduationCap, 
  BookOpen, 
  Briefcase, 
  Trophy, 
  Calendar, 
  Save, 
  Loader2,
  X,
  Sparkles,
  Search,
  FileText,
  Camera
} from "lucide-react";
import { toast } from "sonner";

export default function CandidateProfilePage() {
  const qc = useQueryClient();
  const [skillsInput, setSkillsInput] = useState("");
  const initializedRef = React.useRef<string | null>(null);

  const { data: overview, isLoading } = useQuery({
    queryKey: ["candidate-overview"],
    queryFn: () => candidateApi.getDashboard().then(r => r.data),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const [form, setForm] = useState({
    education: "",
    specialization: "",
    experience_years: 0,
    phone: "",
    location: "",
    skills: [] as string[],
    cgpa: 0,
    year_of_passout: 0,
    summary: ""
  });

  // Initialize form with data from overview
  useEffect(() => {
    if (overview?.candidate && initializedRef.current !== overview.candidate.id) {
      const c = overview.candidate;
      setForm(prev => {
        // Use a more stable initialization pattern
        const isDefault = (val: string | number | string[]) => 
          val === "" || val === 0 || val === "Not Provided" || (Array.isArray(val) && val.length === 0);
        
        return {
          education: isDefault(prev.education) ? (c.education === "Not Provided" ? "" : c.education) : prev.education,
          specialization: isDefault(prev.specialization) ? (c.specialization === "Not Provided" ? "" : c.specialization) : prev.specialization,
          experience_years: isDefault(prev.experience_years) ? (Number(c.experience_years) || 0) : prev.experience_years,
          phone: isDefault(prev.phone) ? (c.phone || "") : prev.phone,
          location: isDefault(prev.location) ? (c.location || "") : prev.location,
          skills: isDefault(prev.skills) ? (c.skills || []) : prev.skills,
          cgpa: isDefault(prev.cgpa) ? (Number(c.cgpa) || 0) : prev.cgpa,
          year_of_passout: isDefault(prev.year_of_passout) ? (Number(c.year_of_passout) || 0) : prev.year_of_passout,
          summary: isDefault(prev.summary) ? (c.summary || "") : prev.summary
        };
      });
      initializedRef.current = c.id;
    }
  }, [overview?.candidate?.id]);

  const autoFillFromResume = () => {
    if (!overview?.candidate) return;
    const c = overview.candidate;
    setForm(f => ({
      ...f,
      education: c.education !== "Not Provided" ? c.education : f.education,
      specialization: c.specialization !== "Not Provided" ? c.specialization : f.specialization,
      skills: c.skills?.length > 0 ? c.skills : f.skills,
      cgpa: c.cgpa ? Number(c.cgpa) : f.cgpa,
      year_of_passout: c.year_of_passout ? Number(c.year_of_passout) : f.year_of_passout,
      summary: c.summary || f.summary
    }));
    toast.success("Applied suggestions from resume", {
      description: "Summary and details updated from latest analysis."
    });
  };

  const updateMutation = useMutation({
    mutationFn: (data: typeof form) => candidateApi.updateProfile(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["candidate-overview"] });
      toast.success("Profile updated successfully");
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message || "Failed to update profile");
    }
  });

  const addSkill = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && skillsInput.trim()) {
      e.preventDefault();
      if (!form.skills.includes(skillsInput.trim())) {
        setForm(f => ({ ...f, skills: [...f.skills, skillsInput.trim()] }));
      }
      setSkillsInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setForm(f => ({ ...f, skills: f.skills.filter(s => s !== skill) }));
  };

  const uploadAvatarMutation = useMutation({
    mutationFn: (file: File) => {
      const fd = new FormData();
      // Field name must match backend multer config
      fd.append("profile_image", file);
      return candidateApi.uploadProfileImage(fd);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["candidate-overview"] });
      toast.success("Profile photo updated");
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message || "Failed to upload profile photo");
    },
  });

  if (isLoading) {
    return (
      <PanelLayout title="My Profile" allowedRoles={["CANDIDATE"]}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </PanelLayout>
    );
  }

  const candidate = overview?.candidate;

  const avatarSrc =
    candidate?.profile_image_path
      ? `http://localhost:5000${candidate.profile_image_path}`
      : null;

  return (
    <PanelLayout title="My Profile" allowedRoles={["CANDIDATE"]}>
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center gap-6 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="relative w-24 h-24 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              candidate?.name?.charAt(0) || "U"
            )}

            {/* Upload avatar */}
            <label
              className={`absolute bottom-1 right-1 p-2 rounded-full bg-white/90 hover:bg-white cursor-pointer transition-all ${
                uploadAvatarMutation.isPending ? "opacity-60 cursor-not-allowed" : ""
              }`}
              title="Upload profile photo"
            >
              <Camera className="w-4 h-4 text-blue-700" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadAvatarMutation.isPending}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  uploadAvatarMutation.mutate(file);
                  // allow re-selecting the same file later
                  e.currentTarget.value = "";
                }}
              />
            </label>

            {uploadAvatarMutation.isPending && (
              <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold text-gray-900">{candidate?.name}</h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2 text-gray-500 text-sm">
              <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {candidate?.email}</span>
              {form.phone && <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {form.phone}</span>}
              {form.location && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {form.location}</span>}
            </div>
          </div>
          <Button 
            className="w-full md:w-auto px-8 shadow-md active:scale-95 transition-all"
            onClick={() => updateMutation.mutate(form)}
            disabled={updateMutation.isPending}
          >
            {updateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save Changes
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Academic Info */}
          <Card className="shadow-sm">
            <CardHeader className="border-b bg-gray-50/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" /> Academic Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Highest Education</Label>
                <Input 
                  value={form.education} 
                  onChange={e => setForm(f => ({ ...f, education: e.target.value }))}
                  placeholder="e.g. B.Tech Computer Science"
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Specialization</Label>
                <Input 
                  value={form.specialization} 
                  onChange={e => setForm(f => ({ ...f, specialization: e.target.value }))}
                  placeholder="e.g. Artificial Intelligence"
                  className="h-11"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">CGPA / Percentage</Label>
                  <div className="relative">
                    <Input 
                      type="number" 
                      step="0.01"
                      value={form.cgpa === 0 ? "" : form.cgpa} 
                      onChange={e => setForm(f => ({ ...f, cgpa: parseFloat(e.target.value) || 0 }))}
                      placeholder="e.g. 8.5"
                      className="h-11 pr-10"
                    />
                    <Trophy className="absolute right-3 top-3 w-4 h-4 text-gray-300" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Year of Passout</Label>
                  <div className="relative">
                    <Input 
                      type="number" 
                      value={form.year_of_passout === 0 ? "" : form.year_of_passout} 
                      onChange={e => setForm(f => ({ ...f, year_of_passout: parseInt(e.target.value) || 0 }))}
                      placeholder="YYYY"
                      className="h-11 pr-10"
                    />
                    <Calendar className="absolute right-3 top-3 w-4 h-4 text-gray-300" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Info */}
          <Card className="shadow-sm">
            <CardHeader className="border-b bg-gray-50/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-600" /> Professional Experience
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Years of Experience</Label>
                <div className="relative">
                  <Input 
                    type="number" 
                    value={form.experience_years === 0 ? "" : form.experience_years} 
                    onChange={e => setForm(f => ({ ...f, experience_years: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                    className="h-11 pr-10"
                  />
                  <Briefcase className="absolute right-3 top-3 w-4 h-4 text-gray-300" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Current Location</Label>
                <div className="relative">
                  <Input 
                    value={form.location} 
                    onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                    placeholder="e.g. Mumbai, India"
                    className="h-11 pl-10"
                  />
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-300" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Phone Number</Label>
                <div className="relative">
                  <Input 
                    value={form.phone} 
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="Enter Your Phone Number"
                    className="h-11 pl-10"
                  />
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-300" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Professional Summary Section */}
        <Card className="shadow-sm">
          <CardHeader className="border-b bg-gray-50/50">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" /> Professional Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold italic text-gray-500">
                Briefly describe your career goals, key achievements, and what you bring to the table.
              </Label>
              <textarea
                value={form.summary}
                onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
                placeholder="Write a short summary about yourself..."
                className="w-full min-h-[120px] p-4 rounded-xl border border-gray-200 focus:border-black focus:ring-1 focus:ring-black transition-all text-sm leading-relaxed"
              />
              {candidate?.ai_summary && !form.summary && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                   <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider mb-1">AI Suggestion:</p>
                   <p className="text-xs text-blue-800 line-clamp-2">{candidate.ai_summary}</p>
                   <button 
                     onClick={() => setForm(f => ({ ...f, summary: candidate.ai_summary }))}
                     className="text-[10px] text-blue-700 font-bold underline mt-1 hover:text-blue-900"
                   >
                     Apply this summary
                   </button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Skills Section */}
        <Card className="shadow-sm">
          <CardHeader className="border-b bg-gray-50/50 flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" /> Skills & Expertise
            </CardTitle>
            {overview?.candidate?.resume_path && (
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs h-8 bg-blue-50 border-blue-200 text-blue-600 flex items-center gap-1.5"
                onClick={autoFillFromResume}
              >
                <Sparkles className="w-3 h-3" /> Auto-fill from Resume
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Type a skill and press Enter..." 
                className="pl-9 h-11"
                value={skillsInput}
                onChange={e => setSkillsInput(e.target.value)}
                onKeyDown={addSkill}
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              {form.skills.length === 0 && (
                <div className="w-full py-8 text-center border-2 border-dashed border-gray-100 rounded-xl">
                  <p className="text-gray-400 text-sm">No skills added yet. Type above to add.</p>
                </div>
              )}
              {form.skills.map(skill => (
                <Badge 
                  key={skill} 
                  className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 pl-3 pr-2 py-1.5 text-sm flex items-center gap-2 transition-all cursor-default"
                >
                  {skill}
                  <button onClick={() => removeSkill(skill)} className="hover:text-red-500 transition-colors">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Resume Status */}
        <Card className="bg-linear-to-r from-blue-600 to-indigo-700 text-white border-none shadow-lg overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 transform translate-x-1/4 -translate-y-1/4 opacity-10">
            <FileText className="w-48 h-48" />
          </div>
          <CardContent className="p-8 flex flex-col md:flex-row items-center gap-6 relative z-10">
            <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
              <FileText className="w-10 h-10" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-bold">Your Resume Information</h3>
              <p className="text-blue-100 mt-1">
                {candidate?.resume_path 
                  ? "We've parsed your resume to suggest profile details. You can override them above."
                  : "Upload a resume to automatically fill your profile details."}
              </p>
            </div>
            <Button 
              variant="secondary" 
              className="bg-white text-blue-600 hover:bg-blue-50 h-12 px-8 font-bold shadow-md shadow-blue-900/20"
              onClick={() => window.location.href = "/candidate/application"}
            >
              {candidate?.resume_path ? "Change Resume" : "Upload Now"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </PanelLayout>
  );
}
