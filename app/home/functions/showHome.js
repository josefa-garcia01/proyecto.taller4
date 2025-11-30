'use client';
import {useState, useEffect} from 'react';
import useHome from './useHome';

export function MemberAdd ({homes, currentHome, setMembers}) {
    const {displayMember, addMember} = useHome(homes, currentHome);
    const [memberName, setMemberName] = useState('');

    async function handleAddMember() {
        await addMember(currentHome.id, memberName);
        setMemberName(''); // clear input
        const updated = await displayMember(); // refresh list
        setMembers(updated);
    }

    return (
        <d1>
            <input
            type="name"
            placeholder="Ingresar nombre de miembro nuevo"
            value={memberName}
            onChange={(e) => setMemberName(e.target.value)}
            />

            <button disabled={!memberName.trim()}  onClick={handleAddMember}>Añadir miembro</button>
        </d1>
    )

}




export function SearchWithDropdown({items, selectedTask, resetFields }) {
    const [query, setQuery] = useState('');
    const [selectedId, setSelectedId] = useState('');

    // search is case-insensitive on title only (or whatever you want)
    const results = items.filter(item =>
        item.title.toLowerCase().includes(query.toLowerCase())
    );

    function handleAutoFill() {
        const task = results.find(t => t.id == parseInt(selectedId));
        if (task) selectedTask(task);
    }

    return (
        <div style={{ width: '300px' }}>
            {/* SEARCH BAR */}
            <input
                type="text"
                placeholder="Search tasks..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ width: '100%', padding: '5px' }}
            />

            {/* DROPDOWN WITH ALL (filtered) TASKS */}
            <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                style={{ width: '100%', marginTop: '10px', padding: '5px' }}
            >
                <option value="">Select a task...</option>

                {results.map(item => (
                    <option key={item.id} value={item.id}>
                        {item.title} — {item.category}
                    </option>
                ))}
            </select>

            <div style={{ display: "flex", flexDirection: "row", flex: 1 }}>
                <button disabled={selectedId == '' || results.length == 0} onClick={handleAutoFill}>Auto-completar</button>
                <button onClick={resetFields}>Vaciar espacios</button>
            </div>

        </div>
    );
}

export function TaskAdd ({homes, currentHome, setTasks, members, setMembers, showSurvey, setShowSurvey, defaultTasks, setDefaultTasks, editingTask, setEditingTask}) {
    const {addTask, updateTask, displayTask, displayDefaultTask, displayMember} = useHome(homes, currentHome);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [frequencyType, setFrequencyType] = useState('days');
    const [frequencyValue, setFrequencyValue] = useState('0');
    const [difficulty, setDifficulty] = useState('');
    const [Estimate, setEstimate] = useState('');
    const [selectedMember, setSelectedMember] = useState('');

    //cargar tareas default
    useEffect( () => {
        async function loadDefaults(){
            if(showSurvey) {
                const defaultTasks = await displayDefaultTask();
                setDefaultTasks(defaultTasks);
            }
        }
        loadDefaults();
    }, [showSurvey]); 

    //cargar miembros
    useEffect(() => {
        async function loadMembers() {
            const data = await displayMember();
            setMembers(data);
        }
        loadMembers();
    }, [currentHome]);


    useEffect(() => {
        if (editingTask && members.length > 0) {
            fillFormFields(editingTask);
        } else {
            resetFormFields();
        }
    }, [editingTask], [members])

    async function resetFormFields() {
        setTitle('');
        setDescription('');
        setFrequencyType('days');
        setFrequencyValue('0');
        setCategory('');
        setDifficulty('0');
        setEstimate('0');
        setSelectedMember('');
    }

    async function fillFormFields(task) {
        setTitle(task.title || '');
        setDescription(task.description || '');
        setCategory(task.category || '');
        setFrequencyType(task.frequency_type || 'days');
        setDifficulty(task.difficulty != null ? String(task.difficulty) : '');
        setEstimate(task.estimated_minutes != null ? String(task.estimated_minutes) : '');
        setFrequencyValue(task.frequency_value != null ? String(task.frequency_value) : '');
        setSelectedMember(task.member_id ?? null);
    }

    async function handleAddTask() {
        if(!title) return alert('El titulo es obligatorio!');
        if(!frequencyValue) return alert('La frecuencia es obligatoria!');
        

        let nextDueDate;


        if (editingTask) {

            const freqChanged =
                parseInt(frequencyValue) !== editingTask.frequency_value || frequencyType !== editingTask.frequency_type;

            if (freqChanged) {
                const now = new Date();

                if (frequencyType === "days") {
                    now.setDate(now.getDate() + parseInt(frequencyValue));
                } else {
                    now.setDate(now.getDate() + parseInt(frequencyValue) * 7);
                }

                nextDueDate = now.toISOString().split("T")[0];
            } else {
                nextDueDate = editingTask.next_due_date;
            }
        }

        else {
            const now = new Date();
            if (frequencyType === "days") {
                now.setDate(now.getDate() + parseInt(frequencyValue));
            } else {
                now.setDate(now.getDate() + parseInt(frequencyValue) * 7);
            }
            nextDueDate = now.toISOString().split("T")[0];
        }

        const newTask = {
            homeId: currentHome.id,
            title,
            description,
            category,
            frequency_type: frequencyType,
            frequency_value: parseInt(frequencyValue),
            next_due_date: nextDueDate, // YYYY-MM-DD format
            member_id: selectedMember || null,
            difficulty: difficulty === "" ? null: difficulty,
            estimated_minutes: Estimate === "" ? null : Estimate
        };

        if (editingTask) {
            await updateTask(editingTask.assigned_id, newTask);
        } else {
            await addTask(newTask);
        }

        setTasks(await displayTask());
        setShowSurvey(false);
        resetFormFields();
    
    }

    return (
        <div>
        <button onClick={() => {setShowSurvey(true), setEditingTask(null)}}>Crear nueva Tarea</button>
        

        {showSurvey && (
            <div className="modal-backdrop">
            <div className="modal-content">
                <h2>Create New Task</h2>

                <SearchWithDropdown items={defaultTasks} selectedTask={fillFormFields} resetFields={resetFormFields}/>

                <label>Titulo:</label>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" />

                <label>Descripcion:</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" />

                <label>Categoria:</label>
                <input value={category} onChange={e => setCategory(e.target.value)} placeholder="Category" />
            
                <label>Miembro a asignar:</label>
                <select
                    value={selectedMember}
                    onChange={(e) => setSelectedMember(e.target.value)}
                    style={{ width: '100%', marginTop: '0px', padding: '5px' }}
                    >
                    <option value="">Selecciona un miembro...</option>

                    {members.map(member => (
                        <option key={member.id} value={member.id}>
                            {member.name}
                        </option>
                    ))}
                </select>

                

                <div className="frequency-row">
                    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                        <label>Tipo de frecuencia</label>
                        <select value={frequencyType} onChange={e => setFrequencyType(e.target.value)}>
                            <option value="days">Days</option>
                            <option value="weeks">Weeks</option>
                        </select>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                        <label>Valor de frecuencia</label>
                        <input
                            type="number"
                            min={0}
                            value={frequencyValue}
                            onChange={e => setFrequencyValue(e.target.value)}
                            placeholder="Frequency"
                        />
                    </div>
                </div>

                <div className="frequency-row">
                    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                        <label>Estimado (minutos):</label>
                        <input
                            type="number"
                            min={0}
                            value={Estimate}
                            onChange={e => setEstimate(e.target.value)}
                            placeholder="Estimado"
                        />
                    </div>
                
                    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                        <label>Dificultad:</label>
                        <input
                            type="number"
                            min={0}
                            max={10}
                            value={difficulty}
                            onChange={e => setDifficulty(e.target.value)}
                            placeholder="difficultad"
                        />
                    </div>
                </div>

                <button onClick={() => setShowSurvey(false)}>Close</button>
                <button onClick={handleAddTask}> {editingTask ? "Guardar cambios" : "Guardar Nueva Tarea"}</button>
            </div>
            </div>
        )}
        </div>
    );
}




export function MemberList ({homes, currentHome, members, setMembers, selectedMember, setSelectedMember}) {
    const {displayMember, deleteMember} = useHome(homes, currentHome);
    const [menuOpenId, setMenuOpenId] = useState(null);

    //Cargar miembros
    useEffect(() => {
        async function loadMembers() {
            const data = await displayMember();
            setMembers(data);
        }
        loadMembers();
    }, [currentHome]);

    async function handleDeleteMember(memberId) {
        await deleteMember(memberId);
        const updated = await displayMember();
        setMembers(updated);
    }

    async function handleSelectMember(memberId) {
        if (selectedMember == memberId){
            setSelectedMember(null);
            return;
        } 
        setSelectedMember(memberId);
    }



    return (
        <div>
            <h2>Miembros:</h2>
            {members.length > 0 ? (
            <ul>
                {members.map((m) => (
                <li key={m.id} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {m.name} (Member ID: {m.id})
                    {selectedMember === m.id && " (Seleccionado)"}

                    {/* WRAPPER fixes the issue */}
                    <div style={{ position: "relative", display: "inline-block" }}>
                        <button onClick={() => setMenuOpenId(menuOpenId === m.id ? null : m.id)}>⋮</button>
                        {menuOpenId === m.id && (
                            <div className="interaction-menu">
                                <button onClick={() => {handleSelectMember(m.id), setMenuOpenId(null)}}> {selectedMember == m.id ? "De-seleccionar" : "Seleccionar"}</button>
                                <button onClick={() => {handleDeleteMember(m.id), setMenuOpenId(null)}}>Eliminar</button>
                            </div>
                        )}
                    </div>
                </li>
                ))}
            </ul>
            ) : (<p>No se encontraron miembros.</p>)}
        </div>
    )
}

export function TaskList ({homes, currentHome, tasks, setTasks, selectedMember, setEditingTask, setShowSurvey}) {
    const {displayTask, deleteTask, assignMember, completeTask, repeatMember} = useHome(homes, currentHome);
        const [menuOpenId, setMenuOpenId] = useState(null);

    //Cargar tareas
    useEffect(() => {
        async function loadTasks() {
            const data = await displayTask();
            setTasks(data);
        }
        loadTasks();
    }, [currentHome]);


    async function handleDeleteTask(taskId) {
        await deleteTask(taskId);
        const updated = await displayTask();
        setTasks(updated);
    }

    async function handleAssignMember(taskId) {
        await assignMember(selectedMember, taskId)

        const updated = await displayTask();
        setTasks(updated);
    }

    async function handleCompleteTask(taskId) {
        await completeTask(taskId);

        const updated = await displayTask();
        setTasks(updated);
    }

    function handleNextDueDate(taskId) {
        if (taskId.frequency_value == 0) return "Sin proxima fecha";

        const dueDate = new Date(taskId.next_due_date);
        const today = new Date();

        dueDate.setHours(0,0,0,0);
        today.setHours(0,0,0,0);

        const diffMs = dueDate - today;
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays > 1) return `Repite en ${diffDays} días`;
        if (diffDays === 1) return "Repite mañana";
        if (diffDays === 0) return "Repite hoy";
    }

    async function handleRepeatMember(memberId, taskId){
        await repeatMember(memberId, taskId)

        const updated = await displayTask();
        setTasks(updated);
    }

    return (
        <div>
            <h2>Tareas que hacer:</h2>
            {tasks.filter(t => t.status == "pending").length > 0 ? (
            <ul>
                {tasks.filter(t => t.status == "pending").map((t) => (
                <li key={t.assigned_id} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {t.title} (AssignedTask ID: {t.assigned_id} Status: {t.status})

                    {t.member_id ? (<span> — Asignado a miembro {t.member_name}</span>) : (<span> — Sin asignar</span>)}


                    <div style={{ position: "relative", display: "inline-block" }}>
                        <button onClick={() => setMenuOpenId(menuOpenId === t.assigned_id ? null : t.assigned_id)}>⋮</button>
                        {menuOpenId === t.assigned_id && (
                            <div className="interaction-menu">
                                <button onClick={() => {setShowSurvey(true); setEditingTask(t);}}>Editar</button>
                                <button onClick={() => {handleDeleteTask(t.assigned_id), setMenuOpenId(null)}}>Eliminar</button>
                                <button disabled={selectedMember !== t.member_id || selectedMember == null} onClick={() => {handleCompleteTask(t.assigned_id), setMenuOpenId(null)}}>Completar</button>
                                {!t.member_id && (<button disabled={!selectedMember} onClick={() => {handleAssignMember(t.assigned_id), setMenuOpenId(null)}}>Asignar miembro</button>)}
                            </div>
                        )}
                    </div>

                </li>
                ))}
            </ul>
            ) : (<p>No hay tareas por hacer.</p>)}


            <h2>Tareas completadas:</h2>
            {tasks.filter(t => t.status == "done").length > 0 ? (
            <ul>
                {tasks.filter(t => t.status == "done").map((t) => (
                <li key={t.assigned_id}>
                    {t.title} {handleNextDueDate(t)}

                    {t.member_id ? (<span> — Asignado a miembro {t.member_name}</span>) : (<span> — Sin asignar</span>)}

                    <div style={{ position: "relative", display: "inline-block" }}>
                        <button onClick={() => setMenuOpenId(menuOpenId === t.assigned_id ? null : t.assigned_id)}>⋮</button>
                        {menuOpenId === t.assigned_id && (
                            <div className="interaction-menu">
                                {!t.member_id && (<button disabled={!selectedMember} onClick={() => {handleAssignMember(t.assigned_id), setMenuOpenId(null)}}>Asignar miembro</button>)}
                            </div>
                        )}
                    </div>


                </li>
                ))}
            </ul>
            ) : (
            <p>No se encontraron tareas completadas.</p>
            )}
        </div>


    )
}

/*
return (
    <div>
        <h2>Tareas que hacer:</h2>

        {tasks.filter(t => t.status === "pending").length > 0 ? (
            <ul>
                {tasks
                    .filter(t => t.status === "pending")
                    .map((t) => (
                        <li key={t.assigned_id}>
                            {t.title} — {t.status}

                            {t.member_id ? (
                                <span> — Asignado a {t.member_name}</span>
                            ) : (
                                <span> — Sin asignar</span>
                            )}

                            <button onClick={() => handleDeleteTask(t.assigned_id)}>
                                Eliminar
                            </button>

                            {!t.member_id && (
                                <button
                                    disabled={!selectedMember}
                                    onClick={() => handleAssignMember(t.assigned_id)}
                                >
                                    Asignar miembro
                                </button>
                            )}
                        </li>
                    ))}
            </ul>
        ) : (
            <p>No hay tareas pendientes.</p>
        )}

        <h2>Tareas completadas:</h2>

        {tasks.filter(t => t.status === "done").length > 0 ? (
            <ul>
                {tasks
                    .filter(t => t.status === "done")
                    .map((t) => (
                        <li key={t.assigned_id}>
                            {t.title} — {t.status}

                            {t.member_id ? (
                                <span> — Asignado a {t.member_name}</span>
                            ) : (
                                <span> — Sin asignar</span>
                            )}

                            <button onClick={() => handleDeleteTask(t.assigned_id)}>
                                Eliminar
                            </button>
                        </li>
                    ))}
            </ul>
        ) : (
            <p>No hay tareas completadas.</p>
        )}
    </div>
);


*/