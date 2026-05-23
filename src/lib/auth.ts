// import { betterAuth } from "better-auth";
// import { drizzleAdapter } from "better-auth/adapters/drizzle";
// import { bearer } from "better-auth/plugins";
// import { NextRequest } from 'next/server';
// import { headers } from "next/headers"
// import { db } from "@/db";
 
// export const auth = betterAuth({
// 	database: drizzleAdapter(db, {
// 		provider: "sqlite",
// 	}),
// 	emailAndPassword: {    
// 		enabled: true
// 	},
// 	plugins: [bearer()]
// });

// // Session validation helper
// export async function getCurrentUser(request: NextRequest) {
//   const session = await auth.api.getSession({ headers: await headers() });
//   return session?.user || null;
// }

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer } from "better-auth/plugins";
import { NextRequest } from "next/server";
import { headers } from "next/headers";
import { db } from "@/db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // TEMPORARILY DISABLED until email delivery is fixed
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "ORG_ADMIN",
      },
    },
  },

  // Removed SUPER_ADMIN detection and assignment. All new users are ORG_ADMIN by default.

  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      console.log("[auth] Sending verification email to:", user.email, "with URL:", url);
      
      const { sendVerificationEmail } = await import("@/lib/email");
      
      try {
        const result = await sendVerificationEmail(user.email, url);
        
        if (!result.success) {
          console.error("[auth] Failed to send verification email:", result.error);
          throw new Error(`Failed to send verification email: ${result.error}`);
        }
        
        console.log("[auth] Verification email sent successfully:", result.data?.id);
      } catch (error) {
        console.error("[auth] Error in sendVerificationEmail:", error);
        throw error;
      }
    },
    sendOnSignUp: true,
  },

  plugins: [bearer()],

  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3003",
    "http://localhost:3001",
    "http://localhost:3002",
    "https://smartwastesite.vercel.app",
    "https://waste-wizard-smart-waste-management.vercel.app",
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? "",
    process.env.NEXT_PUBLIC_SITE_URL ?? "",
  ].filter(Boolean),
});

// Session helper
export async function getCurrentUser(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user || null;
}