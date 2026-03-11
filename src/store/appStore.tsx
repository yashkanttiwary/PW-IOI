'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { getCalendarPhase } from '../engine/calendar/calendarEngine';

export const INITIAL_STATE = {
  currentModule: 'dashboard',
  calendarPhase: null, 
  dateOverride: null,  
  semesterTarget: {
    semester: null,     
    admissionGoal: null,
    totalBudget: null,  
    scenario: 'realistic',
  },
  savedPersonas: [],    
  savedPlans: [],       
  auditHistory: [],     
  abTests: [],          
  activeConversation: {
    module: null,
    history: [],        
    currentPlan: null,  
    lastAutoAudit: null,
  },
};

export function appReducer(state: Record<string, any>, action: { type: string; payload?: any }) {
  switch (action.type) {
    case 'SET_MODULE':
      return {
        ...state,
        currentModule: action.payload,
        activeConversation: {
          ...state.activeConversation,
          module: action.payload,
          history: [], 
        },
      };

    case 'SET_CALENDAR_PHASE':
      return { ...state, calendarPhase: action.payload };

    case 'SET_SEMESTER_TARGET':
      return { ...state, semesterTarget: { ...state.semesterTarget, ...action.payload } };

    case 'ADD_TO_HISTORY':
      return {
        ...state,
        activeConversation: {
          ...state.activeConversation,
          history: [...state.activeConversation.history, action.payload],
        },
      };

    case 'SET_CURRENT_PLAN':
      return {
        ...state,
        activeConversation: {
          ...state.activeConversation,
          currentPlan: action.payload,
        },
      };

    case 'SAVE_PLAN':
      return {
        ...state,
        savedPlans: [
          {
            ...action.payload,
            id: `plan_\${Date.now()}`,
            savedAt: new Date().toISOString(),
          },
          ...state.savedPlans,
        ].slice(0, 50), 
      };

    case 'SAVE_PERSONA':
      return {
        ...state,
        savedPersonas: [
          {
            ...action.payload,
            id: `custom_\${Date.now()}`,
            createdAt: new Date().toISOString(),
          },
          ...state.savedPersonas,
        ].slice(0, 20), 
      };

    case 'SAVE_AUDIT':
      return {
        ...state,
        auditHistory: [action.payload, ...state.auditHistory].slice(0, 30),
      };

    case 'SAVE_AB_TEST':
      return {
        ...state,
        abTests: [action.payload, ...state.abTests].slice(0, 20),
      };

    case 'SET_AUTO_AUDIT':
      return {
        ...state,
        activeConversation: {
          ...state.activeConversation,
          lastAutoAudit: action.payload,
        },
      };

    case 'LOAD_STATE':
      return { ...state, ...action.payload, currentModule: 'dashboard' };

    default:
      return state;
  }
}

const AppContext = createContext<{ state: Record<string, any>; dispatch: React.Dispatch<any> } | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, INITIAL_STATE);
  const [isLoaded, setIsLoaded] = React.useState(false);

  useEffect(() => {
    const savedState = localStorage.getItem('ion_app_state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        dispatch({ type: 'LOAD_STATE', payload: parsed });
      } catch (e) {
        console.error('Failed to load state from localStorage', e);
      }
    }
    dispatch({ type: 'SET_CALENDAR_PHASE', payload: getCalendarPhase() });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('ion_app_state', JSON.stringify(state));
    }
  }, [state, isLoaded]);

  if (!isLoaded) {
    return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">Loading...</div>;
  }

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
}
