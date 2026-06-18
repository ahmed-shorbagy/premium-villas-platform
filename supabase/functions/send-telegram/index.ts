import "@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { 
      propertyTitle, 
      customer_name, 
      customer_location, 
      check_in, 
      check_out, 
      customer_phone, 
      customer_notes 
    } = await req.json();

    const botToken = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const chatId = Deno.env.get("TELEGRAM_CHAT_ID");

    if (!botToken || !chatId) {
      throw new Error("Telegram credentials are not configured in edge function secrets");
    }

    let datesText = 'لم يتم التحديد';
    if (check_in && check_out) {
      datesText = `من ${check_in} إلى ${check_out}`;
    } else if (check_in) {
      datesText = `من ${check_in}`;
    }

    const message = `🚨 *حجز جديد لفيلا: ${propertyTitle}*
👤 الاسم: ${customer_name}
📍 المدينة/المكان: ${customer_location || 'غير محدد'}
📅 تاريخ الحجز: ${datesText}
📞 رقم العميل: ${customer_phone}
📝 الملاحظات: ${customer_notes || 'لا يوجد'}`;

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Telegram API failed: ${errorText}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
