import fetch from "node-fetch";
import { URLSearchParams } from "url";
import { config } from "./config.js";

function assertEnv() {
  if (!process.env.OAUTH_TOKEN) {
    throw new Error("Missing OAUTH_TOKEN");
  }
}

/**
 * Align to next full 2-hour slot
 */
function nextAlignedSlot(from: Date, hoursAhead: number): Date {
  const d = new Date(from);

  d.setUTCMinutes(0, 0, 0);

  const currentHour = d.getUTCHours();
  const nextSlotHour = currentHour + hoursAhead;

  d.setUTCHours(nextSlotHour);

  return d;
}

async function createArena(startDate: Date) {
  const body = new URLSearchParams({
    name: config.arena.name(),
    description: config.arena.description(),

    clockTime: String(config.arena.clockTime),
    clockIncrement: String(config.arena.clockIncrement),
    minutes: String(config.arena.minutes),

    rated: config.arena.rated ? "true" : "false",
    variant: config.arena.variant,

    startDate: startDate.toISOString(),

    "conditions.teamMember.teamId": config.team
  });

  console.log("Creating:", startDate.toISOString());

  const res = await fetch(`${config.server}/api/tournament`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OAUTH_TOKEN}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json"
    },
    body
  });

  const text = await res.text();

  if (!res.ok) {
    console.error("ERROR:", res.status, text);
    throw new Error("Tournament creation failed");
  }

  const data = JSON.parse(text);

  const url = data.id
    ? `${config.server}/tournament/${data.id}`
    : config.server;

  console.log("Created:", url);
  return url;
}

async function main() {
  assertEnv();

  const now = new Date();

  console.log("=== Rolling 2-step tournament generator ===");
  console.log("Team:", config.team);
  console.log("Format: 1+0 | 2h duration");

  if (config.dryRun) {
    console.log("DRY RUN");
    return;
  }

  const created = [];

  // 👉 ALWAYS keep 2 future tournaments alive
  for (let i = 1; i <= 2; i++) {
    const start = nextAlignedSlot(now, i * 2); // +2h, +4h
    const url = await createArena(start);
    created.push(url);
  }

  console.log("\n=== DONE ===");
  created.forEach((u, i) => {
    console.log(`${i + 1}. ${u}`);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
