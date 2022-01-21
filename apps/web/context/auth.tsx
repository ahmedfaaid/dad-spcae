import { createContext, useMemo, useState, useEffect } from 'react';
import {
  useLoginMutation,
  useLogoutMutation,
  useSignupMutation,
  useMeQuery
} from 'dad-gql';
import { User, AuthState } from '../types';

const AuthContext = createContext<AuthState>(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [{ data }] = useMeQuery();
  const [, login] = useLoginMutation();
  const [, signup] = useSignupMutation();
  const [, logout] = useLogoutMutation();

  useEffect(() => {
    if (data?.me) {
      setUser(data.me);
    } else {
      setUser(null);
    }
  }, [data]);

  const authContext = useMemo(
    () => ({
      login: async data => {
        const res = await login(data);

        if (res.data?.login.errors) {
          setUser(null);
          return { ok: false, errors: res.data.login.errors[0].message };
        } else if (res.data?.login.user) {
          setUser(res.data.login.user);
          return { ok: true };
        }
      },
      signup: async data => {
        const res = await signup({ user: data });

        if (res.data?.signup.errors) {
          setUser(null);
          return { ok: false, errors: res.data.signup.errors[0].message };
        } else if (res.data?.signup.user) {
          setUser(res.data.signup.user);
          return { ok: true };
        }
      },
      logout: async () => {
        setUser(null);
        await logout();
      }
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <AuthContext.Provider value={{ user, authContext }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
