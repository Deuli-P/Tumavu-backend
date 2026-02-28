# Auth

Base URL : `/api/auth`

---

## POST /auth/register

Inscription d'un nouvel utilisateur. Accessible uniquement aux non-connectés.

**Auth requise :** Non (`GuestOnlyGuard`)
**Content-Type :** `multipart/form-data`

### Body (form-data)

| Champ             | Type      | Obligatoire | Description                          |
|-------------------|-----------|-------------|--------------------------------------|
| `firstName`       | string    | Oui         | Prénom                               |
| `lastName`        | string    | Oui         | Nom                                  |
| `email`           | string    | Oui         | Adresse email (unique)               |
| `password`        | string    | Oui         | Mot de passe (min 8 caractères)      |
| `confirmedPassword` | string  | Oui         | Confirmation (doit correspondre)     |
| `gender`          | string    | Oui         | Genre                                |
| `birthdate`       | string    | Oui         | Date de naissance (ISO 8601)         |
| `phone`           | string    | Oui         | Numéro de téléphone                  |
| `address.postal_code` | string | Oui        | Code postal                          |
| `address.city`    | string    | Oui         | Ville                                |
| `address.country` | string    | Non         | Pays                                 |
| `cgv`             | boolean   | Oui         | Acceptation CGV (doit être `true`)   |
| `newsletter`      | boolean   | Non         | Inscription newsletter               |
| `photo`           | file      | Non         | Photo de profil (image, max 5 Mo)    |

### Réponse `201`

```json
{
  "token": "header.payload.signature",
  "userLogged": {
    "id": "uuid",
    "info": {
      "firstName": "Jean",
      "lastName": "Dupont",
      "city": "Paris",
      "photoUrl": "uuid/photo/photo_1234567890.jpg",
      "email": "jean@example.com",
      "created_at": "2026-01-01T00:00:00.000Z",
      "phone": "+33612345678"
    },
    "company": null,
    "setup": {
      "language": { "id": 1, "code": "fr" },
      "notifications": true
    }
  }
}
```

### Erreurs

| Code | Message |
|------|---------|
| `400` | Les mots de passe ne correspondent pas |
| `400` | Vous devez accepter les conditions generales (cgv) |
| `400` | Le fichier doit etre une image |
| `409` | Email deja utilise |

---

## POST /auth/login

Connexion d'un utilisateur existant. Accessible uniquement aux non-connectés.

**Auth requise :** Non (`GuestOnlyGuard`)
**Content-Type :** `application/json`

### Body

```json
{
  "email": "jean@example.com",
  "password": "motdepasse123"
}
```

### Réponse `200`

Même structure que `/auth/register`.

### Erreurs

| Code | Message |
|------|---------|
| `401` | Email ou mot de passe invalide |

---

## GET /auth/me

Retourne les informations complètes du convoyeur connecté.

**Auth requise :** Oui (`Bearer token`)

### Réponse `200`

Même structure que `/auth/register`.

### Erreurs

| Code | Message |
|------|---------|
| `401` | Token manquant |
| `401` | Token invalide / expiré |
| `401` | Utilisateur introuvable |

---

## Token

Le token est un HMAC-SHA256 (format JWT-like : `header.payload.signature`).
Durée de validité : **24 heures**.
À envoyer dans le header `Authorization` :

```
Authorization: Bearer <token>
```
