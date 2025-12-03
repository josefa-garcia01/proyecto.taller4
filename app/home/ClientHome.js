'use client';
import {useState} from 'react';
import { useRouter } from 'next/navigation';

export default function ClientHome({homes, initialHomeId, userId}) {
    const[selectedHomeId, setSelectedHomeId] = useState(initialHomeId);
    const [localHomes, setLocalHomes] = useState(homes);
    
    const router = useRouter();
    
    async function logout() {
        router.push("/");
    }

    return(
        <div>
            <button onClick={logout}>Logout</button>
            <h1>ClientHome Loaded - Debug Mode</h1>
            <p>Homes count: {localHomes.length}</p>
            <p>Selected Home ID: {selectedHomeId}</p>
            <p>User ID: {userId}</p>
            
            {localHomes.length > 0 && (
                <div>
                    <h2>Available Homes:</h2>
                    <ul>
                        {localHomes.map(home => (
                            <li key={home.id}>{home.name} (ID: {home.id})</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}
