'use client';
import {useState, useEffect} from 'react';
import useHome from './functions/useHome';
import {MemberList, MemberAdd, TaskAdd, TaskList, HomeFunction} from './functions/showHome';
import { useRouter } from 'next/navigation';


export default function ClientHome({homes, initialHomeId, userId}) {
    const[selectedHomeId, setSelectedHomeId] = useState(initialHomeId);
    const [localHomes, setLocalHomes] = useState(homes); //adaptar array homes que da el servidor al momento de iniciar sesion 
    const {currentHome} = useHome(localHomes, selectedHomeId);
    const [selectedMember, setSelectedMember] = useState(null);
    const[members, setMembers] = useState([]);
    const[tasks, setTasks] = useState([]);
    const[defaultTasks, setDefaultTasks] = useState([])
    const[showSurvey, setShowSurvey] = useState(false);
    const[editingTask, setEditingTask] = useState(null)

    const router = useRouter();

    async function logout() {
        router.push("/");
    }
    return(
        <div>
            <button onClick={logout}>Logout</button>
            {localHomes.length === 0 ? (
                <div>
                    <HomeFunction currentHome={currentHome} userId={userId} localHomes={localHomes} setLocalHomes={setLocalHomes} selectedHomeId={selectedHomeId} setSelectedHomeId={setSelectedHomeId} setMembers={setMembers} setTasks={setTasks}/>
                </div>
            ) : (
                <>
                    <HomeFunction currentHome={currentHome} userId={userId} localHomes={localHomes} setLocalHomes={setLocalHomes} selectedHomeId={selectedHomeId} setSelectedHomeId={setSelectedHomeId} setMembers={setMembers} setTasks={setTasks}/>
                    <MemberAdd homes={homes} currentHome={currentHome}  members={members} setMembers={setMembers}/>
                    <MemberList homes={homes} currentHome={currentHome} setTasks={setTasks} members={members} setMembers={setMembers} selectedMember={selectedMember} setSelectedMember={setSelectedMember}/>
                    <TaskAdd homes={homes} currentHome={currentHome} tasks={tasks} setTasks={setTasks} members={members} setMembers={setMembers} showSurvey={showSurvey} setShowSurvey={setShowSurvey} defaultTasks={defaultTasks} setDefaultTasks={setDefaultTasks} editingTask={editingTask} setEditingTask={setEditingTask}/>
                    <TaskList homes={homes} currentHome={currentHome} tasks={tasks} setTasks={setTasks} selectedMember={selectedMember} setSelectedMember={setSelectedMember} setEditingTask={setEditingTask} setShowSurvey={setShowSurvey}/>                
                </>
            )}


        </div>
    )
}
