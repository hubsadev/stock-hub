# Module 9 - Temps / Ressources / Pointage

Spécifications détaillées de la saisie, l'imputation et la validation des pointages.

## Fiches

- [01-pointage-equipe.md](./01-pointage-equipe.md)
- [02-imputation-ressources.md](./02-imputation-ressources.md)
- [03-validation-consultation-pointage.md](./03-validation-consultation-pointage.md)

## Liens documentaires

- Relation -> [README du module](./README.md) : vue d'ensemble du pointage, de l'imputation et de la validation.
- Relation -> [Matrice du module](../../matrices/09-temps-ressources-pointage.md) : consolide les règles de pointage et d'imputation.
- Relation -> [use-cases.md](../../use-cases.md) : source des cas de saisie quotidienne, d'imputation et de validation.
- Relation -> [permissions.md](../../permissions.md) : précise qui peut saisir, soumettre et valider le pointage.
- Relation -> [state-transitions.md](../../state-transitions.md) : décrit les passages brouillon -> soumis -> validé.
- Relation -> [business-rules.md](../../business-rules.md) : rappelle les contraintes de rattachement et de distinction des heures.

## Liens inter-modules

- Relation -> [07-execution-terrain-ordres-de-travail/02-execution-terrain.md](../07-execution-terrain-ordres-de-travail/02-execution-terrain.md) : les temps pointés reprennent le travail réellement effectué sur l'OT.
- Relation -> [07-execution-terrain-ordres-de-travail/01-creation-planification-ot.md](../07-execution-terrain-ordres-de-travail/01-creation-planification-ot.md) : l'objet pointé doit exister et être planifié dans le périmètre OT.
- Relation -> [10-couts-analytiques-rentabilite/01-cout-reel-intervention.md](../10-couts-analytiques-rentabilite/01-cout-reel-intervention.md) : les pointages validés alimentent le coût réel.
- Relation -> [15-planning-coordination-operationnelle/01-planning-ressources.md](../15-planning-coordination-operationnelle/01-planning-ressources.md) : les équipes et ressources pointées doivent provenir du planning opérationnel.

## Liens internes

- Relation -> [01-pointage-equipe.md](./01-pointage-equipe.md) : capture la feuille de temps quotidienne.
- Relation -> [02-imputation-ressources.md](./02-imputation-ressources.md) : détaille la ventilation sur OT, affaire, chantier ou tâche.
- Relation -> [03-validation-consultation-pointage.md](./03-validation-consultation-pointage.md) : traite la validation hiérarchique et la consultation.
