import fs from "fs";
import path from "path";

function setup() {
  console.log("\n🚀 Claims Copilot — Environment & Setup Helper\n");

  const envLocalPath = path.resolve(process.cwd(), ".env.local");
  const envExamplePath = path.resolve(process.cwd(), ".env.example");

  // 1. Check Node.js version
  const nodeVersion = parseInt(process.versions.node.split(".")[0], 10);
  if (nodeVersion < 18) {
    console.warn(`⚠️  Warning: Node.js version ${process.versions.node} detected. Recommended version is Node 18+.\n`);
  } else {
    console.log(`✓ Node.js version ${process.versions.node} is compatible.`);
  }

  // 2. Safe .env.local initialization
  if (!fs.existsSync(envLocalPath)) {
    if (fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envLocalPath);
      console.log("✓ Created .env.local from .env.example template.");
      console.log("👉 Please open .env.local and add your Supabase, Hugging Face, and Groq API keys.");
    } else {
      console.error("❌ .env.example not found. Please create .env.local manually.");
    }
  } else {
    console.log("✓ .env.local already exists (will not overwrite existing configuration).");
  }

  // 3. Database migrations reminder
  console.log("\n🗄️ Database Setup:");
  console.log("  Execute the SQL migrations in supabase/migrations/ on your Supabase project in order:");
  console.log("  1. 20260826_create_tables.sql (documents & document_chunks with pgvector)");
  console.log("  2. 20260825_add_match_document_chunks.sql (vector similarity RPC)");
  console.log("  3. 20260826182100_create_analysis_sessions.sql (analysis sessions)");

  // 4. Commands summary
  console.log("\n🛠️ Available Commands:");
  console.log("  npm run dev       - Start Next.js development server (http://localhost:3000)");
  console.log("  npm test          - Run Phase 16 Adaptive RAG verification suite");
  console.log("  npm run lint      - Run ESLint checks");
  console.log("  npx tsc --noEmit  - Run TypeScript type checks");
  console.log("  npm run build     - Build optimized production bundle\n");
}

setup();
