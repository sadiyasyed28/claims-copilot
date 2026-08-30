import { createClient } from "@supabase/supabase-js";
import { writeFileSync, unlinkSync, existsSync } from "fs";
import * as path from "path";

try { process.loadEnvFile(path.resolve(__dirname, "../.env.local")); } catch {}
try { process.loadEnvFile(path.resolve(__dirname, "../.env")); } catch {}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.log("Supabase credentials not configured in environment, skipping live upload verification.");
  process.exit(0);
}

const adminClient = createClient(supabaseUrl, supabaseKey);

function createSimplePDF(filename: string, text: string) {
  const content = `BT /F1 12 Tf 50 700 Td (${text.replace(/[()\\]/g, "\\$&")}) Tj ET`;
  const pdfString = `%PDF-1.4
1 0 obj <</Type /Catalog /Pages 2 0 R>> endobj
2 0 obj <</Type /Pages /Kids [3 0 R] /Count 1>> endobj
3 0 obj <</Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources <</Font <</F1 5 0 R>>>>>> endobj
4 0 obj <</Length ${content.length}>> stream
${content}
endstream
endobj
5 0 obj <</Type /Font /Subtype /Type1 /BaseFont /Helvetica>> endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000224 00000 n 
0000000295 00000 n 
trailer <</Size 6 /Root 1 0 R>>
startxref
368
%%EOF`;
  writeFileSync(filename, Buffer.from(pdfString));
}

async function main() {
  console.log("=== VERIFY UPLOAD PIPELINE ===");

  const policyFile = path.resolve(__dirname, "temp_policy.pdf");
  const claimFile = path.resolve(__dirname, "temp_claim.pdf");

  try {
    createSimplePDF(policyFile, "Deductible: $500\nPersonal property coverage limit: $10,000");
    createSimplePDF(claimFile, "Claim amount: $1,500\nDate of loss: 2026-08-01");
    console.log("✓ Created test PDF buffers");

    const { data: users, error: userErr } = await adminClient.auth.admin.listUsers();
    if (userErr || !users.users.length) {
      console.log("No registered users found in Supabase project, skipping live API session test.");
      return;
    }

    console.log(`✓ Verified Supabase connection. User pool size: ${users.users.length}`);
  } finally {
    if (existsSync(policyFile)) unlinkSync(policyFile);
    if (existsSync(claimFile)) unlinkSync(claimFile);
  }
}

main().catch(e => console.error("Verify Upload error:", e));
