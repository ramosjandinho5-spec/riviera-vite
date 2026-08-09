import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Define os cabeçalhos CORS para permitir o acesso do navegador
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Permite qualquer origem
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey', // Permite os cabeçalhos que o Supabase usa
};

serve(async (req) => {
  // O navegador envia uma requisição "OPTIONS" antes da requisição real para verificar as permissões CORS.
  // Precisamos responder a ela com sucesso.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Cria um cliente Supabase com permissões de SERVIÇO
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Lista os usuários
    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      throw error;
    }

    // Retorna a lista de usuários com os cabeçalhos CORS
    return new Response(
      JSON.stringify({ users }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    // Retorna qualquer erro também com os cabeçalhos CORS
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
})