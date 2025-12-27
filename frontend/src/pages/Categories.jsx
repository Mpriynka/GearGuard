import React, { useEffect, useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { resourceService } from '../services/api';

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState({ name: '', description: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const data = await resourceService.getCategories();
            setCategories(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await resourceService.createCategory(newCategory);
            setNewCategory({ name: '', description: '' });
            loadCategories();
        } catch (error) {
            alert("Failed to create category");
        }
    };

    if (loading) return <MainLayout>Loading...</MainLayout>;

    return (
        <MainLayout>
            <div className="dashboard-header">
                <h2>Equipment Categories</h2>
            </div>

            <div className="card">
                <form onSubmit={handleCreate} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', alignItems: 'flex-end' }}>
                    <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
                        <label>Category Name</label>
                        <input value={newCategory.name} onChange={e => setNewCategory({ ...newCategory, name: e.target.value })} required />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0, flex: 2 }}>
                        <label>Description</label>
                        <input value={newCategory.description} onChange={e => setNewCategory({ ...newCategory, description: e.target.value })} />
                    </div>
                    <button type="submit" className="btn btn-primary">Add</button>
                </form>

                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Description</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map(cat => (
                            <tr key={cat.id}>
                                <td>{cat.name}</td>
                                <td>{cat.description}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </MainLayout>
    );
};

export default Categories;
