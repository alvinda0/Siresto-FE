import React, { useState } from 'react';
import { Modal } from '@/components/Modal';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { get } from 'http';
import { getErrorMessage } from '@/lib/utils';
import { toast } from 'sonner';

// Types
interface BasePinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Record<string, string>) => Promise<void>;
  loading?: boolean;
}

// Create PIN Modal Component
export function CreatePinModal({ isOpen, onClose, onSubmit, loading = false }: BasePinModalProps) {
  const { buttonPrimaryColor, secondaryTextColor } = useTheme();
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (pin.length !== 6) {
      setError('PIN must be exactly 6 digits');
      return;
    }
    if (pin !== confirmPin) {
      setError('PIN and confirmation do not match');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }

    try {
      await onSubmit({ pin, password });
      handleClose();
    } catch (err) {
      const error = getErrorMessage(err);
      setError(error);
      toast.error(error);
    }
  };

  const handleClose = () => {
    setPin('');
    setConfirmPin('');
    setPassword('');
    setError('');
    setShowPassword(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create PIN" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            New PIN (6 digits)
          </label>
          <input
            type="text"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            autoComplete="off"
            className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-2xl tracking-widest font-mono backdrop-blur-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Confirm PIN
          </label>
          <input
            type="password"
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            autoComplete="off"
            className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-2xl tracking-widest font-mono backdrop-blur-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Your Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="off"
              className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-12 backdrop-blur-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50/80 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg backdrop-blur-sm flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading || pin.length !== 6 || confirmPin.length !== 6 || !password}
            className="flex-1 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200 shadow-lg"
            style={{
              backgroundColor: buttonPrimaryColor,
              color: secondaryTextColor,
            }}
          >
            {loading ? 'Creating...' : 'Create PIN'}
          </button>
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-6 py-3 bg-white/50 dark:bg-slate-700/50 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-white/70 dark:hover:bg-slate-700/70 font-medium transition-all duration-200 backdrop-blur-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

// Update PIN Modal Component
export function UpdatePinModal({ isOpen, onClose, onSubmit, loading = false }: BasePinModalProps) {
  const { buttonPrimaryColor, secondaryTextColor } = useTheme();
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (oldPin.length !== 6) {
      setError('Old PIN must be exactly 6 digits');
      return;
    }
    if (newPin.length !== 6) {
      setError('New PIN must be exactly 6 digits');
      return;
    }
    if (newPin !== confirmPin) {
      setError('New PIN and confirmation do not match');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }

    try {
      await onSubmit({ old_pin: oldPin, new_pin: newPin, password });
      handleClose();
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Failed to update PIN');
    }
  };

  const handleClose = () => {
    setOldPin('');
    setNewPin('');
    setConfirmPin('');
    setPassword('');
    setError('');
    setShowPassword(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Update PIN" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Current PIN
          </label>
          <input
            type="text"
            value={oldPin}
            onChange={(e) => setOldPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            autoComplete="off"
            className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest font-mono backdrop-blur-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            New PIN (6 digits)
          </label>
          <input
            type="text"
            value={newPin}
            onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            autoComplete="off"
            className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest font-mono backdrop-blur-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Confirm New PIN
          </label>
          <input
            type="password"
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            autoComplete="off"
            className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest font-mono backdrop-blur-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Your Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="off"
              className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12 backdrop-blur-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50/80 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg backdrop-blur-sm flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading || oldPin.length !== 6 || newPin.length !== 6 || confirmPin.length !== 6 || !password}
            className="flex-1 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200 shadow-lg"
            style={{
              backgroundColor: buttonPrimaryColor,
              color: secondaryTextColor,
            }}
          >
            {loading ? 'Updating...' : 'Update PIN'}
          </button>
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-6 py-3 bg-white/50 dark:bg-slate-700/50 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-white/70 dark:hover:bg-slate-700/70 font-medium transition-all duration-200 backdrop-blur-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}

// Delete PIN Modal Component
export function DeletePinModal({ isOpen, onClose, onSubmit, loading = false }: BasePinModalProps) {
  const [pin, setPin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (pin.length !== 6) {
      setError('PIN must be exactly 6 digits');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }

    try {
      await onSubmit({ pin, password });
      handleClose();
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Failed to delete PIN');
    }
  };

  const handleClose = () => {
    setPin('');
    setPassword('');
    setError('');
    setShowPassword(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Delete PIN" size="md">
      <div className="mb-4 p-4 bg-red-50/80 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg backdrop-blur-sm">
        <p className="text-sm text-red-800 dark:text-red-300 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>Are you sure you want to delete your PIN? This will reduce your account security.</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Enter Your PIN
          </label>
          <input
            type="text"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            maxLength={6}
            autoComplete="off"
            className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-center text-2xl tracking-widest font-mono backdrop-blur-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Your Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="off"
              className="w-full px-4 py-3 bg-white/50 dark:bg-slate-800/50 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent pr-12 backdrop-blur-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50/80 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg backdrop-blur-sm flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading || pin.length !== 6 || !password}
            className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200 shadow-lg shadow-red-500/30"
          >
            {loading ? 'Deleting...' : 'Delete PIN'}
          </button>
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="px-6 py-3 bg-white/50 dark:bg-slate-700/50 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-white/70 dark:hover:bg-slate-700/70 font-medium transition-all duration-200 backdrop-blur-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}