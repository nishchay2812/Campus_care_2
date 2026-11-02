export interface CategoryItem {
  id: string;
  name: string;
  description: string;
  examples: string[];
  icon: string;
  badge: string;
}

export interface WorkflowStep {
  step: string;
  title: string;
  description: string;
  detail: string;
  icon: string;
}

export type ComplaintCategory =
  | 'Electrical'
  | 'IT / Computers'
  | 'Classroom Equipment'
  | 'Water / Plumbing'
  | 'Cleanliness'
  | 'Other';

export interface ComplaintFormData {
  studentName: string;
  email: string;
  category: ComplaintCategory | '';
  location: string;
  description: string;
}

export interface ComplaintFormErrors {
  studentName?: string;
  email?: string;
  category?: string;
  location?: string;
  description?: string;
}

export interface AdminLoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface AdminLoginFormErrors {
  email?: string;
  password?: string;
}

export type ComplaintStatus = 'Pending' | 'In Progress' | 'Resolved';

export interface ComplaintRecord {
  id: string;
  dbId?: string;
  complaintId?: string;
  studentName: string;
  email: string;
  category: ComplaintCategory;
  location: string;
  description: string;
  date: string;
  status: ComplaintStatus;
  createdAt?: string;
}

export interface TrackedComplaint {
  complaint_id: string;
  category: string;
  location: string;
  status: ComplaintStatus;
  created_at: string;
}

export type AppRoute = '/' | '/report' | '/track-complaint' | '/admin/login' | '/admin/dashboard';
