export const config = {
  server: "https://lichess.org",
  team: "darkonbullt",
  oauthToken: process.env.OAUTH_TOKEN!,
  daysInAdvance: 0,
  dryRun: false,

  arena: {
    name: () => "Hourly 1+0",
    description: () => "Professional Bullet tournaments by DarkOnBullt team!",

    clockTime: 1,          // 1+0
    clockIncrement: 0,
    minutes: 120,          // Turnier dauert 2 Stunden
    rated: true,
    variant: "standard",
    intervalHours: 2,      // alle 2 Stunden
  },

  schedule: {
    startHours: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22],
    timezone: "UTC",
  },
};
