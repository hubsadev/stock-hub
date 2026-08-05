# Module 14 - SAV / Maintenance / Ticketing

## Vue d'ensemble

Ce module couvre la création des tickets, le diagnostic et les interventions terrain, ainsi que la clôture et la facturabilité.

## Fiches

- [01-creation-ticket.md](./01-creation-ticket.md)
- [02-diagnostic-intervention.md](./02-diagnostic-intervention.md)
- [03-cloture-facturabilite.md](./03-cloture-facturabilite.md)
## Liens documentaires

- Relation -> [GRAPHE-DOCUMENTAIRE.md](../GRAPHE-DOCUMENTAIRE.md) : vue synthétique des dépendances principales du module dans le graphe global
- Relation -> [Matrice module 14](../../matrices/14-sav-maintenance-ticketing.md) : synthèse structurée des objets métier, use cases, règles, permissions et états du module
- Relation -> [use-cases.md](../../use-cases.md) : cas d’usage de référence du module pour sav / maintenance / ticketing
- Relation -> [user-stories.md](../../user-stories.md) : attentes exprimées côté utilisateur pour sav / maintenance / ticketing
- Relation -> [functionnal-requirements.md](../../functionnal-requirements.md) : exigences fonctionnelles à décliner pour sav / maintenance / ticketing
- Relation -> [business-rules.md](../../business-rules.md) : règles métier structurantes pour sav / maintenance / ticketing
- Relation -> [permissions.md](../../permissions.md) : habilitations et rôles associés pour sav / maintenance / ticketing
- Relation -> [state-transitions.md](../../state-transitions.md) : transitions d’état concernées pour sav / maintenance / ticketing
- Relation -> [edge-cases.md](../../edge-cases.md) : cas limites à rejouer en recette pour sav / maintenance / ticketing
- Relation -> [user-flows.md](../../user-flows.md) : parcours opérationnels de référence pour sav / maintenance / ticketing

## Liens inter-modules

- Relation -> [Module 07 - Exécution terrain / Ordres de travail](../07-execution-terrain-ordres-de-travail/README.md) : le ticket peut déclencher un OT et un passage terrain
- Relation -> [02-execution-terrain.md](../07-execution-terrain-ordres-de-travail/02-execution-terrain.md) : le diagnostic et l’intervention consomment le flux d’exécution terrain
- Relation -> [Module 08 - PV / Preuves de réalisation](../08-pv-preuves-de-realisation/README.md) : les preuves et la clôture d’intervention alimentent la validation de service rendu
- Relation -> [03-pv-base-facturation.md](../08-pv-preuves-de-realisation/03-pv-base-facturation.md) : un PV validé peut devenir une base de facturation
- Relation -> [Module 12 - Facturation](../12-facturation/README.md) : les interventions facturables remontent vers la chaîne de facturation
- Relation -> [Module 16 - Gouvernance / Validation / Contrôle interne](../16-gouvernance-validation-controle-interne/README.md) : les arbitrages de SLA, garantie et facturabilité peuvent dépendre des circuits de validation
- Relation -> [Module 18 - Vue transverse Affaire / Projet](../18-vue-transverse-affaire-projet/README.md) : les tickets et interventions doivent rester visibles dans la vue projet

## Liens internes

- Relation -> [01-creation-ticket.md](./01-creation-ticket.md) : enregistre l’incident et prépare l’orientation vers un diagnostic ou un OT
- Relation -> [02-diagnostic-intervention.md](./02-diagnostic-intervention.md) : décrit l’analyse terrain et la résolution de l’incident
- Relation -> [03-cloture-facturabilite.md](./03-cloture-facturabilite.md) : termine le flux avec la décision de clôture et de facturabilité

