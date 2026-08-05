# Budget / Pilotage financier projet - Suivi des écarts et marge

## Périmètre

Consultation des écarts entre budget initial, budget révisé et consommé, et suivi de la marge cible.

## Écran / action

### Action 1 - Consulter les écarts budgétaires

- Écran : Tableau de bord budget / affaire
- Action : Ouvrir la vue comparatif initial / révisé / consommé

### Action 2 - Consulter la marge cible

- Écran : Fiche affaire / projet
- Action : Afficher la marge cible et l'écart estimé

## Input

### Action 1 - Consulter les écarts budgétaires

- Affaire ou projet ; source: sélection ; obligatoire: oui ; remarque: périmètre d'analyse
- Période ; source: sélection ; obligatoire: non ; remarque: filtre temporel

### Action 2 - Consulter la marge cible

- Affaire ou projet ; source: contexte ; obligatoire: oui ; remarque: marge définie au niveau affaire/projet

## Traitement système

### Action 1 - Consulter les écarts budgétaires

1. Vérifier les droits de consultation.
2. Agréger les montants budgétés par poste et les coûts engagés/réels.
3. Calculer les écarts par poste et au global.
4. Afficher les versions budgétaires disponibles.

### Action 2 - Consulter la marge cible

1. Récupérer la marge cible définie pour l'affaire ou le projet.
2. Afficher la marge cible et l'écart avec les coûts engagés/réels si disponibles.

## Output

### Action 1 - Consulter les écarts budgétaires

- Résultat visible : Tableau comparatif par poste
- Statut affiché : n/a
- Trace créée : aucune par défaut
- Notification éventuelle : alerte si écart majeur (si configuré)

### Action 2 - Consulter la marge cible

- Résultat visible : Marge cible et indicateurs associés
- Statut affiché : n/a
- Trace créée : aucune par défaut
- Notification éventuelle : aucune par défaut

## Règle métier

### Action 1 - Consulter les écarts budgétaires

- Les dépenses réelles doivent être comparables au budget par poste.
- Le budget initial reste consultable après révision.

### Action 2 - Consulter la marge cible

- La marge cible doit être définie au niveau de l'affaire ou du projet concerné.

## Exception

### Action 1 - Consulter les écarts budgétaires

- Cas: aucune version budgétaire ; Effet attendu: message d'absence de budget.
- Cas: données de coûts non disponibles ; Effet attendu: écarts incomplets avec avertissement.

### Action 2 - Consulter la marge cible

- Cas: marge cible non définie ; Effet attendu: afficher "non définie" et proposer configuration.

## Liens documentaires

- Relation -> [matrices/04-budget-pilotage-financier-projet.md](../../matrices/04-budget-pilotage-financier-projet.md) : cadrage du suivi des écarts et de la marge cible.
- Relation -> [business-rules.md](../../business-rules.md) : règles de comparaison entre budget, engagé et réalisé.
- Relation -> [state-transitions.md](../../state-transitions.md) : versions budgétaires et statut de référence active.
- Relation -> [edge-cases.md](../../edge-cases.md) : données de coûts manquantes et marge non définie.
- Relation -> [user-flows.md](../../user-flows.md) : parcours de suivi des écarts jusqu'à l'alerte de dérive.

## Liens inter-modules

- Relation -> [../05-achats/03-consultation-fournisseurs-commandes.md](../05-achats/03-consultation-fournisseurs-commandes.md) : les commandes valident les écarts entre budget et coût engagé.
- Relation -> [../06-stock-logistique-magasin/04-pilotage-stock.md](../06-stock-logistique-magasin/04-pilotage-stock.md) : les mouvements de stock participent au coût réel et aux écarts.
- Relation -> [../03-contrats-affaires-projets/03-affaire-rattachement-vue-consolidee.md](../03-contrats-affaires-projets/03-affaire-rattachement-vue-consolidee.md) : la marge cible s'affiche dans la vue consolidée du projet.
