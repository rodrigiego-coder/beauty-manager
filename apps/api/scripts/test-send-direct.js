require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

async function testSend() {
  const instanceId = process.env.ZAPI_INSTANCE_ID;
  const token = process.env.ZAPI_TOKEN;
  const baseUrl = process.env.ZAPI_BASE_URL || 'https://api.z-api.io/instances';
  const clientToken = process.env.ZAPI_CLIENT_TOKEN;

  const phone = '5518997797282'; // Número de teste
  const message = 'Teste de envio direto - Beauty Manager';

  console.log('=== TESTE DE ENVIO DIRETO Z-API ===\n');

  const url = `${baseUrl}/${instanceId}/token/${token}/send-text`;
  console.log(`URL: ${url}`);
  console.log(`Phone: ${phone}`);
  console.log(`Message: ${message}\n`);

  try {
    const headers = { 'Content-Type': 'application/json' };
    if (clientToken) {
      headers['Client-Token'] = clientToken;
    }

    console.log('Headers:', JSON.stringify(headers, null, 2));
    console.log('Body:', JSON.stringify({ phone, message }, null, 2));
    console.log('\nEnviando...\n');

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ phone, message }),
    });

    const responseText = await response.text();

    console.log(`HTTP Status: ${response.status}`);
    console.log(`Response: ${responseText}`);

    if (response.ok) {
      console.log('\n✅ MENSAGEM ENVIADA COM SUCESSO!');
      console.log('Verifique o WhatsApp do número ' + phone);
    } else {
      console.log('\n❌ ERRO NO ENVIO');
    }
  } catch (error) {
    console.log('❌ Erro:', error.message);
  }
}

testSend();
