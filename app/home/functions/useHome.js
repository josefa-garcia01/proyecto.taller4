'use client';

import {useState} from 'react';

export default function useHome(homes, selectedHomeId){
    const currentHome = homes.find(h => h.id == Number(selectedHomeId));



    async function addMember(homeId, memberName){
        try{
            const res = await fetch('./api/members', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include',
                body: JSON.stringify({homeId, memberName}),
            });

            if (!res.ok) throw new Error('Failed to add Member');
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
            console.log("data:", data);
            
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
        
        } catch(err) {
            console.error('Error deleting task:', err);
        }
    }

    async function updateTask(taskId, body) {
        try {
            const res = await fetch('/api/tasks/edit', {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ taskId, body })
            });

            if (!res.ok) throw new Error("Failed to update task");
        } catch (err) {
            console.error("Error updating task:", err);
        }
    }

    async function completeTask(taskId) {
        try{
            const res = await fetch('/api/members', {
                method: 'PATCH',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({taskId})
            });

            if (!res.ok) throw new Error('UseHome, failed to complete task');
        } catch (err) {
            console.error('Use home, error completing task:', err);
        }
    }
    
    

    return {currentHome,
        addMember, displayMember, deleteMember, assignMember,
        displayDefaultTask, displayTask, addTask, deleteTask, updateTask, completeTask};
}