# Stock / Logistique / Magasin - Réception fournisseur

## Périmètre

Enregistrement des réceptions fournisseurs, partielles ou totales, avec impact stock et traçabilité.

## Écran / action

### Action 1 - Enregistrer une réception fournisseur

- Écran : Commande fournisseur > Réception
- Action : Enregistrer les quantités reçues

### Action 2 - Clôturer une réception totale

- Écran : Détail réception
- Action : Clôturer la réception lorsque toutes les lignes sont reçues

## Input

### Action 1 - Enregistrer une réception fournisseur

- Commande fournisseur ; source: sélection ; obligatoire: oui ; remarque: statut en cours
- Quantités reçues par ligne ; source: saisie ; obligatoire: oui ; remarque: partiel possible
- Numéro de lot / série ; source: saisie ; obligatoire: selon article ; remarque: traçabilité
- Commentaire / réserve ; source: saisie ; obligatoire: non ; remarque: non-conformité

### Action 2 - Clôturer une réception totale

- Confirmation de clôture ; source: action utilisateur ; obligatoire: oui ; remarque: toutes lignes reçues

## Traitement système

### Action 1 - Enregistrer une réception fournisseur

1. Vérifier les droits magasin.
2. Vérifier la commande et les lignes ouvertes.
3. Enregistrer la réception partielle ou totale.
4. Mettre à jour les quantités reçues et le stock par emplacement.
5. Historiser la réception et les écarts éventuels.

### Action 2 - Clôturer une réception totale

1. Vérifier que toutes les lignes sont reçues.
2. Changer le statut de réception à Totale/Clôturée.
3. Mettre à jour le statut de la commande si applicable.

## Output

### Action 1 - Enregistrer une réception fournisseur

- Résultat visible : Bon de réception créé
- Statut affiché : Partielle ou Totale
- Trace créée : Historique de réception
- Notification éventuelle : alerte si écart

### Action 2 - Clôturer une réception totale

- Résultat visible : Réception clôturée
- Statut affiché : Clôturée
- Trace créée : Historique de clôture
- Notification éventuelle : aucune par défaut

## Règle métier

### Action 1 - Enregistrer une réception fournisseur

- La réception partielle doit être autorisée.
- Le matériel transféré doit conserver sa traçabilité par lot ou numéro de série si requis.

### Action 2 - Clôturer une réception totale

- La réception totale ne clôture la commande que si toutes les lignes sont reçues.

## Exception

### Action 1 - Enregistrer une réception fournisseur

- Cas: quantité reçue différente de la quantité commandée ; Effet attendu: réception partielle et écart tracé.
- Cas: matériel endommagé ou non conforme ; Effet attendu: statut Litige ou réserve.

### Action 2 - Clôturer une réception totale

- Cas: lignes manquantes ; Effet attendu: clôture bloquée.

## Liens documentaires

- Relation -> [matrices/06-stock-logistique-magasin.md](../../matrices/06-stock-logistique-magasin.md) : cadrage de la réception fournisseur et de la clôture.
- Relation -> [state-transitions.md](../../state-transitions.md) : états en attente, partielle, totale, contrôlée et clôturée.
- Relation -> [permissions.md](../../permissions.md) : droits du magasinier sur les réceptions et les litiges.
- Relation -> [business-rules.md](../../business-rules.md) : règles de réception partielle, de traçabilité et de clôture.
- Relation -> [edge-cases.md](../../edge-cases.md) : quantités différentes, lots manquants, non-conformité.

## Liens inter-modules

- Relation -> [../05-achats/03-consultation-fournisseurs-commandes.md](../05-achats/03-consultation-fournisseurs-commandes.md) : la réception consomme la commande fournisseur émise.
- Relation -> [../05-achats/02-da-validation.md](../05-achats/02-da-validation.md) : la commande reçue provient d'une DA validée.
- Relation -> [../01-referentiel/02-articles-prestations.md](../01-referentiel/02-articles-prestations.md) : les références réceptionnées proviennent du catalogue articles/prestations.
