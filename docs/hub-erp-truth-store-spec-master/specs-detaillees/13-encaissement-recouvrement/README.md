# Module 13 - Encaissement / Recouvrement

## Vue d'ensemble

Ce module couvre l'enregistrement des règlements clients, le suivi des échéances et les actions de recouvrement, ainsi que le rapprochement paiements / factures.

## Fiches

- [01-encaissement-client.md](./01-encaissement-client.md)
- [02-echeances-relances.md](./02-echeances-relances.md)
- [03-rapprochement-tresorerie.md](./03-rapprochement-tresorerie.md)
## Liens documentaires

- Relation -> [GRAPHE-DOCUMENTAIRE.md](../GRAPHE-DOCUMENTAIRE.md) : vue synthétique des dépendances principales du module dans le graphe global
- Relation -> [Matrice module 13](../../matrices/13-encaissement-recouvrement.md) : synthèse structurée des objets métier, use cases, règles, permissions et états du module
- Relation -> [use-cases.md](../../use-cases.md) : cas d’usage de référence du module pour encaissement / recouvrement
- Relation -> [user-stories.md](../../user-stories.md) : attentes exprimées côté utilisateur pour encaissement / recouvrement
- Relation -> [functionnal-requirements.md](../../functionnal-requirements.md) : exigences fonctionnelles à décliner pour encaissement / recouvrement
- Relation -> [business-rules.md](../../business-rules.md) : règles métier structurantes pour encaissement / recouvrement
- Relation -> [permissions.md](../../permissions.md) : habilitations et rôles associés pour encaissement / recouvrement
- Relation -> [state-transitions.md](../../state-transitions.md) : transitions d’état concernées pour encaissement / recouvrement
- Relation -> [edge-cases.md](../../edge-cases.md) : cas limites à rejouer en recette pour encaissement / recouvrement
- Relation -> [user-flows.md](../../user-flows.md) : parcours opérationnels de référence pour encaissement / recouvrement

## Liens inter-modules

- Relation -> [Module 12 - Facturation](../12-facturation/README.md) : les encaissements s’adossent aux factures émises et aux corrections de facture
- Relation -> [03-consultation-correction-facture.md](../12-facturation/03-consultation-correction-facture.md) : les corrections de facture peuvent modifier le rapprochement et le solde à encaisser
- Relation -> [Module 16 - Gouvernance / Validation / Contrôle interne](../16-gouvernance-validation-controle-interne/README.md) : les actions de recouvrement et leurs exceptions doivent être tracées et éventuellement validées
- Relation -> [Module 17 - Reporting / KPI / Direction](../17-reporting-kpi-direction/README.md) : les encaissements alimentent le DSO, le reste à encaisser et les KPI direction
- Relation -> [Module 18 - Vue transverse Affaire / Projet](../18-vue-transverse-affaire-projet/README.md) : la vue projet consolide le statut financier par affaire et par projet

## Liens internes

- Relation -> [01-encaissement-client.md](./01-encaissement-client.md) : point d’entrée pour enregistrer un règlement et l’imputer à une facture
- Relation -> [02-echeances-relances.md](./02-echeances-relances.md) : utilise les encaissements pour piloter les relances et le recouvrement
- Relation -> [03-rapprochement-tresorerie.md](./03-rapprochement-tresorerie.md) : consolide les flux encaissés et le reste à recouvrer

