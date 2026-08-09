import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

const SUGESTAO_WEBHOOK_URL = 'https://discord.com/api/webhooks/1535998608359555195/sZVY49nGpoQ2EQM8jlY1GjR5Vy18H0DNqG82QzuhiUueFQq3uW9k5ds1DuD2zXCsW5Y9';

serve(async (req) => {
  // Trata a requisição OPTIONS (preflight) para CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { sugestaoMessage } = await req.json();

    if (!sugestaoMessage) {
      throw new Error('A mensagem da sugestão é obrigatória.');
    }

    const payload = {
      embeds: [
        {
          title: '💡 Nova Sugestão Recebida',
          description: sugestaoMessage,
          color: 3447003, // Cor azul
          footer: {
            text: `Riviera Roleplay | Sugestão via Site`,
          },
          timestamp: new Date().toISOString(),
        },
      ],
    };

    const res = await fetch(SUGESTAO_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error('Erro na API do Discord:', errorBody);
      throw new Error(`A API do Discord respondeu com o status ${res.status}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Erro ao processar a sugestão:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});