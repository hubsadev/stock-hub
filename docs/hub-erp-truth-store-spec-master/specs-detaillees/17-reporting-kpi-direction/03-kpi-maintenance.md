# Reporting / KPI / Direction - KPI maintenance

## Périmètre

Suivi des tickets, SLA, temps de resolution et recurrences.

## Écran / action

### Action 1 - Consulter les KPI maintenance

- Écran : Dashboard KPI maintenance
- Action : Ouvrir la vue maintenance

### Action 2 - Filtrer par SLA et periode

- Écran : Dashboard KPI maintenance
- Action : Appliquer un filtre

## Input

### Action 1 - Consulter les KPI maintenance

- Champ / donnée : Périmètre support ; Source : utilisateur habilité ; Caractère obligatoire : oui ; Remarque : depend des droits.

### Action 2 - Filtrer par SLA et periode

- Champ / donnée : SLA ; Source : utilisateur habilité ; Caractère obligatoire : non ; Remarque : categorie ou contrat.
- Champ / donnée : Periode ; Source : utilisateur habilité ; Caractère obligatoire : non ; Remarque : mois, trimestre, cumul.

## Traitement système

### Action 1 - Consulter les KPI maintenance

1. Vérifier les droits de consultation.
2. Agréger tickets, statuts, temps de resolution et SLA.
3. Calculer les KPI (respect SLA, temps moyen, recurrences).
4. Afficher les syntheses et alertes.

### Action 2 - Filtrer par SLA et periode

1. Vérifier la validité des filtres.
2. Recalculer les KPI avec filtres.
3. Rafraîchir les indicateurs.

## Output

### Action 1 - Consulter les KPI maintenance

- Résultat visible : KPI maintenance affiches.
- Statut affiché : Périmètre actif.
- Trace créée : Aucune.
- Notification éventuelle : Aucune.

### Action 2 - Filtrer par SLA et periode

- Résultat visible : KPI filtres.
- Statut affiché : Filtres actifs visibles.
- Trace créée : Aucune.
- Notification éventuelle : Aucune.

## Règle métier

### Action 1 - Consulter les KPI maintenance

- Règle 1 : Les KPI maintenance doivent mesurer tickets, SLA, temps de resolution et recurrences.
- Règle 2 : Les indicateurs doivent être calcules a partir des données opérationnelles.

### Action 2 - Filtrer par SLA et periode

- Règle 1 : Les filtres respectent le périmètre de droits.
- Règle 2 : Les KPI restent cohérents avec les definitions officielles.

## Exception

### Action 1 - Consulter les KPI maintenance

- Cas : Aucune donnée ; Effet attendu : tableau vide avec message.
- Cas : Droits insuffisants ; Effet attendu : accès refusé.

### Action 2 - Filtrer par SLA et periode

- Cas : Filtre invalide ; Effet attendu : message d'erreur.
- Cas : Periode sans données ; Effet attendu : affichage vide.
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

- Relation -> [03-cloture-facturabilite.md](../../14-sav-maintenance-ticketing/03-cloture-facturabilite.md) : les KPI maintenance utilisent les clôtures et la facturabilité des interventions
- Relation -> [03-vue-consolidee-planning.md](../../15-planning-coordination-operationnelle/03-vue-consolidee-planning.md) : les retards et replanifications impactent les KPI de maintenance et d’exécution
- Relation -> [03-risques-cockpit-projet.md](../../18-vue-transverse-affaire-projet/03-risques-cockpit-projet.md) : les SLA et incidents récurrents remontent dans la vue risques du projet

