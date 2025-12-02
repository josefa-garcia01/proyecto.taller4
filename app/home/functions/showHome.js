'use client';
import {useState, useEffect} from 'react';
import useHome from './useHome';
import { deleteHome, updateHomeCookie, createHome, editHome } from './switchHomes';
import { useRouter } from "next/navigation";

export function MemberAdd ({homes, currentHome, members, setMembers}) {
    const {displayMember, addMember} = useHome(homes, currentHome);
    const [memberName, setMemberName] = useState('');
    const [isAdding, setAdding] = useState(false);

    function getUniqueName(baseName, members) {
        const regex = new RegExp(`^${baseName}( \\((\\d+)\\))?$`);

        const usedNumbers = members.map(m => {const match = m.name.match(regex);
                return match ? (match[2] ? Number(match[2]) : 0) : null;
            }).filter(n => n !== null);

        if (usedNumbers.length === 0) return baseName;

        const max = Math.max(...usedNumbers);
        return `${baseName} (${max + 1})`;
    }


    async function handleAddMember() {
        let trim = memberName.trim();
        if (!trim || isAdding) return;

        setAdding(true);

        try{
            const finalName = getUniqueName(trim, members);
            await addMember(currentHome.id, finalName);
            setMemberName('');
            const updated = await displayMember(currentHome.id);
            setMembers(updated);

        } finally {
            setAdding(false);
        }

    }

    return (
        <div>
            <input
            type="name"
            placeholder="Ingresar nombre de miembro nuevo"
            value={memberName}
            onChange={(e) => setMemberName(e.target.value)}
            />

            <button disabled={!memberName.trim() || isAdding}  onClick={handleAddMember}>Añadir miembro</button>
        </div>
    )

}

export function HomeFunction({currentHome, userId, localHomes, setLocalHomes, selectedHomeId, setSelectedHomeId, setMembers, setTasks}){
    const [menuOpenId, setMenuOpenId] = useState(null);

    function getUniqueName(baseName, localHomes) {
        const regex = new RegExp(`^${baseName}( \\((\\d+)\\))?$`);

        const usedNumbers = localHomes.map(m => {const match = m.name.match(regex);
                return match ? (match[2] ? Number(match[2]) : 0) : null;
            }).filter(n => n !== null);

        if (usedNumbers.length === 0) return baseName;

        const max = Math.max(...usedNumbers);
        return `${baseName} (${max + 1})`;
    }

    async function handleEditHome(id) {
        const newName = prompt("Nuevo nombre del hogar:");
        if (!newName) return;

        const trim = newName.trim();
        const finalName = getUniqueName(trim, localHomes);

        console.log(localHomes);
        await editHome(id, finalName);
        setLocalHomes(prev => prev.map(h => (h.id === id ? { ...h, name: finalName } : h)));
        console.log(localHomes);
    }

    async function handleSwitchHome(id){
        setSelectedHomeId(id);
        await updateHomeCookie(id);
        setMembers([]);
        setTasks([]);
        
    }

    async function handleCreateHome(){
        const name = prompt("Nombre del nuevo hogar:");
        if(!name) return;

        const trim = name.trim();
        const finalName = getUniqueName(trim, localHomes);

        const newHome = await createHome(finalName, userId);
        setLocalHomes(prev => [...prev, newHome]);
        await handleSwitchHome(newHome.id)
    }

    async function handleDeleteHome(id){
        if (!confirm("¿Seguro que quiere eliminar este hogar?")) return;

        try {
            await deleteHome(id);

            setLocalHomes(prev => prev.filter(h => h.id !== id));

            if (id === currentHome?.id){
                if(localHomes.length === 1) {
                    setSelectedHomeId(null);
                    setMembers([]);
                    setTasks([]);
                } else {
                    const nextHome = localHomes.find(h => h.id !== id);
                    if (nextHome) await handleSwitchHome(nextHome.id);
                }
            }
        } catch (err) {
            console.error("Failed to delete home:", err)
        }
        
    }


    return (
        <div>
            <select
                value={currentHome?.id}
                onChange={(e) => handleSwitchHome(Number(e.target.value))}>
                {localHomes.map(h => (<option key={h.id} value={h.id}>{h.name}</option>))}
            </select>
            <button onClick={handleCreateHome}>Crear Hogar</button>

            {localHomes.length > 0 && currentHome ? (
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <h1>Hogar Actual: {currentHome?.name} ({currentHome.id})</h1>

                    <div style={{ position: "relative", display: "inline-block" }}>
                        <button disabled={!currentHome}onClick={() => setMenuOpenId(menuOpenId === currentHome?.id ? null : currentHome?.id)}>⋮</button>
                        {menuOpenId === currentHome?.id && (
                            <div className="interaction-menu">
                                <button onClick={() => handleEditHome(currentHome.id)}>Editar Nombre</button>
                                <button onClick={() => handleDeleteHome(currentHome.id)}>Eliminar</button>
                        </div>
                        )}
                    </div>
                </div>
            ) : (<p>No hay hogares. Cree uno para empezar</p>)} 


        </div>
    )

}



export function SearchWithDropdown({ items, selectedTask, resetFields }) {
    const [query, setQuery] = useState('');
    const [selectedId, setSelectedId] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

    // build category list (unique)
    const categories = [...new Set(items.map(item => item.category))];

    // search by title (case-insensitive) AND category
    const results = items.filter(item => {
        const matchTitle = item.title.toLowerCase().includes(query.toLowerCase());
        const matchCategory = categoryFilter ? item.category === categoryFilter : true;
        return matchTitle && matchCategory;
    });

    function handleAutoFill() {
        const task = results.find(t => t.id == parseInt(selectedId));
        if (task) selectedTask(task);
    }

    return (
        <div style={{ width: '350px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            
            <div style={{ display: 'flex', gap: '8px' }}>
                <input
                    type="text"
                    placeholder="Buscar Tareas..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    style={{ flex: 2, padding: '5px' }}
                />

                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    style={{ flex: 1, padding: '5px' }}
                >
                    <option value="">Todos</option>
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                style={{ width: '100%', padding: '5px' }}
            >
                <option value="">Seleccionar Tarea...</option>
                {results.map(item => (
                    <option key={item.id} value={item.id}>
                        {item.title} — {item.category}
                    </option>
                ))}
            </select>

            <div style={{ display: "flex", gap: "10px" }}>
                <button 
                    disabled={selectedId === '' || results.length === 0}
                    onClick={handleAutoFill}>
                    Auto-completar
                </button>

                <button onClick={resetFields}>Vaciar espacios</button>
            </div>
        </div>
    );
}



export function TaskAdd ({homes, currentHome, tasks, setTasks, members, setMembers, showSurvey, setShowSurvey, defaultTasks, setDefaultTasks, editingTask, setEditingTask}) {
    const {addTask, updateTask, displayTask, displayDefaultTask, displayMember} = useHome(homes, currentHome);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [frequencyType, setFrequencyType] = useState('days');
    const [frequencyValue, setFrequencyValue] = useState('0');
    const [difficulty, setDifficulty] = useState('');
    const [Estimate, setEstimate] = useState('');
    const [selectedMember, setSelectedMember] = useState('');
    
    const [isAdding, setAdding] = useState(false);

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
            const data = await displayMember(currentHome.id);
            setMembers(data);
        }
        loadMembers();
    }, [currentHome]);



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
        setSelectedMember(task.member_id ?? '');
    }


    useEffect(() => {
        if (editingTask) {
            fillFormFields(editingTask);
        } else if (!editingTask) {
            resetFormFields();
        }
    }, [editingTask, members]);


    function getUniqueName(baseName, tasks) {
        const regex = new RegExp(`^${baseName}( \\((\\d+)\\))?$`);

        const usedNumbers = tasks.map(t => {const match = t.title.match(regex);
                return match ? (match[2] ? Number(match[2]) : 0) : null;
            }).filter(n => n !== null);

        if (usedNumbers.length === 0) return baseName;

        const max = Math.max(...usedNumbers);
        return `${baseName} (${max + 1})`;
    }

    async function handleAddTask() {

        setAdding(true);
        try{
            const safeTitle = title?.trim() || "Sin título";
            const safeDescription = description?.trim() || "";
            const safeCategory = category?.trim() || "";

            const safeFrequencyValue = parseInt(frequencyValue) || 0;
            const safeFrequencyType = frequencyType || "days";

            const safeDifficulty = difficulty === "" || difficulty == null || difficulty == 0 ? 1 : Number(difficulty);
            const safeEstimate = Estimate === "" || Estimate == null ? 0 : Number(Estimate);

            let nextDueDate;


            if (editingTask) {
                const freqChanged =
                    safeFrequencyValue !== editingTask.frequency_value ||
                    safeFrequencyType !== editingTask.frequency_type;

                if (freqChanged) {
                    const now = new Date();
                    if (safeFrequencyType === "days") {
                        now.setDate(now.getDate() + safeFrequencyValue);
                    } else { 
                        now.setDate(now.getDate() + safeFrequencyValue * 7);
                    }
                    nextDueDate = now.toISOString().split("T")[0];
                } else {
                    nextDueDate = editingTask.next_due_date;
                }
            } else {
                const now = new Date();
                if (safeFrequencyType === "days") {
                    now.setDate(now.getDate() + safeFrequencyValue);
                } else {
                    now.setDate(now.getDate() + safeFrequencyValue * 7);
                }
                nextDueDate = now.toISOString().split("T")[0];
            }


            const trim = safeTitle.trim();
            const finalTitle = getUniqueName(trim, tasks);

            const newTask = {
                homeId: currentHome.id,
                title: finalTitle,
                description: safeDescription,
                category: safeCategory,
                frequency_type: safeFrequencyType,
                frequency_value: safeFrequencyValue,
                next_due_date: nextDueDate,
                member_id: selectedMember || null,
                difficulty: safeDifficulty,
                estimated_minutes: safeEstimate
            };

            if (editingTask) {
                await updateTask(editingTask.assigned_id, newTask);
            } else {
                await addTask(newTask);
            }

            setTasks(await displayTask(currentHome.id));
            setShowSurvey(false);
            resetFormFields();
        } finally {
            setAdding(false);
        }

    
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
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Titulo" />

                <label>Descripcion:</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Descripcion" />

                <label>Categoria:</label>
                <input value={category} onChange={e => setCategory(e.target.value)} placeholder="Categoria" />
            
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
                            <option value="days">Dias</option>
                            <option value="weeks">Semanas</option>
                        </select>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                        <label>Valor de frecuencia</label>
                        <input
                            type="number"
                            min={0}
                            value={frequencyValue}
                            onChange={e => setFrequencyValue(e.target.value)}
                            placeholder="Frecuencia"
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
                        <label>Dificultad (1-10):</label>
                        <input
                            type="number"
                            min={1}
                            max={10}
                            value={difficulty}
                            onChange={e => setDifficulty(e.target.value)}
                            placeholder="Dificultad"
                        />
                    </div>
                </div>

                <button onClick={() => setShowSurvey(false)}>Cerrar</button>
                <button onClick={handleAddTask} disabled={isAdding}> {editingTask ? "Guardar cambios" : "Guardar Nueva Tarea"}</button>
            </div>
            </div>
        )}
        </div>
    );
}




export function MemberList ({homes, currentHome, setTasks, members, setMembers, selectedMember, setSelectedMember}) {
    const {displayMember, deleteMember, editMember, displayTask} = useHome(homes, currentHome);
    const [menuOpenId, setMenuOpenId] = useState(null);

    //Cargar miembros
    useEffect(() => {
        async function loadMembers() {
            const data = await displayMember(currentHome.id);
            setMembers(data);
        }
        loadMembers();
    }, [currentHome]);

    function getUniqueName(baseName, members) {
        const regex = new RegExp(`^${baseName}( \\((\\d+)\\))?$`);

        const usedNumbers = members.map(m => {const match = m.name.match(regex);
                return match ? (match[2] ? Number(match[2]) : 0) : null;
            }).filter(n => n !== null);

        if (usedNumbers.length === 0) return baseName;

        const max = Math.max(...usedNumbers);
        return `${baseName} (${max + 1})`;
    }


    async function handleEditName(memberId) {
        const newName = prompt("Nuevo nombre de miembro:");
        if (!newName) return;

        let trim = newName.trim();
        const finalName = getUniqueName(trim, members);
        
        await editMember(memberId, finalName);
        setMembers(await displayMember(currentHome.id));
        setTasks(await displayTask(currentHome.id));
    }

    async function handleDeleteMember(memberId) {
        await deleteMember(memberId);
        const updated = await displayMember(currentHome.id);
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
                                <button onClick={() => {handleEditName(m.id)}}>Editar Nombre</button>
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
    const [sortMenu, setSortMenu] = useState(null);
    const [sortField, setSortField] = useState(null);
    const [sortDirection, setSortDirection] = useState("asc"); // o "desc"


    //Cargar tareas
    useEffect(() => {
        async function loadTasks() {
            console.log(currentHome);
            const data = await displayTask(currentHome.id);
            setTasks(data);
        }
        loadTasks();
    }, [currentHome]);


    function normalize(field, value, task) {

        switch (field) {

            case "next_due_date":
                return new Date(value).getTime();

            case "title":
            case "category":
                return (value ?? "").toLowerCase();

            case "difficulty":
            case "estimated_minutes":
                return Number(value);

            // frequency: convert to days
            case "frequency":
                if (!task) return 0;
                const multiplier = task.frequency_type === "weeks" ? 7 : 1;
                return task.frequency_value * multiplier;

            default:
                return value;
        }
    }


    function handleSort(field) {
        const isSameField = sortField === field;

        // Determinar direccion
        const newDirection = isSameField ? (sortDirection === "asc" ? "desc" : "asc") : "asc";                                        

        // Update sort state
        setSortField(field);
        setSortDirection(newDirection);

        // Create a sorted copy
        const sorted = [...tasks].sort((a, b) => {
            const valA = normalize(field, a[field], a);
            const valB = normalize(field, b[field], b);

            if (valA < valB) return newDirection === "asc" ? -1 : 1;
            if (valA > valB) return newDirection === "asc" ? 1 : -1;
            return 0;
        });

        setTasks(sorted);
    }


    async function handleDeleteTask(taskId) {
        await deleteTask(taskId);
        const updated = await displayTask(currentHome.id);
        setTasks(updated);
    }

    async function handleAssignMember(taskId) {
        await assignMember(selectedMember, taskId)

        const updated = await displayTask(currentHome.id);
        setTasks(updated);
    }

    async function handleCompleteTask(taskId) {
        await completeTask(taskId);

        const updated = await displayTask(currentHome.id);
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

        const updated = await displayTask(currentHome.id);
        setTasks(updated);
    }

    function formatFrequency(value, type) {
        if (!value || !type) return "Tarea de unica vez";

        //caso: todos los dias
        if (value === 1 && type === "days") return "Todos los días";

        // caso: cada semana
        if (value === 1 && type === "weeks") return "Cada semana";

        // Default: "cada n dias/semanas"
        return `Cada ${value} ${type === "days" ? "días" : "semanas"}`;
    }

    return (
        <div>
            <h2>Tareas que hacer:</h2>

            <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                
                <button onClick={() => setSortMenu(prev => !prev)}>Filtros:</button>

                {sortMenu && (
                    <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                        <button onClick={() => handleSort("title")}>
                            Título {sortField === "title" && (sortDirection === "asc" ? "↑" : "↓")}
                        </button>

                        <button onClick={() => handleSort("category")}>
                            Categoría {sortField === "category" && (sortDirection === "asc" ? "↑" : "↓")}
                        </button>

                        <button onClick={() => handleSort("difficulty")}>
                            Dificultad {sortField === "difficulty" && (sortDirection === "asc" ? "↑" : "↓")}
                        </button>

                        <button onClick={() => handleSort("estimated_minutes")}>
                            Tiempo {sortField === "estimated_minutes" && (sortDirection === "asc" ? "↑" : "↓")}
                        </button>

                        <button onClick={() => handleSort("next_due_date")}>
                            Próxima fecha {sortField === "next_due_date" && (sortDirection === "asc" ? "↑" : "↓")}
                        </button>

                        <button onClick={() => handleSort("frequency")}>
                            Frecuencia {sortField === "frequency" && (sortDirection === "asc" ? "↑" : "↓")}
                        </button> 
                    </div>
                )}


            </div>

            {tasks.filter(t => t.status == "pending").length > 0 ? (
            <ul>
                {tasks.filter(t => t.status == "pending").map((t) => (
                <li key={t.assigned_id} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {t.title} (AssignedTask ID: {t.assigned_id} Status: {t.status})

                    {t.member_id ? (<span> — (Asignado a miembro: {t.member_name})</span>) : (<span> — (Sin asignar)</span>)}


                    <div style={{ position: "relative", display: "inline-block" }}>
                        <button onClick={() => setMenuOpenId(menuOpenId === t.assigned_id ? null : t.assigned_id)}>⋮</button>
                        {menuOpenId === t.assigned_id && (
                            <div className="interaction-menu" style={{ padding: "10px", background: "#f5f5f5", borderRadius: "6px" }}>
                                
                                <p style={{ margin: "2px 0", whiteSpace: "pre-wrap" }}>
                                <b>Descripción:</b> {t.description || "No tiene descripción"}
                                </p>
                                <p><b>Categoria:</b> {t.category}</p>
                                <p><b>Frecuencia:</b> {formatFrequency(t.frequency_value, t.frequency_type)}</p>
                                <p><b>Dificultad (1-10):</b> {t.difficulty ? (<span>{t.difficulty}</span>) : (<span>Indeterminado</span>)}</p>
                                <p><b>Tiempo Estimado (minutos):</b> {t.estimated_minutes ? (<span>{t.estimated_minutes}</span>) : (<span>Indeterminado</span>)}</p>
                                <p><b>Miembro Asignado:</b> {t.member_id ? (<span> {t.member_name}</span>) : (<span>Sin asignar</span>)}</p>
                                <hr />

                                <button onClick={() => {setEditingTask(t); setShowSurvey(true);}}>Editar</button>
                                <button onClick={() => {handleDeleteTask(t.assigned_id); setMenuOpenId(null)}}>Eliminar</button>
                                <button 
                                    disabled={selectedMember !== t.member_id || selectedMember == null}
                                    onClick={() => {handleCompleteTask(t.assigned_id); setMenuOpenId(null)}}
                                >Completar</button>

                                {!t.member_id && (
                                    <button 
                                        disabled={!selectedMember} 
                                        onClick={() => {handleAssignMember(t.assigned_id); setMenuOpenId(null)}}
                                    >Asignar miembro</button>
                                )}
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
                    {t.title} ({handleNextDueDate(t)})

                    {t.member_id ? (<span> — Asignado a miembro: {t.member_name}</span>) : (<span> — Sin asignar</span>)}

                    <div style={{ position: "relative", display: "inline-block" }}>
                        <button onClick={() => setMenuOpenId(menuOpenId === t.assigned_id ? null : t.assigned_id)}>⋮</button>
                        {menuOpenId === t.assigned_id && (
                            <div className="interaction-menu" style={{ padding: "10px", background: "#f5f5f5", borderRadius: "6px" }}>
                                
                                <p style={{ margin: "2px 0", whiteSpace: "pre-wrap" }}>
                                <b>Descripción:</b> {t.description || "No tiene descripción"}
                                </p>
                                <p><b>Categoria:</b> {t.category}</p>
                                <p><b>Frecuencia:</b> {formatFrequency(t.frequency_value, t.frequency_type)}</p>
                                <p><b>Dificultad (1-10):</b> {t.difficulty}</p>
                                <p><b>Tiempo Estimado (minutos):</b> {t.estimated_minutes ? (<span>{t.estimated_minutes}</span>) : (<span>Indeterminado</span>)}</p>
                                <p><b>Miembro Asignado:</b> {t.member_id ? (<span> {t.member_name}</span>) : (<span>Sin asignar</span>)}</p>

                                <hr />

                                <button onClick={() => {handleDeleteTask(t.assigned_id); setMenuOpenId(null)}}>Eliminar</button>
                                {!t.member_id && (
                                    <button 
                                        disabled={!selectedMember} 
                                        onClick={() => {handleAssignMember(t.assigned_id); setMenuOpenId(null)}}
                                    >
                                        Asignar miembro
                                    </button>
                                )}
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