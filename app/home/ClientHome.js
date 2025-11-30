'use client';
import {useState, useEffect} from 'react';
import useHome from './functions/useHome';
import { updateHomeCookie, createHome } from './functions/switchHomes';
import {MemberList, MemberAdd, TaskAdd, TaskList} from './functions/showHome';


export default function ClientHome({homes, initialHomeId}) {
    const[selectedHomeId, setSelectedHomeId] = useState(initialHomeId);
    const {currentHome} = useHome(homes, selectedHomeId);
    const [localHomes, setLocalHomes] = useState(homes); //adaptar array homes que da el servidor al momento de iniciar sesion 

    const [selectedMember, setSelectedMember] = useState(null);
    const[members, setMembers] = useState([]);
    const[tasks, setTasks] = useState([]);
    const[defaultTasks, setDefaultTasks] = useState([])
    const[showSurvey, setShowSurvey] = useState(false);
    const[editingTask, setEditingTask] = useState(null)


    async function handleSwitchHome(id){
        setSelectedHomeId(id);
        await updateHomeCookie(id);
        setMembers([]);
        setTasks([]);
    }

    async function handleCreateHome(){
        const name = prompt("Nombre del nuevo hogar:");
        if(!name) return;

        const newHome = await createHome(name, currentHome.user_id);
        setLocalHomes(prev => [...prev, newHome]);
        await handleSwitchHome(newHome.id)
    }

    return(
        <div>
            <select
                value={currentHome?.id}
                onChange={(e) => handleSwitchHome(Number(e.target.value))}>
                {localHomes.map(h => (<option key={h.id} value={h.id}>{h.name}</option>))}
            </select>

            <button onClick={handleCreateHome}>Crear Hogar</button>

            <h1>Current Home: {currentHome?.name}</h1>

            <MemberAdd homes={homes} currentHome={currentHome} setMembers={setMembers}/>
            <MemberList homes={homes} currentHome={currentHome} members={members} setMembers={setMembers} selectedMember={selectedMember} setSelectedMember={setSelectedMember}/>
            <TaskAdd homes={homes} currentHome={currentHome} setTasks={setTasks} members={members} setMembers={setMembers} showSurvey={showSurvey} setShowSurvey={setShowSurvey} defaultTasks={defaultTasks} setDefaultTasks={setDefaultTasks} editingTask={editingTask} setEditingTask={setEditingTask}/>
            <TaskList homes={homes} currentHome={currentHome} tasks={tasks} setTasks={setTasks} selectedMember={selectedMember} setSelectedMember={setSelectedMember} setEditingTask={setEditingTask} setShowSurvey={setShowSurvey}/>

        </div>
    )
}
