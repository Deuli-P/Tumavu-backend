# Company

Base URL : `/api/company`

Toutes les routes requièrent un `Bearer token` valide.

---

## POST /company

Crée une nouvelle entreprise. L'utilisateur connecté devient automatiquement le propriétaire (`owner`).

**Content-Type :** `application/json`

### Body

```json
{
  "name": "Transport Dupont",
  "phone": "+33612345678",
  "type": "TRANSPORT",
  "address": {
    "street": "12 rue de la Paix",
    "city": "Paris",
    "zipCode": "75001",
    "country": "France"
  }
}
```

| Champ             | Type   | Obligatoire | Description          |
|-------------------|--------|-------------|----------------------|
| `name`            | string | Oui         | Nom de l'entreprise  |
| `phone`           | string | Non         | Téléphone            |
| `type`            | string | Non         | Type d'entreprise    |
| `address.street`  | string | Oui         | Rue                  |
| `address.city`    | string | Oui         | Ville                |
| `address.zipCode` | string | Oui         | Code postal          |
| `address.country` | string | Oui         | Pays                 |

### Réponse `201`

```json
{
  "id": 1,
  "name": "Transport Dupont",
  "phone": "+33612345678",
  "type": "TRANSPORT",
  "address": {
    "street": "12 rue de la Paix",
    "city": "Paris",
    "zipCode": "75001",
    "country": "France",
    "formattedAddress": "12 rue de la Paix, 75001 Paris, France"
  },
  "owner": {
    "id": "uuid-du-user"
  }
}
```

---

## PUT /company/:id/options

Crée ou met à jour les options par défaut de l'entreprise (upsert).

**Réservé au propriétaire de l'entreprise.**

### Body

```json
{
  "maxPassagesPerDay": 3
}
```

| Champ               | Type   | Obligatoire | Description                        |
|---------------------|--------|-------------|------------------------------------|
| `maxPassagesPerDay` | number | Oui         | Nombre max de passages par jour (min 1) |

### Réponse `200`

```json
{
  "id": 1,
  "companyId": 1,
  "maxPassagesPerDay": 3
}
```

### Erreurs

| Code | Message |
|------|---------|
| `403` | Non autorise |
| `404` | Entreprise introuvable |

---

## GET /company/:id/options

Retourne les options de l'entreprise.

### Réponse `200`

```json
{
  "id": 1,
  "companyId": 1,
  "maxPassagesPerDay": 3
}
```

Retourne `null` si aucune option n'a encore été configurée.

---

## POST /company/:id/benefit

Ajoute un avantage pour les utilisateurs qui se font scanner par le QR code de l'entreprise.

**Réservé au propriétaire de l'entreprise.**

### Body

```json
{
  "title": "Café offert",
  "description": "Un café offert à chaque passage",
  "minPassages": 1
}
```

| Champ         | Type   | Obligatoire | Description                                  |
|---------------|--------|-------------|----------------------------------------------|
| `title`       | string | Oui         | Titre de l'avantage                          |
| `description` | string | Non         | Description détaillée                        |
| `minPassages` | number | Oui         | Nombre minimum de passages pour en bénéficier |

### Réponse `201`

```json
{
  "id": 1,
  "companyId": 1,
  "title": "Café offert",
  "description": "Un café offert à chaque passage",
  "minPassages": 1
}
```

---

## GET /company/:id/benefit

Retourne la liste des avantages actifs de l'entreprise, triés par `minPassages` croissant.

### Réponse `200`

```json
[
  { "id": 1, "title": "Café offert", "description": "...", "minPassages": 1 },
  { "id": 2, "title": "Remise 10%", "description": "...", "minPassages": 5 }
]
```

---

## PUT /company/:id/benefit/:benefitId

Modifie un avantage existant. Tous les champs sont optionnels.

**Réservé au propriétaire de l'entreprise.**

### Body

```json
{
  "title": "Café offert",
  "description": "Mise à jour description",
  "minPassages": 2
}
```

### Réponse `200`

Même structure que `POST /company/:id/benefit`.

---

## DELETE /company/:id/benefit/:benefitId

Supprime (soft delete) un avantage.

**Réservé au propriétaire de l'entreprise.**

### Réponse `200`

Aucun body retourné (`void`).

### Erreurs (options & benefits)

| Code | Message |
|------|---------|
| `403` | Non autorise (pas le propriétaire) |
| `404` | Entreprise introuvable |
