"use client";

import { useState } from "react";
import { toast } from "sonner";

export default function TestEmailPage() {
  const [email, setEmail] = useState("dex3938@gmail.com");
  const [isLoading, setIsLoading] = useState(false);

  const handleTestEmail = async () => {
    if (!email) {
      toast.error("Please enter an email address");
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch("/api/test-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Test email sent successfully to ${email}! Check your inbox.`);
        console.log("Email sent with ID:", result.emailId);
      } else {
        toast.error(`Failed to send email: ${result.error}`);
        console.error("Email error:", result);
      }
    } catch (error) {
      console.error("Test email error:", error);
      toast.error("Failed to send test email");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Test Email Functionality
        </h1>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Enter email to test"
            />
          </div>
          
          <button
            onClick={handleTestEmail}
            disabled={isLoading}
            className="w-full bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending...
              </>
            ) : (
              "Send Test Email"
            )}
          </button>
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Instructions:</h3>
          <ol className="text-sm text-gray-600 space-y-1">
            <li>1. Enter your email address above</li>
            <li>2. Click "Send Test Email"</li>
            <li>3. Check your inbox (and spam folder)</li>
            <li>4. Verify the email arrives successfully</li>
          </ol>
        </div>
        
        <div className="mt-4 text-center space-y-2">
          <a 
            href="/register" 
            className="block text-emerald-600 hover:text-emerald-700 text-sm font-medium"
          >
            ← Back to Registration
          </a>
          <a 
            href="/api/debug-email" 
            target="_blank"
            className="block text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            🔧 Debug Email Configuration
          </a>
        </div>
      </div>
    </div>
  );
}