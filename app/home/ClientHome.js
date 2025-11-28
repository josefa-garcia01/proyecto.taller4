'use client';
import {useState, useEffect} from 'react';
import useHome from './functions/useHome';
import {MemberList, MemberAdd, TaskAdd, TaskList} from './functions/showHome';


export default function ClientHome({homes, initialHomeId}) {
    const {currentHome, displayMember} = useHome(homes, initialHomeId);
    const [selectedMember, setSelectedMember] = useState(null);
    const[members, setMembers] = useState([]);
    const[tasks, setTasks] = useState([]);
    const[defaultTasks, setDefaultTasks] = useState([])
    const[showSurvey, setShowSurvey] = useState(false);



    return(
        <div>
            <h1>Current Home: {currentHome?.name}</h1>

            <MemberAdd homes={homes} currentHome={currentHome} setMembers={setMembers}/>
            <MemberList homes={homes} currentHome={currentHome} members={members} setMembers={setMembers} selectedMember={selectedMember} setSelectedMember={setSelectedMember}/>
            <TaskAdd homes={homes} currentHome={currentHome} tasks={tasks} setTasks={setTasks} members={members} setMembers={setMembers} showSurvey={showSurvey} setShowSurvey={setShowSurvey} defaultTasks={defaultTasks} setDefaultTasks={setDefaultTasks}/>
            <TaskList homes={homes} currentHome={currentHome} tasks={tasks} setTasks={setTasks} selectedMember={selectedMember} setSelectedMember={setSelectedMember}/>

        </div>
    )
}
