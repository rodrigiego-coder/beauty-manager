/**
 * Copia texto para a área de transferência
 * Funciona tanto em HTTPS quanto HTTP (com fallback)
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // Tenta usar a API moderna (funciona em HTTPS)
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Ignora erro e tenta fallback
  }

  // Fallback para HTTP usando execCommand (deprecated mas funcional)
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '-9999px';
    textarea.setAttribute('readonly', '');
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);
    document.execCommand('copy');
    document.body.removeChild(textarea);
    return true;
  } catch {
    console.error('Falha ao copiar para clipboard');
    return false;
  }
}
