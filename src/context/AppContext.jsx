import { createContext, useContext, useState } from 'react';

export const AppContext = createContext({});

export const useAppContext = () => {
  return useContext(AppContext);
};

export const AppContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [orders, setOrders] = useState([]);
  const [employees, setEmployees] = useState([]);

  // Placeholder functions for compatibility
  const addClient = async (clientData, userUid) => {
    console.warn('addClient: Firebase functionality removed');
    return null;
  };

  const addOrder = async (orderData) => {
    console.warn('addOrder: Firebase functionality removed');
    return null;
  };

  const updateOrder = async (orderId, updatedData) => {
    console.warn('updateOrder: Firebase functionality removed');
    return null;
  };

  const deleteOrder = async (orderId) => {
    console.warn('deleteOrder: Firebase functionality removed');
  };

  const addEmployee = async (employeeData) => {
    console.warn('addEmployee: Firebase functionality removed');
    return null;
  };

  const getClientOrders = (clientId) => {
    return orders.filter((order) => order.clientId === clientId);
  };

  const getClientByCode = async (code) => {
    console.warn('getClientByCode: Firebase functionality removed');
    return null;
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
    getClientByCode,
    userUid: user?.uid || null,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};
