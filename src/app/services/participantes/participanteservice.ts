import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
export interface CreateParticipantDto {
  email: string;
  password: string;
  name: string;
  role?: string;
  shares?: number;
}

import { Participante, UpdateParticipantDto, UpdateParticipantStatusDto } from '../../models/participante.model';

@Injectable({
  providedIn: 'root'
})
export class ParticipanteService {
  private apiUrl = `${environment.apiUrl}/participants`;
  private http = inject(HttpClient);

  /**
   * Obtiene el perfil del participante actual
   */
  getMyProfile(): Observable<Participante> {
    return this.http.get<Participante>(`${this.apiUrl}/me`);
  }

  /**
   * Obtiene participantes con filtro opcional por estado
   * @param options Opciones de filtrado
   */
  getAllParticipants(options?: { inactive?: boolean }): Observable<Participante[]> {
    let params = new HttpParams();
    if (options?.inactive !== undefined) {
      params = params.set('inactive', options.inactive.toString());
    }
    return this.http.get<Participante[]>(this.apiUrl, { params });
  }

  /**
   * Obtiene solo los participantes inactivos
   */
  getInactiveParticipants(): Observable<Participante[]> {
    return this.http.get<Participante[]>(`${this.apiUrl}/inactive`);
  }

  /**
   * Obtiene un participante por su ID
   * @param id ID del participante
   */
  getParticipantById(id: string): Observable<Participante> {
    return this.http.get<Participante>(`${this.apiUrl}/${id}`);
  }

  /**
   * Actualiza el estado de un participante (solo para administradores)
   */
  updateParticipantStatus(id: string, status: UpdateParticipantStatusDto): Observable<Participante> {
    return this.http.patch<Participante>(`${this.apiUrl}/${id}/status`, status);
  }

  /**
   * Actualiza la información de un participante (solo para administradores)
   */
  updateParticipant(id: string, data: UpdateParticipantDto): Observable<Participante> {
    return this.http.patch<Participante>(`${this.apiUrl}/${id}`, data);
  }

  /**
   * Elimina un participante (solo para administradores)
   */
  deleteParticipant(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crea un nuevo participante
   */
  createParticipant(participant: CreateParticipantDto): Observable<Participante> {
    // Asegurarse de que el rol tenga un valor por defecto si no se proporciona
    const data = {
      ...participant,
      role: participant.role || 'participant'
    };
    return this.http.post<Participante>('http://localhost:3000/auth/register', data);
  }
}
