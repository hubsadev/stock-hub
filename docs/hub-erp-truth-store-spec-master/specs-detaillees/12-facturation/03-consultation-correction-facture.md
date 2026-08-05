# Facturation - Consultation et correction de facture

## Périmètre

Consulter l'historique des factures et corriger/annuler une facture selon les droits.

## Écran / action

### Action 1 - Consulter une facture

- Écran : Liste des factures / Fiche facture
- Action : Ouvrir la facture

### Action 2 - Corriger ou annuler une facture

- Écran : Fiche facture
- Action : Corriger / Annuler

## Input

### Action 1 - Consulter une facture

- Champ / donnée : identifiant facture, filtres (client, affaire, période)
- Source : sélection utilisateur
- Caractère obligatoire : identifiant ou filtre
- Remarque : accès selon droits

### Action 2 - Corriger ou annuler une facture

- Champ / donnée : motif, décision, commentaire
- Source : action utilisateur autorisé
- Caractère obligatoire : motif
- Remarque : décision soumise aux droits

## Traitement système

### Action 1 - Consulter une facture

1. Vérifier les droits de consultation.
2. Charger la facture et ses justificatifs.
3. Afficher les statuts et la traçabilité.

### Action 2 - Corriger ou annuler une facture

1. Vérifier les droits de correction/annulation.
2. Vérifier l'état de la facture (émise, payée, contestée).
3. Enregistrer la correction et mettre à jour le statut.
4. Conserver la trace historique (ancien et nouveau).

## Output

### Action 1 - Consulter une facture

- Résultat visible : fiche facture complète
- Statut affiché : état de la facture
- Trace créée : aucune
- Notification éventuelle : aucune

### Action 2 - Corriger ou annuler une facture

- Résultat visible : facture corrigée/annulée
- Statut affiché : corrigée / annulée
- Trace créée : historique de correction
- Notification éventuelle : information aux parties concernées

## Règle métier

### Action 1 - Consulter une facture

- Règle 1 : le reste à facturer doit être calculable à partir des éléments non facturés.
- Règle 2 : la consultation respecte les droits d'accès.

### Action 2 - Corriger ou annuler une facture

- Règle 1 : une facture annulée ou corrigée doit conserver sa traçabilité.
- Règle 2 : la correction doit être autorisée par les droits.

## Exception

### Action 1 - Consulter une facture

- Cas : facture non trouvée
  Effet attendu : message "introuvable".
- Cas : accès non autorisé
  Effet attendu : refus d'accès.

### Action 2 - Corriger ou annuler une facture

- Cas : facture déjà encaissée
  Effet attendu : correction via ajustement, annulation bloquée.
- Cas : facture contestée
  Effet attendu : statut "en litige" et correction suspendue.

## Liens documentaires

- Relation -> [README du module](./README.md) : rattache la consultation et correction au module facturation.
- Relation -> [Matrice du module](../../matrices/12-facturation.md) : consolide la traçabilité des corrections et annulations.
- Relation -> [permissions.md](../../permissions.md) : borne les droits de correction et d'annulation.
- Relation -> [state-transitions.md](../../state-transitions.md) : décrit les statuts émise, corrigée, annulée et litigieuse.
- Relation -> [edge-cases.md](../../edge-cases.md) : couvre les factures déjà encaissées ou contestées.

## Liens inter-modules

- Relation -> [10-couts-analytiques-rentabilite/03-rentabilite-marge.md](../10-couts-analytiques-rentabilite/03-rentabilite-marge.md) : toute correction de facture impacte la marge.
- Relation -> [11-btp-avancement-attachements-situations/03-historique-corrections.md](../11-btp-avancement-attachements-situations/03-historique-corrections.md) : les corrections de facture doivent rester cohérentes avec celles de situation.
- Relation -> [13-encaissement-recouvrement/02-echeances-relances.md](../13-encaissement-recouvrement/02-echeances-relances.md) : les corrections doivent être visibles dans le suivi des échéances et relances.
