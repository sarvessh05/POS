import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function generateTableTokens(count: number) {
  console.log(`Generating QR tokens for ${count} tables...`);
  
  for (let i = 1; i <= count; i++) {
    const qrToken = uuidv4();
    const { data, error } = await supabase
      .from('tables')
      .upsert({ 
        number: i, 
        qr_token: qrToken,
        section: 'General',
        seat_count: 4
      }, { onConflict: 'number' });

    if (error) {
      console.error(`Error table ${i}:`, error.message);
    } else {
      console.log(`Table ${i} assigned token: ${qrToken}`);
    }
  }
}

const tableCount = parseInt(process.argv[2]) || 10;
generateTableTokens(tableCount);
