# Planning / Coordination opérationnelle - Vue consolidée planning

## Périmètre

Fournir une vue consolidée du planning d'un projet avec filtres par équipe, activité et période.

## Écran / action

### Action 1 - Consulter la vue consolidée

- Écran : Planning consolidé
- Action : Ouvrir la vue

### Action 2 - Filtrer et exporter

- Écran : Planning consolidé
- Action : Filtrer / exporter

## Input

### Action 1 - Consulter la vue consolidée

- Champ / donnée : projet, période
- Source : chef de projet ou direction
- Caractère obligatoire : projet ou périmètre
- Remarque : accès limité selon droits

### Action 2 - Filtrer et exporter

- Champ / donnée : équipe, statut, type d'activité, format d'export
- Source : utilisateur autorisé
- Caractère obligatoire : aucun
- Remarque : export facultatif selon droits

## Traitement système

### Action 1 - Consulter la vue consolidée

1. Vérifier droits et périmètre.
2. Agréger les activités planifiées et jalons.
3. Afficher les conflits et retards connus.
4. Mettre en évidence les dépendances critiques.
5. Tracer l'accès si requis.

### Action 2 - Filtrer et exporter

1. Appliquer les filtres sélectionnés.
2. Mettre à jour la vue en temps réel.
3. Générer l'export si demandé.
4. Journaliser l'export si nécessaire.
5. Respecter les restrictions d'accès.

## Output

### Action 1 - Consulter la vue consolidée

- Résultat visible : planning global avec activités et jalons
- Statut affiché : indicateurs de retard ou blocage
- Trace créée : journal de consultation si configuré
- Notification éventuelle : aucune

### Action 2 - Filtrer et exporter

- Résultat visible : vue filtrée / fichier exporté
- Statut affiché : filtres actifs
- Trace créée : journal d'export si requis
- Notification éventuelle : confirmation d'export

## Règle métier

### Action 1 - Consulter la vue consolidée

- Le planning doit soutenir la coordination entre approvisionnement, travaux, installation et maintenance.
- La vue consolidée doit respecter le périmètre d'accès.

### Action 2 - Filtrer et exporter

- Les exports doivent être soumis aux droits d'accès.
- Les filtres ne doivent pas masquer les conflits critiques par défaut.

## Exception

### Action 1 - Consulter la vue consolidée

- Cas : données incomplètes
  Effet attendu : indication d'incomplétude
- Cas : absence d'activité planifiée
  Effet attendu : vue vide avec message

### Action 2 - Filtrer et exporter

- Cas : export non autorisé
  Effet attendu : action refusée
- Cas : période trop large
  Effet attendu : alerte de performance
## Liens documentaires

- Relation -> [README du module](./README.md) : porte d’entrée du module Planning / Coordination opérationnelle
- Relation -> [Matrice 15-planning-coordination-operationnelle.md](../../matrices/15-planning-coordination-operationnelle.md) : correspondance consolidée entre concept, user story, règle métier et flux
- Relation -> [use-cases.md](../../use-cases.md) : cas d’usage de référence du module appliqués à cette fiche
- Relation -> [user-stories.md](../../user-stories.md) : attentes exprimées côté utilisateur appliqués à cette fiche
- Relation -> [functionnal-requirements.md](../../functionnal-requirements.md) : exigences fonctionnelles à décliner appliqués à cette fiche
- Relation -> [business-rules.md](../../business-rules.md) : règles métier structurantes appliqués à cette fiche
- Relation -> [permissions.md](../../permissions.md) : habilitations et rôles associés appliqués à cette fiche
- Relation -> [state-transitions.md](../../state-transitions.md) : transitions d’état concernées appliqués à cette fiche
- Relation -> [edge-cases.md](../../edge-cases.md) : cas limites à rejouer en recette appliqués à cette fiche
- Relation -> [user-flows.md](../../user-flows.md) : parcours opérationnels de référence appliqués à cette fiche

## Liens inter-modules

- Relation -> [01-vue-360-projet.md](../../18-vue-transverse-affaire-projet/01-vue-360-projet.md) : la vue planning complète la vue 360 projet
- Relation -> [02-kpi-projet-finance.md](../../17-reporting-kpi-direction/02-kpi-projet-finance.md) : les retards et charges planifiées impactent les KPI projet et finance
- Relation -> [02-diagnostic-intervention.md](../../14-sav-maintenance-ticketing/02-diagnostic-intervention.md) : le planning consolidé doit tenir compte des interventions terrain

