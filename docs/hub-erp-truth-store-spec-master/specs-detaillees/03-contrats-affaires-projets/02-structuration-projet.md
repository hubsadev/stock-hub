# Contrats / Affaires / Projets - Structuration du projet

## Perimetre

Definition du chef de projet, des dates, et decoupage en zones, sites et sous-lots.

## Ecran / action

### Action 1 - Renseigner les informations projet

- Ecran : Projet > Fiche
- Action : Enregistrer les informations generales

### Action 2 - Decouper un projet

- Ecran : Projet > Structure
- Action : Ajouter zones, sites, sous-lots

## Input

### Action 1 - Renseigner les informations projet

- Champ / donnee : chef de projet, dates prevues, type projet
- Source : saisie utilisateur
- Caractere obligatoire : oui pour chef de projet et dates
- Remarque : affaire de rattachement si applicable

### Action 2 - Decouper un projet

- Champ / donnee : zones, sites, sous-lots, maintenance
- Source : saisie utilisateur
- Caractere obligatoire : oui pour au moins un niveau
- Remarque : structure minimale requise avant execution

## Traitement systeme

### Action 1 - Renseigner les informations projet

1. Verifier droits.
2. Verifier champs obligatoires.
3. Mettre a jour la fiche projet.
4. Historiser la modification.

### Action 2 - Decouper un projet

1. Verifier droits.
2. Creer les zones, sites et sous-lots.
3. Lier chaque element au projet.
4. Mettre a jour la structure projet.
5. Historiser les changements.

## Output

### Action 1 - Renseigner les informations projet

- Resultat visible : fiche projet mise a jour
- Statut affiche : En preparation
- Trace creee : historique de modification
- Notification eventuelle : none

### Action 2 - Decouper un projet

- Resultat visible : structure projet affichee
- Statut affiche : En preparation
- Trace creee : historique de structure
- Notification eventuelle : none

## Regle metier

### Action 1 - Renseigner les informations projet

- Un projet doit avoir un chef de projet identifie.

### Action 2 - Decouper un projet

- Une zone, un site ou un chantier ne doit pas exister hors de son projet parent.

## Exception

### Action 1 - Renseigner les informations projet

- Cas : chef de projet manquant ; Effet attendu : blocage.

### Action 2 - Decouper un projet

- Cas : structure minimale absente ; Effet attendu : blocage du passage en execution.

## Liens documentaires

- Relation -> [matrices/03-contrats-affaires-projets.md](../../matrices/03-contrats-affaires-projets.md) : cadrage du découpage de projet, des zones et des sites.
- Relation -> [functionnal-requirements.md](../../functionnal-requirements.md) : exigences de création, découpage et consultation de la structure.
- Relation -> [business-rules.md](../../business-rules.md) : règles de rattachement, de hiérarchie et d'activation du projet.
- Relation -> [state-transitions.md](../../state-transitions.md) : passage de créé à exécution en fonction de la structure.
- Relation -> [user-flows.md](../../user-flows.md) : parcours de structuration du projet jusqu'au lancement opérationnel.

## Liens inter-modules

- Relation -> [../01-referentiel/03-sites-depots-ressources.md](../01-referentiel/03-sites-depots-ressources.md) : les sites et ressources référentiels structurent le découpage du projet.
- Relation -> [../04-budget-pilotage-financier-projet/01-budget-initial.md](../04-budget-pilotage-financier-projet/01-budget-initial.md) : la structure du projet porte le budget initial.
- Relation -> [../05-achats/01-expression-de-besoin.md](../05-achats/01-expression-de-besoin.md) : les besoins d'achat se rattachent à la structure projet définie.
