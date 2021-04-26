// store.js
import React, { createContext, useReducer } from "react";

const initialState = {
  loading: true,
  currentUser: null,
};
const userStore = createContext(initialState);
const { Provider } = userStore;

const UserStateProvider = ({ children }) => {
  const [state, dispatch] = useReducer((state, action) => {
    const newState = action.payload; // do something with the action
    switch (action.type) {
      case "currentUser":
        return { ...state, currentUser: newState };
      case "userData":
        return { ...state, userData: newState };
      case "update":
        return { ...state, ...newState };

      default:
        throw new Error();
    }
  }, initialState);

  return <Provider value={{ state, dispatch }}>{children}</Provider>;
};

export { userStore, UserStateProvider };
