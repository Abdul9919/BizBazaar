import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const UserList = ({ onSelectUser }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/users`,
          {
            headers: {
              authorization: `Bearer ${user?.token}`
            }
          }
        );

        // Handle empty response
        if (!response.data?.data) {
          throw new Error('Invalid server response');
        }

        setUsers(response.data.data);
        setError('');

      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load users');
        console.error('UserList Error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchUsers();
    } else {
      setError('Authentication required');
      setLoading(false);
    }
  }, [user]);

  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (loading) return <div className="p-4 text-gray-500">Loading users...</div>;

  return (
    <div className="user-list">
      {users.map(user => (
        <div
        key={user.id}
        className="user-item p-3 hover:bg-gray-50 cursor-pointer border-b"
        onClick={() => onSelectUser({
          id: user.id,    // Ensure this matches the API response
          name: user.name,
          email: user.email
        })}
      >
          <div className="flex items-center">
            <div className="avatar mr-3">👤</div>
            <div>
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserList