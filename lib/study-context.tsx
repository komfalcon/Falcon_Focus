import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Goal, Task, GoalWithProgress, Statistics, DailyActivity } from './types';

interface StudyContextType {
  goals: GoalWithProgress[];
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'tasks'>) => void;
  updateGoal: (id: string, goal: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  addTask: (goalId: string, task: Omit<Task, 'id' | 'createdAt' | 'goalId'>) => void;
  updateTask: (goalId: string, taskId: string, task: Partial<Task>) => void;
  deleteTask: (goalId: string, taskId: string) => void;
  toggleTask: (goalId: string, taskId: string) => void;
  getStatistics: () => Statistics;
  isLoading: boolean;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

interface StudyState {
  goals: Goal[];
  isLoading: boolean;
}

type StudyAction =
  | { type: 'SET_GOALS'; payload: Goal[] }
  | { type: 'ADD_GOAL'; payload: Goal }
  | { type: 'UPDATE_GOAL'; payload: { id: string; goal: Partial<Goal> } }
  | { type: 'DELETE_GOAL'; payload: string }
  | { type: 'ADD_TASK'; payload: { goalId: string; task: Task } }
  | { type: 'UPDATE_TASK'; payload: { goalId: string; taskId: string; task: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: { goalId: string; taskId: string } }
  | { type: 'SET_LOADING'; payload: boolean };

const STORAGE_KEY = 'study_planner_goals';

function studyReducer(state: StudyState, action: StudyAction): StudyState {
  switch (action.type) {
    case 'SET_GOALS':
      return { ...state, goals: action.payload };

    case 'ADD_GOAL':
      return { ...state, goals: [...state.goals, action.payload] };

    case 'UPDATE_GOAL': {
      const { id, goal } = action.payload;
      return {
        ...state,
        goals: state.goals.map((g) =>
          g.id === id ? { ...g, ...goal } : g
        ),
      };
    }

    case 'DELETE_GOAL':
      return { ...state, goals: state.goals.filter((g) => g.id !== action.payload) };

    case 'ADD_TASK': {
      const { goalId, task } = action.payload;
      return {
        ...state,
        goals: state.goals.map((g) =>
          g.id === goalId ? { ...g, tasks: [...g.tasks, task] } : g
        ),
      };
    }

    case 'UPDATE_TASK': {
      const { goalId, taskId, task } = action.payload;
      return {
        ...state,
        goals: state.goals.map((g) =>
          g.id === goalId
            ? {
                ...g,
                tasks: g.tasks.map((t) =>
                  t.id === taskId ? { ...t, ...task } : t
                ),
              }
            : g
        ),
      };
    }

    case 'DELETE_TASK': {
      const { goalId, taskId } = action.payload;
      return {
        ...state,
        goals: state.goals.map((g) =>
          g.id === goalId
            ? { ...g, tasks: g.tasks.filter((t) => t.id !== taskId) }
            : g
        ),
      };
    }

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    default:
      return state;
  }
}

export function StudyProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(studyReducer, {
    goals: [],
    isLoading: true,
  });

  // Load goals from AsyncStorage on mount
  useEffect(() => {
    loadGoals();
  }, []);

  // Save goals to AsyncStorage whenever they change
  useEffect(() => {
    if (!state.isLoading) {
      saveGoals(state.goals);
    }
  }, [state.goals, state.isLoading]);

  async function loadGoals() {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        const goals = JSON.parse(data).map((g: any) => ({
          ...g,
          createdAt: new Date(g.createdAt),
          targetDate: g.targetDate ? new Date(g.targetDate) : undefined,
          tasks: g.tasks.map((t: any) => ({
            ...t,
            createdAt: new Date(t.createdAt),
            completedAt: t.completedAt ? new Date(t.completedAt) : undefined,
          })),
        }));
        dispatch({ type: 'SET_GOALS', payload: goals });
      }
    } catch (error) {
      console.error('Failed to load goals:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }

  async function saveGoals(goals: Goal[]) {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
    } catch (error) {
      console.error('Failed to save goals:', error);
    }
  }

  function addGoal(goal: Omit<Goal, 'id' | 'createdAt' | 'tasks'>) {
    const newGoal: Goal = {
      ...goal,
      id: Date.now().toString(),
      createdAt: new Date(),
      tasks: [],
    };
    dispatch({ type: 'ADD_GOAL', payload: newGoal });
  }

  function updateGoal(id: string, goal: Partial<Goal>) {
    dispatch({ type: 'UPDATE_GOAL', payload: { id, goal } });
  }

  function deleteGoal(id: string) {
    dispatch({ type: 'DELETE_GOAL', payload: id });
  }

  function addTask(goalId: string, task: Omit<Task, 'id' | 'createdAt' | 'goalId'>) {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      goalId,
      createdAt: new Date(),
    };
    dispatch({ type: 'ADD_TASK', payload: { goalId, task: newTask } });
  }

  function updateTask(goalId: string, taskId: string, task: Partial<Task>) {
    dispatch({ type: 'UPDATE_TASK', payload: { goalId, taskId, task } });
  }

  function deleteTask(goalId: string, taskId: string) {
    dispatch({ type: 'DELETE_TASK', payload: { goalId, taskId } });
  }

  function toggleTask(goalId: string, taskId: string) {
    const goal = state.goals.find((g) => g.id === goalId);
    if (!goal) return;

    const task = goal.tasks.find((t) => t.id === taskId);
    if (!task) return;

    updateTask(goalId, taskId, {
      completed: !task.completed,
      completedAt: !task.completed ? new Date() : undefined,
    });
  }

  function getStatistics(): Statistics {
    const allTasks = state.goals.flatMap((g) => g.tasks);
    const completedTasks = allTasks.filter((t) => t.completed);
    const completedGoals = state.goals.filter((g) => g.status === 'completed');

    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    const weeklyActivity: DailyActivity[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const tasksCompletedToday = completedTasks.filter(
        (t) => t.completedAt && t.completedAt >= dayStart && t.completedAt <= dayEnd
      ).length;

      weeklyActivity.push({
        date,
        tasksCompleted: tasksCompletedToday,
      });
    }

    const goalsOverdue = state.goals.filter(
      (g) => g.targetDate && g.targetDate < today && g.status === 'active'
    ).length;

    const goalsOnTrack = state.goals.filter(
      (g) => !g.targetDate || (g.targetDate >= today && g.status === 'active')
    ).length;

    return {
      totalGoals: state.goals.length,
      completedGoals: completedGoals.length,
      totalTasks: allTasks.length,
      completedTasks: completedTasks.length,
      completionRate: allTasks.length > 0 ? (completedTasks.length / allTasks.length) * 100 : 0,
      goalsOnTrack,
      goalsOverdue,
      weeklyActivity,
    };
  }

  const goalsWithProgress: GoalWithProgress[] = state.goals.map((goal) => {
    const completedTasks = goal.tasks.filter((t) => t.completed).length;
    return {
      ...goal,
      totalTasks: goal.tasks.length,
      completedTasks,
      progressPercentage: goal.tasks.length > 0 ? (completedTasks / goal.tasks.length) * 100 : 0,
    };
  });

  const value: StudyContextType = {
    goals: goalsWithProgress,
    addGoal,
    updateGoal,
    deleteGoal,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    getStatistics,
    isLoading: state.isLoading,
  };

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
}

export function useStudy() {
  const context = useContext(StudyContext);
  if (!context) {
    throw new Error('useStudy must be used within StudyProvider');
  }
  return context;
}
