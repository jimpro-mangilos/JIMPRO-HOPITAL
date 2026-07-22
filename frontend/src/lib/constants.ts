export const ROLES: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Administrateur',
  MEDECIN: 'Médecin',
  INFIRMIER: 'Infirmier',
  PHARMACIEN: 'Pharmacien',
  LABORANTIN: 'Laborantin',
  RADIOLOGUE: 'Radiologue',
  ACCUEIL: 'Accueil',
  COMPTABLE: 'Comptable',
};

export const GENDERS: Record<string, string> = {
  M: 'Masculin',
  F: 'Féminin',
  AUTRE: 'Autre',
};

export const BLOOD_GROUPS: Record<string, string> = {
  'A+': 'A+',
  'A-': 'A-',
  'B+': 'B+',
  'B-': 'B-',
  'AB+': 'AB+',
  'AB-': 'AB-',
  'O+': 'O+',
  'O-': 'O-',
};

export const APPOINTMENT_STATUS: Record<string, string> = {
  PROGRAMME: 'Programmé',
  CONFIRME: 'Confirmé',
  EN_COURS: 'En cours',
  TERMINE: 'Terminé',
  ANNULE: 'Annulé',
  ABSENT: 'Absent',
};

export const APPOINTMENT_STATUS_COLORS: Record<string, string> = {
  PROGRAMME: 'bg-blue-100 text-blue-800',
  CONFIRME: 'bg-green-100 text-green-800',
  EN_COURS: 'bg-yellow-100 text-yellow-800',
  TERMINE: 'bg-gray-100 text-gray-800',
  ANNULE: 'bg-red-100 text-red-800',
  ABSENT: 'bg-orange-100 text-orange-800',
};

export const APPOINTMENT_TYPES: Record<string, string> = {
  CONSULTATION: 'Consultation',
  SUIVI: 'Suivi',
  URGENCE: 'Urgence',
  LABORATOIRE: 'Laboratoire',
  IMAGERIE: 'Imagerie',
  VACCINATION: 'Vaccination',
};

export const CONSULTATION_STATUS: Record<string, string> = {
  EN_COURS: 'En cours',
  TERMINE: 'Terminé',
  ANNULE: 'Annulé',
};

export const LAB_STATUS: Record<string, string> = {
  EN_ATTENTE: 'En attente',
  PRELEVE: 'Prélevé',
  EN_COURS: 'En cours',
  TERMINE: 'Terminé',
  VALIDE: 'Validé',
};

export const LAB_STATUS_COLORS: Record<string, string> = {
  EN_ATTENTE: 'bg-gray-100 text-gray-800',
  PRELEVE: 'bg-blue-100 text-blue-800',
  EN_COURS: 'bg-yellow-100 text-yellow-800',
  TERMINE: 'bg-green-100 text-green-800',
  VALIDE: 'bg-emerald-100 text-emerald-800',
};

export const IMAGING_STATUS: Record<string, string> = {
  EN_ATTENTE: 'En attente',
  PROGRAMME: 'Programmé',
  REALISE: 'Réalisé',
  INTERPRETE: 'Interprété',
  VALIDE: 'Validé',
};

export const IMAGING_STATUS_COLORS: Record<string, string> = {
  EN_ATTENTE: 'bg-gray-100 text-gray-800',
  PROGRAMME: 'bg-blue-100 text-blue-800',
  REALISE: 'bg-yellow-100 text-yellow-800',
  INTERPRETE: 'bg-purple-100 text-purple-800',
  VALIDE: 'bg-green-100 text-green-800',
};

export const PRIORITY: Record<string, string> = {
  NORMAL: 'Normal',
  URGENT: 'Urgent',
  CRITIQUE: 'Critique',
};

export const PRIORITY_COLORS: Record<string, string> = {
  NORMAL: 'bg-blue-100 text-blue-800',
  URGENT: 'bg-orange-100 text-orange-800',
  CRITIQUE: 'bg-red-100 text-red-800',
};

export const BED_STATUS: Record<string, string> = {
  DISPONIBLE: 'Disponible',
  OCCUPE: 'Occupé',
  MAINTENANCE: 'Maintenance',
  RESERVE: 'Réservé',
};

export const BED_STATUS_COLORS: Record<string, string> = {
  DISPONIBLE: 'bg-green-500',
  OCCUPE: 'bg-red-500',
  MAINTENANCE: 'bg-yellow-500',
  RESERVE: 'bg-blue-500',
};

export const HOSP_STATUS: Record<string, string> = {
  ADMIS: 'Admis',
  TRANSFERE: 'Transféré',
  SORTI: 'Sorti',
  DECEDE: 'Décédé',
};

export const HOSP_STATUS_COLORS: Record<string, string> = {
  ADMIS: 'bg-blue-100 text-blue-800',
  TRANSFERE: 'bg-yellow-100 text-yellow-800',
  SORTI: 'bg-green-100 text-green-800',
  DECEDE: 'bg-red-100 text-red-800',
};

export const INVOICE_STATUS: Record<string, string> = {
  BROUILLON: 'Brouillon',
  EMISE: 'Émise',
  PARTIELLE: 'Partielle',
  PAYEE: 'Payée',
  ANNULEE: 'Annulée',
  REMBOURSEE: 'Remboursée',
};

export const INVOICE_STATUS_COLORS: Record<string, string> = {
  BROUILLON: 'bg-gray-100 text-gray-800',
  EMISE: 'bg-blue-100 text-blue-800',
  PARTIELLE: 'bg-yellow-100 text-yellow-800',
  PAYEE: 'bg-green-100 text-green-800',
  ANNULEE: 'bg-red-100 text-red-800',
  REMBOURSEE: 'bg-purple-100 text-purple-800',
};

export const PAYMENT_METHODS: Record<string, string> = {
  ESPECES: 'Espèces',
  CARTE_BANCAIRE: 'Carte bancaire',
  CHEQUE: 'Chèque',
  VIREMENT: 'Virement',
  ASSURANCE: 'Assurance',
  MOBILE_MONEY: 'Mobile Money',
};

export const TRIAGE_LEVELS: Record<string, string> = {
  I: 'I - Immédiat',
  II: 'II - Très urgent',
  III: 'III - Urgent',
  IV: 'IV - Standard',
  V: 'V - Non urgent',
};

export const TRIAGE_COLORS: Record<string, string> = {
  I: 'bg-red-600 text-white',
  II: 'bg-orange-500 text-white',
  III: 'bg-yellow-500 text-white',
  IV: 'bg-green-500 text-white',
  V: 'bg-blue-500 text-white',
};

export const EMERGENCY_STATUS: Record<string, string> = {
  EN_ATTENTE: 'En attente',
  EN_TRIAGE: 'En triage',
  EN_TRAITEMENT: 'En traitement',
  EN_OBSERVATION: 'En observation',
  SORTI: 'Sorti',
  HOSPITALISE: 'Hospitalisé',
  TRANSFERE: 'Transféré',
  DECEDE: 'Décédé',
};

export const ROOM_TYPES: Record<string, string> = {
  STANDARD: 'Standard',
  PRIVEE: 'Privée',
  SEMI_PRIVEE: 'Semi-privée',
  SOINS_INTENSIFS: 'Soins intensifs',
  ISOLEMENT: 'Isolement',
};
