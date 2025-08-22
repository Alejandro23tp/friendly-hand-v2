export interface Participante {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  isNew: boolean;
  role: string;
  shares?: number;
  password?: string; // Campo para la contraseña temporal
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateParticipantDto {
  name?: string;
  email?: string;
  shares?: number;
  isNew?: boolean;
}

export interface UpdateParticipantStatusDto {
  isActive: boolean;
}
