# 📧 Email Workflow Setup Guide

This guide explains how to set up the professional email workflow for Waste Wizard.

## 🚀 Features Implemented

### ✅ 1. Professional Welcome Email
- **Trigger**: Automatically sent after successful organization registration
- **Design**: Clean, modern SaaS-style HTML template
- **Content**: Organization welcome, platform features, dashboard CTA
- **Branding**: Waste Wizard eco-tech theme with emerald colors

### ✅ 2. Email Service Integration
- **Provider**: Resend API (professional email service)
- **Template**: Custom HTML email template with responsive design
- **Error Handling**: Registration succeeds even if email fails
- **Logging**: Comprehensive error logging for debugging

### ✅ 3. FAQ Chatbot (Non-AI)
- **Location**: Landing page only (not on dashboard/internal pages)
- **Design**: Modern SaaS UI inspired by Linear/Vercel
- **Functionality**: Predefined Q&A with clickable chips
- **Styling**: Glassmorphism, emerald gradients, premium animations

## 🔧 Setup Instructions

### 1. Environment Variables

Add these to your `.env` file:

```env
# Email Configuration
RESEND_API_KEY=your_resend_api_key_here
EMAIL_FROM=Waste Wizard <noreply@wastewizard.com>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 2. Get Resend API Key

1. Sign up at [resend.com](https://resend.com)
2. Create a new API key
3. Add it to your `.env` file
4. Verify your sending domain (optional for development)

### 3. Test Email Functionality

```bash
# Start the development server
npm run dev

# Register a new organization
# Check console logs for email sending status
```

## 📁 Files Modified/Created

### New Files:
- `src/app/api/welcome-email/route.ts` - Welcome email API endpoint
- `src/scripts/cleanup-demo-accounts.ts` - Demo account cleanup script
- `EMAIL_SETUP_GUIDE.md` - This setup guide

### Modified Files:
- `src/lib/email.ts` - Updated to use Resend SDK + welcome template
- `src/app/register/page.tsx` - Added welcome email trigger
- `src/components/FAQChatbot.tsx` - Enhanced design + landing page only
- `.env` - Added email configuration variables
- `package.json` - Added cleanup script + tsx dependency

## 🎨 Email Template Features

### Professional Design:
- ✅ Clean white background
- ✅ Emerald/green accent colors  
- ✅ Rounded sections and modern spacing
- ✅ Professional typography (Inter font)
- ✅ Responsive design
- ✅ Waste Wizard branding

### Content Includes:
- ✅ Personalized organization name
- ✅ Welcome message and platform intro
- ✅ Feature highlights with checkmarks
- ✅ Dashboard access CTA button
- ✅ Support contact information
- ✅ Professional footer with branding

## 🤖 FAQ Chatbot Features

### Design Requirements Met:
- ✅ Modern SaaS UI (Linear/Vercel inspired)
- ✅ Premium, minimal, clean appearance
- ✅ Glassmorphism with backdrop-blur-md
- ✅ Emerald gradient floating button
- ✅ Pulse ring animation on button
- ✅ Smooth open/close animations
- ✅ Responsive mobile layout

### Functionality:
- ✅ Landing page only (not on dashboard)
- ✅ Predefined FAQ questions as clickable chips
- ✅ No free text input (as requested)
- ✅ Professional conversation flow
- ✅ Contact support integration

### FAQ Questions Included:
1. How does this system work?
2. How to register?
3. What hardware is required?
4. How do notifications work?
5. Future scope of this system?
6. Contact Support

## 🧹 Demo Account Cleanup

Run this command to remove demo/test accounts:

```bash
npm run cleanup-demo
```

This will safely remove:
- Demo user accounts
- Associated user profiles
- Related dustbins, notifications, collections, analytics

## 🔍 Testing Checklist

### Email Workflow:
- [ ] Register new organization
- [ ] Check email delivery (check spam folder)
- [ ] Verify email template renders correctly
- [ ] Test with invalid email addresses
- [ ] Confirm registration succeeds even if email fails

### FAQ Chatbot:
- [ ] Chatbot appears on landing page only
- [ ] Floating button has pulse animation
- [ ] Chat window opens/closes smoothly
- [ ] All FAQ chips work correctly
- [ ] Contact support link works
- [ ] Mobile responsive design
- [ ] No chatbot on dashboard pages

## 🚨 Troubleshooting

### Email Not Sending:
1. Check `RESEND_API_KEY` is set correctly
2. Verify API key is active in Resend dashboard
3. Check console logs for error messages
4. Ensure `EMAIL_FROM` domain is verified (for production)

### Chatbot Issues:
1. Clear browser cache and reload
2. Check browser console for JavaScript errors
3. Verify chatbot only appears on landing page (`/`)
4. Test on different screen sizes

### Database Issues:
1. Run database migrations: `npm run db:push`
2. Check database connection in `.env`
3. Verify user table exists and has correct schema

## 📞 Support

For technical support or questions:
- Email: wastewizard24@gmail.com
- Check console logs for detailed error messages
- Review this guide for common solutions

---

**Note**: This implementation follows the exact requirements specified:
- Professional email workflow with Resend
- Non-AI FAQ chatbot with predefined responses
- Clean, modern SaaS design aesthetic
- Proper error handling and logging
- Landing page only chatbot placement