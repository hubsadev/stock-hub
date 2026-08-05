# Coûts analytiques / Rentabilité - Rentabilité et marge

## Périmètre

Calculer la marge réelle et consulter la rentabilité par client, projet, chantier ou site.

## Écran / action

### Action 1 - Calculer la marge réelle

- Écran : Tableau de bord rentabilité
- Action : Lancer le calcul de marge

### Action 2 - Consulter la rentabilité

- Écran : Tableau de bord rentabilité
- Action : Filtrer par client / projet / site

## Input

### Action 1 - Calculer la marge réelle

- Champ / donnée : périmètre, période, source de revenus (factures)
- Source : sélection utilisateur
- Caractère obligatoire : périmètre, période
- Remarque : le périmètre définit l'axe de rentabilité

### Action 2 - Consulter la rentabilité

- Champ / donnée : filtre client / projet / site
- Source : sélection utilisateur
- Caractère obligatoire : oui
- Remarque : peut combiner avec une période

## Traitement système

### Action 1 - Calculer la marge réelle

1. Vérifier les droits d'accès au reporting financier.
2. Charger les revenus facturés et les coûts réels consolidés.
3. Calculer la marge réelle et le taux de marge.
4. Enregistrer l'indicateur de marge pour la période.
5. Historiser la version du calcul.

### Action 2 - Consulter la rentabilité

1. Charger les indicateurs calculés pour le filtre demandé.
2. Afficher la marge et l'évolution temporelle si disponible.
3. Exposer les écarts par composante de coût.

## Output

### Action 1 - Calculer la marge réelle

- Résultat visible : marge réelle et taux de marge
- Statut affiché : calculé / mis à jour
- Trace créée : journal de calcul
- Notification éventuelle : marge négative signalée

### Action 2 - Consulter la rentabilité

- Résultat visible : tableau de rentabilité par axe
- Statut affiché : filtre actif
- Trace créée : aucune
- Notification éventuelle : indication de données partielles

## Règle métier

### Action 1 - Calculer la marge réelle

- Règle 1 : la rentabilité doit pouvoir être mesurée par client, affaire ou site.
- Règle 2 : la marge réelle dépend des imputations validées.

### Action 2 - Consulter la rentabilité

- Règle 1 : les coûts et revenus doivent rester traçables jusqu'aux objets sources.
- Règle 2 : une marge négative doit être identifiable par périmètre.

## Exception

### Action 1 - Calculer la marge réelle

- Cas : facturation partielle
  Effet attendu : marge partielle avec avertissement.
- Cas : coûts incomplets
  Effet attendu : calcul avec indicateur d'incomplétude.

### Action 2 - Consulter la rentabilité

- Cas : absence de revenus sur la période
  Effet attendu : marge nulle ou non calculable, message explicite.
- Cas : recalcul après correction tardive
  Effet attendu : mise à jour de la marge et historisation.

## Liens documentaires

- Relation -> [README du module](./README.md) : rattache la marge au module rentabilité.
- Relation -> [Matrice du module](../../matrices/10-couts-analytiques-rentabilite.md) : lie la marge aux composantes de coût et de revenu.
- Relation -> [business-rules.md](../../business-rules.md) : précise le périmètre de mesure de la rentabilité.
- Relation -> [state-transitions.md](../../state-transitions.md) : décrit les versions de calcul et les recalculs.
- Relation -> [edge-cases.md](../../edge-cases.md) : couvre les marges partielles, négatives et les périodes sans revenus.

## Liens inter-modules

- Relation -> [11-btp-avancement-attachements-situations/02-situation-validation.md](../11-btp-avancement-attachements-situations/02-situation-validation.md) : les situations validées portent une partie du revenu rentabilisé.
- Relation -> [12-facturation/01-facturation-par-origine.md](../12-facturation/01-facturation-par-origine.md) : les factures constituent la base de revenus de la marge.
- Relation -> [12-facturation/03-consultation-correction-facture.md](../12-facturation/03-consultation-correction-facture.md) : les corrections de facture doivent être reflétées dans la marge recalculée.
