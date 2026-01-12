require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

async function testZapi() {
  const instanceId = process.env.ZAPI_INSTANCE_ID;
  const token = process.env.ZAPI_TOKEN;
  const baseUrl = process.env.ZAPI_BASE_URL || 'https://api.z-api.io/instances';
  const clientToken = process.env.ZAPI_CLIENT_TOKEN;

  console.log('=== TESTE DE CONEXÃO Z-API ===\n');

  console.log('1. CONFIGURAÇÃO:');
  console.log(`   ZAPI_INSTANCE_ID: ${instanceId ? instanceId.substring(0, 10) + '...' : 'NÃO CONFIGURADO'}`);
  console.log(`   ZAPI_TOKEN: ${token ? token.substring(0, 10) + '...' : 'NÃO CONFIGURADO'}`);
  console.log(`   ZAPI_CLIENT_TOKEN: ${clientToken ? clientToken.substring(0, 10) + '...' : 'NÃO CONFIGURADO'}`);
  console.log(`   ZAPI_BASE_URL: ${baseUrl}\n`);

  if (!instanceId || !token) {
    console.log('❌ Z-API não configurado. Configure ZAPI_INSTANCE_ID e ZAPI_TOKEN no .env');
    return;
  }

  // Teste 1: Verificar status da instância
  console.log('2. TESTANDO STATUS DA INSTÂNCIA...');
  const statusUrl = `${baseUrl}/${instanceId}/token/${token}/status`;
  console.log(`   URL: ${statusUrl}\n`);

  try {
    const headers = { 'Content-Type': 'application/json' };
    if (clientToken) {
      headers['Client-Token'] = clientToken;
    }

    const response = await fetch(statusUrl, { method: 'GET', headers });
    const responseText = await response.text();

    console.log(`   HTTP Status: ${response.status}`);
    console.log(`   Response: ${responseText}\n`);

    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log('3. RESULTADO:');
      console.log(`   Connected: ${data.connected ?? 'N/A'}`);
      console.log(`   SmartphoneConnected: ${data.smartphoneConnected ?? 'N/A'}`);
      console.log(`   Session: ${data.session ?? 'N/A'}`);

      if (data.connected || data.smartphoneConnected) {
        console.log('\n   ✅ Z-API CONECTADO E FUNCIONANDO!');
      } else {
        console.log('\n   ⚠️ Z-API NÃO CONECTADO - Precisa escanear QR Code');
      }
    } else {
      console.log('   ❌ Erro na resposta:', responseText);

      if (responseText.includes('client-token')) {
        console.log('\n   ⚠️ SOLUÇÃO: Configure ZAPI_CLIENT_TOKEN no .env');
      }
    }
  } catch (error) {
    console.log('   ❌ Erro de conexão:', error.message);
  }

  // Teste 2: Verificar QR Code (se não conectado)
  console.log('\n4. VERIFICANDO QR CODE...');
  const qrUrl = `${baseUrl}/${instanceId}/token/${token}/qr-code`;

  try {
    const headers = { 'Content-Type': 'application/json' };
    if (clientToken) {
      headers['Client-Token'] = clientToken;
    }

    const response = await fetch(qrUrl, { method: 'GET', headers });
    const responseText = await response.text();

    if (response.ok) {
      const data = JSON.parse(responseText);
      if (data.value) {
        console.log('   QR Code disponível para escaneamento');
        console.log(`   Acesse o painel Z-API para escanear: https://app.z-api.io`);
      } else {
        console.log('   Nenhum QR Code pendente (já conectado ou erro)');
      }
    }
  } catch (error) {
    console.log('   Não foi possível verificar QR Code');
  }
}

testZapi();
