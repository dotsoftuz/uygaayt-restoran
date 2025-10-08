import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '@/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  doc,
  getDoc,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';

export const AppContext = createContext({});

export const useAppContext = () => {
  return useContext(AppContext);
};

export const AppContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userUid, setUserUid] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [orders, setOrders] = useState([]);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setUserUid(auth.currentUser.uid);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchUserData = async () => {
    if (user) {
      setUserLoading(true);
      try {
        const snapshot = await getDoc(doc(db, 'users', userUid));
        setUserData(snapshot.data());
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setUserLoading(false);
      }
    }
  };
  useEffect(() => {
    fetchUserData();
  }, [user]);

  // Real-time clients listener
  useEffect(() => {
    if (!userUid) return;

    const q = query(
      collection(db, 'users', userUid, 'clients'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const clientsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setClients(clientsData);
      },
      (error) => {
        console.error('Error listening to clients:', error);
      }
    );

    return () => unsubscribe();
  }, [userUid]);

  // Real-time orders listener
  useEffect(() => {
    if (!userUid) return;

    const q = query(
      collection(db, 'users', userUid, 'orders'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const ordersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(ordersData);
      },
      (error) => {
        console.error('Error listening to orders:', error);
      }
    );

    return () => unsubscribe();
  }, [userUid]);

  // Real-time employees listener
  useEffect(() => {
    if (!userUid) return;

    const q = query(
      collection(db, 'users', userUid, 'employees'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const employeesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEmployees(employeesData);
      },
      (error) => {
        console.error('Error listening to employees:', error);
      }
    );

    return () => unsubscribe();
  }, [userUid]);

  // Add new client
  const addClient = async (clientData) => {
    if (!userUid) return;
    try {
      // If clientData has an id, it means we're updating an existing client
      if (clientData.id) {
        const clientRef = doc(db, 'users', userUid, 'clients', clientData.id);
        await updateDoc(clientRef, clientData);
        return clientData.id;
      } else {
        // Creating a new client
        const docRef = await addDoc(
          collection(db, 'users', userUid, 'clients'),
          {
            ...clientData,
            createdAt: new Date(),
          }
        );
        return docRef.id;
      }
    } catch (error) {
      console.error('Error adding/updating client:', error);
      throw error;
    }
  };

  // Add new order
  const addOrder = async (orderData) => {
    if (!userUid) return;
    try {
      const docRef = await addDoc(collection(db, 'users', userUid, 'orders'), {
        ...orderData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding order:', error);
      throw error;
    }
  };

  // Update existing order
  const updateOrder = async (orderId, updatedData) => {
    if (!userUid) return;
    try {
      const orderRef = doc(db, 'users', userUid, 'orders', orderId);
      await updateDoc(orderRef, {
        ...updatedData,
        updatedAt: new Date(),
      });
      return orderId;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  };

  // Delete order
  const deleteOrder = async (orderId) => {
    if (!userUid) return;
    try {
      const orderRef = doc(db, 'users', userUid, 'orders', orderId);
      await deleteDoc(orderRef);
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  };

  // Add new employee
  const addEmployee = async (employeeData) => {
    if (!userUid) return;
    try {
      // If employeeData has an id, it means we're updating an existing employee
      if (employeeData.id) {
        const employeeRef = doc(
          db,
          'users',
          userUid,
          'employees',
          employeeData.id
        );
        await updateDoc(employeeRef, employeeData);
        return employeeData.id;
      } else {
        // Creating a new employee
        const docRef = await addDoc(
          collection(db, 'users', userUid, 'employees'),
          {
            ...employeeData,
            createdAt: new Date(),
          }
        );
        return docRef.id;
      }
    } catch (error) {
      console.error('Error adding/updating employee:', error);
      throw error;
    }
  };

  // Get orders for a specific client
  const getClientOrders = (clientId) => {
    return orders.filter((order) => order.clientId === clientId);
  };

  const contextValue = {
    user,
    userData,
    setUserData,
    loading,
    clients,
    orders,
    employees,
    addClient,
    addOrder,
    updateOrder,
    deleteOrder,
    addEmployee,
    getClientOrders,
    userUid,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};
