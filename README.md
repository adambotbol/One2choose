# One2Choose

Boutique de chaussures construite avec Next.js pour un modele simple de vente en ligne et dropshipping:

- le client paie via Stripe Checkout
- vous recevez une notification marchand
- le fournisseur recoit automatiquement les details de livraison apres paiement confirme

## Stack

- Next.js App Router
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
- `RESEND_API_KEY`
- `MERCHANT_NOTIFICATION_EMAIL`
- `SUPPLIER_NOTIFICATION_EMAIL`

4. Lancer le serveur:

```bash
npm run dev
```

## Webhook Stripe

Pour tester localement:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Recuperez la valeur `whsec_...` retournee par Stripe CLI et placez-la dans `STRIPE_WEBHOOK_SECRET`.

## Ce que fait le projet

- Catalogue de chaussures
- Panier local simple
- Redirection vers Stripe Checkout
- Collecte de l'adresse, du telephone et du paiement
- Envoi d'un e-mail commercant
- Envoi d'un e-mail fournisseur avec l'adresse du client

## Limites du MVP

- Pas de base de donnees
- Pas d'espace admin
- Pas de gestion de stock temps reel
- Le message commercant est un recapitulatif de commande; la facture legale client peut etre generee via Stripe Invoicing, votre ERP ou votre fournisseur
