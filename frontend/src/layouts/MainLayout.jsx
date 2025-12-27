import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Wrench, Calendar, Monitor, BarChart, Users, Layers } from 'lucide-react';
import './MainLayout.css';

const MainLayout = ({ children }) => {
    const { logout, user } = useAuth();
    const location = useLocation();

    const isActive = (path) => location.pathname.startsWith(path) ? 'active' : '';

    const role = user?.role;

    return (
        <div className="layout-container">
            <header className="main-header">
                <div className="header-top">
                    <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Wrench size={20} /> GearGuard
                    </div>
                    <div className="user-info">
                        <span>{user?.username} ({user?.role})</span>
                        <button onClick={logout} className="btn-text">Logout</button>
                    </div>
                </div>
                <nav className="main-nav">
                    {(role === 'TECHNICIAN' || role === 'MANAGER' || role === 'ADMIN') && (
                        <Link to="/requests" className={`nav-item ${isActive('/requests')}`}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Wrench size={16} /> Maintenance</span>
                        </Link>
                    )}

                    {(role === 'MANAGER' || role === 'ADMIN' || role === 'TECHNICIAN' || role === 'EMPLOYEE') && (
                        <Link to="/dashboard" className={`nav-item ${isActive('/dashboard')}`}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><LayoutDashboard size={16} /> Dashboard</span>
                        </Link>
                    )}

                    {(role === 'MANAGER' || role === 'ADMIN') && (
                        <Link to="/calendar" className={`nav-item ${isActive('/calendar')}`}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={16} /> Calendar</span>
                        </Link>
                    )}

                    {(role === 'ADMIN' || role === 'EMPLOYEE' || role === 'MANAGER' || role === 'TECHNICIAN') && (
                        <Link to="/equipment" className={`nav-item ${isActive('/equipment')}`}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Monitor size={16} /> Equipment</span>
                        </Link>
                    )}

                    {(role === 'ADMIN' || role === 'MANAGER' || role === 'EMPLOYEE') && (
                        <Link to="/work-centers" className={`nav-item ${isActive('/work-centers')}`}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Layers size={16} /> Work Centers</span>
                        </Link>
                    )}

                    {(role === 'MANAGER' || role === 'ADMIN') && (
                        <Link to="/reporting" className={`nav-item ${isActive('/reporting')}`}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><BarChart size={16} /> Reporting</span>
                        </Link>
                    )}

                    {(role === 'MANAGER' || role === 'ADMIN') && (
                        <Link to="/teams" className={`nav-item ${isActive('/teams')}`}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Users size={16} /> Teams</span>
                        </Link>
                    )}

                    {role === 'ADMIN' && (
                        <Link to="/categories" className={`nav-item ${isActive('/categories')}`}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Layers size={16} /> Categories</span>
                        </Link>
                    )}
                </nav>
            </header>
            <main className="main-content">
                {children}
            </main>
        </div>
    );
};

export default MainLayout;
