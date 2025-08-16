export async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit & { timeout?: number } = {}): Promise<Response> {
  const { timeout, ...rest } = init;
  if (!timeout) return fetch(input, rest);
  
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeout);
  
  try {
    return await fetch(input, { ...rest, signal: ctrl.signal });
  } finally {
    clearTimeout(id);
  }
}

export function isOnline(): boolean {
  if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
    return navigator.onLine;
  }
  return true; // Default to online for Node.js environments
}

let serverOffsetMs = 0;
export function getServerTimeOffset(): number { 
  return serverOffsetMs; 
}

export function getAdjustedTime(date = new Date()): Date { 
  return new Date(date.getTime() + serverOffsetMs); 
}

export function __setServerTimeOffsetForTest(ms: number): void { 
  serverOffsetMs = ms; 
}