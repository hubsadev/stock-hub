# Coûts analytiques / Rentabilité - Consolidation du coût complet

## Périmètre

Consolider les coûts par affaire, projet, chantier ou site et comparer au budget.

## Écran / action

### Action 1 - Consolider les coûts

- Écran : Tableau de bord analytique
- Action : Lancer la consolidation

### Action 2 - Comparer budget vs réel

- Écran : Tableau de bord analytique / vue comparatif
- Action : Afficher écarts

## Input

### Action 1 - Consolider les coûts

- Champ / donnée : périmètre (affaire/projet/site), période, niveau d'agrégation
- Source : sélection utilisateur
- Caractère obligatoire : périmètre, période
- Remarque : le niveau d'agrégation pilote le regroupement

### Action 2 - Comparer budget vs réel

- Champ / donnée : périmètre, période, version budget
- Source : sélection utilisateur
- Caractère obligatoire : périmètre, version budget
- Remarque : la version budget choisie doit être validée

## Traitement système

### Action 1 - Consolider les coûts

1. Vérifier les droits d'accès au reporting analytique.
2. Agréger les coûts réels par composante et par périmètre.
3. Consolider les coûts mutualisés selon les règles d'imputation.
4. Enregistrer ou mettre en cache la synthèse consolidée.
5. Mettre à jour l'historique de consolidation.

### Action 2 - Comparer budget vs réel

1. Charger la version budget valide du périmètre.
2. Calculer les écarts par poste et le total.
3. Marquer les postes en dépassement.
4. Afficher les écarts et l'évolution.

## Output

### Action 1 - Consolider les coûts

- Résultat visible : coût complet par périmètre
- Statut affiché : consolidation à jour
- Trace créée : journal de consolidation
- Notification éventuelle : alerte si coûts non imputés

### Action 2 - Comparer budget vs réel

- Résultat visible : tableau des écarts par poste
- Statut affiché : version budget affichée
- Trace créée : aucune
- Notification éventuelle : surcoût identifié

## Règle métier

### Action 1 - Consolider les coûts

- Règle 1 : les coûts réels doivent être comparables au budget.
- Règle 2 : toute composante retenue doit être rattachée à un objet analytique.

### Action 2 - Comparer budget vs réel

- Règle 1 : la comparaison se fait sur une version de budget validée.
- Règle 2 : les coûts partiels doivent être explicités comme tels.

## Exception

### Action 1 - Consolider les coûts

- Cas : coûts partagés entre plusieurs sites
  Effet attendu : répartition selon les règles d'imputation.
- Cas : sous-traitance engagée sans facture reçue
  Effet attendu : coût provisoire affiché.

### Action 2 - Comparer budget vs réel

- Cas : budget absent
  Effet attendu : comparaison indisponible, message explicite.
- Cas : écarts incohérents selon période
  Effet attendu : signaler l'écart temporel et proposer la période correcte.

## Liens documentaires

- Relation -> [README du module](./README.md) : rattache la consolidation au module analytique.
- Relation -> [Matrice du module](../../matrices/10-couts-analytiques-rentabilite.md) : consolide les postes, périmètres et règles de comparaison.
- Relation -> [business-rules.md](../../business-rules.md) : formalise la comparaison sur budget validé et les règles d'imputation.
- Relation -> [use-cases.md](../../use-cases.md) : source du besoin de suivi budget vs réel.
- Relation -> [permissions.md](../../permissions.md) : borne l'accès au reporting analytique.

## Liens inter-modules

- Relation -> [09-temps-ressources-pointage/03-validation-consultation-pointage.md](../09-temps-ressources-pointage/03-validation-consultation-pointage.md) : la consolidation ne doit consommer que des pointages validés.
- Relation -> [11-btp-avancement-attachements-situations/02-situation-validation.md](../11-btp-avancement-attachements-situations/02-situation-validation.md) : les situations BTP validées alimentent la lecture des coûts sur le chantier.
- Relation -> [12-facturation/01-facturation-par-origine.md](../12-facturation/01-facturation-par-origine.md) : la comparaison budget/réel doit se lire avec les revenus facturés.
