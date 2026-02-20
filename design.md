# Study Planner App - Design Document

## Overview

Study Planner is a mobile app designed to help learners set ambitious learning goals, break them into manageable tasks, and track their progress over time. The app follows iOS Human Interface Guidelines and is optimized for one-handed portrait usage.

---

## Screen List

### 1. **Home Screen** (Goals Overview)
- **Purpose**: Display all learning goals at a glance with progress indicators
- **Content**: 
  - List of active goals with progress bars
  - Quick stats (total goals, tasks completed today)
  - Floating action button to create new goal
- **Functionality**: Tap goal to view details, swipe to delete, pull-to-refresh

### 2. **Goal Detail Screen**
- **Purpose**: View a single goal with all its tasks and metadata
- **Content**:
  - Goal title, description, and deadline
  - Progress bar (tasks completed / total tasks)
  - List of tasks with checkboxes
  - Floating action button to add new task
- **Functionality**: Check/uncheck tasks, edit goal, delete goal, view task details

### 3. **Create/Edit Goal Screen**
- **Purpose**: Add or modify a learning goal
- **Content**:
  - Text input for goal title (e.g., "Learn React Hooks")
  - Text input for description (optional)
  - Date picker for target completion date
  - Save/Cancel buttons
- **Functionality**: Form validation, auto-save to local storage

### 4. **Task Detail Screen**
- **Purpose**: View and edit a single task
- **Content**:
  - Task title and description
  - Status (pending, completed)
  - Parent goal name (breadcrumb)
  - Edit/Delete buttons
- **Functionality**: Mark complete/incomplete, edit task, delete task

### 5. **Create/Edit Task Screen**
- **Purpose**: Add or modify a task within a goal
- **Content**:
  - Text input for task title
  - Text input for task description (optional)
  - Checkbox to mark as completed
  - Save/Cancel buttons
- **Functionality**: Form validation, link to parent goal

### 6. **Statistics Screen** (Tab)
- **Purpose**: Show progress analytics and insights
- **Content**:
  - Total goals created
  - Total tasks completed
  - Completion rate (%)
  - Goals on track vs. overdue
  - Weekly activity chart (tasks completed per day)
- **Functionality**: View trends, motivational messages

---

## Primary Content and Functionality

### Data Model

**Goal**
- `id`: Unique identifier
- `title`: String (required)
- `description`: String (optional)
- `targetDate`: Date
- `createdAt`: Date
- `tasks`: Array of Task IDs
- `status`: "active" | "completed" | "archived"

**Task**
- `id`: Unique identifier
- `goalId`: Reference to parent goal
- `title`: String (required)
- `description`: String (optional)
- `completed`: Boolean (default: false)
- `createdAt`: Date
- `completedAt`: Date (optional)

### Core Workflows

**Workflow 1: Create a Learning Goal**
1. User taps "+" button on Home screen
2. Create Goal screen opens
3. User enters goal title (e.g., "Master TypeScript")
4. User optionally adds description and deadline
5. User taps "Save"
6. Goal appears on Home screen with 0% progress

**Workflow 2: Break Goal into Tasks**
1. User taps on a goal from Home screen
2. Goal Detail screen opens
3. User taps "+" button to add task
4. Create Task screen opens
5. User enters task title (e.g., "Complete TypeScript basics course")
6. User optionally adds description
7. User taps "Save"
8. Task appears in goal's task list

**Workflow 3: Track Progress**
1. User views Goal Detail screen
2. User taps checkbox next to a task to mark it complete
3. Task moves to completed section (visual feedback)
4. Progress bar updates in real-time
5. When all tasks are complete, goal shows 100% progress

**Workflow 4: View Statistics**
1. User taps "Statistics" tab
2. Statistics screen shows:
   - Overall completion metrics
   - Weekly activity chart
   - Motivational message based on progress

---

## Key User Flows

### Flow A: Daily Study Routine
```
Home Screen 
  → Tap goal "Learn React"
  → Goal Detail Screen
  → Check off completed tasks
  → Progress bar updates
  → Return to Home Screen
```

### Flow B: Plan New Learning Path
```
Home Screen
  → Tap "+" button
  → Create Goal Screen
  → Enter "Learn Python Data Science"
  → Set deadline (30 days)
  → Save
  → Goal Detail Screen opens
  → Add tasks (NumPy, Pandas, Matplotlib, etc.)
  → Return to Home Screen
```

### Flow C: Review Progress
```
Home Screen
  → Tap "Statistics" tab
  → View completion metrics
  → See weekly activity chart
  → Return to Home Screen
```

---

## Color Choices

**Brand Colors** (Study Planner)
- **Primary**: `#0a7ea4` (Teal/Blue) — Action buttons, progress bars, highlights
- **Background**: `#ffffff` (Light) / `#151718` (Dark)
- **Surface**: `#f5f5f5` (Light) / `#1e2022` (Dark) — Cards, containers
- **Foreground**: `#11181C` (Light) / `#ECEDEE` (Dark) — Primary text
- **Muted**: `#687076` (Light) / `#9BA1A6` (Dark) — Secondary text
- **Success**: `#22C55E` (Green) — Completed tasks, success states
- **Warning**: `#F59E0B` (Amber) — Overdue goals, warnings
- **Error**: `#EF4444` (Red) — Delete actions, errors

**Semantic Usage**
- Progress bars: Primary color (teal)
- Completed tasks: Success color (green) with strikethrough
- Overdue goals: Warning color (amber)
- Buttons: Primary color with opacity on press
- Text: Foreground for primary, Muted for secondary

---

## Navigation Structure

**Tab Bar** (Bottom Navigation)
1. **Home** — Goals overview
2. **Statistics** — Progress analytics
3. **Settings** — App preferences (theme, notifications, about)

**Modal Flows** (Presented on top)
- Create/Edit Goal
- Create/Edit Task
- Task Detail (optional)
- Goal Detail (can be full-screen or modal)

---

## Interaction Patterns

### Button Feedback
- **Primary buttons**: Scale to 0.97 on press + haptic feedback (light)
- **List items**: Opacity 0.7 on press
- **Checkboxes**: Animate to green with success haptic on completion

### Haptics
- Tap to create goal: Light impact
- Mark task complete: Medium impact + success notification
- Delete goal: Error notification

### Animations
- Progress bar update: Smooth 300ms transition
- Task completion: Fade + scale (100ms)
- Screen transitions: Slide from right (200ms)

---

## Accessibility Considerations

- All interactive elements have minimum 44pt touch targets
- Color is not the only indicator (use icons + text)
- Text has sufficient contrast (WCAG AA)
- VoiceOver support for all screens
- Haptic feedback provides non-visual feedback

---

## Data Persistence

- **Local Storage**: AsyncStorage for goals and tasks (no cloud sync required)
- **Backup**: Optional export/import JSON
- **Sync**: Not required for MVP (local-only)

---

## Success Metrics

- User can create a goal in < 30 seconds
- User can add 5 tasks in < 2 minutes
- Progress bar updates instantly on task completion
- App loads in < 1 second
- All flows are dead-end free (every action has a clear next step)
