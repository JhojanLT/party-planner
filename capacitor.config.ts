import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.partyplanner.app',
  appName: 'Party Planner',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
