# Contrats / Affaires / Projets - Affaire de rattachement et vue consolidee

## Perimetre

Rattachement a une affaire et consultation d une vue projet consolidee.

## Ecran / action

### Action 1 - Rattacher un projet a une affaire

- Ecran : Projet > Informations contractuelles
- Action : Enregistrer le rattachement

### Action 2 - Consulter la fiche projet consolidee

- Ecran : Projet > Vue consolidee
- Action : Ouvrir la vue

## Input

### Action 1 - Rattacher un projet a une affaire

- Champ / donnee : affaire de rattachement, type de projet
- Source : saisie utilisateur
- Caractere obligatoire : selon modele retenu
- Remarque : rattachement requis pour la vue analytique

### Action 2 - Consulter la fiche projet consolidee

- Champ / donnee : identifiant projet
- Source : selection utilisateur
- Caractere obligatoire : oui
- Remarque : controle des droits de consultation

## Traitement systeme

### Action 1 - Rattacher un projet a une affaire

1. Verifier droits.
2. Verifier existence de l affaire.
3. Enregistrer le rattachement.
4. Historiser la modification.

### Action 2 - Consulter la fiche projet consolidee

1. Verifier droits de consultation.
2. Aggreguer contrats, budgets, achats, OT, PV, factures, tickets.
3. Afficher les indicateurs clefs et le statut global.

## Output

### Action 1 - Rattacher un projet a une affaire

- Resultat visible : affaire rattachee visible
- Statut affiche : inchangé
- Trace creee : historique de rattachement
- Notification eventuelle : none

### Action 2 - Consulter la fiche projet consolidee

- Resultat visible : vue 360 projet
- Statut affiche : statut global
- Trace creee : none
- Notification eventuelle : none

## Regle metier

### Action 1 - Rattacher un projet a une affaire

- Le projet doit pouvoir etre rattache a une affaire si le modele le requiert.

### Action 2 - Consulter la fiche projet consolidee

- Tous les objets lies a un projet doivent rester navigables depuis la fiche projet.

## Exception

### Action 1 - Rattacher un projet a une affaire

- Cas : affaire inexistante ou inactive ; Effet attendu : blocage.

### Action 2 - Consulter la fiche projet consolidee

- Cas : droits insuffisants ; Effet attendu : acces refuse.

## Liens documentaires

- Relation -> [matrices/03-contrats-affaires-projets.md](../../matrices/03-contrats-affaires-projets.md) : cadrage de la vue consolidée et de l'affaire de rattachement.
- Relation -> [business-rules.md](../../business-rules.md) : règles de centralisation opérationnelle et analytique.
- Relation -> [permissions.md](../../permissions.md) : visibilité conditionnée aux droits par module ou périmètre.
- Relation -> [edge-cases.md](../../edge-cases.md) : affaire inexistante, projet suspendu, données non synchronisées.
- Relation -> [user-flows.md](../../user-flows.md) : parcours de consultation de la fiche projet consolidée.

## Liens inter-modules

- Relation -> [../04-budget-pilotage-financier-projet/03-suivi-ecarts-marge.md](../04-budget-pilotage-financier-projet/03-suivi-ecarts-marge.md) : la vue consolidée agrège les écarts budgétaires et de marge.
- Relation -> [../05-achats/01-expression-de-besoin.md](../05-achats/01-expression-de-besoin.md) : les besoins achats sont rattachés à l'affaire ou au projet consulté.
- Relation -> [../06-stock-logistique-magasin/04-pilotage-stock.md](../06-stock-logistique-magasin/04-pilotage-stock.md) : le pilotage stock se lit à travers la vue consolidée du projet.
