import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

const BUG_REPORT_WEBHOOK_URL = 'https://discord.com/api/webhooks/1535991151062941726/UVeXJeLeFvbmGXCM9LCebLg51PKjz_pIWmuuBA6Y1Eip6f9DxKQgnSU1PEh1s9kbe89S';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { bugMessage } = await req.json();

    const payload = {
      embeds: [
        {
          title: '🐞 Novo Relatório de Bug',
          description: bugMessage,
          color: 15158332, // Cor vermelha
          footer: {
            text: `Riviera Roleplay | Relatório de Bug via Site`,
          },
          timestamp: new Date().toISOString(),
        },
      ],
    };

    const res = await fetch(BUG_REPORT_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Discord API responded with ${res.status}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});