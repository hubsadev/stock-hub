# Encaissement / Recouvrement - Échéances et relances

## Périmètre

Suivre les échéances de paiement, identifier les impayés et déclencher des relances tracées.

## Écran / action

### Action 1 - Consulter les échéances

- Écran : Tableau de bord recouvrement
- Action : Filtrer et consulter les échéances

### Action 2 - Déclencher une relance

- Écran : Dossier client / Facture échue
- Action : Enregistrer une relance

## Input

### Action 1 - Consulter les échéances

- Champ / donnée : période, client, statut de paiement, montant, canal
- Source : utilisateur comptable
- Caractère obligatoire : période ou filtre par statut
- Remarque : la vue doit respecter le périmètre d'accès

### Action 2 - Déclencher une relance

- Champ / donnée : facture(s) ciblée(s), type de relance, canal, message, date
- Source : utilisateur comptable
- Caractère obligatoire : facture(s), type de relance
- Remarque : une relance peut couvrir plusieurs factures d'un même client

## Traitement système

### Action 1 - Consulter les échéances

1. Vérifier les droits d'accès et le périmètre client/projet.
2. Calculer les échéances et les retards à date.
3. Identifier les factures en litige ou non relançables.
4. Afficher le statut et le reste à payer.
5. Permettre un tri par ancienneté et montant.

### Action 2 - Déclencher une relance

1. Vérifier que la facture est échue et relançable.
2. Créer l'action de relance avec date et canal.
3. Mettre à jour le statut du dossier de recouvrement.
4. Historiser la relance sur la facture et le client.
5. Émettre la notification si le canal l'exige.

## Output

### Action 1 - Consulter les échéances

- Résultat visible : liste des factures échues et non échues
- Statut affiché : non échu / échu / en relance / litige
- Trace créée : aucune
- Notification éventuelle : aucune

### Action 2 - Déclencher une relance

- Résultat visible : relance enregistrée
- Statut affiché : en relance
- Trace créée : historique de relance
- Notification éventuelle : email ou message client si configuré

## Règle métier

### Action 1 - Consulter les échéances

- Le suivi des échéances doit permettre d'identifier les retards de paiement.
- Les factures en litige ne sont pas relançables par défaut.

### Action 2 - Déclencher une relance

- Les relances doivent être historisées.
- Une relance doit être rattachée à une facture et un client.

## Exception

### Action 1 - Consulter les échéances

- Cas : client hors périmètre
  Effet attendu : données masquées
- Cas : facture sans échéance définie
  Effet attendu : signalement dans la vue de contrôle

### Action 2 - Déclencher une relance

- Cas : facture en litige
  Effet attendu : relance bloquée, motif affiché
- Cas : relance déjà envoyée récemment
  Effet attendu : avertissement et confirmation requise
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

- Relation -> [01-facturation-par-origine.md](../../12-facturation/01-facturation-par-origine.md) : les échéances à relancer dérivent des factures émises par origine métier
- Relation -> [01-circuits-validation.md](../../16-gouvernance-validation-controle-interne/01-circuits-validation.md) : certaines relances ou remises peuvent nécessiter une validation préalable
- Relation -> [02-kpi-projet-finance.md](../../17-reporting-kpi-direction/02-kpi-projet-finance.md) : les retards de paiement alimentent les indicateurs projet et finance

