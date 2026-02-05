/**
 * =====================================================
 * SCRIPT: Sincroniza todos os agendamentos com Google Calendar
 * Uso: npx ts-node src/scripts/sync-all-to-google.ts
 * =====================================================
 */

import { db } from '../database/connection';
import { appointments, googleCalendarTokens, users, clients } from '../database/schema';
import { eq, and, gte, or } from 'drizzle-orm';
import { google } from 'googleapis';
import 'dotenv/config';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

async function main() {
  console.log('\n🔄 Iniciando sincronização em massa com Google Calendar...\n');

  // 1. Busca tokens do salão
  const [token] = await db
    .select()
    .from(googleCalendarTokens)
    .where(eq(googleCalendarTokens.syncEnabled, true))
    .limit(1);

  if (!token) {
    console.error('❌ Nenhuma conta Google Calendar conectada ao salão!');
    process.exit(1);
  }

  console.log(`✅ Conta Google encontrada: ${token.calendarId}`);

  // 2. Configura OAuth
  const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
  );

  oauth2Client.setCredentials({
    access_token: token.accessToken,
    refresh_token: token.refreshToken,
  });

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  // 3. Busca agendamentos futuros (a partir de hoje)
  const today = new Date().toISOString().split('T')[0];

  const futureAppointments = await db
    .select({
      id: appointments.id,
      date: appointments.date,
      time: appointments.time,
      startTime: appointments.startTime,
      endTime: appointments.endTime,
      duration: appointments.duration,
      service: appointments.service,
      status: appointments.status,
      clientId: appointments.clientId,
      clientName: appointments.clientName,
      professionalId: appointments.professionalId,
      googleEventId: appointments.googleEventId,
      salonId: appointments.salonId,
    })
    .from(appointments)
    .where(
      and(
        gte(appointments.date, today),
        or(
          eq(appointments.status, 'SCHEDULED'),
          eq(appointments.status, 'CONFIRMED'),
        ),
      ),
    )
    .orderBy(appointments.date, appointments.time);

  console.log(`📅 Encontrados ${futureAppointments.length} agendamentos futuros\n`);

  if (futureAppointments.length === 0) {
    console.log('✅ Nenhum agendamento para sincronizar.');
    process.exit(0);
  }

  // 4. Busca todos os profissionais
  const professionals = await db.select({ id: users.id, name: users.name }).from(users);
  const profMap = new Map(professionals.map(p => [p.id, p.name || 'Profissional']));

  // 5. Busca todos os clientes
  const allClients = await db.select({ id: clients.id, name: clients.name }).from(clients);
  const clientMap = new Map(allClients.map(c => [c.id, c.name || 'Cliente']));

  let synced = 0;
  let errors = 0;
  let skipped = 0;

  // 6. Sincroniza cada agendamento
  for (const apt of futureAppointments) {
    const professionalName = apt.professionalId ? profMap.get(apt.professionalId) || 'Profissional' : 'Profissional';
    const clientName = apt.clientId ? clientMap.get(apt.clientId) || apt.clientName || 'Cliente' : apt.clientName || 'Cliente';

    const eventTitle = `${apt.service} - ${professionalName}`;
    const startTime = apt.startTime || apt.time;
    const endTime = apt.endTime || calculateEndTime(startTime!, apt.duration);

    const event = {
      summary: eventTitle,
      description: `Agendamento via Beauty Manager\nServiço: ${apt.service}\nProfissional: ${professionalName}\nCliente: ${clientName}`,
      start: {
        dateTime: `${apt.date}T${startTime}:00`,
        timeZone: 'America/Sao_Paulo',
      },
      end: {
        dateTime: `${apt.date}T${endTime}:00`,
        timeZone: 'America/Sao_Paulo',
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup' as const, minutes: 30 },
          { method: 'popup' as const, minutes: 60 },
        ],
      },
    };

    try {
      let eventId: string;

      if (apt.googleEventId) {
        // Atualiza evento existente
        try {
          const response = await calendar.events.update({
            calendarId: token.calendarId || 'primary',
            eventId: apt.googleEventId,
            requestBody: event,
          });
          eventId = response.data.id!;
          console.log(`🔄 UPDATE: ${apt.date} ${apt.time} - ${eventTitle}`);
        } catch (updateError: any) {
          // Se o evento não existe mais, cria novo
          if (updateError?.code === 404) {
            const response = await calendar.events.insert({
              calendarId: token.calendarId || 'primary',
              requestBody: event,
            });
            eventId = response.data.id!;
            await db
              .update(appointments)
              .set({ googleEventId: eventId })
              .where(eq(appointments.id, apt.id));
            console.log(`➕ CREATE (evento antigo não encontrado): ${apt.date} ${apt.time} - ${eventTitle}`);
          } else {
            throw updateError;
          }
        }
      } else {
        // Cria novo evento
        const response = await calendar.events.insert({
          calendarId: token.calendarId || 'primary',
          requestBody: event,
        });
        eventId = response.data.id!;

        // Salva o eventId no agendamento
        await db
          .update(appointments)
          .set({ googleEventId: eventId })
          .where(eq(appointments.id, apt.id));

        console.log(`➕ CREATE: ${apt.date} ${apt.time} - ${eventTitle}`);
      }

      synced++;

      // Rate limiting - espera 100ms entre requests
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error: any) {
      console.error(`❌ ERRO: ${apt.date} ${apt.time} - ${eventTitle}: ${error?.message}`);
      errors++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✅ Sincronizados: ${synced}`);
  console.log(`❌ Erros: ${errors}`);
  console.log(`⏭️  Ignorados: ${skipped}`);
  console.log('='.repeat(50) + '\n');

  process.exit(0);
}

function calculateEndTime(startTime: string, duration: number): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + duration;
  const endHours = Math.floor(totalMinutes / 60);
  const endMinutes = totalMinutes % 60;
  return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
}

main().catch(error => {
  console.error('Erro fatal:', error);
  process.exit(1);
});
