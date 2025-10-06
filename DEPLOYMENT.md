# CivicGraph Deployment Guide

This guide will walk you through deploying CivicGraph to production.

## ✅ Prerequisites Completed

- [x] Supabase project created
- [x] Environment variables configured in `.env.local`
- [x] Database schema created (`supabase/migrations/001_initial_schema.sql`)

## 🗄️ Step 1: Set Up Database

You need to run the SQL migration in your Supabase project:

### Option A: Via Supabase Dashboard (Recommended)

1. Go to your Supabase project: https://supabase.com/dashboard/project/fqhjjwmovdjsgtlqcpwe
2. Click **SQL Editor** in the sidebar
3. Click **New Query**
4. Copy the contents of `supabase/migrations/001_initial_schema.sql`
5. Paste into the SQL editor
6. Click **Run** (or press Cmd/Ctrl + Enter)
7. You should see: "Success. No rows returned"

### Option B: Via Command Line (requires Supabase CLI)

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref fqhjjwmovdjsgtlqcpwe

# Run migration
supabase db push
```

### ✅ Verify Database Setup

After running the migration, verify in Supabase Dashboard:
1. Go to **Table Editor**
2. You should see tables: `civic_actions`, `network_nodes`, `network_edges`, `user_profiles`, `communities`, etc.
3. Go to **Authentication** → **Policies** - RLS should be enabled

## 🧪 Step 2: Test Locally

Let's make sure everything works locally before deploying:

```bash
# Start development server
npm run dev
```

Open http://localhost:3000 and verify:
- ✅ Landing page loads
- ✅ Dashboard page loads
- ✅ Network page loads
- ✅ No console errors

## 🚀 Step 3: Deploy to Vercel

### Install Vercel CLI

```bash
npm install -g vercel
```

### Deploy

```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

The CLI will:
1. Ask you to link to existing project or create new one
2. Detect Next.js framework automatically
3. Ask about environment variables

### Set Environment Variables in Vercel

When prompted, or via Vercel Dashboard:

1. Go to your project in Vercel Dashboard
2. Click **Settings** → **Environment Variables**
3. Add these variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://fqhjjwmovdjsgtlqcpwe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxaGpqd21vdmRqc2d0bHFjcHdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MTE4MzMsImV4cCI6MjA3NTI4NzgzM30.U4pttZxJqRi1zyZP4WplGMBEqdpnPIcBp-03xmdqF3I
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxaGpqd21vdmRqc2d0bHFjcHdlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTcxMTgzMywiZXhwIjoyMDc1Mjg3ODMzfQ.DGyqbIDNKEzIgPRhqq9hmxhIg8QdYe5kM3BzT4OWXtM
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
```

4. Click **Save**
5. Redeploy if needed

### Alternative: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click **Add New** → **Project**
3. Import your Git repository (or upload files)
4. Framework: **Next.js** (auto-detected)
5. Add environment variables (see above)
6. Click **Deploy**

## 🔐 Step 4: Configure Supabase for Production

Update Supabase to allow your Vercel domain:

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add your Vercel URL to **Site URL**: `https://your-project.vercel.app`
3. Add to **Redirect URLs**: `https://your-project.vercel.app/**`
4. Click **Save**

## ✅ Step 5: Verify Deployment

Visit your Vercel URL and test:
- ✅ Landing page loads
- ✅ Dashboard works
- ✅ Network page works
- ✅ Supabase connection works (check browser console for errors)

## 🎨 Step 6: Customize (Optional)

### Update Branding

Edit `app/page.tsx`:
- Line 11: Change platform name
- Line 13-17: Update tagline and description
- Line 19-23: Customize CTAs

### Update Metadata

Edit `app/layout.tsx`:
- Line 10-11: Update title and description for SEO

### Add Your Logo

1. Add logo image to `public/logo.png`
2. Import and use in navigation components

### Customize Colors

Edit `tailwind.config.ts`:
- Line 19-54: Customize color palette

## 📊 Monitoring

### Vercel Analytics
- Go to your project in Vercel
- Click **Analytics** to see traffic and performance

### Supabase Monitoring
- Go to Supabase Dashboard → **Database** → **Logs**
- Monitor queries and errors

## 🐛 Troubleshooting

### Build Fails
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

### Supabase Connection Error
- Verify environment variables are set in Vercel
- Check Supabase project is active
- Verify RLS policies are correct

### Database Migration Fails
- Check for syntax errors in SQL
- Run migration in parts if needed
- Check Supabase logs for errors

## 🔄 Continuous Deployment

Connect to Git for automatic deployments:

1. Push your code to GitHub/GitLab/Bitbucket
2. In Vercel, connect the repository
3. Every push to main branch will auto-deploy

## 🎉 You're Live!

Your CivicGraph platform is now deployed and ready to use!

Next steps:
- Create admin account in Supabase Auth
- Invite beta users
- Monitor usage and feedback
- Iterate and improve

## 📞 Support

Need help? Check:
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
