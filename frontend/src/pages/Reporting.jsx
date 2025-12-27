import React, { useEffect, useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { requestService } from '../services/api';

const Reporting = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await requestService.getStats();
                setStats(data);
            } catch (error) {
                console.error("Failed to load reports", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <MainLayout>Loading...</MainLayout>;

    return (
        <MainLayout>
            <div className="dashboard-header">
                <h2>Reporting & Analytics</h2>
            </div>

            {stats && (
                <div className="card">
                    <h3>Key Performance Indicators</h3>
                    <div className="kpi-grid">
                        <div className="kpi-card error">
                            <h3>Critical Equipment</h3>
                            <div className="kpi-value">{stats.critical_equipment.count} Units</div>
                        </div>
                        <div className="kpi-card info">
                            <h3>Technician Load</h3>
                            <div className="kpi-value">{stats.technician_load.label}</div>
                        </div>
                        <div className="kpi-card success">
                            <h3>Open Requests</h3>
                            <div className="kpi-value">{stats.open_requests.count}</div>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
};

export default Reporting;
