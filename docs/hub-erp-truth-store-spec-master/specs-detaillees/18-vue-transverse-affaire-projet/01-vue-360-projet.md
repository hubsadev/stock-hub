# Vue transverse Affaire / Projet - Vue 360 projet

## Périmètre

Accès a une fiche projet consolidée regroupant vente, execution, finance et maintenance.

## Écran / action

### Action 1 - Ouvrir la vue 360 d'un projet

- Écran : Fiche projet - Vue 360
- Action : Ouvrir la fiche projet

### Action 2 - Consulter un volet de la vue 360

- Écran : Fiche projet - Vue 360
- Action : Ouvrir un volet (offres, contrats, budget, achats, OT, PV, factures, tickets)

## Input

### Action 1 - Ouvrir la vue 360 d'un projet

- Champ / donnée : Projet ; Source : utilisateur habilité ; Caractère obligatoire : oui ; Remarque : visibilité selon droits.

### Action 2 - Consulter un volet de la vue 360

- Champ / donnée : Volet sélectionné ; Source : utilisateur habilité ; Caractère obligatoire : oui ; Remarque : accès conditionné aux droits.

## Traitement système

### Action 1 - Ouvrir la vue 360 d'un projet

1. Vérifier les droits de consultation du projet.
2. Charger les données de base du projet et de l'affaire de rattachement.
3. Agréger les liens vers les objets des modules connexes.
4. Afficher la synthese projet.

### Action 2 - Consulter un volet de la vue 360

1. Vérifier l'autorisation d'acces au module cible.
2. Charger les objets liés au projet pour le volet.
3. Afficher la liste et les statuts.

## Output

### Action 1 - Ouvrir la vue 360 d'un projet

- Résultat visible : Fiche projet consolidée.
- Statut affiché : Statut global du projet.
- Trace créée : Aucune.
- Notification éventuelle : Aucune.

### Action 2 - Consulter un volet de la vue 360

- Résultat visible : Volet et objets liés.
- Statut affiché : Statuts par objet.
- Trace créée : Aucune.
- Notification éventuelle : Aucune.

## Règle métier

### Action 1 - Ouvrir la vue 360 d'un projet

- Règle 1 : Tout projet doit centraliser les informations de vente, execution, finance et maintenance.
- Règle 2 : Les objets liés doivent rester navigables depuis la fiche projet.

### Action 2 - Consulter un volet de la vue 360

- Règle 1 : La visibilité depend des droits par module.
- Règle 2 : Le realisé a date reflète les données consolidées disponibles.

## Exception

### Action 1 - Ouvrir la vue 360 d'un projet

- Cas : Projet inexistant ou inactif ; Effet attendu : message d'erreur.
- Cas : Droits insuffisants ; Effet attendu : acces refuse.

### Action 2 - Consulter un volet de la vue 360

- Cas : Module non accessible ; Effet attendu : volet masque ou acces refuse.
- Cas : Données non synchronisées ; Effet attendu : indicateur d'alerte.
## Liens documentaires

- Relation -> [README du module](./README.md) : porte d’entrée du module Vue transverse Affaire / Projet
- Relation -> [Matrice 18-vue-transverse-affaire-projet.md](../../matrices/18-vue-transverse-affaire-projet.md) : correspondance consolidée entre concept, user story, règle métier et flux
- Relation -> [use-cases.md](../../use-cases.md) : cas d’usage de référence du module appliqués à cette fiche
- Relation -> [user-stories.md](../../user-stories.md) : attentes exprimées côté utilisateur appliqués à cette fiche
- Relation -> [functionnal-requirements.md](../../functionnal-requirements.md) : exigences fonctionnelles à décliner appliqués à cette fiche
- Relation -> [business-rules.md](../../business-rules.md) : règles métier structurantes appliqués à cette fiche
- Relation -> [permissions.md](../../permissions.md) : habilitations et rôles associés appliqués à cette fiche
- Relation -> [state-transitions.md](../../state-transitions.md) : transitions d’état concernées appliqués à cette fiche
- Relation -> [edge-cases.md](../../edge-cases.md) : cas limites à rejouer en recette appliqués à cette fiche
- Relation -> [user-flows.md](../../user-flows.md) : parcours opérationnels de référence appliqués à cette fiche

## Liens inter-modules

- Relation -> [03-rapprochement-tresorerie.md](../../13-encaissement-recouvrement/03-rapprochement-tresorerie.md) : la vue 360 expose l’état financier et le cash du projet
- Relation -> [01-creation-ticket.md](../../14-sav-maintenance-ticketing/01-creation-ticket.md) : les tickets SAV doivent remonter dans la fiche projet consolidée
- Relation -> [02-kpi-projet-finance.md](../../17-reporting-kpi-direction/02-kpi-projet-finance.md) : la vue 360 sert aussi d’entrée aux analyses projet et finance

