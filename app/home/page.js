import ClientHome from './ClientHome';
import {cookies} from 'next/headers';

import { neon } from '@neondatabase/serverless';
import { NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL);

export const dynamic = "force-dynamic";

export default async function UserHome(){
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value; //sin .value, retorna un json con todos los componentes definidos en la API, .value retorna el valor que le damos dentro de la API

  const homesResult = await sql`SELECT * FROM homes WHERE user_id = ${userId} ORDER BY id ASC;`;
  const homes = homesResult

  let homeId
  if (homes.length === 0) {
    homeId = null;
  } else {
    homeId = cookieStore.get('homeId')?.value || homes[0].id;
  }
  
  console.log("COOKIE READ ON LOAD:", homeId);

  return <ClientHome homes={homes} initialHomeId={homeId} userId={userId}/>;

}


/*
import { cookies } from 'next/headers';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function UserHome() {
  try {
    const cookieStore = await cookies();

    const userIdCookie = cookieStore.get('userId') //get(cookiename)
    const userId = userIdCookie?.value;

    //hogares en cookies
    let currentHomeCookie = cookieStore.get('homeId'); //cookies devuelven primer hogar, que es el default
    const [currentHomeId, setCurrentHomeId] = useState(currentHomeCookie?.value || homes[0].id); 

    if (!currentHomeId){
      currentHomeId = homes[0].id;

      cookieStore.set({
        name: 'homeId',
        value: String(currentHomeId),
        path: '/',
        httpOnly: true,
      });
    }

    const currentHome = homes.find(h => h.id == parseInt(currentHomeId));


    return(
      <div>
        <h1>Current Home: {currentHome.name}</h1>
      </div> 
    )

  } catch (err) {
    console.error(err);
    return <div>Something went wrong. Please try again later.</div>;
  }
}

    const cookieStore = await cookies(); // obtener cookies de la pagina

    //obtener cookies del usuario
    const userIdCookie = cookieStore.get('userId');
    const userId = userIdCookie?.value;             //?.value significa que si existe un valor, que me lo de, si no que de undefined

    if (!userId) {
      return <div><h1>Please log in to see your homepage</h1></div>;
    }

    // Hogares de usuario
    const result = await pool.query(
      'SELECT * FROM homes WHERE user_id = $1',
      [userId]
    );

    const homes = result.rows;

    if (!homes.length) {
      return <div><h1>Welcome! You don't have any homes yet.</h1></div>;
    }

    return (
      <div>
        <h1>Your Homes</h1>
        <ul>
          {homes.map(home => (
            <li key={home.id}>{home.name}</li>
          ))}
        </ul>
      </div>
    );
*/
