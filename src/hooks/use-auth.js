import { useState } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Firebase removed - using backend API authentication instead
  return { user, loading };
};
