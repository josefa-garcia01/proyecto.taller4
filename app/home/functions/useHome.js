'use client';

import {useState} from 'react';

export default function useHome(homes, initialHomeId){
    const [currentHomeId, setCurrentHomeId] = useState(initialHomeId);
    const [members, setMembers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const currentHome = homes.find(h => h.id == parseInt(currentHomeId));



    async function addMember(homeId, memberName){
        try{
            const res = await fetch('./api/members', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include',
                body: JSON.stringify({homeId, memberName}),
            });

            if (!res.ok) throw new Error('Failed to add Member');
            const newMember = await res.json();

            
            setMembers(prev => [...prev, newMember]);  //componente de react para actualizar lista en tiempo real
        } catch (err) {
            console.error('Error adding member:', err);
        }
    }


    async function displayMember(){
        try{
            const res = await fetch('./api/members', {
                method: 'GET',
                credentials: 'include',
                cache: 'no-store',
            });

            if (!res.ok) throw new Error('Failed to show members');
            const showMember = await res.json();
            return showMember.members;//.members para retornar el arreglo entero del json formado

        } catch(err) {
            console.error('Error getting members', err)
        }

        return [];
    }

    async function deleteMember(memberId){
        try{
            const res = await fetch('/api/members', {
                method: 'DELETE',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({memberId}),
            });

            if (!res.ok) throw new Error('Failed to delete member');
            
            const data = await res.json();
            
            //actualizar componente de react
            setMembers(prev => prev.filter(m => m.id != memberId)); //filter.() funcion con m que retorna un nuevo arreglo de todos los miembros EXCEPTO el memberId que se quiere eliminar
            return data;

        } catch(err) {
            console.error('Error deleting members:', err);
        }
    }

    async function assignMember(memberId, taskId){
        try{
            const res = await fetch('./api/tasks', {
                method: 'PATCH',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include',
                body: JSON.stringify({memberId, taskId}),
            });

            if (!res.ok) throw new Error('Failed to assign Member');
            return true;
        } catch (err) {
            console.error('Error assigning member:', err);
            return false;
        }
    }




    async function displayDefaultTask(){
        try{
            const res = await fetch('/api/default', {method: 'GET'});

            if (!res.ok) throw new Error('Failed to load Tasks');

            const data = await res.json();
            return data.tasks; //.tasks es el nombre del json que retorna la api
        } catch (err) {
            console.error('Error getting tasks', err)
        }

        return [];
    }

    async function displayTask() {
        try {
            const res = await fetch('/api/tasks', {method: 'GET'});

            if (!res.ok) throw new Error('Failed to load assigned tasks');

            const data = await res.json();
            return data.assignedTasks;
        } catch (err) {
            console.error('Error getting assigned tasks', err)
        }

        return [];
    }


    async function addTask(newTask){
        try {
            const response = await fetch("/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newTask),
            });

            if (!response.ok) {
                throw new Error("AddTask returned an error");
            }

            const data = await response.json();

            const updated = await displayTask();
            setTasks(updated);

        } catch (err) {
            console.error("Error al crear tarea:", err);
        }

    }


    async function deleteTask(taskId){
        try{
            const res = await fetch('/api/tasks', {
                method: 'DELETE',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({taskId}),
            });

            if (!res.ok) throw new Error('Failed to delete task');
            
            const data = await res.json();
            
            //actualizar componente de react
            setTasks(prev => prev.filter(t => t.assigned_id != taskId)); //filter.() funcion con m que retorna un nuevo arreglo de todos los miembros EXCEPTO el memberId que se quiere eliminar
            return data;

        } catch(err) {
            console.error('Error deleting task:', err);
        }
    }

    return {currentHome, currentHomeId, setCurrentHomeId, members, 
        addMember, displayMember, deleteMember, assignMember,
        displayDefaultTask, displayTask, addTask, deleteTask};
}