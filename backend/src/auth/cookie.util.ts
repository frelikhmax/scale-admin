export function getHeader(request: { headers?: Record<string, string | string[] | undefined> }, name: string): string | undefined {
  const header = request.headers?.[name];
  if (Array.isArray(header)) {
    return header.join(', ');
  }

  return typeof header === 'string' ? header : undefined;
}

export function getCookie(request: { headers?: Record<string, string | string[] | undefined> }, cookieName: string): string | undefined {
  const cookieHeader = getHeader(request, 'cookie');
  if (!cookieHeader) {
    return undefined;
  }

  const cookies = cookieHeader.split(';');
  for (const cookie of cookies) {
    const [rawName, ...rawValueParts] = cookie.trim().split('=');
    if (rawName === cookieName) {
      const rawValue = rawValueParts.join('=');
      return rawValue ? decodeURIComponent(rawValue) : undefined;
    }
  }

  return undefined;
}
