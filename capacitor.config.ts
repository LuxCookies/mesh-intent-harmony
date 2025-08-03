import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.d6ae6a3130e34ddb8f7b29514217d130',
  appName: 'mesh-intent-harmony',
  webDir: 'dist',
  server: {
    url: 'https://d6ae6a31-30e3-4ddb-8f7b-29514217d130.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF",
      sound: "beep.wav",
    },
    Haptics: {},
    Network: {}
  }
};

export default config;