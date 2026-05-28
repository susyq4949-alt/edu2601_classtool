/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Student {
  id: string;
  num: number;
  name: string;
  emoji: string;
}

export interface Task {
  id: string;
  title: string;
  createdAt: string;
}

export interface Submission {
  taskId: string;
  studentId: string;
  submitted: boolean;
}

export interface TimetableItem {
  period: number;
  subject: string;
  details: string;
}

export interface ClassNotice {
  id: string;
  content: string;
  isImportant: boolean;
  createdAt: string;
}
