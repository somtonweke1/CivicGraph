# CivicGraph

**Where Civic Impact Meets Network Intelligence**

CivicGraph is a unified platform that combines civic impact data collection with advanced network analysis and visualization. Born from the merger of Civic Pulse Stream and NetworkOracle Pro, it enables communities to capture informal actions, transform them into meaningful data, and analyze complex relationships through AI-powered network intelligence.

---

## 🌟 Platform Vision

We believe the data layer for civic impact is broken. Entire economies of mutual care, informal housing, and local innovation are invisible to policy, funding, and planning systems. CivicGraph bridges this gap by:

- **Capturing** community actions and informal civic contributions
- **Quantifying** their impact with validated metrics
- **Analyzing** relationships through advanced network algorithms
- **Visualizing** community connections in interactive 3D
- **Predicting** network evolution with machine learning
- **Informing** policy and investment decisions with real data

---

## 🚀 Key Features

### Civic Action Tracking
- Log community activities, mutual aid, and local innovations
- Standardized impact metrics across sustainability, housing, and community care
- Light-touch verification through photos and peer confirmation
- Aggregate data at neighborhood and city levels

### Network Analysis
- **15+ Centrality Algorithms**: Degree, Betweenness, Closeness, Eigenvector, PageRank, Katz, HITS, Harmonic, Subgraph, and more
- **Community Detection**: Identify clusters using Louvain algorithm
- **Path Analysis**: Shortest paths, diameter, and connectivity metrics
- **Structural Properties**: Density, clustering coefficient, modularity

### 3D Visualization
- Interactive force-directed network layouts
- Real-time rendering with smooth interactions
- Multiple color schemes (centrality, group, custom)
- Pan, zoom, rotate controls for optimal viewing

### Machine Learning & AI
- **Predictive Analytics**: Network growth and evolution forecasting
- **Anomaly Detection**: Identify unusual patterns and security risks
- **Influence Prediction**: Information spread and viral potential
- **Community Evolution**: Predict how communities form and change
- **OpenAI Integration**: GPT-4 powered insights

---

## 📊 Use Cases

### Government & Policy
- Access real-time community needs data
- Allocate resources more effectively
- Track informal civic contributions
- Measure impact of community programs

### Community Organizations
- Demonstrate impact with credible data
- Attract funding and support
- Coordinate mutual aid networks
- Build reputation and trust

### Impact Investors
- Identify promising movements early
- Track community innovation
- Assess network effects
- Make data-driven investment decisions

### Researchers & Analysts
- Study community network dynamics
- Analyze social capital formation
- Track informal economy activity
- Research urban innovation patterns

---

## 🏗️ Architecture

### Technology Stack

**Frontend**
- Next.js 14.2.5 with App Router
- React 18.2 with TypeScript 5.5.4
- Tailwind CSS 3.4.3 for styling
- shadcn/ui for components
- Three.js for 3D visualizations
- Zustand for state management

**Backend**
- Next.js API Routes
- Supabase for authentication & database
- PostgreSQL for data persistence
- OpenAI API for AI insights

**Analysis & ML**
- TensorFlow.js for client-side ML
- NetworkX algorithms (via API)
- D3.js for 2D charts
- Custom centrality implementations

---

## 🛠️ Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git
- Supabase account (free tier works)
- OpenAI API key (optional, for AI features)

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd civicgraph
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to `http://localhost:3000`

---

## 📖 Platform Structure

```
civicgraph/
├── app/                      # Next.js App Router
│   ├── api/                 # Backend API routes
│   │   ├── centrality/     # Centrality analysis
│   │   ├── analysis/       # Network analysis
│   │   └── ml/             # Machine learning endpoints
│   ├── dashboard/          # Civic action dashboard
│   ├── network/            # Network visualization
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Landing page
├── components/             # React components
│   ├── ui/                 # shadcn/ui components
│   ├── civic/              # Civic tracking components
│   └── network/            # Network visualization components
├── lib/                    # Utilities and configs
│   ├── supabase.ts         # Database client
│   ├── utils.ts            # Helper functions
│   └── types.ts            # TypeScript types
├── stores/                 # Zustand state stores
│   ├── network-store.ts    # Network data state
│   └── visualization-store.ts  # Viz settings
└── public/                 # Static assets
```

---

## 🎯 Core Workflows

### 1. Civic Action Logging
1. Navigate to Dashboard
2. Click "Log Action"
3. Fill in activity details and category
4. Add photos or verification (optional)
5. Submit for impact calculation

### 2. Network Analysis
1. Navigate to Network page
2. Load sample data or import your network
3. Select analysis type (centrality, communities, paths)
4. Run algorithm
5. Explore results in 3D visualization

### 3. AI-Powered Insights
1. Load network data
2. Navigate to ML Insights tab
3. Choose prediction type:
   - Network growth
   - Anomaly detection
   - Influence prediction
   - Community evolution
4. Set time horizon
5. Generate insights

---

## 🔌 API Documentation

### Centrality Analysis
```bash
POST /api/centrality
{
  "network": {
    "nodes": [{"id": "1", "label": "Node 1"}],
    "edges": [{"source": "1", "target": "2"}]
  },
  "algorithm": "degree" | "betweenness" | "closeness" | "eigenvector" | "pagerank"
}
```

### Network Analysis
```bash
POST /api/analysis
{
  "network": { "nodes": [...], "edges": [...] },
  "analysis_type": "community_detection" | "path_analysis" | "structural_properties"
}
```

### ML Predictions
```bash
POST /api/ml/predictive
{
  "network": { "nodes": [...], "edges": [...] },
  "predictionType": "network_growth" | "influence_prediction" | "community_evolution",
  "timeHorizon": 12
}
```

---

## 🗄️ Database Schema

### Civic Actions
```sql
civic_actions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  impact_points NUMERIC,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
)
```

### Network Nodes
```sql
network_nodes (
  id UUID PRIMARY KEY,
  label TEXT NOT NULL,
  type TEXT,
  properties JSONB,
  created_at TIMESTAMP DEFAULT NOW()
)
```

### Network Edges
```sql
network_edges (
  id UUID PRIMARY KEY,
  source_id UUID REFERENCES network_nodes,
  target_id UUID REFERENCES network_nodes,
  weight NUMERIC DEFAULT 1.0,
  type TEXT,
  created_at TIMESTAMP DEFAULT NOW()
)
```

---

## 🚢 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Environment Variables
Make sure to set these in your deployment platform:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`

---

## 🤝 Who Benefits

### Community Members
- Gain recognition for informal contributions
- Build reputation within neighborhoods
- Connect with others doing similar work

### Civic Organizations
- Demonstrate impact with credible data
- Attract funding and support
- Coordinate networks effectively

### City Governments
- Access real-time community insights
- Allocate resources based on actual needs
- Track informal civic economy

### Impact Investors
- Identify promising movements early
- Assess network effects
- Make data-driven decisions

### Researchers
- Study community dynamics
- Analyze network formation
- Track social innovation

---

## 📈 Performance

- **Page Load**: <1s for initial dashboard
- **API Response**: <100ms for most analyses
- **3D Rendering**: 60fps for smooth interactions
- **Network Capacity**: Tested with 10,000+ nodes
- **Uptime Target**: 99.99% availability

---

## 🔒 Security & Privacy

- End-to-end encryption for sensitive data
- JWT-based authentication via Supabase
- Role-based access control
- Audit logging for all actions
- GDPR compliant data handling

---

## 🌍 Contributing

We welcome contributions! Whether you're fixing bugs, adding features, or improving documentation:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

CivicGraph is built on the shoulders of giants:

- **Civic Pulse Stream**: For civic impact tracking foundation
- **NetworkOracle Pro**: For network analysis capabilities
- **Next.js**: For the excellent React framework
- **Supabase**: For authentication and database
- **shadcn/ui**: For beautiful, accessible components
- **Three.js**: For 3D visualization
- **OpenAI**: For AI-powered insights
- **Vercel**: For deployment infrastructure

---

## 📞 Support

- **Documentation**: Coming soon
- **Issues**: [GitHub Issues](https://github.com/your-repo/civicgraph/issues)
- **Email**: support@civicgraph.org

---

**Built with ❤️ for communities everywhere**

*Making the invisible visible, one connection at a time.*
