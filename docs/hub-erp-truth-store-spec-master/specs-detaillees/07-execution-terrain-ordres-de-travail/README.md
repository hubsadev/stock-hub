# Module 7 - Exécution terrain / Ordres de travail

Spécifications détaillées des actions principales autour des OT et de l'exécution terrain.

## Fiches

- [01-creation-planification-ot.md](./01-creation-planification-ot.md)
- [02-execution-terrain.md](./02-execution-terrain.md)
- [03-anomalies-cloture-ot.md](./03-anomalies-cloture-ot.md)

## Liens documentaires

- Relation -> [README du module](./README.md) : point d'entrée du lot OT et vue d'ensemble du périmètre terrain.
- Relation -> [Matrice du module](../../matrices/07-execution-terrain-ordres-de-travail.md) : consolide les objets métier, règles et cas d'usage du module.
- Relation -> [use-cases.md](../../use-cases.md) : source des scénarios de création, planification, exécution et clôture OT.
- Relation -> [business-rules.md](../../business-rules.md) : formalise les contraintes de rattachement, de preuve et de planification.
- Relation -> [state-transitions.md](../../state-transitions.md) : décrit les passages de statut de l'OT du brouillon à la clôture.
- Relation -> [user-flows.md](../../user-flows.md) : relie les écrans de création, d'exécution et de clôture dans un flux utilisateur unique.

## Liens inter-modules

- Relation -> [14-sav-maintenance-ticketing/01-creation-ticket.md](../14-sav-maintenance-ticketing/01-creation-ticket.md) : un ticket support peut être l'origine fonctionnelle d'un OT.
- Relation -> [15-planning-coordination-operationnelle/01-planning-ressources.md](../15-planning-coordination-operationnelle/01-planning-ressources.md) : la planification OT consomme les ressources et créneaux du planning.
- Relation -> [08-pv-preuves-de-realisation/01-generation-pv.md](../08-pv-preuves-de-realisation/01-generation-pv.md) : la clôture technique de l'OT alimente la création du PV.
- Relation -> [09-temps-ressources-pointage/02-imputation-ressources.md](../09-temps-ressources-pointage/02-imputation-ressources.md) : les temps et consommations de l'OT alimentent le pointage et les imputations.
- Relation -> [10-couts-analytiques-rentabilite/01-cout-reel-intervention.md](../10-couts-analytiques-rentabilite/01-cout-reel-intervention.md) : les données d'exécution OT entrent dans le calcul du coût réel.
- Relation -> [12-facturation/01-facturation-par-origine.md](../12-facturation/01-facturation-par-origine.md) : un PV issu de l'OT peut devenir une base de facturation.

## Liens internes

- Relation -> [01-creation-planification-ot.md](./01-creation-planification-ot.md) : crée et positionne l'OT dans le cycle de vie.
- Relation -> [02-execution-terrain.md](./02-execution-terrain.md) : décrit le démarrage et la saisie des opérations terrain.
- Relation -> [03-anomalies-cloture-ot.md](./03-anomalies-cloture-ot.md) : couvre les exceptions, réserves et clôture technique.
