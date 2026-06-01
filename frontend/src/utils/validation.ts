export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,11}$/;

export function validateRequired(value: string, fieldName: string): string | null {
  if (!value || value.trim().length === 0) {
    return `${fieldName} harus diisi`;
  }
  return null;
}

export function validateEmail(value: string): string | null {
  if (!value) return null;
  if (!emailRegex.test(value)) {
    return 'Format email tidak valid';
  }
  return null;
}

export function validatePhone(value: string): string | null {
  if (!value) return null;
  if (!phoneRegex.test(value)) {
    return 'Format nomor telepon tidak valid';
  }
  return null;
}

export function validateMinLength(value: string, min: number, fieldName: string): string | null {
  if (value.length < min) {
    return `${fieldName} minimal ${min} karakter`;
  }
  return null;
}

export function validateMin(value: number, min: number, fieldName: string): string | null {
  if (value < min) {
    return `${fieldName} minimal ${min}`;
  }
  return null;
}
