export type Role = 'ADMIN' | 'LECTOR';
export type LoanStatus = 'ACTIVO' | 'DEVUELTO' | 'VENCIDO';

export interface AuthUser {
  token: string;
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: Role;
}

export interface Author {
  id?: number;
  name: string;
  nationality?: string;
  biography?: string;
}

export interface Category {
  id?: number;
  name: string;
  description?: string;
}

export interface Book {
  id: number;
  title: string;
  isbn: string;
  publicationYear?: number;
  totalCopies: number;
  availableCopies: number;
  active: boolean;
  author: Author;
  category: Category;
}

export interface BookPayload {
  title: string;
  isbn: string;
  publicationYear: number | null;
  totalCopies: number;
  authorId: number;
  categoryId: number;
  active: boolean;
}

export interface UserItem {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: Role;
  enabled: boolean;
}

export interface Loan {
  id: number;
  user: UserItem;
  book: Book;
  loanDate: string;
  dueDate: string;
  returnDate?: string;
  status: LoanStatus;
}

export interface ApiError {
  message?: string;
  validationErrors?: Record<string, string>;
}
