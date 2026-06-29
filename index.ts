import { URLSearchParams } from "url";
import { config } from "./config.js";

function assertEnv() {
  if (!process.env.OAUTH_TOKEN) {
    throw new Error("Missing OAUTH_TOKEN");
  }
}

function getTargetSlots(now: Date): Date[] {
  const base = new Date(now);
  base.setUTCMinutes(0, 0, 0);
  return [
    new Date(base.getTime() + 2 * 60 * 60 * 1000),
    new Date(base.getTime() + 4 * 60 * 60 * 1000),
  ];
}

async function getExistingTournaments(): Promise<any[]> {
  const res = await fetch(
    `${config.server}/api/team/${config.team}/arena`,
    {
      headers: {
        Authorization: `Bearer ${process.env.OAUTH_TOKEN}`,
        Accept: "application/x-ndjson",
      },
    }
  );
  if (!res.ok) {
    console.error("Failed to fetch existing tournaments:", await res.text());
    return [];
  }
  const text = await res.text();
  return text
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function existsAtTime(tournaments: any[], target: Date): boolean {
  const targetMs = target.getTime();
  return tournaments.some((t) => {
    if (!t.startsAt) return false;
    return new Date(t.startsAt).getTime() === targetMs;
  });
}

async function createArena(startDate: Date): Promise<string> {
  const body = new URLSearchParams({
    name: config.arena.name(),
    description: config.arena.description(),
    clockTime: String(config.arena.clockTime),
    clockIncrement: String(config.arena.clockIncrement),
    minutes: String(config.arena.minutes),
    rated: config.arena.rated ? "true" : "false",
    variant: config.arena.variant,
    startDate: String(startDate.getTime()),
    "conditions.teamMember.teamId": config.team,
  });

  const res = await fetch(`${config.server}/api/tournament`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OAUTH_TOKEN}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body,
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Create failed: ${res.status} ${text}`);
  }

  const data = JSON.parse(text);
  const url = `${config.server}/tournament/${data.id}`;
  console.log("✅ Created:", url);
  return url;
}

async function main() {
  assertEnv();
  console.log("=== SAFE 2H FUTURE TOURNAMENT SYSTEM ===");

  const now = new Date();
  const slots = getTargetSlots(now);

  console.log("Target slots:");
  slots.forEach((s) => console.log(" -", s.toISOString()));

  const existing = await getExistingTournaments();
  const created: string[] = [];

  for (const slot of slots) {
    if (existsAtTime(existing, slot)) {
      console.log("⏭ Already exists:", slot.toISOString());
      continue;
    }
    const url = await createArena(slot);
    created.push(url);
  }

  console.log("\n=== DONE ===");
  if (created.length === 0) {
    console.log("No new tournaments needed (already up to date)");
  } else {
    created.forEach((c) => console.log(c));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
