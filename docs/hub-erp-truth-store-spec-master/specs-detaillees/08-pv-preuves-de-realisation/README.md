# Module 8 - PV / Preuves de réalisation

Spécifications détaillées de la production des PV, des réserves, de la signature et du lien facturation.

## Fiches

- [01-generation-pv.md](./01-generation-pv.md)
- [02-reserves-signature.md](./02-reserves-signature.md)
- [03-pv-base-facturation.md](./03-pv-base-facturation.md)

## Liens documentaires

- Relation -> [README du module](./README.md) : point d'entrée du module PV et des preuves de réalisation.
- Relation -> [Matrice du module](../../matrices/08-pv-preuves-de-realisation.md) : consolide les objets métier, règles et use cases du module.
- Relation -> [use-cases.md](../../use-cases.md) : source des cas de création PV, de signature et de validation.
- Relation -> [business-rules.md](../../business-rules.md) : formalise les conditions de signature, de réserve et de facturabilité.
- Relation -> [state-transitions.md](../../state-transitions.md) : décrit les passages brouillon -> signé -> validé -> facturable.
- Relation -> [edge-cases.md](../../edge-cases.md) : couvre les réserves majeures, l'absence de signature et les blocages de facturation.

## Liens inter-modules

- Relation -> [07-execution-terrain-ordres-de-travail/03-anomalies-cloture-ot.md](../07-execution-terrain-ordres-de-travail/03-anomalies-cloture-ot.md) : le PV découle de la clôture technique et des anomalies terrain.
- Relation -> [12-facturation/01-facturation-par-origine.md](../12-facturation/01-facturation-par-origine.md) : le PV validé peut servir de base de facture.
- Relation -> [12-facturation/02-modes-contractuels-specifiques.md](../12-facturation/02-modes-contractuels-specifiques.md) : le mode contractuel décide si le PV suffit à facturer.
- Relation -> [12-facturation/03-consultation-correction-facture.md](../12-facturation/03-consultation-correction-facture.md) : les corrections de facture doivent conserver le lien au PV d'origine.

## Liens internes

- Relation -> [01-generation-pv.md](./01-generation-pv.md) : transforme un OT clôturé en PV exploitable.
- Relation -> [02-reserves-signature.md](./02-reserves-signature.md) : formalise les réserves et la signature client.
- Relation -> [03-pv-base-facturation.md](./03-pv-base-facturation.md) : traite l'éligibilité du PV à la facturation.
