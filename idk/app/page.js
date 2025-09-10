import Image from 'next/image'
import data from "./data/nombres.json"
 
export default function Page() {
  return (
    <>
    <center>
    <h1>{data.titulo}</h1>
    
    {data.amigos.map((amigo, i) => (
        <div key={i}>{amigo.nombre}</div>)
        )
    }

    <Image src="/profile.png" alt="Profile" width={1500} height={500} />
    </center>
    
    </>
  )
}

//<iframe src="https://www.youtube.com/watch?v=R1tgBxuRqZ8" allowFullScreen />