import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dumbbell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import FloatingLabelInput from '../../components/Input/FloatingLabelInput';
import Button from '../../components/Button/Button';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string; errors?: { username?: string[] } } } };
      setError(axiosError.response?.data?.errors?.username?.[0] || axiosError.response?.data?.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FACC15]">
            <Dumbbell className="h-8 w-8 text-[#111827]" />
          </div>
          <h1 className="text-2xl font-bold text-[#111827]">OFitness Gym</h1>
          <p className="mt-1 text-sm text-gray-500">Management System</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-lg font-semibold text-[#111827]">Sign In</h2>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <FloatingLabelInput
              label="Username"
              name="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <FloatingLabelInput
              label="Password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
