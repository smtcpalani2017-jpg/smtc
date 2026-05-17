export type UserRole = 'admin' | 'teacher';

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Teacher {
  id: string;
  teacher_name: string;
  subject: string;
  qualification: string;
  experience: string;
  pass_percentage: number;
  top_results: string;
  salary: number;
  assigned_grades: string[];
  attendance_percentage: number;
  profile_id: string;
  created_at: string;
}

export interface Student {
  id: string;
  register_number: string;
  student_name: string;
  grade: string;
  school_name: string;
  parent_name: string;
  parent_phone: string;
  address: string;
  join_date: string;
  assigned_teacher: string;
  fees_status: 'paid' | 'pending' | 'partial';
  created_at: string;
}

export interface Attendance {
  id: string;
  student_id: string;
  teacher_id: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  remarks?: string;
}

export interface Mark {
  id: string;
  student_id: string;
  subject: string;
  exam_name: string;
  marks: number;
  total_marks: number;
  uploaded_by: string;
  created_at: string;
}

export interface Fee {
  id: string;
  student_id: string;
  amount: number;
  paid_amount: number;
  pending_amount: number;
  due_date: string;
  payment_status: 'paid' | 'pending' | 'partial';
}

export interface Achievement {
  id: string;
  student_name: string;
  exam: string;
  rank: string;
  score: string;
  year: string;
  image_url?: string;
  description: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
}
