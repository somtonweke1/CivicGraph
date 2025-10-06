# 🚀 CivicGraph Quick Start Guide

Everything is configured and ready to go! Follow these steps to get CivicGraph deployed.

## ✅ What's Already Done

- [x] Supabase credentials configured in `.env.local`
- [x] Database schema created (`supabase/migrations/001_initial_schema.sql`)
- [x] Vercel configuration ready (`vercel.json`)
- [x] Local development server tested successfully

## 📋 Next Steps (15 minutes total)

### Step 1: Run Database Migration (5 minutes)

1. Open your browser and go to:
   **https://supabase.com/dashboard/project/fqhjjwmovdjsgtlqcpwe**

2. Click **SQL Editor** in the left sidebar

3. Click **New Query**

4. Open the file: `supabase/migrations/001_initial_schema.sql`

5. Copy ALL the contents and paste into the SQL Editor

6. Click **Run** button (or press Cmd/Ctrl + Enter)

7. You should see: ✅ **"Success. No rows returned"**

8. Verify tables were created:
   - Click **Table Editor** in sidebar
   - You should see: `civic_actions`, `network_nodes`, `network_edges`, `user_profiles`, `communities`, etc.

### Step 2: Test Locally (2 minutes)

```bash
# Start the development server
npm run dev
```

Open http://localhost:3000 - you should see the CivicGraph landing page!

Test these pages:
- ✅ Landing page: http://localhost:3000
- ✅ Dashboard: http://localhost:3000/dashboard
- ✅ Network: http://localhost:3000/network

Press `Ctrl+C` to stop the server when done.

### Step 3: Deploy to Vercel (8 minutes)

#### Option A: Deploy via CLI (Recommended)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

The CLI will ask you:
- **Set up and deploy?** → Yes
- **Which scope?** → Your personal account
- **Link to existing project?** → No
- **Project name?** → civicgraph (or your preferred name)
- **Directory?** → . (current directory)
- **Override settings?** → No

Vercel will:
1. Build your project
2. Deploy to production
3. Give you a URL like: `https://civicgraph.vercel.app`

#### Add Environment Variables to Vercel

After deployment:

```bash
# Add Supabase URL
vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Paste: https://fqhjjwmovdjsgtlqcpwe.supabase.co

# Add Supabase anon key
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Paste: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxaGpqd21vdmRqc2d0bHFjcHdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MTE4MzMsImV4cCI6MjA3NTI4NzgzM30.U4pttZxJqRi1zyZP4WplGMBEqdpnPIcBp-03xmdqF3I

# Redeploy with env vars
vercel --prod
```

#### Option B: Deploy via Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Add New** → **Project**
3. Select **Continue with GitHub** (or upload files directly)
4. Import this `civicgraph` directory
5. Vercel auto-detects Next.js settings
6. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://fqhjjwmovdjsgtlqcpwe.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxaGpqd21vdmRqc2d0bHFjcHdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3MTE4MzMsImV4cCI6MjA3NTI4NzgzM30.U4pttZxJqRi1zyZP4WplGMBEqdpnPIcBp-03xmdqF3I`
7. Click **Deploy**

### Step 4: Configure Supabase for Production (2 minutes)

After getting your Vercel URL:

1. Go to: **https://supabase.com/dashboard/project/fqhjjwmovdjsgtlqcpwe/auth/url-configuration**

2. Update **Site URL** to: `https://your-project.vercel.app`

3. Add **Redirect URLs**: `https://your-project.vercel.app/**`

4. Click **Save**

## 🎉 You're Live!

Your CivicGraph platform is now deployed and accessible at your Vercel URL!

### Test Your Deployment

Visit your Vercel URL and verify:
- ✅ Landing page loads
- ✅ Dashboard page works
- ✅ Network page works
- ✅ No console errors (press F12 to check)

## 🔐 Enable Authentication (Optional)

To allow users to sign up:

1. Go to Supabase: **Authentication** → **Providers**
2. Enable **Email** provider
3. Optional: Enable OAuth (Google, GitHub, etc.)
4. Save changes

## 📊 Monitor Your Platform

### Vercel Analytics
- Dashboard: `https://vercel.com/dashboard`
- See traffic, performance, and errors

### Supabase Dashboard
- Database: Monitor queries and usage
- Auth: See registered users
- Logs: Debug any issues

## 🎨 Next Steps

### Customize Your Platform

1. **Update Branding**
   - Edit `app/page.tsx` for landing page content
   - Edit `app/layout.tsx` for meta tags
   - Add your logo to `public/`

2. **Add Features**
   - Create civic action logging forms
   - Build user authentication flows
   - Add data visualization components

3. **Connect to Git**
   - Push code to GitHub/GitLab
   - Connect repository in Vercel
   - Enable automatic deployments

## 📞 Need Help?

- **Documentation**: Check `README.md` and `DEPLOYMENT.md`
- **Supabase Docs**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs

## 🐛 Troubleshooting

### Build Failed on Vercel
```bash
# Test build locally first
npm run build
# Fix any errors, then redeploy
```

### Can't Connect to Supabase
- Verify environment variables in Vercel dashboard
- Check Supabase project is active
- Verify URL configuration in Supabase

### Database Errors
- Check migration ran successfully
- Verify RLS policies are enabled
- Check Supabase logs for errors

---

**That's it! You're ready to start building on CivicGraph! 🚀**
