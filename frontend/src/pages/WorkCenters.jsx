import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../layouts/MainLayout';
import { resourceService } from '../services/api';

const WorkCenters = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [workCenters, setWorkCenters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);

    // Create Form State
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        department: '',
        location: '',
        capacity: 0,
        cost_per_hour: 0,
        oee_target: 85
    });

    const fetchWorkCenters = async () => {
        try {
            const data = await resourceService.getWorkCenters();
            setWorkCenters(data);
        } catch (error) {
            console.error("Failed to load work centers", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkCenters();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await resourceService.createWorkCenter(formData);
            setShowCreate(false);
            setFormData({ name: '', code: '', department: '', location: '', capacity: 0, cost_per_hour: 0, oee_target: 85 });
            fetchWorkCenters();
        } catch (error) {
            alert("Error creating work center");
        }
    };

    if (loading) return <MainLayout><div>Loading...</div></MainLayout>;

    return (
        <MainLayout>
            <div className="dashboard-header">
                <h2>Work Centers</h2>
                {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
                    <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>
                        {showCreate ? 'Cancel' : 'New Work Center'}
                    </button>
                )}
            </div>

            {showCreate && (
                <div className="card" style={{ marginBottom: '20px' }}>
                    <h3>Create New Work Center</h3>
                    <form onSubmit={handleCreate}>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Name</label>
                                <input name="name" value={formData.name} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Code</label>
                                <input name="code" value={formData.code} onChange={handleChange} required />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Department</label>
                                <input name="department" value={formData.department} onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Location</label>
                                <input name="location" value={formData.location} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Capacity (Units/Hr)</label>
                                <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Cost Per Hour ($)</label>
                                <input type="number" name="cost_per_hour" value={formData.cost_per_hour} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>OEE Target (%)</label>
                                <input type="number" name="oee_target" value={formData.oee_target} onChange={handleChange} />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-success">Save Work Center</button>
                    </form>
                </div>
            )}

            <div className="card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Code</th>
                            <th>Department</th>
                            <th>Capacity</th>
                            <th>Cost/Hr</th>
                            <th>OEE Target</th>
                        </tr>
                    </thead>
                    <tbody>
                        {workCenters.map(wc => (
                            <tr key={wc.id}>
                                <td>{wc.name}</td>
                                <td>{wc.code}</td>
                                <td>{wc.department}</td>
                                <td>{wc.capacity}</td>
                                <td>${wc.cost_per_hour}</td>
                                <td>{wc.oee_target}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </MainLayout>
    );
};

export default WorkCenters;
