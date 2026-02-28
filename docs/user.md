# User

Base URL : `/api/user`

Toutes les routes requièrent un `Bearer token` valide.

---

## PUT /user/photo

Met à jour la photo de profil du convoyeur connecté. Upload direct du fichier vers Supabase Storage.

**Content-Type :** `multipart/form-data`

### Body (form-data)

| Champ  | Type  | Obligatoire | Description                        |
|--------|-------|-------------|------------------------------------|
| `file` | File  | Oui         | Image de profil (image/*, max 5 Mo) |

### Réponse `200`

```json
{
  "slug": "uuid/photo/photo_1234567890.jpg",
  "publicUrl": "https://xxx.supabase.co/storage/v1/object/public/..."
}
```

### Erreurs

| Code | Message |
|------|---------|
| `400` | Fichier image requis |
| `400` | Le fichier doit etre une image |
| `413` | Fichier trop volumineux (> 5 Mo) |

---

## PUT /user/contact

Met à jour les informations de contact du convoyeur connecté. Tous les champs sont optionnels.

**Content-Type :** `application/json`

### Body

```json
{
  "phone": "+33612345678",
  "city": "Paris",
  "postalCode": "75001",
  "country": "France"
}
```

| Champ        | Type   | Obligatoire | Description      |
|--------------|--------|-------------|------------------|
| `phone`      | string | Non         | Numéro de téléphone |
| `city`       | string | Non         | Ville            |
| `postalCode` | string | Non         | Code postal      |
| `country`    | string | Non         | Pays             |

### Réponse `200`

Aucun body retourné (`void`).

---

## PUT /user/setup/language

Met à jour la langue préférée du convoyeur connecté.

**Content-Type :** `application/json`

### Body

```json
{
  "language": 1
}
```

| Champ      | Type   | Obligatoire | Description                   |
|------------|--------|-------------|-------------------------------|
| `language` | number | Oui         | ID de la langue (table `languages`) |

### Réponse `200`

Aucun body retourné (`void`).

### Erreurs

| Code | Message |
|------|---------|
| `400` | PUT_LANGUAGE_ERROR (ID langue introuvable) |

---

## Modèle Language (référence)

Les langues disponibles sont dans la table `languages`.

| id | name        | code |
|----|-------------|------|
| 1  | Français    | fr   |
| 2  | Anglais     | en   |
| 3  | Espagnol    | es   |
| …  | …           | …    |

Récupérable via `setup.language` dans la réponse de `/auth/me`.
