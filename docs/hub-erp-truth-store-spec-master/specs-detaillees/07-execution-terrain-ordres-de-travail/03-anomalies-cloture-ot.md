# Exécution terrain / Ordres de travail - Anomalies et clôture OT

## Périmètre

Signaler une anomalie, suivre sa résolution, et clôturer techniquement l'OT.

## Écran / action

### Action 1 - Signaler une anomalie

- Écran : Fiche OT / onglet Anomalies
- Action : Créer une anomalie

### Action 2 - Clôturer techniquement l'OT

- Écran : Fiche OT / bouton "Clôturer"
- Action : Clôturer l'intervention

## Input

### Action 1 - Signaler une anomalie

- Champ / donnée : type d'anomalie
- Source : sélection utilisateur
- Caractère obligatoire : oui
- Remarque : utilisé pour reporting qualité

- Champ / donnée : description
- Source : saisie utilisateur
- Caractère obligatoire : oui
- Remarque : doit être exploitable pour suivi

- Champ / donnée : photo / pièce jointe
- Source : capture mobile
- Caractère obligatoire : selon type
- Remarque : preuve terrain

### Action 2 - Clôturer techniquement l'OT

- Champ / donnée : heure de fin
- Source : système ou saisie
- Caractère obligatoire : oui
- Remarque : utilisée pour calcul de durée

- Champ / donnée : état de résolution
- Source : sélection utilisateur
- Caractère obligatoire : oui
- Remarque : partiel, complet, avec réserves

## Traitement système

### Action 1 - Signaler une anomalie

1. Vérifier les droits de création d'anomalie.
2. Enregistrer l'anomalie et la lier à l'OT.
3. Associer les preuves (photos, commentaires).
4. Marquer l'OT comme "avec anomalie" si applicable.
5. Notifier le responsable si requis.

### Action 2 - Clôturer techniquement l'OT

1. Vérifier que les checklists requises sont complètes.
2. Vérifier que les preuves obligatoires sont présentes.
3. Enregistrer l'heure de fin et le statut de résolution.
4. Passer l'OT à "Terminé techniquement".
5. Historiser la clôture.

## Output

### Action 1 - Signaler une anomalie

- Résultat visible : anomalie créée et visible dans l'OT
- Statut affiché : OT "avec anomalie" si applicable
- Trace créée : historique anomalie
- Notification éventuelle : responsable qualité/projet

### Action 2 - Clôturer techniquement l'OT

- Résultat visible : OT clôturé techniquement
- Statut affiché : Terminé techniquement
- Trace créée : fin d'intervention historisée
- Notification éventuelle : préparation PV / validation

## Règle métier

### Action 1 - Signaler une anomalie

- Règle 1 : toute anomalie détectée sur le terrain doit être enregistrable.
- Règle 2 : l'anomalie reste traçable même si non corrigée sur place.

### Action 2 - Clôturer techniquement l'OT

- Règle 1 : une intervention n'est pas clôturable si les preuves requises manquent.
- Règle 2 : la clôture technique précède la génération du PV ou la validation.

## Exception

### Action 1 - Signaler une anomalie

- Cas : anomalie sans informations minimales
  Effet attendu : blocage et demande de complétion.
- Cas : OT déjà clos
  Effet attendu : création refusée ou création en annexe selon règle.

### Action 2 - Clôturer techniquement l'OT

- Cas : checklist obligatoire incomplète
  Effet attendu : clôture bloquée.
- Cas : preuves manquantes
  Effet attendu : clôture bloquée avec message explicite.

## Liens documentaires

- Relation -> [README du module](./README.md) : situe la clôture technique dans le cycle OT.
- Relation -> [Matrice du module](../../matrices/07-execution-terrain-ordres-de-travail.md) : relie cette fiche aux statuts, règles et exceptions consolidés.
- Relation -> [state-transitions.md](../../state-transitions.md) : décrit le passage "en cours" -> "terminé techniquement".
- Relation -> [business-rules.md](../../business-rules.md) : explicite les obligations de preuve et de checklist.
- Relation -> [edge-cases.md](../../edge-cases.md) : couvre les anomalies, les cas de clôture bloquée et les réserves.

## Liens inter-modules

- Relation -> [08-pv-preuves-de-realisation/02-reserves-signature.md](../08-pv-preuves-de-realisation/02-reserves-signature.md) : les réserves terrain se retrouvent dans le PV.
- Relation -> [08-pv-preuves-de-realisation/03-pv-base-facturation.md](../08-pv-preuves-de-realisation/03-pv-base-facturation.md) : la clôture technique conditionne l'éligibilité du PV à la facturation.
- Relation -> [12-facturation/01-facturation-par-origine.md](../12-facturation/01-facturation-par-origine.md) : un OT clôturé peut devenir une base de facture via son PV.
