const STORAGE_KEY = 'moaz_admin_auth';
const CONFIG_KEY = 'moaz_cognito_config';

export type CognitoAuthSession = {
  idToken: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
  email: string;
};

export type CognitoLoginResult =
  | { status: 'SUCCESS'; session: CognitoAuthSession }
  | { status: 'NEW_PASSWORD_REQUIRED'; sessionToken: string; username: string };

export function getCognitoConfig() {
  const saved = localStorage.getItem(CONFIG_KEY);
  const parsed = saved ? JSON.parse(saved) : {};
  return {
    region: import.meta.env.VITE_COGNITO_REGION || parsed.region || 'us-east-1',
    clientId: import.meta.env.VITE_COGNITO_CLIENT_ID || parsed.clientId || '',
  };
}

export function saveCognitoConfig(region: string, clientId: string) {
  localStorage.setItem(CONFIG_KEY, JSON.stringify({ region: region.trim(), clientId: clientId.trim() }));
}

export function getStoredSession(): CognitoAuthSession | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const session: CognitoAuthSession = JSON.parse(raw);
    if (Date.now() >= session.expiresAt) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function clearSession() {
  sessionStorage.removeItem(STORAGE_KEY);
}

async function cognitoRequest(region: string, target: string, body: Record<string, unknown>) {
  const endpoint = `https://cognito-idp.${region}.amazonaws.com/`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-amz-json-1.1',
      'X-Amz-Target': `AWSCognitoIdentityProviderService.${target}`,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.__type || 'Authentication failed');
  }
  return data;
}

export async function signInWithCognito(
  email: string,
  password: string,
  region: string,
  clientId: string
): Promise<CognitoLoginResult> {
  const data = await cognitoRequest(region, 'InitiateAuth', {
    AuthFlow: 'USER_PASSWORD_AUTH',
    ClientId: clientId,
    AuthParameters: {
      USERNAME: email.trim(),
      PASSWORD: password,
    },
  });

  if (data.ChallengeName === 'NEW_PASSWORD_REQUIRED') {
    return {
      status: 'NEW_PASSWORD_REQUIRED',
      sessionToken: data.Session,
      username: email.trim(),
    };
  }

  const auth = data.AuthenticationResult;
  const session: CognitoAuthSession = {
    idToken: auth.IdToken,
    accessToken: auth.AccessToken,
    refreshToken: auth.RefreshToken,
    expiresAt: Date.now() + (auth.ExpiresIn || 3600) * 1000,
    email: email.trim(),
  };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  return { status: 'SUCCESS', session };
}

export async function completeNewPasswordChallenge(
  username: string,
  newPassword: string,
  sessionToken: string,
  region: string,
  clientId: string
): Promise<CognitoAuthSession> {
  const data = await cognitoRequest(region, 'RespondToAuthChallenge', {
    ChallengeName: 'NEW_PASSWORD_REQUIRED',
    ClientId: clientId,
    Session: sessionToken,
    ChallengeResponses: {
      USERNAME: username,
      NEW_PASSWORD: newPassword,
    },
  });

  const auth = data.AuthenticationResult;
  const session: CognitoAuthSession = {
    idToken: auth.IdToken,
    accessToken: auth.AccessToken,
    refreshToken: auth.RefreshToken,
    expiresAt: Date.now() + (auth.ExpiresIn || 3600) * 1000,
    email: username,
  };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  return session;
}
