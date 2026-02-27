import { ScrollView, Text, View, Pressable, TextInput } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import type { Note } from '@/lib/types';

const STORAGE_KEY = 'falcon_focus_data';

const SUBJECTS = [
  'Mathematics',
  'Science',
  'English',
  'History',
  'Languages',
  'Biology',
  'Chemistry',
  'Physics',
  'Art',
  'Music',
  'Other',
];

export default function NoteEditorScreen() {
  const colors = useColors();
  const router = useRouter();
  const { noteId } = useLocalSearchParams<{ noteId?: string }>();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState('Other');
  const [existingNote, setExistingNote] = useState<Note | null>(null);
  const lastSavedRef = useRef<number>(0);
  const isDirtyRef = useRef(false);

  const loadNote = useCallback(async () => {
    if (!noteId) return;
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      const data = JSON.parse(stored) as Record<string, unknown>;
      const notes = (data.notes as Note[]) ?? [];
      const note = notes.find((n) => n.id === noteId);
      if (note) {
        setTitle(note.title);
        setContent(note.content);
        setSubject(note.subject);
        setExistingNote(note);
      }
    } catch (e) {
      console.error('Error loading note:', e);
    }
  }, [noteId]);

  useEffect(() => {
    loadNote();
  }, [loadNote]);

  const saveNote = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const data = stored ? (JSON.parse(stored) as Record<string, unknown>) : {};
      const currentNotes = (data.notes as Note[]) ?? [];
      const now = Date.now();

      if (existingNote) {
        const updated: Note = {
          ...existingNote,
          title: title.trim() || 'Untitled',
          content,
          subject,
          updatedAt: now,
        };
        data.notes = currentNotes.map((n) => (n.id === existingNote.id ? updated : n));
        setExistingNote(updated);
      } else {
        const newNote: Note = {
          id: now.toString(),
          title: title.trim() || 'Untitled',
          content,
          subject,
          tags: [],
          createdAt: now,
          updatedAt: now,
        };
        data.notes = [...currentNotes, newNote];
        setExistingNote(newNote);
      }

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      lastSavedRef.current = now;
      isDirtyRef.current = false;
    } catch (e) {
      console.error('Error saving note:', e);
    }
  }, [title, content, subject, existingNote]);

  // Auto-save every 30 seconds if content changed
  useEffect(() => {
    const interval = setInterval(() => {
      if (isDirtyRef.current && (title.trim() || content.trim())) {
        saveNote();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [saveNote, title, content]);

  const handleSave = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    saveNote().then(() => router.back());
  }, [saveNote, router]);

  const handleBack = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  }, [router]);

  return (
    <ScreenContainer edges={['top', 'left', 'right', 'bottom']}>
      {/* Header */}
      <View
        className="flex-row items-center justify-between px-4 py-3"
        style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
      >
        <Pressable
          className="flex-row items-center active:opacity-70"
          onPress={handleBack}
        >
          <Text className="text-base" style={{ color: colors.primary }}>
            ← Back
          </Text>
        </Pressable>
        <Pressable
          className="rounded-xl px-5 py-2 active:opacity-80"
          style={{ backgroundColor: colors.primary }}
          onPress={handleSave}
        >
          <Text className="text-sm font-bold text-white">Save</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="p-4">
          {/* Title */}
          <TextInput
            className="text-2xl font-bold mb-4"
            style={{ color: colors.foreground }}
            placeholder="Note title"
            placeholderTextColor={colors.muted}
            value={title}
            onChangeText={(text) => { setTitle(text); isDirtyRef.current = true; }}
            returnKeyType="next"
          />

          {/* Subject Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-4"
            contentContainerStyle={{ gap: 8 }}
          >
            {SUBJECTS.map((s) => {
              const isActive = subject === s;
              return (
                <Pressable
                  key={s}
                  className="rounded-xl px-3 py-1.5 active:opacity-80"
                  style={{
                    backgroundColor: isActive ? colors.primary : colors.surface,
                    borderWidth: 1,
                    borderColor: isActive ? colors.primary : colors.border,
                  }}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSubject(s);
                    isDirtyRef.current = true;
                  }}
                >
                  <Text
                    className="text-xs font-bold"
                    style={{ color: isActive ? '#fff' : colors.foreground }}
                  >
                    {s}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Content */}
          <TextInput
            className="text-sm leading-relaxed"
            style={{
              color: colors.foreground,
              minHeight: 300,
              textAlignVertical: 'top',
            }}
            placeholder="Start writing..."
            placeholderTextColor={colors.muted}
            value={content}
            onChangeText={(text) => { setContent(text); isDirtyRef.current = true; }}
            multiline
            scrollEnabled={false}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
