# 🏥 JIMPRO-HOPITAL

**Plateforme de Gestion Hospitalière — Moderne, Complète, Professionnelle.**

JIMPRO-HOPITAL est une solution logicielle tout-en-un conçue pour digitaliser 
et optimiser l'ensemble des services d'un établissement hospitalier. De la 
prise de rendez-vous à la facturation, en passant par le dossier médical 
électronique et la gestion de la pharmacie, chaque module est pensé pour 
offrir une expérience fluide et professionnelle.

---

## ✨ Fonctionnalités

### 🏥 Modules Principaux
| Module | Fonctionnalités |
|--------|----------------|
| **Patients** | CRUD complet, recherche avancée, historique médical, QR code dossier |
| **Personnel** | Médecins, infirmiers, pharmaciens, laborantins — gestion des profils |
| **Rendez-vous** | Planning intelligent, détection de conflits, rappels, files d'attente |
| **Consultations** | Dossiers médicaux électroniques, diagnostics CIM-10, prescriptions |
| **Pharmacie** | Inventaire, dispensing, alertes de péremption, commandes fournisseurs |
| **Laboratoire** | Demandes d'analyses, saisie des résultats, seuils anormaux |
| **Imagerie** | Demandes radio/IRM/Scanner, comptes-rendus, suivi |
| **Hospitalisation** | Gestion des lits/chambres/pavillons, admissions, transferts, sorties |
| **Urgences** | Triage (I à V), tableau de bord temps réel, orientation |
| **Facturation** | Factures, lignes, paiements, assurance, rapports financiers |
| **Dashboard** | KPIs temps réel, graphiques, alertes |

### 🔐 Sécurité & Audit
- Authentification JWT avec rôles (SuperAdmin, Admin, Médecin, Infirmier, etc.)
- Contrôle d'accès granulaire (RBAC)
- Journal d'audit complet (chaque action tracée)
- Validation des entrées (Zod)

---

## 🛠 Stack Technique

| Couche | Technologie |
|--------|-------------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Recharts |
| **Backend** | Node.js, Express, TypeScript, Prisma ORM |
| **Base de données** | SQLite (développement) / PostgreSQL (production) |
| **Authentification** | JWT + bcrypt |
| **Validation** | Zod |
| **Documentation API** | Swagger / OpenAPI |
| **Temps réel** | Socket.IO |

---

## 🚀 Démarrage Rapide

### Prérequis
- **Node.js** ≥ 18
- **npm** ≥ 9

### Installation

```bash
# 1. Cloner le projet
git clone <repo-url>
cd JIMPRO-HOPITAL

# 2. Installer toutes les dépendances
npm run setup

# 3. Lancer en développement (backend + frontend)
npm run dev
```

- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:3000
- **Swagger Docs** : http://localhost:3000/api-docs
- **Prisma Studio** : `npm run db:studio`

### Comptes par défaut (seed)

| Rôle | Email | Mot de passe |
|------|-------|-------------|
| Super Admin | admin@jimpro-hopital.com | Admin@123 |

---

## 🐳 Docker (Production)

```bash
docker compose up -d
```

- **Frontend** : http://localhost
- **Backend** : http://localhost:3000

---

## 📁 Structure du Projet

```
JIMPRO-HOPITAL/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Modèle de données (18 entités)
│   │   └── seed.ts            # Données de démarrage
│   ├── src/
│   │   ├── config/            # Configuration
│   │   ├── lib/               # Utilitaires (Prisma, JWT, Audit)
│   │   ├── middleware/        # Auth, RBAC, Validation, Erreurs
│   │   ├── modules/           # Modules métier
│   │   │   ├── auth/          # Authentification
│   │   │   ├── patients/      # Gestion des patients
│   │   │   ├── staff/         # Personnel
│   │   │   ├── appointments/  # Rendez-vous
│   │   │   ├── consultations/ # Consultations médicales
│   │   │   ├── prescriptions/ # Ordonnances
│   │   │   ├── pharmacy/      # Pharmacie & stock
│   │   │   ├── laboratory/    # Laboratoire
│   │   │   ├── imaging/       # Imagerie médicale
│   │   │   ├── hospitalization/ # Hospitalisation
│   │   │   ├── billing/       # Facturation
│   │   │   ├── emergency/     # Urgences
│   │   │   ├── dashboard/     # Tableaux de bord
│   │   │   └── notifications/ # Notifications
│   │   └── main.ts            # Point d'entrée serveur
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/        # Composants UI & Layout
│   │   ├── pages/             # Pages de l'application
│   │   ├── store/             # État global (Zustand)
│   │   ├── lib/               # API client, utilitaires
│   │   ├── App.tsx            # Routing principal
│   │   └── main.tsx           # Point d'entrée
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
└── README.md
```

---

## 🔑 Rôles & Permissions

| Rôle | Permissions |
|------|-------------|
| **SUPER_ADMIN** | Tout — configuration système, utilisateurs |
| **ADMIN** | Gestion complète sauf configuration système |
| **MEDECIN** | Patients, consultations, prescriptions, labo, imagerie |
| **INFIRMIER** | Patients, constantes, soins, hospitalisation |
| **PHARMACIEN** | Pharmacie, dispensing, stocks |
| **LABORANTIN** | Analyses, résultats |
| **RADIOLOGUE** | Imagerie, comptes-rendus |
| **ACCUEIL** | Rendez-vous, admissions, orientation |
| **COMPTABLE** | Facturation, rapports financiers |

---

## 📊 Modèle de Données (18 entités)

```
User ──┬── Staff ──┬── Appointment ─── Consultation ──┬── Prescription ── Medication
       │            │                                   ├── LabRequest ──── LabResult
       │            │                                   ├── ImagingRequest ─ ImagingResult
       │            │                                   └── Invoice ─────── InvoiceLine
       │            └── EmergencyVisit
       ├── Notification
       └── AuditLog

Patient ──┬── Appointment
           ├── Consultation
           ├── LabRequest
           ├── ImagingRequest
           ├── Hospitalization ─── Bed ─── Room ─── Ward
           ├── Invoice
           └── EmergencyVisit

PharmacyStock ── Medication
               └── Supplier (optionnel)
```

---

## 📝 Licence

Propriétaire — JIMPRO-HOPITAL. Tous droits réservés.
