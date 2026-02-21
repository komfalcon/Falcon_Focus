import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Goal, Task, StudySession, StudyBlock, EnergyLog, UserProgress, Note, FlashcardDeck } from './types';

interface StudyContextType {
  goals: Goal[];
  tasks: Task[];
  studySessions: StudySession[];
  studyBlocks: StudyBlock[];
  energyLogs: EnergyLog[];
  userProgress: UserProgress;
  notes: Note[];
  flashcardDecks: FlashcardDeck[];
  
  // Goal actions
  addGoal: (goal: Goal) => Promise<void>;
  updateGoal: (goal: Goal) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
  
  // Task actions
  addTask: (task: Task) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;
  
  // Study session actions
  addStudySession: (session: StudySession) => Promise<void>;
  completeStudySession: (sessionId: string) => Promise<void>;
  
  // Study block actions
  addStudyBlock: (block: StudyBlock) => Promise<void>;
  updateStudyBlock: (block: StudyBlock) => Promise<void>;
  deleteStudyBlock: (blockId: string) => Promise<void>;
  
  // Energy logging
  logEnergy: (level: number) => Promise<void>;
  
  // Progress
  updateUserProgress: (progress: Partial<UserProgress>) => Promise<void>;
  getStreakCount: () => number;
  getAltitudePercentage: () => number;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

const STORAGE_KEY = 'falcon_focus_data';

const DEFAULT_PROGRESS: UserProgress = {
  totalStudyHours: 0,
  totalSessions: 0,
  currentStreak: 0,
  longestStreak: 0,
  xp: 0,
  level: 'Fledgling',
  badges: [],
  completedGoals: 0,
  completedTasks: 0,
};

export function StudyProvider({ children }: { children: React.ReactNode }) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [studyBlocks, setStudyBlocks] = useState<StudyBlock[]>([]);
  const [energyLogs, setEnergyLogs] = useState<EnergyLog[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress>(DEFAULT_PROGRESS);
  const [notes, setNotes] = useState<Note[]>([]);
  const [flashcardDecks, setFlashcardDecks] = useState<FlashcardDeck[]>([]);

  // Load data from storage on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        setGoals(data.goals || []);
        setTasks(data.tasks || []);
        setStudySessions(data.studySessions || []);
        setStudyBlocks(data.studyBlocks || []);
        setEnergyLogs(data.energyLogs || []);
        setUserProgress(data.userProgress || DEFAULT_PROGRESS);
        setNotes(data.notes || []);
        setFlashcardDecks(data.flashcardDecks || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveData = useCallback(
    async (newGoals: Goal[], newTasks: Task[], newSessions: StudySession[], newBlocks: StudyBlock[], newEnergy: EnergyLog[], newProgress: UserProgress, newNotes: Note[], newDecks: FlashcardDeck[]) => {
      try {
        const data = {
          goals: newGoals,
          tasks: newTasks,
          studySessions: newSessions,
          studyBlocks: newBlocks,
          energyLogs: newEnergy,
          userProgress: newProgress,
          notes: newNotes,
          flashcardDecks: newDecks,
        };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        console.error('Error saving data:', error);
      }
    },
    []
  );

  const addGoal = useCallback(
    async (goal: Goal) => {
      const newGoals = [...goals, goal];
      setGoals(newGoals);
      await saveData(newGoals, tasks, studySessions, studyBlocks, energyLogs, userProgress, notes, flashcardDecks);
    },
    [goals, tasks, studySessions, studyBlocks, energyLogs, userProgress, notes, flashcardDecks, saveData]
  );

  const updateGoal = useCallback(
    async (goal: Goal) => {
      const newGoals = goals.map((g) => (g.id === goal.id ? goal : g));
      setGoals(newGoals);
      await saveData(newGoals, tasks, studySessions, studyBlocks, energyLogs, userProgress, notes, flashcardDecks);
    },
    [goals, tasks, studySessions, studyBlocks, energyLogs, userProgress, notes, flashcardDecks, saveData]
  );

  const deleteGoal = useCallback(
    async (goalId: string) => {
      const newGoals = goals.filter((g) => g.id !== goalId);
      setGoals(newGoals);
      await saveData(newGoals, tasks, studySessions, studyBlocks, energyLogs, userProgress, notes, flashcardDecks);
    },
    [goals, tasks, studySessions, studyBlocks, energyLogs, userProgress, notes, flashcardDecks, saveData]
  );

  const addTask = useCallback(
    async (task: Task) => {
      const newTasks = [...tasks, task];
      setTasks(newTasks);
      await saveData(goals, newTasks, studySessions, studyBlocks, energyLogs, userProgress, notes, flashcardDecks);
    },
    [goals, tasks, studySessions, studyBlocks, energyLogs, userProgress, notes, flashcardDecks, saveData]
  );

  const updateTask = useCallback(
    async (task: Task) => {
      const newTasks = tasks.map((t) => (t.id === task.id ? task : t));
      setTasks(newTasks);
      await saveData(goals, newTasks, studySessions, studyBlocks, energyLogs, userProgress, notes, flashcardDecks);
    },
    [goals, tasks, studySessions, studyBlocks, energyLogs, userProgress, notes, flashcardDecks, saveData]
  );

  const deleteTask = useCallback(
    async (taskId: string) => {
      const newTasks = tasks.filter((t) => t.id !== taskId);
      setTasks(newTasks);
      await saveData(goals, newTasks, studySessions, studyBlocks, energyLogs, userProgress, notes, flashcardDecks);
    },
    [goals, tasks, studySessions, studyBlocks, energyLogs, userProgress, notes, flashcardDecks, saveData]
  );

  const completeTask = useCallback(
    async (taskId: string) => {
      const newTasks = tasks.map((t) =>
        t.id === taskId ? { ...t, completed: true, completedAt: Date.now() } : t
      );
      setTasks(newTasks);
      const newProgress = { ...userProgress, completedTasks: userProgress.completedTasks + 1 };
      setUserProgress(newProgress);
      await saveData(goals, newTasks, studySessions, studyBlocks, energyLogs, newProgress, notes, flashcardDecks);
    },
    [goals, tasks, studySessions, studyBlocks, energyLogs, userProgress, notes, flashcardDecks, saveData]
  );

  const addStudySession = useCallback(
    async (session: StudySession) => {
      const newSessions = [...studySessions, session];
      setStudySessions(newSessions);
      await saveData(goals, tasks, newSessions, studyBlocks, energyLogs, userProgress, notes, flashcardDecks);
    },
    [goals, tasks, studySessions, studyBlocks, energyLogs, userProgress, notes, flashcardDecks, saveData]
  );

  const completeStudySession = useCallback(
    async (sessionId: string) => {
      const session = studySessions.find((s) => s.id === sessionId);
      if (!session) return;

      const completedAt = Date.now();
      const newSessions = studySessions.map((s) =>
        s.id === sessionId ? { ...s, completedAt } : s
      );
      setStudySessions(newSessions);

      const studyHours = session.duration / 60;
      const newProgress = {
        ...userProgress,
        totalStudyHours: userProgress.totalStudyHours + studyHours,
        totalSessions: userProgress.totalSessions + 1,
        xp: userProgress.xp + Math.floor(session.duration * 1.5),
      };
      setUserProgress(newProgress);

      await saveData(goals, tasks, newSessions, studyBlocks, energyLogs, newProgress, notes, flashcardDecks);
    },
    [goals, tasks, studySessions, studyBlocks, energyLogs, userProgress, notes, flashcardDecks, saveData]
  );

  const addStudyBlock = useCallback(
    async (block: StudyBlock) => {
      const newBlocks = [...studyBlocks, block];
      setStudyBlocks(newBlocks);
      await saveData(goals, tasks, studySessions, newBlocks, energyLogs, userProgress, notes, flashcardDecks);
    },
    [goals, tasks, studySessions, studyBlocks, energyLogs, userProgress, notes, flashcardDecks, saveData]
  );

  const updateStudyBlock = useCallback(
    async (block: StudyBlock) => {
      const newBlocks = studyBlocks.map((b) => (b.id === block.id ? block : b));
      setStudyBlocks(newBlocks);
      await saveData(goals, tasks, studySessions, newBlocks, energyLogs, userProgress, notes, flashcardDecks);
    },
    [goals, tasks, studySessions, studyBlocks, energyLogs, userProgress, notes, flashcardDecks, saveData]
  );

  const deleteStudyBlock = useCallback(
    async (blockId: string) => {
      const newBlocks = studyBlocks.filter((b) => b.id !== blockId);
      setStudyBlocks(newBlocks);
      await saveData(goals, tasks, studySessions, newBlocks, energyLogs, userProgress, notes, flashcardDecks);
    },
    [goals, tasks, studySessions, studyBlocks, energyLogs, userProgress, notes, flashcardDecks, saveData]
  );

  const logEnergy = useCallback(
    async (level: number) => {
      const newLog: EnergyLog = {
        id: Date.now().toString(),
        level,
        timestamp: Date.now(),
      };
      const newLogs = [...energyLogs, newLog];
      setEnergyLogs(newLogs);
      await saveData(goals, tasks, studySessions, studyBlocks, newLogs, userProgress, notes, flashcardDecks);
    },
    [goals, tasks, studySessions, studyBlocks, energyLogs, userProgress, notes, flashcardDecks, saveData]
  );

  const updateUserProgress = useCallback(
    async (updates: Partial<UserProgress>) => {
      const newProgress = { ...userProgress, ...updates };
      setUserProgress(newProgress);
      await saveData(goals, tasks, studySessions, studyBlocks, energyLogs, newProgress, notes, flashcardDecks);
    },
    [goals, tasks, studySessions, studyBlocks, energyLogs, userProgress, notes, flashcardDecks, saveData]
  );

  const getStreakCount = useCallback(() => {
    return userProgress.currentStreak;
  }, [userProgress]);

  const getAltitudePercentage = useCallback(() => {
    if (tasks.length === 0) return 0;
    const completedTasks = tasks.filter((t) => t.completed).length;
    return Math.round((completedTasks / tasks.length) * 100);
  }, [tasks]);

  return (
    <StudyContext.Provider
      value={{
        goals,
        tasks,
        studySessions,
        studyBlocks,
        energyLogs,
        userProgress,
        notes,
        flashcardDecks,
        addGoal,
        updateGoal,
        deleteGoal,
        addTask,
        updateTask,
        deleteTask,
        completeTask,
        addStudySession,
        completeStudySession,
        addStudyBlock,
        updateStudyBlock,
        deleteStudyBlock,
        logEnergy,
        updateUserProgress,
        getStreakCount,
        getAltitudePercentage,
      }}
    >
      {children}
    </StudyContext.Provider>
  );
}

export function useStudy() {
  const context = useContext(StudyContext);
  if (!context) {
    throw new Error('useStudy must be used within StudyProvider');
  }
  return context;
}
