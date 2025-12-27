import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        role: 'TECHNICIAN'
    });
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(formData);
            navigate('/login');
        } catch (err) {
            setError('Registration failed. Username/Email might exist.');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2>Sign Up</h2>
                {error && <div style={{ color: 'var(--error-color)', marginBottom: '1rem' }}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Username</label>
                        <input name="username" onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Email ID</label>
                        <input type="email" name="email" onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" name="password" onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Role</label>
                        <select name="role" onChange={handleChange} value={formData.role}>
                            <option value="TECHNICIAN">Technician</option>
                            <option value="MANAGER">Manager</option>
                            <option value="ADMIN">Admin</option>
                            <option value="EMPLOYEE">Employee</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary btn-block">Sign Up</button>
                    <div className="auth-actions" style={{ justifyContent: 'center' }}>
                        <Link to="/login" className="auth-link">Already have an account? Sign In</Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
