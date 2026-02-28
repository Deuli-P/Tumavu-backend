# Passage

Base URL : `/api/passage`

Toutes les routes requièrent un `Bearer token` valide.

---

## POST /passage

Enregistre le passage d'un convoyeur dans une entreprise (scan du QR code). Une seule ligne est créée par combinaison `userId + companyId + date`. Les passages suivants de la même journée incrémentent le compteur `count`.

**Content-Type :** `application/json`

### Body

```json
{
  "userId": "uuid-du-convoyeur",
  "companyId": 1,
  "jobId": 3
}
```

| Champ       | Type   | Obligatoire | Description                              |
|-------------|--------|-------------|------------------------------------------|
| `userId`    | string | Oui         | UUID du convoyeur scanné                 |
| `companyId` | number | Oui         | ID de la company qui scanne              |
| `jobId`     | number | Non         | ID du job en cours (si applicable)       |

### Réponse `200`

```json
{
  "id": 1,
  "date": "2026-02-28T00:00:00.000Z",
  "count": 1,
  "lastPassageAt": "2026-02-28T09:30:00.000Z",
  "userId": "uuid-du-convoyeur",
  "companyId": 1,
  "jobId": 3
}
```

### Erreurs

| Code  | Message                                                         |
|-------|-----------------------------------------------------------------|
| `404` | Entreprise introuvable                                          |
| `409` | Nombre maximum de passages atteint pour aujourd'hui (X/X)      |

> Le nombre maximum de passages par jour est défini dans `CompanyDefaultOptions.maxPassagesPerDay`. Par défaut : `1`.

---

## GET /passage

Retourne la liste des passages, triés par `lastPassageAt` décroissant. Filtrable via query params.

### Query params

| Paramètre   | Type   | Obligatoire | Description                       |
|-------------|--------|-------------|-----------------------------------|
| `companyId` | number | Non         | Filtre par ID de company          |
| `userId`    | string | Non         | Filtre par UUID de convoyeur      |
| `date`      | string | Non         | Filtre par date (ISO 8601)        |

### Réponse `200`

```json
[
  {
    "id": 1,
    "date": "2026-02-28T00:00:00.000Z",
    "count": 2,
    "lastPassageAt": "2026-02-28T14:00:00.000Z",
    "userId": "uuid-du-convoyeur",
    "companyId": 1,
    "jobId": 3
  }
]
```

---

## Logique métier

- Un seul enregistrement par `(userId, companyId, date)` grâce à la contrainte `@@unique`.
- Chaque scan de la journée incrémente `count` et met à jour `lastPassageAt`.
- Si `count >= maxPassagesPerDay`, une erreur `409` est retournée.
- `maxPassagesPerDay` est lu depuis `CompanyDefaultOptions`. Si non configuré, la valeur par défaut est `1`.
