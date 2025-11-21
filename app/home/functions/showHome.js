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

function AddTaskForm({ closeModal }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [frequencyType, setFrequencyType] = useState("days");
  const [frequencyValue, setFrequencyValue] = useState(1);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Send to backend
    fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        category,
        frequency_type: frequencyType,
        frequency_value: frequencyValue
      })
    });

    closeModal();
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add Task</h2>

      <label>Title</label>
      <input value={title} onChange={(e) => setTitle(e.target.value)} />

      <label>Category</label>
      <input value={category} onChange={(e) => setCategory(e.target.value)} />

      <label>Frequency Type</label>
      <select value={frequencyType} onChange={(e) => setFrequencyType(e.target.value)}>
        <option value="days">Days</option>
        <option value="weekly">Weekly</option>
      </select>

      <label>Frequency Value</label>
      <input type="number" value={frequencyValue}
             onChange={(e) => setFrequencyValue(Number(e.target.value))} />

      <button type="submit">Create</button>
    </form>
  );
}


export function TaskAdd ({homes, currentHome, showSurvey, setShowSurvey}) {
    const {addTask} = useHome(homes, currentHome);

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
                    min={1}
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
    const {displayTask, deleteTask, assignMember} = useHome(homes, currentHome);

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

    return (
        <div>
            <h2>Tareas del hogar:</h2>
            {tasks.length > 0 ? (
            <ul>
                {tasks.map((t) => (
                <li key={t.assigned_id}>
                    {t.title} (AssignedTask ID: {t.assigned_id} || Task ID: {t.task_id})

                    {t.member_id ? (
                        <span> — Asignado a miembro {t.member_name}</span>
                    ) : (
                        <span> — Sin asignar</span>
                    )}

                    <button onClick={() => handleDeleteTask(t.assigned_id)}>Eliminar</button>

                    {!t.member_id && (
                        <button disabled={!selectedMember} onClick={() => handleAssignMember(t.assigned_id)}>Asignar miembro</button>
                    )}
                </li>
                ))}
            </ul>
            ) : (
            <p>No se encontraron tareas.</p>
            )}
        </div>
    )
}