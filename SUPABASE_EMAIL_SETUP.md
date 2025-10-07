# 📧 Supabase Email Configuration Guide

## Issue: "Email not confirmed" Error

When users try to sign in, they get "Email not confirmed" error. This is because Supabase requires email confirmation by default.

---

## 🎯 Quick Fix Options

### Option 1: Disable Email Confirmation (Development Only)

**For local development/testing**, you can disable email confirmation:

1. Go to Supabase Dashboard: https://app.supabase.com
2. Select your project: `civicgraph`
3. Go to **Authentication** → **Providers** → **Email**
4. Scroll down to **"Confirm email"**
5. **Uncheck** "Confirm email"
6. Click **Save**

**⚠️ Warning**: Only use this for development. In production, you should always confirm emails.

### Option 2: Setup Email Confirmation (Production - Recommended)

#### Step 1: Configure Email Templates

1. Go to Supabase Dashboard → **Authentication** → **Email Templates**
2. Customize the "Confirm signup" template:

```html
<h2>Confirm your signup</h2>

<p>Welcome to CivicGraph! 🎉</p>

<p>Click the link below to confirm your email and start making civic impact:</p>

<p><a href="{{ .ConfirmationURL }}">Confirm your email</a></p>

<p>If you didn't create an account with CivicGraph, you can safely ignore this email.</p>
```

#### Step 2: Configure Redirect URL

1. Go to **Authentication** → **URL Configuration**
2. Add your site URL:
   - Local: `http://localhost:3000`
   - Production: `https://civicgraph.vercel.app`
3. Add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://civicgraph.vercel.app/auth/callback`

#### Step 3: Create Auth Callback Route

Create `/app/auth/callback/route.ts`:

```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirect to dashboard after confirmation
  return NextResponse.redirect(new URL('/dashboard', request.url))
}
```

### Option 3: Use Magic Link (No Password)

Replace password-based auth with magic links:

1. Go to **Authentication** → **Providers** → **Email**
2. Enable **"Enable email provider"**
3. Disable password if desired

Update signin page to use magic link:

```typescript
const { data, error } = await supabase.auth.signInWithOtp({
  email: email,
  options: {
    emailRedirectTo: `${window.location.origin}/auth/callback`,
  },
});
```

---

## 🔧 Current Implementation

I've updated the auth pages to:

### 1. **Better Error Messaging**
- Shows clear message: "Email not confirmed"
- Explains: "Please check your email and click the confirmation link"

### 2. **Resend Confirmation Email**
- Added "Resend" button in error toast
- Click to resend confirmation email
- Shows success message when sent

### 3. **Signup Flow**
- Detects if email confirmation is required
- Shows message: "Check your email!"
- Doesn't redirect until confirmed

---

## 🚀 Recommended Setup for Production

### Step 1: Keep Email Confirmation Enabled
It prevents spam and fake accounts.

### Step 2: Setup Custom SMTP (Optional but Recommended)

By default, Supabase uses their email service which has limits. For production:

1. Go to **Project Settings** → **Auth** → **SMTP Settings**
2. Configure your own SMTP:
   - **SendGrid** (free 100 emails/day)
   - **Mailgun** (free 5,000 emails/month)
   - **AWS SES** (very cheap, $0.10 per 1,000 emails)

Example SendGrid config:
- Host: `smtp.sendgrid.net`
- Port: `587`
- Username: `apikey`
- Password: `[Your SendGrid API Key]`
- Sender email: `noreply@civicgraph.com`
- Sender name: `CivicGraph`

### Step 3: Customize Email Templates

Make emails match your brand:

**Confirmation Email**:
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to CivicGraph! 🎉</h1>
    </div>
    <div class="content">
      <p>Hi there!</p>
      <p>Thank you for joining CivicGraph, the platform where civic action meets community impact.</p>
      <p>Click the button below to confirm your email and start making a difference:</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="{{ .ConfirmationURL }}" class="button">Confirm Your Email</a>
      </p>
      <p>Once confirmed, you'll be able to:</p>
      <ul>
        <li>Log and track your civic actions</li>
        <li>Earn impact points and achievements</li>
        <li>Connect with other change-makers</li>
        <li>Visualize your community impact</li>
      </ul>
      <p>If you didn't create this account, you can safely ignore this email.</p>
      <p>Questions? Reply to this email or visit our help center.</p>
      <p>Let's make impact together! 🌟</p>
      <p><strong>The CivicGraph Team</strong></p>
    </div>
  </div>
</body>
</html>
```

### Step 4: Monitor Email Deliverability

1. Check SPF/DKIM records
2. Monitor bounce rates
3. Watch spam complaints
4. Test emails regularly

---

## 🐛 Troubleshooting

### "Email not confirmed" persists after clicking link

**Solution**: Check redirect URLs are correct in Supabase dashboard.

### Confirmation email not arriving

**Possible causes**:
1. In spam folder - check there first
2. Wrong email entered - verify spelling
3. Supabase email rate limits - wait a few minutes
4. SMTP issues - check Supabase logs

**Fix**: Click "Resend" button in error message.

### Users can't sign in after confirming

**Solution**: Clear cookies and try again, or use password reset flow.

---

## 📝 Testing Email Flow

### Local Testing

1. Use a real email or temp email service (temp-mail.org)
2. Sign up with test email
3. Check inbox for confirmation email
4. Click confirmation link
5. Should redirect to dashboard

### Production Testing

1. Test with multiple email providers (Gmail, Outlook, Yahoo)
2. Check spam folders
3. Test on mobile devices
4. Verify redirect URLs work

---

## 🎯 Current Status

✅ **Fixed**: Better error messages for unconfirmed emails
✅ **Added**: Resend confirmation email button
✅ **Improved**: Signup flow with email confirmation detection
⏳ **TODO**: Create auth callback route (if keeping email confirmation)
⏳ **TODO**: Customize email templates in Supabase
⏳ **TODO**: Setup custom SMTP for production (optional)

---

## 💡 Quick Start

**For immediate development** (no email hassle):

1. Go to Supabase Dashboard
2. Authentication → Providers → Email
3. Uncheck "Confirm email"
4. Save
5. Now you can sign in immediately after signup!

**For production launch**:

1. Enable email confirmation
2. Setup custom SMTP
3. Customize email templates
4. Test thoroughly
5. Monitor deliverability

---

**The auth flow is now much better!** Users get clear feedback about email confirmation and can easily resend if needed. 🎉
