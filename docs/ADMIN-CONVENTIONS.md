# Aperture — Admin Conventions

> **Lis-moi avant d'écrire la moindre ligne.** Source de vérité pour les
> agents qui construisent le back-office. Si un écran viole une règle ici,
> l'orchestrateur le renvoie.
>
> Tout le contenu visible utilisateur est **en français**. Aucun mot anglais
> dans l'UI. Les commentaires et noms de variables peuvent rester en anglais
> côté code, mais les libellés, messages, boutons, en-têtes : **français
> uniquement**.

---

## 0. Contraintes dures (non négociables)

1. **Next.js 16.** `params` et `searchParams` sont des `Promise` — toujours
   `await` en Server Components. Utilise les helpers globaux
   `PageProps<'/admin/.../[id]'>` et `LayoutProps<'/admin/...'>`. Middleware
   s'appelle désormais `proxy` (`proxy.ts` à la racine).
2. **Server Components par défaut.** `"use client"` uniquement si
   `useState`, `useEffect`, gestionnaires d'événements, ou APIs navigateur.
3. **Ne casse jamais le site invité.** Interdit de modifier `app/(site)/*`,
   `app/(booking)/*`, `components/site/*`, `components/booking/*`,
   `components/Footer.tsx`, `components/NavbarCentered.tsx`, `components/Hero.tsx`,
   tout `lib/booking/*` ou `lib/data/*` (sauf ajout de nouveaux fichiers).
4. **Aucune nouvelle dépendance** sans validation orchestrateur. Tout ce
   qu'il te faut est déjà dans `package.json` : `lucide-react`,
   `framer-motion`, `gsap`, `date-fns`, `react-day-picker`, `@base-ui/react`,
   `class-variance-authority`, `clsx`, `tailwind-merge`.
5. **Réutilise avant d'inventer.** Si une primitive admin existe dans
   `components/admin/*`, utilise-la — ne forke pas, n'invente pas une
   variante locale. Si elle manque ou doit évoluer, propose le changement
   à l'orchestrateur dans ton rapport plutôt que de dupliquer.
6. **Mobile : utilisable au moins en tablette.** Desktop est la cible
   principale (l'admin se manipule sur un poste de réception). Tablette
   ≥ 768 px doit rester fonctionnelle. Mobile ≥ 360 px doit au minimum
   permettre une lecture des dashboards et statuts.
7. **Tout en français.** Libellés, messages d'erreur, vides, en-têtes de
   colonnes, boutons, infobulles : 100 % français. Aucun « OK »,
   « Cancel », « Save », « Loading… » qui traîne.

---

## 1. Routage & arborescence

```
app/
  (admin)/
    layout.tsx                     ← garde d'auth + AdminShell (sidebar + topbar)
    admin/
      page.tsx                     ← tableau de bord (dashboard d'accueil)
      login/
        page.tsx                   ← page de connexion (hors AdminShell)
        LoginForm.tsx              ← client component
      reservations/                ← Agent A
        page.tsx                   ← liste + filtres
        nouvelle/page.tsx          ← création walk-in
        calendrier/page.tsx        ← grille de disponibilité drag-drop
        arrivees/page.tsx          ← check-in du jour
        departs/page.tsx           ← check-out du jour
        liste-attente/page.tsx
        [id]/page.tsx              ← détail réservation
      chambres/                    ← Agent B
        page.tsx                   ← tableau d'état temps réel
        gouvernante/page.tsx       ← affectation des tâches ménage
        maintenance/page.tsx       ← incidents & résolution
      clients/                     ← Agent C
        page.tsx                   ← CRM listing
        [id]/page.tsx              ← profil + historique + préférences + notes
        messages/page.tsx          ← messagerie (email/SMS/in-app)
      tarifs/                      ← Agent D
        page.tsx                   ← grille tarifaire saisonnière
        promotions/page.tsx        ← codes promo
        canaux/page.tsx            ← channel manager (OTA)
      facturation/                 ← Agent E
        page.tsx                   ← liste folios/factures
        [id]/page.tsx              ← folio détaillé
        paiements/page.tsx
        pos/page.tsx               ← intégrations POS (restaurant, spa, extras)
      exploitation/                ← Agent F
        page.tsx                   ← rapports & analytics (occupation, ADR, RevPAR)
        audit-de-nuit/page.tsx
        equipe/page.tsx            ← staff & shifts
        roles/page.tsx             ← RBAC
        notifications/page.tsx
```

Le groupe `(admin)` n'apparaît pas dans l'URL. Les URLs publiques commencent
toutes par `/admin/...`. La page de connexion vit à `/admin/login` et utilise
le même groupe `(admin)` mais **doit court-circuiter `AdminShell`** (voir §4).

---

## 2. Design system Aperture — tokens et primitives

### 2.1 Couleurs (toutes en variables CSS, déjà ajoutées à `globals.css`)

| Token CSS | Hex | Usage |
| --- | --- | --- |
| `--color-admin-bg` | `#f7f7f8` | Fond global derrière les panneaux |
| `--color-admin-panel` | `#ffffff` | Surface des cartes, tableaux, formulaires |
| `--color-admin-sunken` | `#f1f1f3` | En-têtes de tableau, zones secondaires |
| `--color-admin-border` | `#e6e6e9` | Bordures fines, séparateurs |
| `--color-admin-border-strong` | `#d3d3d7` | Bordures actives / focus passif |
| `--color-admin-divider` | `#ececef` | Filets horizontaux internes |
| `--color-admin-text` | `#151316` | Texte principal (= `--color-ink`) |
| `--color-admin-muted` | `#6b6b70` | Texte secondaire |
| `--color-admin-faint` | `#9a9aa0` | Texte tertiaire, placeholders |
| `--color-marine` | `#1f4a37` | Accent de marque (CTA, liens, états actifs) |

**Statuts** — paires `bg`/`fg` toujours utilisées ensemble :

| Token | Usage |
| --- | --- |
| `--color-admin-ok-{bg,fg}` | Succès, propre, payé, terminé, vert vif |
| `--color-admin-warn-{bg,fg}` | Attention, en attente, à faire bientôt |
| `--color-admin-danger-{bg,fg}` | Erreur, hors service, en retard, annulé |
| `--color-admin-info-{bg,fg}` | Information, en cours, neutre positif |
| `--color-admin-muted-{bg,fg}` | Désactivé, archivé, brouillon |
| `--color-admin-violet-{bg,fg}` | Maintenance en cours, en intervention |
| `--color-admin-amber-{bg,fg}` | À nettoyer, recouché, urgence faible |
| `--color-admin-solid-{bg,fg}` | Marine plein (occupé / actif fort) |

**Règle d'or :** ne signale **jamais** un statut par la couleur seule.
Couleur + icône Lucide + libellé. Toujours les trois.

### 2.2 Mapping statut → token

#### Chambres (Agent B)
| Statut français (libellé UI) | Token | Icône Lucide |
| --- | --- | --- |
| « Libre & propre » | `ok` | `Check` |
| « Occupée » | `solid` | `BedDouble` |
| « Libre à nettoyer » | `amber` | `Sparkles` |
| « Inspection requise » | `info` | `Eye` |
| « Hors service » | `danger` | `Ban` |
| « En maintenance » | `violet` | `Wrench` |

#### Réservations (Agent A)
| Statut | Token | Icône |
| --- | --- | --- |
| « Confirmée » | `ok` | `BadgeCheck` |
| « Option » | `warn` | `Clock` |
| « Arrivée prévue » | `info` | `LogIn` |
| « Arrivée » (checked-in) | `solid` | `KeyRound` |
| « Départ prévu » | `info` | `LogOut` |
| « Partie » (checked-out) | `muted` | `CheckCircle2` |
| « Annulée » | `danger` | `XCircle` |
| « No-show » | `danger` | `AlertOctagon` |

#### Paiements (Agent E)
| Statut | Token |
| --- | --- |
| « Payé » | `ok` |
| « Acompte versé » | `info` |
| « En attente » | `warn` |
| « En retard » | `danger` |
| « Remboursé » | `muted` |

### 2.3 Typographie

| Rôle | Classe | Famille |
| --- | --- | --- |
| Numéraux KPI (valeur principale) | `text-[32px] leading-9 font-display tnum` | Erode |
| H1 page admin | `text-[22px] leading-7 font-display tracking-tight` | Erode |
| H2 section | `text-[16px] leading-6 font-medium` | Switzer |
| Libellé KPI | `text-[11px] uppercase tracking-[0.08em] text-admin-muted` | Switzer |
| Corps standard | `text-[14px] leading-5` | Switzer |
| Table dense | `text-[13px] leading-[18px]` | Switzer |
| Table confort | `text-[14px] leading-5` | Switzer |
| Méta / horodatage | `text-[12px] text-admin-muted tnum` | Switzer |
| Input (taille minimum) | `text-[14px]` desktop, `text-[16px]` mobile pour éviter zoom iOS | Switzer |

Toujours `tnum` (utilitaire défini dans `globals.css`) pour : prix,
quantités, dates, durées, pourcentages, numéros de chambre/réservation.

### 2.4 Espacement & rayons

- Espacement base : 4 / 8 / 12 / 16 / 20 / 24 / 32 / 48
- Padding panneau standard : `p-5` (20px) sur desktop, `p-4` (16px) sur mobile
- Gap entre cartes : `gap-4` (16px) standard, `gap-6` (24px) sur dashboards
- Rayons : boutons `rounded-md` (6px), cartes `rounded-xl` (12px),
  pastilles `rounded-full`, inputs `rounded-md` (6px)
- Ombres : `shadow-sm` pour les cartes, rien pour les tableaux
  (compter sur `hairline`/bordure), `shadow-lg` pour les overlays (dialog/sheet)

### 2.5 Animation

- Micro-interactions : 150–220 ms, `ease-out`
- Ouverture sheet/drawer : 220 ms, `cubic-bezier(0.22, 1, 0.36, 1)`
- Pas de stagger gratuit. Pas de parallax. Pas de marquee.
- Toujours respecter `prefers-reduced-motion` (déjà global dans `globals.css`).

---

## 3. Primitives admin — utilise-les, n'en crée pas

Tout est dans `components/admin/`. Importe par nommage :

```ts
import { Button } from "@/components/admin/Button";
import { Input, Label, Textarea, Select, Checkbox, Switch } from "@/components/admin/form";
import { Card, CardHeader, CardBody, CardFooter } from "@/components/admin/Card";
import { Badge, StatusPill } from "@/components/admin/Badge";
import { DataTable } from "@/components/admin/DataTable";
import { Dialog } from "@/components/admin/Dialog";
import { Sheet } from "@/components/admin/Sheet";
import { Toast, useToast } from "@/components/admin/Toast";
import { Tabs } from "@/components/admin/Tabs";
import { EmptyState } from "@/components/admin/EmptyState";
import { LoadingState } from "@/components/admin/LoadingState";
import { ErrorState } from "@/components/admin/ErrorState";
import { StatTile } from "@/components/admin/StatTile";
import { Toolbar } from "@/components/admin/Toolbar";
import { PageHeader } from "@/components/admin/PageHeader";
import { AvatarChip } from "@/components/admin/AvatarChip";
import { Kbd } from "@/components/admin/Kbd";
```

### 3.1 Règles d'usage

- **`PageHeader`** est obligatoire en tête de chaque page admin. Fournit le
  fil d'ariane, le titre, le sous-titre optionnel, et les actions à droite.
- **`Toolbar`** vient juste après `PageHeader` sur les pages de liste :
  recherche, filtres, bascule densité (Comfortable / Compact), CTA primaire à droite.
- **`DataTable`** pour toute liste tabulaire. Supporte tri, en-tête collant,
  sélection multiple, action de ligne, mode compact/confort, état vide.
- **`StatusPill`** pour tout statut chambre/réservation/paiement — utilise
  les `tone` du §2.2, jamais des couleurs ad hoc.
- **`Dialog`** pour confirmations destructives ou formulaires courts.
  **`Sheet`** (drawer droit 480 px) pour édition profonde / détail latéral.
- **`EmptyState` / `LoadingState` / `ErrorState`** : chaque écran qui charge
  ou liste a les trois. Pas d'écran blanc en chargement.

### 3.2 Iconographie

- **Lucide React uniquement.** Stroke 1.75. Taille standard 16 ou 18 px
  dans l'UI dense, 20 px dans la sidebar. Pas d'emoji jamais.
- Pour une icône d'action seule, prévoir un `aria-label` français.

---

## 4. Auth, RBAC et garde de route

### 4.1 Helpers

```ts
import {
  currentSession,        // SSR + client : lit la session admin (localStorage)
  signIn,                // (email, password) → mock auth → set session
  signOut,               // efface la session, redirige vers /admin/login
  requireRole,           // throw si role manquant → redirige
  hasPermission,         // (perm) → boolean
} from "@/lib/admin/auth";

import type { StaffRole, Permission } from "@/lib/admin/types";
```

### 4.2 Rôles (énum)

| `StaffRole` | Libellé UI | Permissions clés |
| --- | --- | --- |
| `direction` | Direction | Tout, y compris audit, paramètres, RBAC |
| `manager` | Manager | Tarifs, rapports, équipe, vues consolidées |
| `reception` | Réception | Réservations, arrivées/départs, clients, facturation |
| `gouvernante` | Gouvernante | Chambres, ménage, maintenance |
| `comptabilite` | Comptabilité | Facturation, paiements, exports |

### 4.3 Garde de route (déjà câblée dans `app/(admin)/layout.tsx`)

Toute page sous `app/(admin)/admin/*` est protégée : si pas de session, on
redirige côté client vers `/admin/login?next=<chemin>`. Sur `/admin/login`,
on ne rend **pas** `AdminShell`.

### 4.4 Vérifier une permission dans une page

```tsx
"use client";
import { hasPermission } from "@/lib/admin/auth";
import { EmptyState } from "@/components/admin/EmptyState";

if (!hasPermission("manage-rates")) {
  return <EmptyState tone="warn" title="Accès restreint" body="…" />;
}
```

---

## 5. Couche de données — `lib/admin/*`

Tout l'admin lit/écrit via le **repository**, jamais directement contre
le store. Cela permet de remplacer le mock par un vrai backend plus tard
sans toucher les composants.

```ts
import { repo } from "@/lib/admin/repo";

// Lecture (synchrones — c'est un mock en mémoire) :
const reservations = repo.reservations.list({ status: "arrival-today" });
const room = repo.rooms.byNumber("204");
const guest = repo.guests.byId("g_4f3");

// Mutation (toujours async — signature future-proof pour vrai backend) :
await repo.reservations.create({ ... });
await repo.rooms.setStatus("204", "vacant-clean");
await repo.tasks.assign("t_99", "user_marie");
```

### 5.1 Domaines disponibles

| Domaine | Fichier | Lecture | Écriture |
| --- | --- | --- | --- |
| `staff` | `lib/admin/data/staff.ts` | `list`, `byId`, `byEmail` | `create`, `update` |
| `rooms` | `lib/admin/data/rooms.ts` | `list`, `byNumber`, `byStatus` | `setStatus`, `setNote` |
| `reservations` | `lib/admin/data/reservations.ts` | `list`, `byId`, `forDate` | `create`, `update`, `cancel`, `checkIn`, `checkOut` |
| `guests` | `lib/admin/data/guests.ts` | `list`, `byId`, `search` | `create`, `update`, `addNote` |
| `tasks` | `lib/admin/data/tasks.ts` | `list`, `forUser` | `create`, `assign`, `complete` |
| `invoices` | `lib/admin/data/invoices.ts` | `list`, `byId`, `forReservation` | `create`, `addItem`, `addPayment`, `void` |
| `rates` | `lib/admin/data/rates.ts` | `list`, `forSeason` | `create`, `update` |
| `promos` | `lib/admin/data/promos.ts` | `list`, `byCode` | `create`, `update`, `archive` |
| `channels` | `lib/admin/data/channels.ts` | `list`, `byId` | `setEnabled`, `sync` |
| `messages` | `lib/admin/data/messages.ts` | `list`, `threadFor` | `send`, `markRead` |
| `notifications` | `lib/admin/data/notifications.ts` | `list`, `unread` | `markRead`, `markAllRead` |

### 5.2 Persistance

- Le store est **en mémoire**, hydraté depuis `localStorage` au premier
  appel client (`admin:db:v1`).
- Les mutations sérialisent automatiquement le store dans `localStorage`.
- En SSR (pages serveur), le store retourne ses valeurs initiales depuis
  les seeds — jamais d'erreur d'hydratation parce que le store côté client
  re-synchronise au mount.

### 5.3 Création d'IDs

```ts
import { newId } from "@/lib/admin/id";
newId("res");  // → "res_a1b2c3"
```

Préfixes attendus : `res` réservation, `room` chambre (le code = numéro),
`g` client, `t` tâche, `inv` facture, `pay` paiement, `pr` promo,
`ch` canal, `msg` message, `not` notification, `user` staff.

---

## 6. La boucle (à exécuter par feature)

1. **Construire** la fonctionnalité avec les primitives partagées + tokens Aperture.
2. **Auto-review** sur trois axes :
   - critères d'acceptation §7
   - adhérence Aperture (couleurs, types, espacements)
   - conventions §1–§5 (routage, primitives, repo, auth)
3. **Affiner** jusqu'à ce que les trois passent.
4. **Vérif intégration** : tous les liens marchent, pas de collision de
   route/style, le site invité tourne toujours (`npm run build`).
5. **Rapport** : ce qui est livré, ce qui est mocké, questions ouvertes.

---

## 7. Critères d'acceptation (par feature)

- Rendu sans erreur ; responsive (desktop primaire, tablette utilisable).
- États **chargement** + **vide** + **erreur** présents systématiquement.
- Utilise **seulement** les tokens & primitives partagés (zéro style local
  qui invente une couleur ou un radius).
- Cohérent visuellement avec les autres domaines (test : ouvre deux pages
  d'agents différents côte à côte, ça doit se ressembler).
- Données mockées réalistes ; passage par `lib/admin/repo` exclusivement.
- Textes en **français** uniquement, ton calme et précis (cf. site invité).
  Pas d'exclamations, pas de majuscules criées sauf dans les pastilles.

---

## 8. Rapport de fin

Quand tu termines ton lot, le message final doit contenir :

1. **Fichiers créés/édités** (chemins seulement).
2. **Liens vers où** — chaque `Link`/`href` créé, pour vérification du graphe.
3. **Breakpoints testés** — confirmer 768 / 1024 / 1280 / 1440 sur les écrans clés.
4. **Modifications de fichiers partagés** (data, primitives, layouts) — si tu en as fait.
5. **Questions ouvertes** — toute ambiguïté que tu as tranchée seul.
