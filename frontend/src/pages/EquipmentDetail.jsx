import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { resourceService } from '../services/api';

const EquipmentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isNew = id === 'new';

    const [formData, setFormData] = useState({
        name: '',
        serial_number: '',
        location: '',
        department: '',
        category_id: '',
        default_team_id: '',
        default_technician_id: '', // Added default_technician_id
        status: 'ACTIVE',
        description: ''
    });

    const [categories, setCategories] = useState([]);
    const [teams, setTeams] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [cats, tms, techs] = await Promise.all([
                    resourceService.getCategories(),
                    resourceService.getTeams(),
                    resourceService.getUsers({ role: 'TECHNICIAN' })
                ]);
                setCategories(cats);
                setTeams(tms);
                setTechnicians(techs);

                if (!isNew) {
                    const equipmentData = await resourceService.getEquipmentById(id);
                    setFormData({
                        name: equipmentData.name || '',
                        serial_number: equipmentData.serial_number || '',
                        location: equipmentData.location || '',
                        department: equipmentData.department || '',
                        category_id: equipmentData.category_id || '',
                        default_team_id: equipmentData.default_team_id || '',
                        default_technician_id: equipmentData.default_technician_id || '',
                        status: equipmentData.status || 'ACTIVE',
                        description: equipmentData.description || ''
                    });
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, isNew]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Clean payload: convert empty strings to null for integers
            const payload = {
                ...formData,
                category_id: formData.category_id ? parseInt(formData.category_id) : null,
                default_team_id: formData.default_team_id ? parseInt(formData.default_team_id) : null,
                default_technician_id: formData.default_technician_id ? parseInt(formData.default_technician_id) : null
            };

            if (isNew) {
                await resourceService.createEquipment(payload);

            } else {
                await resourceService.updateEquipment(id, payload); // Changed to use payload
            }
            navigate('/equipment');
        } catch (error) {
            alert("Failed to save equipment");
        }
    };

    if (loading) return <MainLayout>Loading...</MainLayout>;

    return (
        <MainLayout>
            <div className="dashboard-header">
                <h2>{isNew ? 'New Equipment' : formData.name}</h2>
                <div className="actions">
                    <button className="btn btn-primary" onClick={handleSubmit}>Save</button>
                </div>
            </div>

            <div className="card">
                <form className="request-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Equipment Name</label>
                            <input name="name" value={formData.name} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Serial Number</label>
                            <input name="serial_number" value={formData.serial_number} onChange={handleChange} required />
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Category</label>
                            <select name="category_id" value={formData.category_id} onChange={handleChange}>
                                <option value="">Select Category</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Maintenance Team</label>
                            <select name="default_team_id" value={formData.default_team_id} onChange={handleChange}>
                                <option value="">Select Team</option>
                                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Technician</label>
                            <select name="default_technician_id" value={formData.default_technician_id || ''} onChange={handleChange}>
                                <option value="">Select Technician</option>
                                {technicians.map(t => <option key={t.id} value={t.id}>{t.username}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Location</label>
                            <input name="location" value={formData.location} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Department</label>
                            <input name="department" value={formData.department} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Status</label>
                        <select name="status" value={formData.status} onChange={handleChange}>
                            <option value="ACTIVE">Active</option>
                            <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                            <option value="SCRAP">Scrap</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows="3" />
                    </div>
                </form>
            </div>
        </MainLayout>
    );
};

export default EquipmentDetail;
