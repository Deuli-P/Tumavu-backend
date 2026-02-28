# Document (CV)

Base URL : `/api/document`

Toutes les routes requièrent un `Bearer token` valide.

---

## POST /document

Upload un nouveau CV au format PDF.

**Content-Type :** `multipart/form-data`

### Body (form-data)

| Champ  | Type | Obligatoire | Description                     |
|--------|------|-------------|---------------------------------|
| `file` | File | Oui         | Fichier PDF (max 10 Mo)         |

### Réponse `201`

```json
{
  "id": 1,
  "slug": "uuid/cv/cv_1234567890.pdf",
  "status": "ACTIVE",
  "createdAt": "2026-02-28T10:00:00.000Z",
  "userId": "uuid-du-user"
}
```

### Erreurs

| Code  | Message                            |
|-------|------------------------------------|
| `400` | Fichier PDF requis                 |
| `400` | Le fichier doit etre un PDF        |
| `400` | Le fichier n'est pas un PDF valide |
| `413` | Fichier trop volumineux (> 10 Mo)  |

> Le backend vérifie à la fois le `Content-Type` (`application/pdf`) et les magic bytes du fichier (`%PDF-`) pour s'assurer que le contenu est bien un PDF.

---

## GET /document

Retourne tous les CV actifs du convoyeur connecté, triés par date de création décroissante.

### Réponse `200`

```json
[
  {
    "id": 1,
    "slug": "uuid/cv/cv_1234567890.pdf",
    "status": "ACTIVE",
    "createdAt": "2026-02-28T10:00:00.000Z",
    "userId": "uuid-du-user"
  }
]
```

---

## GET /document/:id

Retourne un document spécifique du convoyeur connecté.

### Réponse `200`

Même structure que `POST /document`.

### Erreurs

| Code  | Message                |
|-------|------------------------|
| `404` | Document introuvable   |

---

## PUT /document/:id

Remplace un CV existant par un nouveau fichier PDF. L'ancien document est archivé (soft delete + status `ARCHIVED`) et un nouveau document `ACTIVE` est créé. L'opération est atomique.

**Content-Type :** `multipart/form-data`

### Body (form-data)

| Champ  | Type | Obligatoire | Description             |
|--------|------|-------------|-------------------------|
| `file` | File | Oui         | Nouveau fichier PDF (max 10 Mo) |

### Réponse `200`

Même structure que `POST /document` (le nouveau document créé).

### Erreurs

| Code  | Message                            |
|-------|------------------------------------|
| `400` | Fichier PDF requis                 |
| `400` | Le fichier doit etre un PDF        |
| `400` | Le fichier n'est pas un PDF valide |
| `403` | Non autorise                       |
| `404` | Document introuvable               |
| `413` | Fichier trop volumineux (> 10 Mo)  |

---

## DELETE /document/:id

Supprime (soft delete) un document. Le document passe en status `ARCHIVED`.

### Réponse `200`

Aucun body retourné (`void`).

### Erreurs

| Code  | Message              |
|-------|----------------------|
| `403` | Non autorise         |
| `404` | Document introuvable |

---

## Statuts

| Valeur     | Description                          |
|------------|--------------------------------------|
| `ACTIVE`   | Document actif, visible du convoyeur |
| `ARCHIVED` | Document archivé (remplacé ou supprimé) |
