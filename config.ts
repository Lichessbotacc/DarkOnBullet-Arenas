export const config = {
  server: "https://lichess.org",
  team: "darkonbullt",
  oauthToken: process.env.OAUTH_TOKEN!,

  dryRun: false,

  arena: {
    name: () => "DarkOnBullet 1+0",
    description: () =>
      "Welcome to the 1+0 Arenas of DarkOnBullet! [JOIN OUR WHATSAPP GROUP](https://chat.whatsapp.com/KAZn4UrhOZq57P4cPjAuYe?s=cl&p=i&mlu=1) , Good luck and invite your friends!",

    clockTime: 1,
    clockIncrement: 0,
    minutes: 120,

    rated: true,
    variant: "standard"
  }
};
