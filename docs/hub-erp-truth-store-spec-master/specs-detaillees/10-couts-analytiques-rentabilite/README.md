# Module 10 - Coûts analytiques / Rentabilité

Spécifications détaillées pour le calcul des coûts réels, la consolidation et la rentabilité.

## Fichiers

- [01-cout-reel-intervention.md](./01-cout-reel-intervention.md)
- [02-consolidation-cout-complet.md](./02-consolidation-cout-complet.md)
- [03-rentabilite-marge.md](./03-rentabilite-marge.md)

## Liens documentaires

- Relation -> [README du module](./README.md) : vue d'ensemble du calcul de coûts et de la rentabilité.
- Relation -> [Matrice du module](../../matrices/10-couts-analytiques-rentabilite.md) : consolide les composantes de coût et les règles de rentabilité.
- Relation -> [use-cases.md](../../use-cases.md) : source des cas d'usage de calcul de coût et de marge.
- Relation -> [functionnal-requirements.md](../../functionnal-requirements.md) : formalise les exigences de consolidation et de consultation.
- Relation -> [business-rules.md](../../business-rules.md) : précise les règles d'agrégation, de traçabilité et de comparaison budget/réel.
- Relation -> [state-transitions.md](../../state-transitions.md) : aligne les états de calcul, de consolidation et d'actualisation.

## Liens inter-modules

- Relation -> [07-execution-terrain-ordres-de-travail/02-execution-terrain.md](../07-execution-terrain-ordres-de-travail/02-execution-terrain.md) : l'exécution terrain fournit une partie des coûts réels.
- Relation -> [09-temps-ressources-pointage/03-validation-consultation-pointage.md](../09-temps-ressources-pointage/03-validation-consultation-pointage.md) : les pointages validés sont la base du coût analytique.
- Relation -> [11-btp-avancement-attachements-situations/02-situation-validation.md](../11-btp-avancement-attachements-situations/02-situation-validation.md) : la consolidation se compare aux situations BTP validées.
- Relation -> [12-facturation/03-consultation-correction-facture.md](../12-facturation/03-consultation-correction-facture.md) : la marge doit rester cohérente avec les revenus facturés et les corrections.

## Liens internes

- Relation -> [01-cout-reel-intervention.md](./01-cout-reel-intervention.md) : détaille le calcul du coût réel par intervention.
- Relation -> [02-consolidation-cout-complet.md](./02-consolidation-cout-complet.md) : agrège les coûts sur un périmètre analytique.
- Relation -> [03-rentabilite-marge.md](./03-rentabilite-marge.md) : calcule et consulte la marge réelle.
