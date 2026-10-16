import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Author, Book, BookPayload, Category, Loan, Role, UserItem } from './models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly base = environment.apiUrl;
  constructor(private http: HttpClient) {}

  getAuthors(): Observable<Author[]> { return this.http.get<Author[]>(`${this.base}/authors`); }
  createAuthor(data: Author): Observable<Author> { return this.http.post<Author>(`${this.base}/authors`, data); }
  updateAuthor(id: number, data: Author): Observable<Author> { return this.http.put<Author>(`${this.base}/authors/${id}`, data); }
  deleteAuthor(id: number): Observable<void> { return this.http.delete<void>(`${this.base}/authors/${id}`); }

  getCategories(): Observable<Category[]> { return this.http.get<Category[]>(`${this.base}/categories`); }
  createCategory(data: Category): Observable<Category> { return this.http.post<Category>(`${this.base}/categories`, data); }
  updateCategory(id: number, data: Category): Observable<Category> { return this.http.put<Category>(`${this.base}/categories/${id}`, data); }
  deleteCategory(id: number): Observable<void> { return this.http.delete<void>(`${this.base}/categories/${id}`); }

  getBooks(q = ''): Observable<Book[]> {
    return this.http.get<Book[]>(`${this.base}/books`, { params: q ? { q } : {} });
  }
  createBook(data: BookPayload): Observable<Book> { return this.http.post<Book>(`${this.base}/books`, data); }
  updateBook(id: number, data: BookPayload): Observable<Book> { return this.http.put<Book>(`${this.base}/books/${id}`, data); }
  deleteBook(id: number): Observable<void> { return this.http.delete<void>(`${this.base}/books/${id}`); }

  getUsers(): Observable<UserItem[]> { return this.http.get<UserItem[]>(`${this.base}/users`); }
  updateUser(id: number, data: { fullName: string; email: string; role: Role; enabled: boolean }): Observable<UserItem> {
    return this.http.put<UserItem>(`${this.base}/users/${id}`, data);
  }
  deleteUser(id: number): Observable<void> { return this.http.delete<void>(`${this.base}/users/${id}`); }

  getLoans(): Observable<Loan[]> { return this.http.get<Loan[]>(`${this.base}/loans`); }
  createLoan(data: { bookId: number; userId?: number | null; dueDate: string }): Observable<Loan> {
    return this.http.post<Loan>(`${this.base}/loans`, data);
  }
  returnLoan(id: number): Observable<Loan> { return this.http.put<Loan>(`${this.base}/loans/${id}/return`, {}); }
  deleteLoan(id: number): Observable<void> { return this.http.delete<void>(`${this.base}/loans/${id}`); }
}
