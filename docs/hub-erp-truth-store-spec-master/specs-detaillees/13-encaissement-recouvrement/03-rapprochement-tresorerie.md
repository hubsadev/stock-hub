# Encaissement / Recouvrement - Rapprochement et trésorerie

## Périmètre

Rapprocher les paiements aux factures, gérer les paiements non identifiés et afficher les montants facturés, encaissés et restant dus.

## Écran / action

### Action 1 - Rapprocher un paiement à une ou plusieurs factures

- Écran : Écran de rapprochement paiements / factures
- Action : Imputer le paiement

### Action 2 - Traiter un paiement non identifié

- Écran : File des paiements non rapprochés
- Action : Assigner ou créer un encaissement en avance

## Input

### Action 1 - Rapprocher un paiement à une ou plusieurs factures

- Champ / donnée : paiement, facture(s), montant imputé par facture, commentaire
- Source : utilisateur comptable
- Caractère obligatoire : paiement, facture(s), montants
- Remarque : un paiement peut être ventilé sur plusieurs factures

### Action 2 - Traiter un paiement non identifié

- Champ / donnée : paiement non identifié, client proposé, facture candidate, justification
- Source : utilisateur comptable
- Caractère obligatoire : décision d'affectation
- Remarque : possibilité de créer un acompte client

## Traitement système

### Action 1 - Rapprocher un paiement à une ou plusieurs factures

1. Vérifier la validité du paiement et des factures sélectionnées.
2. Contrôler que le montant imputé ne dépasse pas le montant payé.
3. Mettre à jour le solde de chaque facture.
4. Mettre à jour le statut de paiement de la facture.
5. Historiser l'opération de rapprochement.

### Action 2 - Traiter un paiement non identifié

1. Vérifier l'existence du client et des factures candidates.
2. Proposer des correspondances par montant, date, référence.
3. Enregistrer l'affectation ou créer un acompte.
4. Mettre à jour la file de paiements non rapprochés.
5. Tracer la décision et l'utilisateur.

## Output

### Action 1 - Rapprocher un paiement à une ou plusieurs factures

- Résultat visible : factures imputées et solde mis à jour
- Statut affiché : partiellement payé / payé
- Trace créée : historique de rapprochement
- Notification éventuelle : alerte interne en cas d'écart

### Action 2 - Traiter un paiement non identifié

- Résultat visible : paiement rapproché ou transformé en acompte
- Statut affiché : rapproché / en attente
- Trace créée : journal de décision
- Notification éventuelle : alerte au responsable finance si paiement non résolu

## Règle métier

### Action 1 - Rapprocher un paiement à une ou plusieurs factures

- Un paiement peut couvrir plusieurs factures.
- Un écart de montant doit être justifié et tracé.

### Action 2 - Traiter un paiement non identifié

- Un paiement sans référence claire ne doit pas rester non traité.
- Un acompte client doit être rattaché à un client identifié.

## Exception

### Action 1 - Rapprocher un paiement à une ou plusieurs factures

- Cas : paiement partiel
  Effet attendu : facture reste en statut partiellement payé
- Cas : surpaiement
  Effet attendu : création d'un avoir ou acompte selon règle

### Action 2 - Traiter un paiement non identifié

- Cas : client introuvable
  Effet attendu : paiement conservé en file d'attente
- Cas : référence de paiement invalide
  Effet attendu : demande de vérification manuelle
## Liens documentaires

- Relation -> [README du module](./README.md) : porte d’entrée du module Encaissement / Recouvrement
- Relation -> [Matrice 13-encaissement-recouvrement.md](../../matrices/13-encaissement-recouvrement.md) : correspondance consolidée entre concept, user story, règle métier et flux
- Relation -> [use-cases.md](../../use-cases.md) : cas d’usage de référence du module appliqués à cette fiche
- Relation -> [user-stories.md](../../user-stories.md) : attentes exprimées côté utilisateur appliqués à cette fiche
- Relation -> [functionnal-requirements.md](../../functionnal-requirements.md) : exigences fonctionnelles à décliner appliqués à cette fiche
- Relation -> [business-rules.md](../../business-rules.md) : règles métier structurantes appliqués à cette fiche
- Relation -> [permissions.md](../../permissions.md) : habilitations et rôles associés appliqués à cette fiche
- Relation -> [state-transitions.md](../../state-transitions.md) : transitions d’état concernées appliqués à cette fiche
- Relation -> [edge-cases.md](../../edge-cases.md) : cas limites à rejouer en recette appliqués à cette fiche
- Relation -> [user-flows.md](../../user-flows.md) : parcours opérationnels de référence appliqués à cette fiche

## Liens inter-modules

- Relation -> [03-consultation-correction-facture.md](../../12-facturation/03-consultation-correction-facture.md) : le rapprochement trésorerie dépend du montant final facturé
- Relation -> [02-kpi-projet-finance.md](../../17-reporting-kpi-direction/02-kpi-projet-finance.md) : les montants encaissés et restant dus alimentent le cockpit financier
- Relation -> [03-risques-cockpit-projet.md](../../18-vue-transverse-affaire-projet/03-risques-cockpit-projet.md) : les écarts de cash et de recouvrement doivent remonter en risque projet

