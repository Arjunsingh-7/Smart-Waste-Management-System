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
  },

  plugins: [bearer()],

  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? "",
  ].filter(Boolean),
});

// Session helper
export async function getCurrentUser(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user || null;
}