import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RateLimitConfig {
  endpoint: string;
  limit: number;
  window: number; // in seconds
}

const rateLimitConfigs: RateLimitConfig[] = [
  { endpoint: '/auth/login', limit: 5, window: 300 }, // 5 attempts per 5 minutes
  { endpoint: '/api/appointments', limit: 100, window: 60 }, // 100 requests per minute
  { endpoint: '/api/inventory', limit: 200, window: 60 }, // 200 requests per minute
  { endpoint: '/api/reports', limit: 50, window: 60 }, // 50 requests per minute
]

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { endpoint, clientId } = await req.json()
    
    // Buscar configuração de rate limit para o endpoint
    const config = rateLimitConfigs.find(c => endpoint.startsWith(c.endpoint))
    if (!config) {
      return new Response(
        JSON.stringify({ allowed: true, remaining: 1000 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const now = Math.floor(Date.now() / 1000)
    const windowStart = now - config.window

    // Verificar tentativas na janela de tempo
    const { data: attempts, error } = await supabaseClient
      .from('security_audit_log')
      .select('id')
      .eq('user_id', clientId)
      .eq('action_type', `api_request_${config.endpoint}`)
      .gte('created_at', new Date(windowStart * 1000).toISOString())

    if (error) {
      console.error('Error checking rate limit:', error)
      return new Response(
        JSON.stringify({ allowed: true, remaining: config.limit }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const currentAttempts = attempts?.length || 0
    const allowed = currentAttempts < config.limit
    const remaining = Math.max(0, config.limit - currentAttempts)

    if (allowed) {
      // Registrar a tentativa
      await supabaseClient
        .from('security_audit_log')
        .insert({
          user_id: clientId,
          action_type: `api_request_${config.endpoint}`,
          metadata: { endpoint, method: req.method },
          risk_level: 'low'
        })
    }

    const resetTime = windowStart + config.window

    return new Response(
      JSON.stringify({
        allowed,
        remaining,
        resetTime,
        limit: config.limit
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': config.limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': resetTime.toString()
        },
        status: allowed ? 200 : 429
      }
    )

  } catch (error) {
    console.error('Rate limiter error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})