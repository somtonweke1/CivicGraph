# CivicGraph Migration Guide

This document explains how the two repositories were merged into CivicGraph.

## Source Repositories

### 1. Civic Pulse Stream
- **Purpose**: Civic impact data collection and tracking
- **Framework**: Vite + React + TypeScript
- **Key Features**:
  - Community action logging
  - Impact metrics calculation
  - Supabase authentication
  - shadcn/ui components

### 2. NetworkOracle Pro
- **Purpose**: Network analysis and visualization
- **Framework**: Next.js + React + TypeScript
- **Key Features**:
  - 15+ centrality algorithms
  - 3D network visualization
  - Machine learning predictions
  - OpenAI integration

## Architecture Decisions

### Framework Choice: Next.js
**Why?**
- Better production performance with SSR
- Built-in API routes for backend functionality
- Superior SEO capabilities
- Easier deployment and scaling
- Better suited for full-stack applications

### Key Integrations

#### From Civic Pulse Stream
✅ **Migrated:**
- All shadcn/ui components (`components/ui/`)
- Supabase integration (`lib/supabase.ts`)
- Utility functions (`lib/utils.ts`)
- Type definitions (`lib/types.ts`)
- Authentication context patterns

❌ **Not Migrated:**
- Vite-specific configuration
- React Router (replaced with Next.js App Router)
- Vite dev server setup

#### From NetworkOracle Pro
✅ **Migrated:**
- Network analysis API routes (`app/api/centrality`, `app/api/analysis`)
- ML prediction endpoints (`app/api/ml/`)
- Zustand stores (`stores/network-store.ts`, `stores/visualization-store.ts`)
- Network analysis algorithms

❌ **Not Migrated (Temporarily):**
- 3D visualization components (React Three Fiber incompatibility)
  - Will be re-implemented with compatible versions
- TensorFlow.js client-side ML (performance considerations)

## Directory Structure Mapping

### Civic Pulse Stream → CivicGraph
```
civic-pulse-stream/src/
├── components/ui/          → civicgraph/components/ui/
├── lib/                    → civicgraph/lib/
├── pages/                  → civicgraph/app/dashboard/
└── context/AuthContext.tsx → Integrated into app layout
```

### NetworkOracle Pro → CivicGraph
```
networksystems/src/
├── app/api/               → civicgraph/app/api/
├── stores/                → civicgraph/stores/
├── components/            → civicgraph/components/network/
└── lib/                   → Merged with civicgraph/lib/
```

## New Platform Structure

```
civicgraph/
├── app/                    # Next.js App Router
│   ├── page.tsx           # Landing page
│   ├── dashboard/         # Civic action tracking (from civic-pulse)
│   ├── network/           # Network analysis (from networkoracle)
│   └── api/               # Backend endpoints (from networkoracle)
├── components/
│   ├── ui/                # shadcn components (from civic-pulse)
│   ├── civic/             # Civic-specific components
│   └── network/           # Network visualization components
├── lib/
│   ├── supabase.ts        # Database client (from civic-pulse)
│   └── utils.ts           # Shared utilities
└── stores/                # State management (from networkoracle)
```

## Configuration Changes

### Environment Variables
**Old (Civic Pulse Stream):**
```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

**New (CivicGraph):**
```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
OPENAI_API_KEY=...
```

### Build & Dev Scripts
**Old:**
- Civic Pulse: `npm run dev` (Vite)
- NetworkOracle: `npm run dev` (Next.js)

**New:**
- `npm run dev` - Start development server (Next.js)
- `npm run build` - Build for production
- `npm start` - Start production server

## Feature Parity

### Civic Action Tracking
- ✅ Dashboard interface
- ✅ Action logging structure
- ⏳ Form components (to be implemented)
- ⏳ Verification system (to be implemented)

### Network Analysis
- ✅ API endpoints for analysis
- ✅ State management stores
- ⏳ 3D visualization (to be re-implemented)
- ⏳ ML prediction UI (to be implemented)

### Authentication
- ✅ Supabase client configured
- ⏳ Auth UI components (to be implemented)
- ⏳ Protected routes (to be implemented)

## Next Steps

### Immediate (Week 1)
1. Implement civic action logging forms
2. Set up Supabase database schema
3. Create authentication flows
4. Implement basic network visualization (2D)

### Short-term (Month 1)
1. Re-implement 3D visualization with compatible libraries
2. Connect ML prediction APIs to UI
3. Build out dashboard analytics
4. Implement user profiles and permissions

### Long-term (Quarter 1)
1. Add temporal network analysis
2. Implement community detection UI
3. Build data export features
4. Create admin dashboard
5. Add real-time collaboration features

## Breaking Changes

### For Civic Pulse Stream Users
- Routes changed from `/` to `/dashboard`
- Import paths changed from `@/components` to Next.js structure
- Vite env vars (`VITE_*`) → Next.js env vars (`NEXT_PUBLIC_*`)

### For NetworkOracle Users
- 3D visualization temporarily unavailable (being reimplemented)
- TensorFlow.js features moved server-side
- API routes remain the same

## Migration Checklist

- [x] Initialize Next.js project
- [x] Merge package.json dependencies
- [x] Copy UI components from civic-pulse-stream
- [x] Copy API routes from networksystems
- [x] Set up Supabase integration
- [x] Create landing page
- [x] Create dashboard page
- [x] Create network page
- [x] Configure TypeScript
- [x] Configure Tailwind CSS
- [x] Create README documentation
- [ ] Implement 3D visualization
- [ ] Connect database schema
- [ ] Build authentication system
- [ ] Implement civic action forms
- [ ] Add ML prediction UI
- [ ] Write integration tests
- [ ] Deploy to production

## Support & Questions

If you have questions about the migration:
1. Check the README.md for general documentation
2. Review this guide for specific migration details
3. Open an issue on GitHub
4. Contact the development team

---

**Last Updated**: October 2025
