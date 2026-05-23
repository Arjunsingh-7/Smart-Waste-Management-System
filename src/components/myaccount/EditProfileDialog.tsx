"use client";

import React, { useState, useEffect } from "react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function EditProfileDialog({ open, onOpenChange, initialProfile, userId, onSaved }: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initialProfile: any;
  userId: string;
  onSaved: (updated: any) => void;
}) {
  const [org, setOrg] = useState(initialProfile?.organizationName || "");
  const [category, setCategory] = useState(initialProfile?.category || "");
  const [mobile, setMobile] = useState(initialProfile?.mobileNumber || "");
  const [name, setName] = useState(initialProfile?.name || "");
  const [loading, setLoading] = useState(false);
  const categories = ["College","Hospital","Cafe","Airport","Municipal","School","Office","Restaurant","Others"];

  useEffect(() => {
    setOrg(initialProfile?.organizationName || "");
    setCategory(initialProfile?.category || "");
    setMobile(initialProfile?.mobileNumber || "");
    setName(initialProfile?.name || "");
  }, [initialProfile]);

  const handleSave = async () => {
    // basic validation
    if (!org.trim()) return toast.error("Organization name is required");
    if (!category) return toast.error("Category is required");
    if (!/^[\d\s+-]{7,15}$/.test(mobile)) return toast.error("Enter a valid phone number");

    setLoading(true);
    try {
      // Update profile table
      const profileResp = await fetch('/api/user-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('bearer_token')}` },
        body: JSON.stringify({ user_id: userId, organization_name: org, category: category, mobile_number: mobile }),
      });

      if (!profileResp.ok) {
        const err = await profileResp.json().catch(() => ({}));
        throw new Error(err?.error || 'Failed to update profile');
      }

      const updatedProfile = await profileResp.json();

      // Also update user name if provided
      if (name && name.trim()) {
        const userResp = await fetch('/api/user', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('bearer_token')}` },
          body: JSON.stringify({ user_id: userId, name: name.trim() }),
        });
        if (!userResp.ok) {
          // non-fatal
          console.warn('Failed to update user name');
        }
      }

      toast.success('Profile updated');
      onSaved({ ...updatedProfile, name });
      onOpenChange(false);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Edit Profile</AlertDialogTitle>
          <AlertDialogDescription>Update your account and organization details.</AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-3 mt-2">
          <label className="text-xs text-muted-foreground">Full Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />

          <label className="text-xs text-muted-foreground">Organization Name</label>
          <Input value={org} onChange={(e) => setOrg(e.target.value)} placeholder="Organization" />

          <label className="text-xs text-muted-foreground">Category</label>
          <select className="w-full p-2 rounded-md bg-input border border-border" value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Select category</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <label className="text-xs text-muted-foreground">Phone Number</label>
          <Input value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="+911234567890" />
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline">Cancel</Button>
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleSave} className="ml-2" disabled={loading}>{loading ? 'Saving…' : 'Save Changes'}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
