export interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  createdAt: Date;
} 