# One2Choose

Boutique de chaussures construite avec Next.js pour un modele simple de vente en ligne et dropshipping:

- le client paie via Stripe Checkout
- vous recevez une notification marchand
- le fournisseur recoit automatiquement les details de livraison apres paiement confirme
- chaque client peut avoir son compte et son espace personnel via Supabase
- un administrateur peut gerer le catalogue et les prix depuis un back-office

## Stack

- Next.js App Router
- Supabase Auth + base Postgres + RLS
- Stripe Checkout + webhook Stripe
- Resend pour les e-mails transactionnels

## Demarrage

1. Installer les dependances:

```bash
npm install
```

2. Copier la configuration:

```bash
cp .env.example .env.local
```

3. Renseigner vos variables:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SECRET_KEY`
- `RESEND_API_KEY`
- `MERCHANT_NOTIFICATION_EMAIL`
- `SUPPLIER_NOTIFICATION_EMAIL`

4. Lancer le serveur:

```bash
npm run dev
```

## Supabase

Le projet contient un schema pret a executer dans [supabase/schema.sql](/Users/adambotbol/Documents/Dev/Codex/One2choose/supabase/schema.sql).

Ce schema cree:

- `profiles` pour l'interface client et les roles
- `products` pour le catalogue editable
- `orders` et `order_items` pour l'historique client
- les triggers de creation de profil
- les policies RLS pour clients et admins

Apres creation de votre projet Supabase:

1. ouvrez SQL Editor
2. executez `supabase/schema.sql`
3. ajoutez les variables d'environnement
4. changez le role d'un premier utilisateur en `admin` dans la table `profiles`

## Webhook Stripe

Pour tester localement:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Recuperez la valeur `whsec_...` retournee par Stripe CLI et placez-la dans `STRIPE_WEBHOOK_SECRET`.

## Ce que fait le projet

- Catalogue de chaussures
- Catalogue venant de Supabase avec repli local si besoin
- Redirection vers Stripe Checkout
- Collecte de l'adresse, du telephone et du paiement
- Envoi d'un e-mail commercant
- Envoi d'un e-mail fournisseur avec l'adresse du client
- Espace client `/account`
- Interface admin `/admin`

## Limites du MVP

- Pas de base de donnees
- Pas d'espace admin
- Pas de gestion de stock temps reel
- Le message commercant est un recapitulatif de commande; la facture legale client peut etre generee via Stripe Invoicing, votre ERP ou votre fournisseur
