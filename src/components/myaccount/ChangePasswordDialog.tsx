// "use client";

// import React, { useState } from "react";
// import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { toast } from "sonner";
// import { authClient } from "@/lib/auth-client";

// export default function ChangePasswordDialog({ open, onOpenChange, userEmail }: { open: boolean; onOpenChange: (v: boolean) => void; userEmail: string; }) {
//   const [current, setCurrent] = useState("");
//   const [next, setNext] = useState("");
//   const [confirm, setConfirm] = useState("");
//   const [loading, setLoading] = useState(false);

//   const validate = () => {
//     if (!current) return "Enter current password";
//     if (!next || next.length < 8) return "New password must be at least 8 characters";
//     if (next !== confirm) return "Passwords do not match";
//     return null;
//   };

//   const handleChange = async () => {
//     const v = validate();
//     if (v) return toast.error(v);
//     setLoading(true);
//     try {
//       // Try using client SDK method if available
//       const anyClient: any = authClient as any;
//       if (anyClient?.changePassword) {
//         const res = await anyClient.changePassword({ email: userEmail, currentPassword: current, newPassword: next });
//         if (res?.error) throw new Error(res.error.message || 'Password change failed');
//         toast.success('Password changed');
//         onOpenChange(false);
//         return;
//       }

//       // Fallback: call server endpoint (not implemented server-side)
//       const resp = await fetch('/api/change-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: userEmail, currentPassword: current, newPassword: next }) });
//       if (!resp.ok) {
//         const err = await resp.json().catch(() => ({}));
//         throw new Error(err?.error || 'Password change not available');
//       }
//       toast.success('Password changed');
//       onOpenChange(false);
//     } catch (e: any) {
//       console.error(e);
//       toast.error(e.message || 'Failed to change password');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <AlertDialog open={open} onOpenChange={onOpenChange}>
//       <AlertDialogContent className="max-w-md">
//         <AlertDialogHeader>
//           <AlertDialogTitle>Change Password</AlertDialogTitle>
//           <AlertDialogDescription>Update your account password. For security, your current password is required.</AlertDialogDescription>
//         </AlertDialogHeader>

//         <div className="space-y-3 mt-2">
//           <label className="text-xs text-muted-foreground">Current Password</label>
//           <Input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} />
//           <label className="text-xs text-muted-foreground">New Password</label>
//           <Input type="password" value={next} onChange={(e) => setNext(e.target.value)} />
//           <label className="text-xs text-muted-foreground">Confirm New Password</label>
//           <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
//         </div>

//         <AlertDialogFooter>
//           <AlertDialogCancel asChild>
//             <Button variant="outline">Cancel</Button>
//           </AlertDialogCancel>
//           <AlertDialogAction onClick={handleChange} className="ml-2" disabled={loading}>{loading ? 'Updating…' : 'Change Password'}</AlertDialogAction>
//         </AlertDialogFooter>
//       </AlertDialogContent>
//     </AlertDialog>
//   );
// }
