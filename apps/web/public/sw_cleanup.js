/**
 * Service Worker Cleanup Script
 * ==============================
 * Remove todos os Service Workers registrados e limpa caches.
 * Injetar temporariamente no index.html após deploys problemáticos.
 *
 * Auto-desativa após 7 dias da data de deploy.
 */
(function () {
  'use strict';

  // Data do deploy - ajuste conforme necessário
  var DEPLOY_DATE = new Date('2026-01-12');
  var CLEANUP_DAYS = 7;
  var CLEANUP_EXPIRES = new Date(DEPLOY_DATE.getTime() + CLEANUP_DAYS * 24 * 60 * 60 * 1000);

  // Verifica se ainda está no período de limpeza
  if (new Date() > CLEANUP_EXPIRES) {
    console.log('[SW Cleanup] Período de limpeza expirado. Script inativo.');
    return;
  }

  console.log('[SW Cleanup] Iniciando limpeza de Service Workers...');

  // 1. Desregistra todos os Service Workers
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function (registrations) {
      if (registrations.length === 0) {
        console.log('[SW Cleanup] Nenhum Service Worker encontrado.');
        return;
      }

      registrations.forEach(function (registration) {
        registration.unregister().then(function (success) {
          if (success) {
            console.log('[SW Cleanup] Service Worker removido:', registration.scope);
          } else {
            console.warn('[SW Cleanup] Falha ao remover SW:', registration.scope);
          }
        });
      });
    }).catch(function (error) {
      console.error('[SW Cleanup] Erro ao listar SWs:', error);
    });
  }

  // 2. Limpa todos os caches
  if ('caches' in window) {
    caches.keys().then(function (cacheNames) {
      if (cacheNames.length === 0) {
        console.log('[SW Cleanup] Nenhum cache encontrado.');
        return;
      }

      cacheNames.forEach(function (cacheName) {
        caches.delete(cacheName).then(function (success) {
          if (success) {
            console.log('[SW Cleanup] Cache removido:', cacheName);
          }
        });
      });
    }).catch(function (error) {
      console.error('[SW Cleanup] Erro ao limpar caches:', error);
    });
  }

  // 3. Limpa localStorage relacionado a SW/PWA (opcional)
  try {
    var keysToRemove = [];
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      if (key && (key.includes('sw-') || key.includes('workbox') || key.includes('pwa'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(function (key) {
      localStorage.removeItem(key);
      console.log('[SW Cleanup] localStorage removido:', key);
    });
  } catch (e) {
    // Ignora erros de localStorage
  }

  console.log('[SW Cleanup] Limpeza concluída. Expira em:', CLEANUP_EXPIRES.toISOString());
})();
