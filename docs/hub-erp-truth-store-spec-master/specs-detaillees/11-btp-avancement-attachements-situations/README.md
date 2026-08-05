# Module 11 - BTP / Avancement / Attachements / Situations

Spécifications détaillées pour la saisie d'avancement, les attachements, les situations et les corrections.

## Fichiers

- [01-avancement-attachements.md](./01-avancement-attachements.md)
- [02-situation-validation.md](./02-situation-validation.md)
- [03-historique-corrections.md](./03-historique-corrections.md)

## Liens documentaires

- Relation -> [README du module](./README.md) : vue d'ensemble de l'avancement, des attachements et des situations.
- Relation -> [Matrice du module](../../matrices/11-btp-avancement-attachements-situations.md) : consolide les objets métier, les règles et les étapes de validation.
- Relation -> [use-cases.md](../../use-cases.md) : source des cas de saisie d'avancement, de calcul de situation et de correction.
- Relation -> [business-rules.md](../../business-rules.md) : formalise la valorisation, les retenues et les règles de correction.
- Relation -> [state-transitions.md](../../state-transitions.md) : décrit les statuts calculé, validé, rejeté et corrigé.
- Relation -> [edge-cases.md](../../edge-cases.md) : couvre les litiges, les doublons et les corrections sur documents déjà traités.

## Liens inter-modules

- Relation -> [07-execution-terrain-ordres-de-travail/02-execution-terrain.md](../07-execution-terrain-ordres-de-travail/02-execution-terrain.md) : les quantités d'avancement viennent de l'exécution terrain réelle.
- Relation -> [08-pv-preuves-de-realisation/03-pv-base-facturation.md](../08-pv-preuves-de-realisation/03-pv-base-facturation.md) : le PV validé est une alternative ou un complément à la situation selon le contrat.
- Relation -> [10-couts-analytiques-rentabilite/02-consolidation-cout-complet.md](../10-couts-analytiques-rentabilite/02-consolidation-cout-complet.md) : les situations permettent de comparer coût complet et réalisé BTP.
- Relation -> [12-facturation/01-facturation-par-origine.md](../12-facturation/01-facturation-par-origine.md) : la situation validée devient une base de facturation.

## Liens internes

- Relation -> [01-avancement-attachements.md](./01-avancement-attachements.md) : couvre la saisie d'avancement et la génération des attachements.
- Relation -> [02-situation-validation.md](./02-situation-validation.md) : traite le calcul et la validation de la situation.
- Relation -> [03-historique-corrections.md](./03-historique-corrections.md) : documente les corrections et l'historique des valorisations.
