import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../layouts/MainLayout';
import { requestService } from '../services/api';
import { AlertTriangle, Users, Activity, Wrench, CheckCircle } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
    const { user } = useAuth(); // Get user role
    const [stats, setStats] = useState(null);
    const [recentRequests, setRecentRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Determine what requests to fetch based on role
                let requestFilters = { limit: 5 };
                if (user?.role === 'TECHNICIAN') {
                    requestFilters.technician_id = user.id; // Only show assigned
                } else if (user?.role === 'EMPLOYEE') {
                    // Maybe filter by reporter_id if we had it in context/backend filter
                }

                const requestsData = await requestService.getAll(requestFilters);
                setRecentRequests(requestsData);

                // For stats, backend returns global stats currently.
                // For Technician, we might want to compute local stats from requests or add backend endpoint.
                // For MVP speed, let's fetch global for Admin/Manager, and compute simple stats for Tech from their list.
                if (user?.role === 'ADMIN' || user?.role === 'MANAGER') {
                    const statsData = await requestService.getStats();
                    setStats(statsData);
                } else if (user?.role === 'TECHNICIAN') {
                    // Compute simple personalized stats
                    const myRequests = await requestService.getAll({ technician_id: user.id }); // Fetch all my active
                    setStats({
                        technician_view: true, // Marker
                        assigned: myRequests.length,
                        completed: myRequests.filter(r => r.stage === 'REPAIRED').length
                    });
                }

            } catch (error) {
                console.error("Error loading dashboard", error);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchData();
    }, [user]);

    // Generic/Manager KPIs
    const kpiCards = [
        { title: 'Critical Equipment', value: stats?.critical_equipment?.count || 0, color: 'red', icon: <AlertTriangle size={24} />, desc: stats?.critical_equipment?.label || 'Health < 30%' },
        { title: 'Technician Load', value: stats?.technician_load?.label || 'N/A', color: 'blue', icon: <Users size={24} />, desc: stats?.technician_load?.details || 'Workforce Utilization' },
        { title: 'Open Requests', value: stats?.open_requests?.count || 0, color: 'green', icon: <Activity size={24} />, desc: stats?.open_requests?.label || 'Pending & Overdue' }
    ];

    if (loading) return <MainLayout><div>Loading...</div></MainLayout>;

    return (
        <MainLayout>
            <div className="dashboard-header">
                <h2>Dashboard</h2>
                <span>Welcome back, {user?.username}</span>
            </div>

            <div className="kpi-grid">
                {user?.role === 'TECHNICIAN' ? (
                    <>
                        <div className="kpi-card blue">
                            <div className="kpi-icon"><Wrench size={24} /></div>
                            <div className="kpi-info">
                                <h3>My Assigned Jobs</h3>
                                <p className="kpi-value">{stats?.assigned || 0}</p>
                            </div>
                        </div>
                        <div className="kpi-card green">
                            <div className="kpi-icon"><CheckCircle size={24} /></div>
                            <div className="kpi-info">
                                <h3>Jobs Completed</h3>
                                <p className="kpi-value">{stats?.completed || 0}</p>
                            </div>
                        </div>
                    </>
                ) : (
                    kpiCards.map((card, index) => (
                        <div key={index} className={`kpi-card ${card.color}`}>
                            <div className="kpi-icon">{card.icon}</div>
                            <div className="kpi-info">
                                <h3>{card.title}</h3>
                                <p className="kpi-value">{card.value}</p>
                                <span className="kpi-desc">{card.desc}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="dashboard-section">
                <h3>Recent Activity</h3>
                <div className="card">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Subject</th>
                                <th>Employee</th>
                                <th>Technician</th>
                                <th>Category</th>
                                <th>Stage</th>
                                <th>Company</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentRequests.map(req => (
                                <tr key={req.id}>
                                    <td>{req.title}</td>
                                    <td>{req.reporter ? req.reporter.username : `User #${req.reporter_id}`}</td>
                                    <td>{req.technician ? req.technician.username : '-'}</td>
                                    <td>{req.equipment_id ? 'Machinery' : 'General'}</td> {/* Mock Category */}
                                    <td><span className={`badge ${req.stage.toLowerCase()}`}>{req.stage}</span></td>
                                    <td>{req.reporter ? (req.reporter.company_name || 'My Company') : '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </MainLayout>
    );
};

export default Dashboard;
