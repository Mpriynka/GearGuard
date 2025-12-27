import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../layouts/MainLayout';
import { resourceService } from '../services/api';
import { Edit, Trash2 } from 'lucide-react';

const Equipment = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEquipment = async () => {
            try {
                const data = await resourceService.getEquipment();
                setEquipment(data);
            } catch (error) {
                console.error("Failed to load equipment", error);
            } finally {
                setLoading(false);
            }
        };
        fetchEquipment();
    }, []);

    if (loading) return <MainLayout><div>Loading...</div></MainLayout>;

    return (
        <MainLayout>
            <div className="dashboard-header">
                <h2>Equipment Inventory</h2>
                {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
                    <button className="btn btn-primary" onClick={() => navigate('/equipment/new')}>Create Equipment</button>
                )}
            </div>

            <div className="card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Equipment Name</th>
                            <th>Employee</th>
                            <th>Department</th>
                            <th>Serial Number</th>
                            <th>Technician</th>
                            <th>Equipment Category</th>
                            <th>Company</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {equipment.map(eq => (
                            <tr key={eq.id}>
                                <td>{eq.name}</td>
                                <td>Mitchell Admin</td> {/* Mock */}
                                <td>{eq.department}</td>
                                <td>{eq.serial_number}</td>
                                <td>Marc Demo</td> {/* Mock */}
                                <td>Monitors</td> {/* Mock */}
                                <td>{user?.company_name || 'My Company (San Francisco)'}</td>
                                <td><span className={`status-badge ${eq.status.toLowerCase()}`}>{eq.status}</span></td>
                                <td>
                                    <button onClick={() => navigate(`/equipment/${eq.id}`)} className="btn-icon"><Edit size={16} /></button>
                                    <button onClick={() => handleDelete(eq.id)} className="btn-icon"><Trash2 size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </MainLayout>
    );
};

export default Equipment;
