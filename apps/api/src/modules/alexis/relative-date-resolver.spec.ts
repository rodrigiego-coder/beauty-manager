import { resolveRelativeDate } from './relative-date-resolver';

describe('RelativeDateResolver', () => {
  it('"amanhã que dia é?" deve retornar resposta com dia da semana e dd/MM', () => {
    const result = resolveRelativeDate('amanhã que dia é?');
    expect(result.matched).toBe(true);
    expect(result.response).toMatch(/^Amanhã é .+, \d{2}\/\d{2}\./);
  });

  it('"que dia é amanhã?" deve retornar resposta', () => {
    const result = resolveRelativeDate('que dia é amanhã?');
    expect(result.matched).toBe(true);
    expect(result.response).toContain('Amanhã');
  });

  it('"hoje que dia é?" deve retornar resposta com "Hoje"', () => {
    const result = resolveRelativeDate('hoje que dia é?');
    expect(result.matched).toBe(true);
    expect(result.response).toMatch(/^Hoje é .+, \d{2}\/\d{2}\./);
  });

  it('"depois de amanhã que dia é?" deve retornar +2 dias', () => {
    const result = resolveRelativeDate('depois de amanhã que dia é?');
    expect(result.matched).toBe(true);
    expect(result.response).toContain('Depois de amanhã');
  });

  it('"qual a data de amanhã?" deve retornar resposta', () => {
    const result = resolveRelativeDate('qual a data de amanhã?');
    expect(result.matched).toBe(true);
    expect(result.response).toContain('Amanhã');
  });

  it('"que data é hoje?" deve retornar resposta', () => {
    const result = resolveRelativeDate('que data é hoje?');
    expect(result.matched).toBe(true);
    expect(result.response).toContain('Hoje');
  });

  it('mensagem sem pergunta de data não deve casar', () => {
    const result = resolveRelativeDate('quero agendar para amanhã');
    expect(result.matched).toBe(false);
  });

  it('"oi tudo bem?" não deve casar', () => {
    const result = resolveRelativeDate('oi tudo bem?');
    expect(result.matched).toBe(false);
  });

  it('"amanhã quero cortar cabelo" não deve casar (não é pergunta de data)', () => {
    const result = resolveRelativeDate('amanhã quero cortar cabelo');
    expect(result.matched).toBe(false);
  });

  it('resposta deve conter dia da semana em pt-BR', () => {
    const result = resolveRelativeDate('hoje que dia é?');
    expect(result.matched).toBe(true);
    const weekdays = [
      'domingo', 'segunda-feira', 'terça-feira', 'quarta-feira',
      'quinta-feira', 'sexta-feira', 'sábado',
    ];
    expect(weekdays.some((d) => result.response!.includes(d))).toBe(true);
  });
});
