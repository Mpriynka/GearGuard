import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import { requestService } from '../services/api';

const RequestList = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'kanban'
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const data = await requestService.getAll();
                setRequests(data);
            } catch (error) {
                console.error("Failed to load requests", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRequests();
    }, []);

    if (loading) return <MainLayout><div>Loading...</div></MainLayout>;

    return (
        <MainLayout>
            <div className="dashboard-header">
                <h2>Maintenance Requests</h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-outlined" onClick={() => setViewMode(viewMode === 'table' ? 'kanban' : 'table')}>
                        {viewMode === 'table' ? 'Switch to Board' : 'Switch to List'}
                    </button>
                    {user?.role !== 'TECHNICIAN' && (
                        <Link to="/maintenance/new" className="btn btn-primary">New Request</Link>
                    )}
                </div>
            </div>

            {viewMode === 'table' ? (
                <div className="card">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Subject</th>
                                <th>Equipment</th>
                                <th>Type</th>
                                <th>Priority</th>
                                <th>Scheduled Date</th>
                                <th>Stage</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map(req => (
                                <tr key={req.id} onClick={() => navigate(`/maintenance/${req.id}`)} style={{ cursor: 'pointer' }}>
                                    <td>{req.title}</td>
                                    <td>{req.equipment_id}</td>
                                    <td>{req.request_type}</td>
                                    <td>{req.priority}</td>
                                    <td>{req.scheduled_date ? new Date(req.scheduled_date).toLocaleDateString() : '-'}</td>
                                    <td><span className={`badge ${req.stage.toLowerCase()}`}>{req.stage}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="kanban-board" style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }}>
                    {['NEW', 'IN_PROGRESS', 'REPAIRED', 'SCRAP'].map(stage => (
                        <div key={stage} className="kanban-column" style={{ minWidth: '280px', flex: 1, background: '#f4f5f7', padding: '1rem', borderRadius: '8px' }}>
                            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                                {stage} <span style={{ background: '#dfe1e6', padding: '2px 8px', borderRadius: '10px', fontSize: '0.8rem' }}>{requests.filter(r => r.stage === stage).length}</span>
                            </h3>
                            <div className="kanban-cards" style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                {requests.filter(r => r.stage === stage).map(req => (
                                    <div key={req.id} onClick={() => navigate(`/maintenance/${req.id}`)} style={{ background: 'white', padding: '1rem', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', cursor: 'pointer' }}>
                                        <div style={{ fontWeight: 500, marginBottom: '0.5rem' }}>{req.title}</div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#666' }}>
                                            <span>{req.priority}</span>
                                            <span>#{req.id}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </MainLayout>
    );
};

export default RequestList;
