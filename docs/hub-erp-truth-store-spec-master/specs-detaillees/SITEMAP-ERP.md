# Sitemap ERP

Ce document propose le sitemap complet de l'ERP à partir de toute la base `spec-truth`, et en particulier :

- [CATALOGUE-ECRANS.md](./CATALOGUE-ECRANS.md)
- [user-flows.md](../user-flows.md)
- les fiches détaillées de chaque module
- les liens inter-modules et la vue transverse projet

Ce sitemap n'est pas une simple reprise des modules.
Il regroupe les écrans dans une navigation ERP cohérente pour l'utilisateur final, en respectant les grands parcours métier de bout en bout.

## 1. Principes de navigation retenus

- Les 18 modules sont regroupés en 10 espaces métier, complétés par un `Accueil ERP` de niveau 1.
- Les écrans liste, fiche, dashboard, planning, file de validation et cockpit sont distingués.
- Les écrans partagés ou contextuels ne sont pas dupliqués dans tous les menus.
- La `Vue 360 affaire / projet` sert de hub transverse entre commerce, opérations, finance et maintenance.
- Les user flows de bout en bout priment sur la simple séparation modulaire.

## 2. Structure globale retenue

### 2.1 Niveau 1

1. Accueil ERP
2. Référentiel
3. Commerce
4. Projets & affaires
5. Budget & performance
6. Approvisionnement & stock
7. Planification & opérations
8. SAV & maintenance
9. Finance client
10. Gouvernance & contrôle
11. Reporting & direction

### 2.2 Écrans structurels déduits

Les écrans suivants sont déduits de la logique globale ERP et des user flows, même s'ils ne sont pas toujours décrits comme fiches autonomes :

- `Accueil ERP / Cockpit utilisateur`
- `Accès rapide à la Vue 360 projet`
- `Accès rapide à la Boîte de validation`

Ils sont nécessaires pour rendre les parcours réellement opérables dans une navigation unifiée.

## 3. Sitemap détaillé

```text
ERP
├── 1. Accueil ERP
│   ├── 1.1 Cockpit ERP / Accueil utilisateur
│   ├── 1.2 Mes validations (raccourci vers Boîte de validation)
│   ├── 1.3 Mes projets / affaires récents
│   └── 1.4 Accès rapide à la Vue 360 projet
│
├── 2. Référentiel
│   ├── 2.1 Tiers
│   │   ├── 2.1.1 Catalogue des tiers
│   │   └── 2.1.2 Fiche tiers
│   ├── 2.2 Articles & prestations
│   │   ├── 2.2.1 Catalogue articles et prestations
│   │   └── 2.2.2 Fiche article ou prestation
│   └── 2.3 Sites, dépôts & ressources
│       ├── 2.3.1 Référentiel sites et dépôts
│       └── 2.3.2 Référentiel ressources opérationnelles
│
├── 3. Commerce
│   ├── 3.1 Avant-vente
│   │   ├── 3.1.1 Pipeline avant-vente
│   │   ├── 3.1.2 Fiche demande de cotation
│   │   ├── 3.1.3 Atelier d'étude et de chiffrage
│   │   └── 3.1.4 Fiche offre
│   └── 3.2 Contrats
│       ├── 3.2.1 Registre des contrats
│       └── 3.2.2 Fiche contrat
│
├── 4. Projets & affaires
│   ├── 4.1 Portefeuille projets
│   │   ├── 4.1.1 Registre des affaires et projets
│   │   ├── 4.1.2 Fiche affaire / projet
│   │   └── 4.1.3 Structure projet
│   └── 4.2 Pilotage transverse projet
│       ├── 4.2.1 Vue 360 affaire / projet
│       └── 4.2.2 Cockpit risques et arbitrages projet
│
├── 5. Budget & performance
│   ├── 5.1 Budgets
│   │   ├── 5.1.1 Fiche budget projet / affaire
│   │   ├── 5.1.2 Détail budget et postes de coût
│   │   ├── 5.1.3 File de validation et révision budget
│   │   └── 5.1.4 Tableau de bord budget et écarts
│   └── 5.2 Performance économique
│       ├── 5.2.1 Fiche coût analytique d'intervention
│       ├── 5.2.2 Tableau de bord analytique consolidé
│       └── 5.2.3 Tableau de bord rentabilité et marge
│
├── 6. Approvisionnement & stock
│   ├── 6.1 Besoins & achats
│   │   ├── 6.1.1 Registre des expressions de besoin
│   │   ├── 6.1.2 Fiche expression de besoin
│   │   ├── 6.1.3 Registre des demandes d'achat
│   │   ├── 6.1.4 Fiche demande d'achat
│   │   ├── 6.1.5 Comparatif fournisseurs
│   │   └── 6.1.6 Commande fournisseur
│   └── 6.2 Stock & logistique
│       ├── 6.2.1 Centre de réception fournisseur
│       ├── 6.2.2 Fiche réception
│       ├── 6.2.3 Réservation et sortie de stock
│       ├── 6.2.4 Transfert et retour de stock
│       ├── 6.2.5 Vue stock par emplacement
│       └── 6.2.6 Inventaire de stock
│
├── 7. Planification & opérations
│   ├── 7.1 Planification
│   │   ├── 7.1.1 Planning projet
│   │   ├── 7.1.2 Fiche activité planifiée
│   │   └── 7.1.3 Planning consolidé
│   ├── 7.2 Ordres de travail
│   │   ├── 7.2.1 Liste / planning des ordres de travail
│   │   ├── 7.2.2 Formulaire création OT
│   │   ├── 7.2.3 Fiche OT back-office
│   │   └── 7.2.4 Fiche OT mobile terrain
│   ├── 7.3 PV & preuves de réalisation
│   │   ├── 7.3.1 Registre des PV
│   │   └── 7.3.2 Fiche PV
│   ├── 7.4 Temps & ressources
│   │   ├── 7.4.1 Pointage quotidien équipe
│   │   ├── 7.4.2 Imputation et ressources pointées
│   │   └── 7.4.3 Validation et consultation des pointages
│   └── 7.5 Chantier / BTP
│       ├── 7.5.1 Saisie d'avancement chantier
│       ├── 7.5.2 Gestion des attachements
│       ├── 7.5.3 Registre des situations de travaux
│       └── 7.5.4 Historique chantier et corrections
│
├── 8. SAV & maintenance
│   ├── 8.1 Tickets
│   │   ├── 8.1.1 Registre des tickets SAV
│   │   ├── 8.1.2 Formulaire de ticket SAV
│   │   └── 8.1.3 Fiche ticket SAV
│   └── 8.2 Intervention SAV
│       └── 8.2.1 Suivi d'intervention SAV sur OT
│
├── 9. Finance client
│   ├── 9.1 Facturation
│   │   ├── 9.1.1 Registre des factures
│   │   ├── 9.1.2 Assistant nouvelle facture
│   │   └── 9.1.3 Fiche facture
│   └── 9.2 Encaissement & recouvrement
│       ├── 9.2.1 Formulaire d'encaissement client
│       ├── 9.2.2 Fiche encaissement
│       ├── 9.2.3 Tableau de bord recouvrement
│       ├── 9.2.4 Dossier relance client
│       ├── 9.2.5 Écran de rapprochement paiements / factures
│       └── 9.2.6 File des paiements non rapprochés
│
├── 10. Gouvernance & contrôle
│   ├── 10.1 Paramétrage des validations
│   ├── 10.2 Boîte de validation
│   ├── 10.3 Historique des validations
│   └── 10.4 Contrôle de blocage sur fiche objet
│
└── 11. Reporting & direction
    ├── 11.1 Dashboard KPI commerciaux
    ├── 11.2 Dashboard KPI projet / finance
    └── 11.3 Dashboard KPI maintenance
```

## 4. Navigation transverse obligatoire

Le sitemap ERP ne peut pas reposer uniquement sur des menus.
Les user flows imposent aussi des liaisons contextuelles entre écrans.

### 4.1 Chaîne commerce vers projet

- `Pipeline avant-vente` -> `Fiche demande de cotation`
- `Fiche demande de cotation` -> `Atelier d'étude et de chiffrage`
- `Atelier d'étude et de chiffrage` -> `Fiche offre`
- `Fiche offre` -> `Fiche contrat`
- `Fiche contrat` -> `Fiche affaire / projet`
- `Fiche affaire / projet` -> `Vue 360 affaire / projet`

### 4.2 Chaîne besoin vers approvisionnement

- `Fiche affaire / projet` -> `Registre des expressions de besoin`
- `Fiche expression de besoin` -> `Fiche demande d'achat`
- `Fiche demande d'achat` -> `Comparatif fournisseurs`
- `Comparatif fournisseurs` -> `Commande fournisseur`
- `Commande fournisseur` -> `Centre de réception fournisseur`
- `Fiche réception` -> `Vue stock par emplacement`

### 4.3 Chaîne stock vers terrain

- `Vue stock par emplacement` -> `Réservation et sortie de stock`
- `Réservation et sortie de stock` -> `Fiche OT back-office`
- `Fiche OT back-office` -> `Fiche OT mobile terrain`
- `Fiche OT mobile terrain` -> `Fiche coût analytique d'intervention`

### 4.4 Chaîne OT vers preuve puis facture

- `Fiche OT back-office` -> `Registre des PV`
- `Registre des PV` -> `Fiche PV`
- `Fiche PV` -> `Assistant nouvelle facture`
- `Assistant nouvelle facture` -> `Fiche facture`
- `Fiche facture` -> `Formulaire d'encaissement client`

### 4.5 Chaîne BTP vers situation puis facture

- `Saisie d'avancement chantier` -> `Gestion des attachements`
- `Gestion des attachements` -> `Registre des situations de travaux`
- `Registre des situations de travaux` -> `Assistant nouvelle facture`
- `Fiche facture` -> `Tableau de bord recouvrement`

### 4.6 Chaîne SAV vers intervention puis facturation

- `Registre des tickets SAV` -> `Fiche ticket SAV`
- `Fiche ticket SAV` -> `Suivi d'intervention SAV sur OT`
- `Suivi d'intervention SAV sur OT` -> `Fiche ticket SAV`
- `Fiche ticket SAV` -> `Assistant nouvelle facture` si l'intervention est facturable

### 4.7 Chaîne projet vers pilotage direction

- `Fiche affaire / projet` -> `Fiche budget projet / affaire`
- `Fiche affaire / projet` -> `Planning projet`
- `Fiche affaire / projet` -> `Vue 360 affaire / projet`
- `Vue 360 affaire / projet` -> `Cockpit risques et arbitrages projet`
- `Vue 360 affaire / projet` -> `Dashboard KPI projet / finance`

## 5. Points d'entrée par profil

### 5.1 Direction

- `Accueil ERP / Cockpit utilisateur`
- `Pipeline avant-vente`
- `Cockpit risques et arbitrages projet`
- `Dashboard KPI commerciaux`
- `Dashboard KPI projet / finance`
- `Dashboard KPI maintenance`

### 5.2 Chef de projet / conducteur de travaux

- `Registre des affaires et projets`
- `Fiche affaire / projet`
- `Planning projet`
- `Fiche budget projet / affaire`
- `Registre des expressions de besoin`
- `Liste / planning des ordres de travail`
- `Vue 360 affaire / projet`

### 5.3 Achats / logistique / magasin

- `Registre des expressions de besoin`
- `Registre des demandes d'achat`
- `Comparatif fournisseurs`
- `Commande fournisseur`
- `Centre de réception fournisseur`
- `Vue stock par emplacement`
- `Inventaire de stock`

### 5.4 Support / maintenance

- `Registre des tickets SAV`
- `Fiche ticket SAV`
- `Suivi d'intervention SAV sur OT`
- `Dashboard KPI maintenance`

### 5.5 Comptabilité / finance

- `Assistant nouvelle facture`
- `Registre des factures`
- `Fiche facture`
- `Formulaire d'encaissement client`
- `Tableau de bord recouvrement`
- `Écran de rapprochement paiements / factures`
- `Dashboard KPI projet / finance`

### 5.6 Validation / contrôle interne

- `Boîte de validation`
- `Historique des validations`
- `Contrôle de blocage sur fiche objet`

## 6. Règles d'implémentation UI déduites

- La `Vue 360 affaire / projet` doit exister comme hub transverse et non comme simple rapport.
- Les écrans `Fiche` doivent toujours permettre de rejoindre l'amont et l'aval du flux métier.
- Les écrans de type `File de travail` doivent être accessibles à la fois depuis le menu principal et depuis les objets concernés.
- Les écrans `mobile terrain` et `écrans partagés OT` peuvent relever d'une application ou d'un mode spécifique, mais ils doivent rester dans le même sitemap fonctionnel.
- Les fonctions de validation ne doivent pas être dispersées uniquement dans chaque module : la `Boîte de validation` doit être un point d'entrée autonome.

## 7. Couverture du catalogue d'écrans

Ce sitemap couvre l'ensemble des écrans du [CATALOGUE-ECRANS.md](./CATALOGUE-ECRANS.md) et les organise en navigation cible.

Repères :

- 11 entrées de niveau 1
- 72 écrans métier couverts
- 1 hub transverse majeur : `Vue 360 affaire / projet`
- 1 hub de gouvernance : `Boîte de validation`

## 8. Étape suivante conseillée

À partir de ce sitemap, on peut produire :

- une arborescence de menus et sous-menus version UX
- un zoning par écran
- une matrice `écran -> rôle -> permission -> user flow`
- une priorisation MVP / V2 / V3 par écran
