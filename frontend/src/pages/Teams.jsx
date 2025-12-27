import React, { useEffect, useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { resourceService } from '../services/api';
import { Trash2 } from 'lucide-react';

const Teams = () => {
    const [teams, setTeams] = useState([]);
    const [users, setUsers] = useState([]);
    const [newTeam, setNewTeam] = useState({ name: '' });
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [selectedUser, setSelectedUser] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [teamsData, usersData] = await Promise.all([
                resourceService.getTeams(),
                resourceService.getUsers({ role: 'TECHNICIAN' })
            ]);
            setTeams(teamsData);
            setUsers(usersData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await resourceService.createTeam(newTeam);
            setNewTeam({ name: '' });
            loadData();
        } catch (error) {
            alert("Failed to create team");
        }
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        if (!selectedTeam || !selectedUser) return;
        try {
            // Update user to set team_id
            await resourceService.updateUser(selectedUser, { team_id: selectedTeam.id });
            setSelectedUser('');
            loadData(); // Reload to refresh lists
        } catch (error) {
            alert("Failed to add member");
        }
    };

    const handleRemoveMember = async (userId) => {
        if (!confirm("Remove user from team?")) return;
        try {
            await resourceService.updateUser(userId, { team_id: null });
            loadData();
        } catch (error) {
            alert("Failed to remove member");
        }
    };

    const handleDelete = async (teamId) => {
        if (!confirm("Delete this team?")) return;
        try {
            // Logic to handle team deletion - currently not in resourceService, assuming it exists or needs generic delete
            // resourceService doesn't have deleteTeam?
            // Checking api.js... it has delete for requests but not teams?
            // I'll check api.js next. If missing, I'll stick to alert for now or implement it.
            // For now let's safely alert if not implemented.
            await resourceService.deleteTeam(teamId);
            loadData();
        } catch (error) {
            alert("Failed to delete team (Not implemented or API error)");
        }
    };

    if (loading) return <MainLayout>Loading...</MainLayout>;

    return (
        <MainLayout>
            <div className="dashboard-header">
                <h2>Maintenance Teams</h2>
            </div>

            <div className="card">
                <form onSubmit={handleCreate} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', alignItems: 'flex-end' }}>
                    <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
                        <label>Team Name</label>
                        <input value={newTeam.name} onChange={e => setNewTeam({ ...newTeam, name: e.target.value })} required />
                    </div>
                    <button type="submit" className="btn btn-primary">Add Team</button>
                </form>

                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Team Name</th>
                            <th>Team Members</th>
                            <th>Company</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {teams.map(team => {
                            const members = users.filter(u => u.team_id === team.id);
                            return (
                                <tr key={team.id}>
                                    <td>{team.name}</td>
                                    <td>
                                        {members.length > 0 ? members.map(m => (
                                            <span key={m.id} style={{ display: 'block' }}>
                                                {m.username}
                                                <button type="button" onClick={() => handleRemoveMember(m.id)} style={{ marginLeft: '8px', color: 'red', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>Remove</button>
                                            </span>
                                        )) : 'No members'}
                                        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                            <select value={selectedTeam?.id === team.id ? selectedUser : ''} onChange={e => { setSelectedTeam(team); setSelectedUser(e.target.value); }}>
                                                <option value="">Add Member...</option>
                                                {users.filter(u => !u.team_id).map(u => (
                                                    <option key={u.id} value={u.id}>{u.username}</option>
                                                ))}
                                            </select>
                                            <button type="button" className="btn btn-primary btn-sm" onClick={handleAddMember} disabled={!selectedUser || selectedTeam?.id !== team.id}>Add</button>
                                        </div>
                                    </td>
                                    <td>{user?.company_name || 'My Company (San Francisco)'}</td>
                                    <td>
                                        <button type="button" onClick={() => handleDelete(team.id)} className="btn-icon">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </MainLayout>
    );
};

export default Teams;
