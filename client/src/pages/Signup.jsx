import { useState } from 'react';
import api from '../utils/api';
import { useNavigate, Link } from 'react-router-dom';

export default function Signup() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      
      const res = await api.post('/auth/register', formData);
      
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      
      console.log('Registration Successful! 🎉');
      navigate('/dashboard'); 
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error registering user');
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="w-96 p-8 bg-white rounded-xl shadow-xl border border-gray-100">
        
        {}
        <h2 className="mb-8 text-center">
            {}
            <span className="block text-gray-500 text-sm font-semibold tracking-wide uppercase mb-1">
                Get Started
            </span>
            
            {}
            <div className="flex items-center justify-center gap-1">
                <span className="text-gray-600 text-xl font-medium mr-1">Join</span>
                <span className="text-2xl font-extrabold text-gray-900 tracking-tighter">
                    Bug<span className="text-blue-600">Bridge</span>
                </span>
            </div>
        </h2>

        <form onSubmit={handleSubmit}>
          {}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Full Name</label>
            <input 
              type="text" name="name" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm"
              placeholder="John Doe"
              onChange={handleChange} required 
            />
          </div>

          {}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Email Address</label>
            <input 
              type="email" name="email" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm"
              placeholder="name@company.com"
              onChange={handleChange} required 
            />
          </div>

          {}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
            <input 
              type="password" name="password" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition shadow-sm"
              placeholder="••••••••"
              onChange={handleChange} required 
            />
          </div>

          {}
          <button className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition font-bold shadow-md hover:shadow-lg transform active:scale-95 duration-200">
            Sign Up
          </button>
        </form>

        {}
        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account? <Link to="/login" className="text-blue-600 font-bold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}