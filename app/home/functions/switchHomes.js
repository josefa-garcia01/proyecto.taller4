"use server";

import { neon } from "@neondatabase/serverless";
import { cookies } from "next/headers";

const sql = neon(process.env.DATABASE_URL);

export async function updateHomeCookie(homeId) {
  const cookieStore = await cookies();
  
  cookieStore.set("homeId", String(homeId), {
    path: "/",
    sameSite: "lax",
    httpOnly: true
  });

  return true;
}


export async function createHome(name, userId) {
  // Insert the new home
    const inserted = await sql`INSERT INTO homes (name, user_id) VALUES (${name}, ${userId}) RETURNING id, name;`;

    const home = inserted[0];

    // Update the cookie so the user switches to the new home
    const cookieStore = await cookies();
    cookieStore.set("homeId", String(home.id), {
        path: "/",
        httpOnly: true,
        sameSite: "lax"
    });

    return home; // return the created home to the client
}