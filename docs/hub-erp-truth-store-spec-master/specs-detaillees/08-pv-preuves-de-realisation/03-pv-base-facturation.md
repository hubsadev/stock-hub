# PV / Preuves de réalisation - PV comme base de facturation

## Périmètre

Valider un PV pour qu'il devienne un justificatif de facturation.

## Écran / action

### Action 1 - Valider un PV

- Écran : Fiche PV / action "Valider"
- Action : Valider le PV

### Action 2 - Marquer le PV facturable

- Écran : Fiche PV / section Facturation
- Action : Rendre le PV éligible à la facture

## Input

### Action 1 - Valider un PV

- Champ / donnée : décision de validation
- Source : valideur
- Caractère obligatoire : oui
- Remarque : peut nécessiter commentaire

### Action 2 - Marquer le PV facturable

- Champ / donnée : indicateur facturable
- Source : système / comptable
- Caractère obligatoire : oui
- Remarque : dépend du contrat et des réserves

## Traitement système

### Action 1 - Valider un PV

1. Vérifier les droits de validation.
2. Vérifier que le PV est signé et complet.
3. Passer le statut à "Validé".
4. Historiser la décision et le valideur.

### Action 2 - Marquer le PV facturable

1. Vérifier les règles contractuelles de facturation.
2. Vérifier l'absence de réserves bloquantes.
3. Marquer le PV comme éligible.
4. Rendre le PV disponible dans l'écran de facturation.

## Output

### Action 1 - Valider un PV

- Résultat visible : PV validé
- Statut affiché : Validé
- Trace créée : décision de validation historisée
- Notification éventuelle : comptabilité

### Action 2 - Marquer le PV facturable

- Résultat visible : PV éligible à facturation
- Statut affiché : Facturable / Éligible
- Trace créée : lien facturation
- Notification éventuelle : aucune

## Règle métier

### Action 1 - Valider un PV

- Règle 1 : un PV doit être signé pour être validé.
- Règle 2 : les preuves requises doivent être présentes.

### Action 2 - Marquer le PV facturable

- Règle 1 : un PV signé peut déclencher la facturation si le contrat le prévoit.
- Règle 2 : un PV avec réserves peut être facturable ou non selon politique métier.

## Exception

### Action 1 - Valider un PV

- Cas : PV non signé
  Effet attendu : validation refusée.
- Cas : PV incomplet
  Effet attendu : validation bloquée avec liste des manquants.

### Action 2 - Marquer le PV facturable

- Cas : réserve majeure
  Effet attendu : PV non facturable, statut bloqué.
- Cas : contrat interdit facturation par PV
  Effet attendu : PV non éligible, justification affichée.

## Liens documentaires

- Relation -> [README du module](./README.md) : rattache cette fiche au module PV.
- Relation -> [Matrice du module](../../matrices/08-pv-preuves-de-realisation.md) : consolide les règles d'éligibilité du PV à la facture.
- Relation -> [functionnal-requirements.md](../../functionnal-requirements.md) : explicite l'exigence de disponibilité du PV pour la facturation.
- Relation -> [state-transitions.md](../../state-transitions.md) : formalise le passage du PV à l'état facturable.
- Relation -> [business-rules.md](../../business-rules.md) : précise les conditions contractuelles et de réserve.
- Relation -> [permissions.md](../../permissions.md) : borne les droits de validation et de marquage facturable.

## Liens inter-modules

- Relation -> [12-facturation/01-facturation-par-origine.md](../12-facturation/01-facturation-par-origine.md) : un PV facturable devient une source directe de facture.
- Relation -> [12-facturation/02-modes-contractuels-specifiques.md](../12-facturation/02-modes-contractuels-specifiques.md) : le mode contractuel décide si le PV suffit à facturer.
- Relation -> [10-couts-analytiques-rentabilite/03-rentabilite-marge.md](../10-couts-analytiques-rentabilite/03-rentabilite-marge.md) : le PV facturable alimente la marge via la reconnaissance de revenu.
