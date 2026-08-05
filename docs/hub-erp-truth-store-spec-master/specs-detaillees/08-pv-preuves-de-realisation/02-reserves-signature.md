# PV / Preuves de réalisation - Réserves et signature

## Périmètre

Gérer les réserves et la signature client pour finaliser la preuve d'exécution.

## Écran / action

### Action 1 - Ajouter des réserves

- Écran : Fiche PV / onglet Réserves
- Action : Enregistrer une réserve

### Action 2 - Faire signer le PV

- Écran : Fiche PV / bouton "Signature client"
- Action : Capturer la signature

## Input

### Action 1 - Ajouter des réserves

- Champ / donnée : description de la réserve
- Source : saisie équipe ou client
- Caractère obligatoire : oui
- Remarque : impacte la facturabilité selon politique métier

- Champ / donnée : gravité / type
- Source : sélection
- Caractère obligatoire : non
- Remarque : mineure ou majeure si applicable

### Action 2 - Faire signer le PV

- Champ / donnée : signature client
- Source : capture tactile
- Caractère obligatoire : oui
- Remarque : inclure nom et date

## Traitement système

### Action 1 - Ajouter des réserves

1. Vérifier que le PV est modifiable.
2. Enregistrer la réserve et la lier au PV.
3. Mettre à jour le statut si la réserve bloque la validation.
4. Historiser la modification.

### Action 2 - Faire signer le PV

1. Vérifier que le PV est complet et prêt à signature.
2. Enregistrer la signature et l'horodatage.
3. Verrouiller les champs critiques du PV.
4. Passer le statut à "Signé".

## Output

### Action 1 - Ajouter des réserves

- Résultat visible : réserve visible dans la fiche PV
- Statut affiché : Brouillon / Avec réserves
- Trace créée : historique réserve
- Notification éventuelle : projet ou support si réserve majeure

### Action 2 - Faire signer le PV

- Résultat visible : signature affichée avec date
- Statut affiché : Signé
- Trace créée : preuve de signature
- Notification éventuelle : déclenchement workflow facturation si applicable

## Règle métier

### Action 1 - Ajouter des réserves

- Règle 1 : un PV peut contenir des réserves.
- Règle 2 : une réserve majeure peut bloquer la facturation selon contrat.

### Action 2 - Faire signer le PV

- Règle 1 : un PV signé constitue une preuve d'exécution.
- Règle 2 : la signature doit être conservée et consultable.

## Exception

### Action 1 - Ajouter des réserves

- Cas : PV déjà signé
  Effet attendu : modification refusée ou création d'avenant selon règle.
- Cas : réserve sans description
  Effet attendu : enregistrement bloqué.

### Action 2 - Faire signer le PV

- Cas : client absent ou refuse de signer
  Effet attendu : PV reste non signé, statut adapté, action de suivi requise.
- Cas : signature hors ligne
  Effet attendu : signature enregistrée localement puis synchronisée.

## Liens documentaires

- Relation -> [README du module](./README.md) : situe les réserves et la signature dans le cycle du PV.
- Relation -> [Matrice du module](../../matrices/08-pv-preuves-de-realisation.md) : aligne cette fiche avec les règles de preuve et de signature.
- Relation -> [business-rules.md](../../business-rules.md) : formalise l'impact des réserves sur la facturabilité.
- Relation -> [user-flows.md](../../user-flows.md) : décrit le chemin de validation et de signature du client.
- Relation -> [edge-cases.md](../../edge-cases.md) : couvre le refus de signer et les signatures hors ligne.

## Liens inter-modules

- Relation -> [12-facturation/01-facturation-par-origine.md](../12-facturation/01-facturation-par-origine.md) : un PV signé et sans réserve bloquante peut alimenter la facture.
- Relation -> [12-facturation/03-consultation-correction-facture.md](../12-facturation/03-consultation-correction-facture.md) : les réserves et contestations doivent rester visibles dans les corrections de facture.
