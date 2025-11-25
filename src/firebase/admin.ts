
import { initializeApp, getApps, App } from 'firebase-admin/app';

// IMPORTANT: This configuration is for the SERVER-SIDE Admin SDK.
// It should not be exposed to the client. In a real production app,
// you would load these credentials from a secure source like Google Secret Manager.
// For this example, we'll assume they are set as environment variables.
const firebaseAdminConfig = {
  // Since we are in a Google Cloud environment (like Cloud Workstations),
  // the Admin SDK can often auto-discover credentials.
  // We leave this empty to let the SDK try auto-discovery.
};

export function initializeAdminApp(): App {
  const apps = getApps();
  if (apps.length > 0) {
    return apps[0];
  }
  return initializeApp(firebaseAdminConfig);
}
