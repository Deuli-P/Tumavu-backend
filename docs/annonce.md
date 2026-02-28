# Annonce

Base URL : `/api/annonce`

Toutes les routes requièrent un `Bearer token` valide.

---

## POST /annonce

Crée une nouvelle annonce de job. L'utilisateur connecté doit être le propriétaire de la company liée.

**Content-Type :** `application/json`

### Body

```json
{
  "title": "Convoyeur Paris-Lyon",
  "description": "Mission de convoyage urgente",
  "startDate": "2026-03-01T08:00:00.000Z",
  "endDate": "2026-03-01T18:00:00.000Z",
  "companyId": 1
}
```

| Champ         | Type   | Obligatoire | Description                     |
|---------------|--------|-------------|---------------------------------|
| `title`       | string | Oui         | Titre de l'annonce (min 1 car.) |
| `description` | string | Non         | Description détaillée           |
| `startDate`   | string | Non         | Date de début (ISO 8601)        |
| `endDate`     | string | Non         | Date de fin (ISO 8601)          |
| `companyId`   | number | Oui         | ID de la company associée       |

### Réponse `201`

```json
{
  "id": 1,
  "title": "Convoyeur Paris-Lyon",
  "description": "Mission de convoyage urgente",
  "startDate": "2026-03-01T08:00:00.000Z",
  "endDate": "2026-03-01T18:00:00.000Z",
  "createdAt": "2026-02-28T10:00:00.000Z",
  "createdBy": "uuid-du-user",
  "company": {
    "id": 1,
    "description": null,
    "phone": "+33612345678",
    "type": "TRANSPORT",
    "address": {
      "city": "Paris",
      "country": "France"
    }
  }
}
```

### Erreurs

| Code  | Message                                  |
|-------|------------------------------------------|
| `404` | Entreprise introuvable ou non autorisee |

---

## GET /annonce

Retourne la liste de toutes les annonces actives, triées par date de création décroissante.

### Query params

| Paramètre   | Type   | Obligatoire | Description                         |
|-------------|--------|-------------|-------------------------------------|
| `companyId` | number | Non         | Filtre par ID de company            |

### Réponse `200`

```json
[
  {
    "id": 1,
    "title": "Convoyeur Paris-Lyon",
    "description": "Mission de convoyage urgente",
    "startDate": "2026-03-01T08:00:00.000Z",
    "endDate": "2026-03-01T18:00:00.000Z",
    "createdAt": "2026-02-28T10:00:00.000Z",
    "createdBy": "uuid-du-user",
    "company": {
      "id": 1,
      "description": null,
      "phone": "+33612345678",
      "type": "TRANSPORT",
      "address": { "city": "Paris", "country": "France" }
    }
  }
]
```

---

## GET /annonce/:id

Retourne le détail d'une annonce.

### Réponse `200`

Même structure que `POST /annonce`.

---

## PUT /annonce/:id

Modifie une annonce existante. Réservé au créateur de l'annonce. Tous les champs sont optionnels.

**Content-Type :** `application/json`

### Body

```json
{
  "title": "Nouveau titre",
  "description": "Nouvelle description",
  "startDate": "2026-03-02T08:00:00.000Z",
  "endDate": "2026-03-02T18:00:00.000Z"
}
```

### Réponse `200`

Même structure que `POST /annonce`.

### Erreurs

| Code  | Message             |
|-------|---------------------|
| `403` | Non autorise        |
| `404` | Annonce introuvable |

---

## DELETE /annonce/:id

Supprime (soft delete) une annonce. Réservé au créateur.

### Réponse `200`

Aucun body retourné (`void`).

### Erreurs

| Code  | Message             |
|-------|---------------------|
| `403` | Non autorise        |
| `404` | Annonce introuvable |

---

## PUT /annonce/:id/assign

Attribue le job d'une annonce à un convoyeur. Réservé au créateur de l'annonce.

**Content-Type :** `application/json`

### Body

```json
{
  "userId": "uuid-du-convoyeur"
}
```

| Champ    | Type   | Obligatoire | Description              |
|----------|--------|-------------|--------------------------|
| `userId` | string | Oui         | UUID du convoyeur cible  |

### Réponse `200`

Aucun body retourné (`void`).

### Erreurs

| Code  | Message                                  |
|-------|------------------------------------------|
| `403` | Non autorise (pas le créateur)           |
| `404` | Annonce introuvable                      |
| `404` | Utilisateur introuvable                  |
| `409` | Ce job est deja attribue a un convoyeur  |
| `409` | Ce convoyeur a deja un job en cours      |
