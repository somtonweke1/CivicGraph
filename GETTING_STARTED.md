# Getting Started with CivicGraph

Welcome to CivicGraph! This guide will help you get the platform running locally.

## Prerequisites

Before you begin, ensure you have:
- **Node.js** 18 or higher ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- A **Supabase** account (free tier works - [Sign up](https://supabase.com))
- *(Optional)* An **OpenAI** API key for AI features ([Get key](https://platform.openai.com/api-keys))

## Quick Start (5 minutes)

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key  # Optional
```

**Where to find Supabase credentials:**
1. Go to [app.supabase.com](https://app.supabase.com)
2. Create a new project (or use existing)
3. Go to Settings → API
4. Copy `Project URL` and `anon public` key

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

## What You'll See

### Landing Page (`/`)
- Platform overview
- Feature highlights
- Quick navigation to Dashboard and Network

### Dashboard (`/dashboard`)
- Civic action tracking interface
- Community activity stream
- Impact metrics overview
- Statistics and charts

### Network Analysis (`/network`)
- Network visualization area
- Analysis tools (centrality, communities, paths)
- ML insights panel
- Network metrics

## Project Structure

```
civicgraph/
├── app/                    # Pages and routes
│   ├── page.tsx           # Landing page
│   ├── dashboard/         # Civic tracking dashboard
│   ├── network/           # Network analysis
│   └── api/               # Backend API endpoints
│
├── components/            # React components
│   ├── ui/                # Reusable UI components
│   ├── civic/             # Civic-specific components
│   └── network/           # Network components
│
├── lib/                   # Utilities and configs
│   ├── supabase.ts        # Database client
│   ├── utils.ts           # Helper functions
│   └── types.ts           # TypeScript types
│
├── stores/                # State management (Zustand)
│   ├── network-store.ts   # Network data state
│   └── visualization-store.ts  # Visualization settings
│
└── public/                # Static assets
```

## Common Tasks

### Running Tests
```bash
npm test
```

### Building for Production
```bash
npm run build
npm start
```

### Linting Code
```bash
npm run lint
```

## Setting Up Database

CivicGraph uses Supabase for data persistence. You'll need to set up the database schema:

### 1. Create Tables

In your Supabase SQL Editor, run:

```sql
-- Civic Actions Table
CREATE TABLE civic_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  impact_points NUMERIC DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Network Nodes Table
CREATE TABLE network_nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  label TEXT NOT NULL,
  type TEXT,
  properties JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Network Edges Table
CREATE TABLE network_edges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_id UUID REFERENCES network_nodes NOT NULL,
  target_id UUID REFERENCES network_nodes NOT NULL,
  weight NUMERIC DEFAULT 1.0,
  type TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE civic_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE network_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE network_edges ENABLE ROW LEVEL SECURITY;

-- Create Policies (example - adjust as needed)
CREATE POLICY "Users can view their own actions"
  ON civic_actions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own actions"
  ON civic_actions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### 2. Enable Authentication

In Supabase Dashboard:
1. Go to Authentication → Providers
2. Enable Email provider (at minimum)
3. Optional: Enable OAuth providers (Google, GitHub, etc.)

## Features Overview

### 🎯 Civic Action Tracking
Log and track community activities:
- Mutual aid events
- Sustainability initiatives
- Housing innovations
- Local organizing

### 📊 Network Analysis
Analyze community relationships:
- **Centrality**: Find influential nodes
- **Communities**: Detect groups and clusters
- **Paths**: Analyze connections
- **ML Predictions**: Forecast network evolution

### 🔐 Authentication
Secure user management:
- Email/password authentication
- OAuth providers
- Role-based access control

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill
```

### Module Not Found
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Supabase Connection Issues
- Verify your credentials in `.env.local`
- Check if Supabase project is active
- Ensure API key is the `anon public` key, not service role

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

## Next Steps

Now that you're set up:

1. **Explore the Dashboard** - See how civic actions are tracked
2. **Try Network Analysis** - Load sample data and analyze
3. **Read the Docs** - Check out [README.md](./README.md) and [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
4. **Customize** - Adapt the platform for your community's needs
5. **Deploy** - When ready, deploy to [Vercel](https://vercel.com)

## Getting Help

- **Documentation**: [README.md](./README.md)
- **Migration Info**: [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
- **Issues**: Open a GitHub issue
- **Community**: Join our discussions

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Your Supabase anonymous key |
| `OPENAI_API_KEY` | No | OpenAI API key for AI features |
| `NEXT_PUBLIC_APP_URL` | No | Your app URL (for production) |

## Development Tips

### Hot Reload
Next.js automatically reloads when you save files. If it stops working:
```bash
# Restart the dev server
# Press Ctrl+C to stop, then:
npm run dev
```

### TypeScript Errors
The project uses strict TypeScript. Check for errors:
```bash
npx tsc --noEmit
```

### Component Development
UI components are in `components/ui/` using shadcn/ui. To add more:
```bash
# This won't work yet - manual copy for now
# npx shadcn-ui@latest add [component-name]
```

---

**Ready to make civic impact visible!** 🚀

If you run into any issues, check the documentation or open an issue.
