import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { adminService } from '../../services';
import './Customers.css';

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllUsers({});
      console.log('Customers response:', response);
      setCustomers(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to load customers');
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await adminService.toggleUserStatus(userId);
      setCustomers(customers.map(c => 
        c._id === userId ? { ...c, isActive: !c.isActive } : c
      ));
      toast.success('User status updated successfully');
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading customers...</div>;
  }

  return (
    <div className="admin-customers">
      <div className="customers-container">
        <div className="customers-header">
          <h1>Customers Management</h1>
          <p>{customers.length} total customers</p>
        </div>

        <div className="customers-table-wrapper">
          <table className="customers-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Joined Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer._id}>
                  <td>
                    <div className="customer-name">
                      {customer.firstName} {customer.lastName}
                    </div>
                  </td>
                  <td>{customer.email}</td>
                  <td>{customer.phone || 'N/A'}</td>
                  <td>
                    <span className={`role-badge ${customer.role}`}>
                      {customer.role}
                    </span>
                  </td>
                  <td>{new Date(customer.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge ${customer.isActive ? 'active' : 'inactive'}`}>
                      {customer.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    {customer.role !== 'admin' && (
                      <button
                        className={`btn-toggle-status ${customer.isActive ? 'deactivate' : 'activate'}`}
                        onClick={() => handleToggleStatus(customer._id)}
                      >
                        {customer.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminCustomers;
