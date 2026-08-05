# Module 12 - Facturation

Spécifications détaillées pour la création, les modes de facturation et les corrections de facture.

## Fichiers

- [01-facturation-par-origine.md](./01-facturation-par-origine.md)
- [02-modes-contractuels-specifiques.md](./02-modes-contractuels-specifiques.md)
- [03-consultation-correction-facture.md](./03-consultation-correction-facture.md)

## Liens documentaires

- Relation -> [README du module](./README.md) : point d'entrée du module facturation.
- Relation -> [Matrice du module](../../matrices/12-facturation.md) : consolide les modes, les origines et les règles de correction.
- Relation -> [use-cases.md](../../use-cases.md) : source des cas de création, de consultation et de correction de facture.
- Relation -> [user-stories.md](../../user-stories.md) : formalise le besoin métier de transformation des preuves et situations en factures.
- Relation -> [functionnal-requirements.md](../../functionnal-requirements.md) : précise les exigences de rattachement et de traçabilité.
- Relation -> [business-rules.md](../../business-rules.md) : détaille les bases de facturation autorisées par contrat.
- Relation -> [permissions.md](../../permissions.md) : borne les rôles de création, correction et annulation.
- Relation -> [state-transitions.md](../../state-transitions.md) : décrit les statuts brouillon, émis, corrigé, annulé et litigieux.

## Liens inter-modules

- Relation -> [08-pv-preuves-de-realisation/03-pv-base-facturation.md](../08-pv-preuves-de-realisation/03-pv-base-facturation.md) : le PV validé est une base de facture.
- Relation -> [11-btp-avancement-attachements-situations/02-situation-validation.md](../11-btp-avancement-attachements-situations/02-situation-validation.md) : la situation validée est une autre base de facturation.
- Relation -> [10-couts-analytiques-rentabilite/03-rentabilite-marge.md](../10-couts-analytiques-rentabilite/03-rentabilite-marge.md) : les factures constituent la base de revenu de la marge.
- Relation -> [13-encaissement-recouvrement/01-encaissement-client.md](../13-encaissement-recouvrement/01-encaissement-client.md) : la facture émise déclenche l'encaissement et le suivi du règlement.
- Relation -> [13-encaissement-recouvrement/02-echeances-relances.md](../13-encaissement-recouvrement/02-echeances-relances.md) : les échéances et relances prolongent le cycle de facturation.
- Relation -> [13-encaissement-recouvrement/03-rapprochement-tresorerie.md](../13-encaissement-recouvrement/03-rapprochement-tresorerie.md) : la facture réglée alimente le rapprochement de trésorerie.

## Liens internes

- Relation -> [01-facturation-par-origine.md](./01-facturation-par-origine.md) : crée la facture à partir d'un PV ou d'une situation.
- Relation -> [02-modes-contractuels-specifiques.md](./02-modes-contractuels-specifiques.md) : couvre les cas contractuels particuliers.
- Relation -> [03-consultation-correction-facture.md](./03-consultation-correction-facture.md) : gère la lecture, la correction et l'annulation.
