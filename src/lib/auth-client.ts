"use client"
import { createAuthClient } from "better-auth/react"
import { inferAdditionalFields } from "better-auth/client/plugins"
import { useEffect, useState } from "react"
import type { auth } from "./auth"

export const authClient = createAuthClient({
   baseURL: typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL,
   plugins: [
      inferAdditionalFields<typeof auth>()
   ],
   fetchOptions: {
      credentials: 'include',
      onRequest: (ctx) => {
         if (typeof window !== 'undefined') {
            const token = localStorage.getItem("bearer_token");
            if (token && token !== "null" && token !== "undefined") {
               ctx.headers.set("Authorization", `Bearer ${token}`);
            }
         }
      },
      onSuccess: (ctx) => {
          const authToken = ctx.response.headers.get("set-auth-token")
          // Store the token securely (e.g., in localStorage)
          if(authToken){
            // Split token at "." and take only the first part
            const tokenPart = authToken.includes('.') ? authToken.split('.')[0] : authToken;
            localStorage.setItem("bearer_token", tokenPart);
          }
      }
   }
});

type SessionData = ReturnType<typeof authClient.useSession>

export function useSession(): SessionData {
   const [session, setSession] = useState<any>(null);
   const [isPending, setIsPending] = useState(true);
   const [error, setError] = useState<any>(null);

   const refetch = () => {
      setIsPending(true);
      setError(null);
      fetchSession();
   };

   const fetchSession = async () => {
      try {
         const token = typeof window !== 'undefined' ? localStorage.getItem("bearer_token") : null;
         const hasToken = token && token !== "null" && token !== "undefined";

         const res = await authClient.getSession({
            fetchOptions: hasToken ? {
               auth: {
                  type: "Bearer",
                  token: token,
               },
            } : {},
         });
         setSession(res?.data || null);
         setError(null);
      } catch (err) {
         setSession(null);
         setError(err);
      } finally {
         setIsPending(false);
      }
   };

   useEffect(() => {
      fetchSession();
   }, []);

   return { data: session, isPending, error, refetch };
}