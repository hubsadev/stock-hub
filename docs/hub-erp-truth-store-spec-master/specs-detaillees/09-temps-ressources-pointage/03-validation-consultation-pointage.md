# Temps / Ressources / Pointage - Validation et consultation

## Périmètre

Valider, corriger et consulter les pointages.

## Écran / action

### Action 1 - Valider ou corriger un pointage

- Écran : File de validation / fiche pointage
- Action : Valider ou renvoyer en correction

### Action 2 - Consulter les pointages

- Écran : Tableau de pointages / filtres
- Action : Consulter par période, équipe, affaire

## Input

### Action 1 - Valider ou corriger un pointage

- Champ / donnée : décision de validation
- Source : valideur
- Caractère obligatoire : oui
- Remarque : validation ou retour correction

- Champ / donnée : commentaire
- Source : saisie valideur
- Caractère obligatoire : selon règle
- Remarque : recommandé si rejet

### Action 2 - Consulter les pointages

- Champ / donnée : période
- Source : sélection utilisateur
- Caractère obligatoire : oui
- Remarque : filtre principal

- Champ / donnée : équipe / affaire / chantier
- Source : sélection utilisateur
- Caractère obligatoire : non
- Remarque : filtres secondaires

## Traitement système

### Action 1 - Valider ou corriger un pointage

1. Vérifier les droits de validation.
2. Vérifier que le pointage est en statut "Soumis".
3. Enregistrer la décision et l'horodatage.
4. Passer le statut à "Validé" ou "À corriger".
5. Lancer le recalcul des coûts analytiques si applicable.

### Action 2 - Consulter les pointages

1. Appliquer les filtres de recherche.
2. Vérifier les droits d'accès au périmètre.
3. Afficher les totaux et détails.

## Output

### Action 1 - Valider ou corriger un pointage

- Résultat visible : décision visible sur la fiche
- Statut affiché : Validé / À corriger
- Trace créée : historique de validation
- Notification éventuelle : équipe informée

### Action 2 - Consulter les pointages

- Résultat visible : liste filtrée avec totaux
- Statut affiché : n/a
- Trace créée : aucune
- Notification éventuelle : aucune

## Règle métier

### Action 1 - Valider ou corriger un pointage

- Règle 1 : la validation est hiérarchique.
- Règle 2 : les heures validées alimentent le coût réel.

### Action 2 - Consulter les pointages

- Règle 1 : l'accès est limité au périmètre autorisé.
- Règle 2 : les pointages validés ne sont plus modifiables sans réouverture.

## Exception

### Action 1 - Valider ou corriger un pointage

- Cas : valideur absent
  Effet attendu : délégation ou escalade.
- Cas : correction après validation
  Effet attendu : réouverture tracée.

### Action 2 - Consulter les pointages

- Cas : absence de données sur la période
  Effet attendu : message "aucun résultat".
- Cas : accès non autorisé
  Effet attendu : résultat masqué ou refusé.

## Liens documentaires

- Relation -> [README du module](./README.md) : rattache la validation hiérarchique au module pointage.
- Relation -> [Matrice du module](../../matrices/09-temps-ressources-pointage.md) : aligne les états et les règles de validation.
- Relation -> [permissions.md](../../permissions.md) : formalise les rôles de validateur et de consultation.
- Relation -> [state-transitions.md](../../state-transitions.md) : décrit le passage soumis -> validé / rejeté.
- Relation -> [edge-cases.md](../../edge-cases.md) : couvre les périodes clôturées et les modifications bloquées.

## Liens inter-modules

- Relation -> [10-couts-analytiques-rentabilite/02-consolidation-cout-complet.md](../10-couts-analytiques-rentabilite/02-consolidation-cout-complet.md) : seuls les pointages validés doivent alimenter la consolidation analytique.
- Relation -> [10-couts-analytiques-rentabilite/03-rentabilite-marge.md](../10-couts-analytiques-rentabilite/03-rentabilite-marge.md) : la marge dépend des imputations pointées et validées.
