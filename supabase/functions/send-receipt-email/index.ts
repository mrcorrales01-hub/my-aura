import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", 
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[SEND-RECEIPT-EMAIL] ${step}${detailsStr}`);
};

interface ReceiptRequest {
  receiptId: string;
  language?: string;
}

// Email templates in multiple languages
const EMAIL_TEMPLATES = {
  en: {
    subject: "Your My Aura Payment Receipt - {receiptNumber}",
    greeting: "Thank you for your purchase!",
    receiptDetails: "Receipt Details",
    amount: "Amount Paid",
    date: "Transaction Date", 
    method: "Payment Method",
    description: "Description",
    support: "If you have any questions about this transaction, please contact our support team.",
    footer: "Thank you for choosing My Aura for your mental wellness journey."
  },
  es: {
    subject: "Tu Recibo de Pago My Aura - {receiptNumber}",
    greeting: "¡Gracias por tu compra!",
    receiptDetails: "Detalles del Recibo",
    amount: "Cantidad Pagada",
    date: "Fecha de Transacción",
    method: "Método de Pago", 
    description: "Descripción",
    support: "Si tienes alguna pregunta sobre esta transacción, por favor contacta a nuestro equipo de soporte.",
    footer: "Gracias por elegir My Aura para tu viaje de bienestar mental."
  },
  fr: {
    subject: "Votre Reçu de Paiement My Aura - {receiptNumber}",
    greeting: "Merci pour votre achat!",
    receiptDetails: "Détails du Reçu",
    amount: "Montant Payé",
    date: "Date de Transaction",
    method: "Méthode de Paiement",
    description: "Description", 
    support: "Si vous avez des questions sur cette transaction, veuillez contacter notre équipe de support.",
    footer: "Merci d'avoir choisi My Aura pour votre parcours de bien-être mental."
  },
  de: {
    subject: "Ihre My Aura Zahlungsquittung - {receiptNumber}",
    greeting: "Vielen Dank für Ihren Kauf!",
    receiptDetails: "Quittungsdetails",
    amount: "Bezahlter Betrag",
    date: "Transaktionsdatum",
    method: "Zahlungsmethode",
    description: "Beschreibung",
    support: "Bei Fragen zu dieser Transaktion wenden Sie sich bitte an unser Support-Team.",
    footer: "Vielen Dank, dass Sie My Aura für Ihre mentale Wellness-Reise gewählt haben."
  }
  // Add more languages as needed...
};

const generateReceiptHTML = (receipt: any, template: any, userEmail: string) => {
  const formatCurrency = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString();

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>My Aura Receipt</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 30px 20px; border-radius: 10px 10px 0 0; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
            .receipt-details { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
            .detail-label { font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; }
            .support { background: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>My Aura</h1>
            <p>Mental Wellness Platform</p>
        </div>
        
        <div class="content">
            <h2>${template.greeting}</h2>
            <p>Receipt #${receipt.receipt_number}</p>
            
            <div class="receipt-details">
                <h3>${template.receiptDetails}</h3>
                <div class="detail-row">
                    <span class="detail-label">${template.amount}:</span>
                    <span>${formatCurrency(receipt.amount_cents)} ${receipt.currency.toUpperCase()}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">${template.date}:</span>
                    <span>${formatDate(receipt.created_at)}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">${template.description}:</span>
                    <span>${receipt.receipt_data?.description || 'My Aura Premium Service'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Email:</span>
                    <span>${userEmail}</span>
                </div>
            </div>
            
            <div class="support">
                <p><strong>💬 ${template.support}</strong></p>
                <p>Email: support@myaura.app</p>
            </div>
            
            <div class="footer">
                <p>${template.footer}</p>
                <p>© 2024 My Aura. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const { receiptId, language = 'en' }: ReceiptRequest = await req.json();

    if (!receiptId) {
      throw new Error("receiptId is required");
    }

    // Get receipt details
    const { data: receipt, error: receiptError } = await supabaseClient
      .from('payment_receipts')
      .select('*, user_id')
      .eq('id', receiptId)
      .single();

    if (receiptError || !receipt) {
      throw new Error("Receipt not found");
    }

    // Get user details 
    const { data: userData, error: userError } = await supabaseClient.auth.admin.getUserById(receipt.user_id);
    
    if (userError || !userData.user?.email) {
      throw new Error("User not found");
    }

    const userEmail = userData.user.email;
    const template = EMAIL_TEMPLATES[language as keyof typeof EMAIL_TEMPLATES] || EMAIL_TEMPLATES.en;

    logStep("Receipt and user data retrieved", { 
      receiptId, 
      receiptNumber: receipt.receipt_number,
      userEmail 
    });

    // For demo purposes, we'll just return the HTML content
    // In production, you would integrate with your email service (Resend, SendGrid, etc.)
    const htmlContent = generateReceiptHTML(receipt, template, userEmail);

    // Mark receipt as email sent
    await supabaseClient
      .from('payment_receipts')
      .update({ email_sent: true })
      .eq('id', receiptId);

    logStep("Receipt email processed", { receiptId, language });

    return new Response(JSON.stringify({ 
      success: true,
      message: "Receipt email prepared successfully",
      htmlContent, // For testing purposes
      receiptNumber: receipt.receipt_number
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in send-receipt-email", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});