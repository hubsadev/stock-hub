# Module 18 - Vue transverse Affaire / Projet

## Objectif

Décrire la vue 360 projet, la navigation transverse entre modules et le cockpit risques.

## Fichiers

- [01-vue-360-projet.md](./01-vue-360-projet.md)
- [02-navigation-transverse.md](./02-navigation-transverse.md)
- [03-risques-cockpit-projet.md](./03-risques-cockpit-projet.md)
## Liens documentaires

- Relation -> [GRAPHE-DOCUMENTAIRE.md](../GRAPHE-DOCUMENTAIRE.md) : vue synthétique des dépendances principales du module dans le graphe global
- Relation -> [Matrice module 18](../../matrices/18-vue-transverse-affaire-projet.md) : synthèse structurée des objets métier, use cases, règles, permissions et états du module
- Relation -> [use-cases.md](../../use-cases.md) : cas d’usage de référence du module pour vue transverse affaire / projet
- Relation -> [user-stories.md](../../user-stories.md) : attentes exprimées côté utilisateur pour vue transverse affaire / projet
- Relation -> [functionnal-requirements.md](../../functionnal-requirements.md) : exigences fonctionnelles à décliner pour vue transverse affaire / projet
- Relation -> [business-rules.md](../../business-rules.md) : règles métier structurantes pour vue transverse affaire / projet
- Relation -> [permissions.md](../../permissions.md) : habilitations et rôles associés pour vue transverse affaire / projet
- Relation -> [state-transitions.md](../../state-transitions.md) : transitions d’état concernées pour vue transverse affaire / projet
- Relation -> [edge-cases.md](../../edge-cases.md) : cas limites à rejouer en recette pour vue transverse affaire / projet
- Relation -> [user-flows.md](../../user-flows.md) : parcours opérationnels de référence pour vue transverse affaire / projet

## Liens inter-modules

- Relation -> [Module 02 - Avant-vente](../02-avant-vente/README.md) : la vue transverse reprend le cycle commercial en amont du projet
- Relation -> [Module 03 - Contrats / Affaires / Projets](../03-contrats-affaires-projets/README.md) : le dossier consolidé se structure autour de l’affaire et du projet
- Relation -> [Module 07 - Exécution terrain / Ordres de travail](../07-execution-terrain-ordres-de-travail/README.md) : les OT et interventions terrain sont des volets de la vue 360
- Relation -> [Module 08 - PV / Preuves de réalisation](../08-pv-preuves-de-realisation/README.md) : les preuves de réalisation alimentent la consolidation projet
- Relation -> [Module 12 - Facturation](../12-facturation/README.md) : la facturation est consultable depuis la fiche projet consolidée
- Relation -> [Module 14 - SAV / Maintenance / Ticketing](../14-sav-maintenance-ticketing/README.md) : les tickets et clôtures SAV doivent rester visibles au niveau projet
- Relation -> [Module 17 - Reporting / KPI / Direction](../17-reporting-kpi-direction/README.md) : les KPI direction consomment la vue transverse pour le pilotage

## Liens internes

- Relation -> [01-vue-360-projet.md](./01-vue-360-projet.md) : fiche centrale de consultation consolidée du projet
- Relation -> [02-navigation-transverse.md](./02-navigation-transverse.md) : définit les points de navigation entre modules liés
- Relation -> [03-risques-cockpit-projet.md](./03-risques-cockpit-projet.md) : regroupe les alertes, risques et blocages projet

