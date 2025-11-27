import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const fetchProfile = async () => {
  const res = await fetch("/api/auth/me", { credentials: "include" });
  if (res.status === 401) throw new Error("auth");
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
};

const updateProfile = async (payload) => {
  const res = await fetch("/api/auth/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (res.status === 401) throw new Error("auth");
  if (!res.ok) throw new Error("Failed to update profile");
  return res.json();
};

export default function Profile() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: profile } = useQuery({
    queryKey: ["me"],
    queryFn: fetchProfile,
    retry: false,
    onError: (err) => {
      if (err.message === "auth") router.push("/login");
    },
  });

  const [template, setTemplate] = useState("classic");

  useEffect(() => {
    if (profile?.invoice_template) setTemplate(profile.invoice_template);
  }, [profile]);

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
      toast.success("Profile updated");
      setTemplate(data.invoice_template);
    },
    onError: (err) => {
      if (err.message === "auth") router.push("/login");
      else toast.error(err.message);
    },
  });

  const handleSave = () => {
    mutation.mutate({ invoice_template: template });
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-gray-600 text-sm">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-lg font-semibold text-gray-900">
                {profile?.email || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Invoice Structure
              </p>
              <Select value={template} onValueChange={setTemplate}>
                <SelectTrigger className="w-60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="classic">Classic</SelectItem>
                  <SelectItem value="compact">Compact</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-2">
                Choose how your invoices are laid out. Applies to new invoices and preview.
              </p>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                disabled={mutation.isPending}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {mutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
