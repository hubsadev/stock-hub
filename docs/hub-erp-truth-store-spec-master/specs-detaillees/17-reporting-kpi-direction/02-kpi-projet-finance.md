# Reporting / KPI / Direction - KPI projet et finance

## Périmètre

KPI d'avancement physique et financier, marge prévue vs marge réelle, reste a engager et reste a facturer.

## Écran / action

### Action 1 - Consulter les KPI projet

- Écran : Dashboard KPI projet/finance
- Action : Ouvrir la vue projet

### Action 2 - Comparer prévu vs réel

- Écran : Dashboard KPI projet/finance
- Action : Activer la comparaison

## Input

### Action 1 - Consulter les KPI projet

- Champ / donnée : Périmètre projet ; Source : utilisateur habilité ; Caractère obligatoire : oui ; Remarque : dépend des droits.

### Action 2 - Comparer prévu vs réel

- Champ / donnée : Période de comparaison ; Source : utilisateur habilité ; Caractère obligatoire : non ; Remarque : mois, trimestre, cumul.
- Champ / donnée : Axe d'analyse (projet, client, site) ; Source : utilisateur habilité ; Caractère obligatoire : non ; Remarque : selon rôle.

## Traitement système

### Action 1 - Consulter les KPI projet

1. Vérifier les droits de consultation.
2. Agréger avancement, budget, couts reels, factures et encaissements.
3. Calculer les KPI projet (avancement physique, avancement financier, marge).
4. Afficher les syntheses.

### Action 2 - Comparer prévu vs réel

1. Récupérer la baseline budgetaire et contractuelle.
2. Comparer avec les couts reels et factures.
3. Calculer les ecarts et tendances.
4. Rafraîchir les indicateurs.

## Output

### Action 1 - Consulter les KPI projet

- Résultat visible : KPI projet affiches.
- Statut affiché : Périmètre actif.
- Trace créée : Aucune.
- Notification éventuelle : Aucune.

### Action 2 - Comparer prévu vs réel

- Résultat visible : Ecart budgetaire et marge affichees.
- Statut affiché : Mode comparaison actif.
- Trace créée : Aucune.
- Notification éventuelle : Aucune.

## Règle métier

### Action 1 - Consulter les KPI projet

- Règle 1 : Les KPI projet doivent permettre de suivre l'avancement physique et financier.
- Règle 2 : Les KPI finance doivent suivre factures, encaissements et reste a facturer.

### Action 2 - Comparer prévu vs réel

- Règle 1 : La comparaison marge prévue vs réelle est obligatoire pour le pilotage direction.
- Règle 2 : Les ecarts doivent être calcules a partir des données validées.

## Exception

### Action 1 - Consulter les KPI projet

- Cas : Données non synchronisées ; Effet attendu : indicateur d'alerte.
- Cas : Projet sans budget ; Effet attendu : KPI budgetaires indisponibles.

### Action 2 - Comparer prévu vs réel

- Cas : Données manquantes ; Effet attendu : comparaison partielle avec message.
- Cas : Filtre trop restrictif ; Effet attendu : resultat vide.
## Liens documentaires

- Relation -> [README du module](./README.md) : porte d’entrée du module Reporting / KPI / Direction
- Relation -> [Matrice 17-reporting-kpi-direction.md](../../matrices/17-reporting-kpi-direction.md) : correspondance consolidée entre concept, user story, règle métier et flux
- Relation -> [use-cases.md](../../use-cases.md) : cas d’usage de référence du module appliqués à cette fiche
- Relation -> [user-stories.md](../../user-stories.md) : attentes exprimées côté utilisateur appliqués à cette fiche
- Relation -> [functionnal-requirements.md](../../functionnal-requirements.md) : exigences fonctionnelles à décliner appliqués à cette fiche
- Relation -> [business-rules.md](../../business-rules.md) : règles métier structurantes appliqués à cette fiche
- Relation -> [permissions.md](../../permissions.md) : habilitations et rôles associés appliqués à cette fiche
- Relation -> [state-transitions.md](../../state-transitions.md) : transitions d’état concernées appliqués à cette fiche
- Relation -> [edge-cases.md](../../edge-cases.md) : cas limites à rejouer en recette appliqués à cette fiche
- Relation -> [user-flows.md](../../user-flows.md) : parcours opérationnels de référence appliqués à cette fiche

## Liens inter-modules

- Relation -> [03-suivi-ecarts-marge.md](../../04-budget-pilotage-financier-projet/03-suivi-ecarts-marge.md) : les KPI projet-finance reprennent le suivi d’écarts et de marge
- Relation -> [03-rentabilite-marge.md](../../10-couts-analytiques-rentabilite/03-rentabilite-marge.md) : la rentabilité analytique nourrit les indicateurs de direction
- Relation -> [03-rapprochement-tresorerie.md](../../13-encaissement-recouvrement/03-rapprochement-tresorerie.md) : les KPI financiers intègrent le cash réellement encaissé

