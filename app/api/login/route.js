import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL);


export async function POST(req) {
  console.log("DB URL?", process.env.DATABASE_URL);


  try {
    const { email } = await req.json();

    if (!email) return new Response("Email is required", { status: 400 });

    //ver si usuario existe en la base de datos
    const users = await sql`SELECT id FROM users WHERE email = ${email}`;


    let userId;

    //Si usuario no existe en base de datos
    if (users.length === 0) {

      // Registrar usuario
      const inserted = await sql`INSERT INTO users (email) VALUES (${email}) RETURNING id`;
      userId = inserted[0].id; // .id es la propiedad id de la base de datos

      // Crear primer hogar
      await sql`INSERT INTO homes (name, user_id) VALUES ('Mi Primer Hogar', ${userId})`;

    } else {
      userId = users[0].id; //Si ya existe
    }

    //obtener hogares de usuario ya registrado
    let homeId;

    const homes = await sql`SELECT * FROM homes WHERE user_id = ${userId} ORDER BY id ASC LIMIT 1`;
    const firstHome = homes[0];



    // Cookies y retornar JSON
    const res = NextResponse.json({ userId, homes}); //respuesta de API

    res.cookies.set({ //respuesta de cookies
      name: "userId",           //nombre de cookie
      value: String(userId),    //valor dentro de cookie
      path: "/",                //cookie valida para todo el sitio
      httpOnly: true,          
      sameSite: "lax",
      // secure: true, // uncomment if using HTTPS
    });

    if (homes.length > 0) {
      res.cookies.set({
        name: "homeId",
        value: String(homes[0].id),
        path: "/",
        httpOnly: true,
        sameSite: "lax",
      });
    } else {
      // Important: clear previous homeId cookie if it existed
      res.cookies.set({
        name: "homeId",
        value: "",
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 0,
      });
    }

    return res;

  } catch (err) {
    console.error(err);
    return new Response("Internal Server Error", { status: 500 });
  }
}