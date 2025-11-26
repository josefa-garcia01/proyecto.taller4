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

export function TaskAdd ({homes, currentHome, tasks, setTasks, showSurvey, setShowSurvey}) {
    const {addTask, displayTask} = useHome(homes, currentHome);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [frequencyType, setFrequencyType] = useState('days');
    const [frequencyValue, setFrequencyValue] = useState('');

    async function resetFormFields() {
        setTitle('');
        setDescription('');
        setFrequencyType('days');
        setFrequencyValue('');
        setCategory('');
    }

    async function handleAddTask() {
        if(!title) return alert('El titulo es obligatorio!');
        if(!frequencyValue) return alert('La frecuencia es obligatoria!');
        

        const now = new Date();
        let nextDueDate = new Date(now);

        if (frequencyType === 'days') {
            nextDueDate.setDate(now.getDate() + parseInt(frequencyValue));
        } else if (frequencyType === 'weeks') {
            nextDueDate.setDate(now.getDate() + parseInt(frequencyValue) * 7);
        }

        const newTask = {
            homeId: currentHome.id,
            title,
            description,
            category,
            frequency_type: frequencyType,
            frequency_value: parseInt(frequencyValue),
            next_due_date: nextDueDate.toISOString().split('T')[0], // YYYY-MM-DD format
        };

        await addTask(newTask);
        setTasks(await displayTask());

        setShowSurvey(false);
        resetFormFields();
    
    }

    return (
        <div>
        <button onClick={() => setShowSurvey(true)}>Crear nueva Tarea</button>
        

        {showSurvey && (
            <div className="modal-backdrop">
            <div className="modal-content">
                <h2>Create New Task</h2>

                <label>Titulo:</label>
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Title" />

                <label>Descripcion:</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" />

                <label>Categoria:</label>
                <input value={category} onChange={e => setCategory(e.target.value)} placeholder="Category" />


                <div className="frequency-row">
                <select value={frequencyType} onChange={e => setFrequencyType(e.target.value)}>
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                </select>
                <input
                    type="number"
                    min={0}
                    value={frequencyValue}
                    onChange={e => setFrequencyValue(e.target.value)}
                    placeholder="Frequency"
                />
                </div>

                <button onClick={() => setShowSurvey(false)}>Close</button>
                <button onClick={handleAddTask}>Guardar</button>
            </div>
            </div>
        )}
        </div>
    );
}




export function MemberList ({homes, currentHome, members, setMembers, selectedMember, setSelectedMember}) {
    const {displayMember, deleteMember} = useHome(homes, currentHome);

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
                <li key={m.id}>
                    {m.name} (Member ID: {m.id})
                    {selectedMember === m.id && "(Seleccionado)"}

                    <button onClick={() => handleDeleteMember(m.id)}>Eliminar</button>
                    <button onClick={() => handleSelectMember(m.id)}>Seleccionar</button>
                </li>
                ))}
            </ul>
            ) : (
            <p>No se encontraron miembros.</p>
            )}
        </div>
    )
}

export function TaskList ({homes, currentHome, tasks, setTasks, selectedMember, setSelectedMember}) {
    const {displayTask, deleteTask, assignMember, completeTask} = useHome(homes, currentHome);

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
        if (taskId.next_due_date == 0) return "Sin proxima fecha";

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

    return (
        <div>
            <h2>Tareas que hacer:</h2>
            {tasks.filter(t => t.status == "pending").length > 0 ? (
            <ul>
                {tasks.filter(t => t.status == "pending").map((t) => (
                <li key={t.assigned_id}>
                    {t.title} (AssignedTask ID: {t.assigned_id} Status: {t.status})

                    {t.member_id ? (
                        <span> — Asignado a miembro {t.member_name}</span>
                    ) : (
                        <span> — Sin asignar</span>
                    )}

                    <button onClick={() => handleDeleteTask(t.assigned_id)}>Eliminar</button>

                    {!t.member_id && (
                        <button disabled={!selectedMember} onClick={() => handleAssignMember(t.assigned_id)}>Asignar miembro</button>
                    )}

                    <button disabled={selectedMember !== t.member_id || selectedMember == null} onClick={() => handleCompleteTask(t.assigned_id)}>Completar</button>

                </li>
                ))}
            </ul>
            ) : (
            <p>No hay tareas por hacer.</p>
            )}


            <h2>Tareas completadas:</h2>
            {tasks.filter(t => t.status == "done").length > 0 ? (
            <ul>
                {tasks.filter(t => t.status == "done").map((t) => (
                <li key={t.assigned_id}>
                    {t.title} {handleNextDueDate(t)}

                    {t.member_id ? (
                        <span> — Asignado a miembro {t.member_name}</span>
                    ) : (
                        <span> — Sin asignar</span>
                    )}
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