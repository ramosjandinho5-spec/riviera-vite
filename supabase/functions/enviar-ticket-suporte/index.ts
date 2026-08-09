import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1535986165360893972/43AUtFBAIBJ_b8S4Z6vQAUf8MgaPTHjEHEwOupc05cbBhl8ddAgme6nZ2IcXSfYprw0m';

serve(async (req) => {
  // This is needed if you're deploying functions from a browser.
  // This browser based deployment can be disabled in the Supabase CLI.
  // See a more custom pattern for this at https://supabase.com/docs/guides/functions/cors
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { ticketType, ticketMessage } = await req.json();

    const payload = {
      embeds: [
        {
          title: `Novo Ticket de Suporte: ${ticketType}`,
          description: ticketMessage,
          color: 15158332, // Cor vermelha para tickets
          fields: [
            {
              name: 'Tipo de Chamado',
              value: ticketType,
              inline: true,
            },
            {
                name: 'Status',
                value: 'Aguardando Resposta',
                inline: true,
            }
          ],
          footer: {
            text: `Riviera Roleplay | Suporte via Site`,
          },
          timestamp: new Date().toISOString(),
        },
      ],
    };

    const res = await fetch(DISCORD_WEBHOOK_URL, {
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