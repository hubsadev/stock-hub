# Budget / Pilotage financier projet - Validation et révision

## Périmètre

Soumission d'un budget à validation, décision de validation ou rejet, et création d'une révision budgétaire.

## Écran / action

### Action 1 - Soumettre un budget à validation

- Écran : Détail budget
- Action : Soumettre à validation

### Action 2 - Valider ou rejeter un budget

- Écran : File de validation budget
- Action : Approuver ou rejeter

### Action 3 - Créer une révision budgétaire

- Écran : Détail budget validé
- Action : Créer une version révisée

## Input

### Action 1 - Soumettre un budget à validation

- Budget ; source: contexte ; obligatoire: oui ; remarque: budget en brouillon
- Commentaire de soumission ; source: saisie ; obligatoire: non ; remarque: justification

### Action 2 - Valider ou rejeter un budget

- Décision ; source: sélection ; obligatoire: oui ; remarque: valider ou rejeter
- Commentaire de décision ; source: saisie ; obligatoire: selon règle ; remarque: requis si rejet

### Action 3 - Créer une révision budgétaire

- Motif de révision ; source: saisie ; obligatoire: oui ; remarque: traçabilité
- Postes impactés ; source: sélection ; obligatoire: oui ; remarque: au moins un poste

## Traitement système

### Action 1 - Soumettre un budget à validation

1. Vérifier les droits de soumission.
2. Vérifier la complétude des postes de coût obligatoires.
3. Changer le statut du budget à Soumis à validation.
4. Notifier les valideurs selon le circuit.
5. Historiser la soumission.

### Action 2 - Valider ou rejeter un budget

1. Vérifier les droits de validation.
2. Enregistrer la décision et le commentaire.
3. Mettre à jour le statut à Validé ou Rejeté.
4. Déclencher les actions aval autorisées si validé.
5. Historiser la décision.

### Action 3 - Créer une révision budgétaire

1. Vérifier que la version active est validée.
2. Créer une nouvelle version révisée liée au budget initial.
3. Positionner la version révisée en Brouillon.
4. Préserver l'historique des versions précédentes.

## Output

### Action 1 - Soumettre un budget à validation

- Résultat visible : Budget en attente de validation
- Statut affiché : Soumis à validation
- Trace créée : Historique de soumission
- Notification éventuelle : valideurs alertés

### Action 2 - Valider ou rejeter un budget

- Résultat visible : Décision enregistrée
- Statut affiché : Validé ou Rejeté
- Trace créée : Historique de décision
- Notification éventuelle : demandeur informé

### Action 3 - Créer une révision budgétaire

- Résultat visible : Nouvelle version budgétaire créée
- Statut affiché : Brouillon
- Trace créée : Historique de version
- Notification éventuelle : aucune par défaut

## Règle métier

### Action 1 - Soumettre un budget à validation

- Un budget doit être validé avant le lancement des achats soumis à budget.
- Le circuit de validation dépend des seuils définis.

### Action 2 - Valider ou rejeter un budget

- Toute décision de validation ou rejet doit être tracée.
- Un budget rejeté peut être corrigé et resoumis.

### Action 3 - Créer une révision budgétaire

- Une affaire peut avoir un budget initial et plusieurs budgets révisés.
- Le budget initial ne doit pas être écrasé par la révision.

## Exception

### Action 1 - Soumettre un budget à validation

- Cas: budget incomplet ; Effet attendu: soumission bloquée.
- Cas: circuit de validation non configuré ; Effet attendu: erreur et blocage.

### Action 2 - Valider ou rejeter un budget

- Cas: valideur non habilité ; Effet attendu: action refusée.
- Cas: budget déjà validé ; Effet attendu: décision bloquée ou double validation empêchée.

### Action 3 - Créer une révision budgétaire

- Cas: budget non validé ; Effet attendu: création de révision bloquée.
- Cas: dépassement de seuil imposant une nouvelle validation ; Effet attendu: révision soumise après création.

## Liens documentaires

- Relation -> [matrices/04-budget-pilotage-financier-projet.md](../../matrices/04-budget-pilotage-financier-projet.md) : cadrage de la validation et de la révision budgétaire.
- Relation -> [state-transitions.md](../../state-transitions.md) : brouillon, soumis, validé, rejeté, révisé et remplacé.
- Relation -> [business-rules.md](../../business-rules.md) : règles de validation, de révision et de remplacement de version.
- Relation -> [permissions.md](../../permissions.md) : rôles autorisés à valider ou rejeter le budget.
- Relation -> [edge-cases.md](../../edge-cases.md) : budget non validé, seuil dépassé et révision bloquée.

## Liens inter-modules

- Relation -> [../05-achats/02-da-validation.md](../05-achats/02-da-validation.md) : le budget validé autorise ou bloque les demandes d'achat.
- Relation -> [../05-achats/03-consultation-fournisseurs-commandes.md](../05-achats/03-consultation-fournisseurs-commandes.md) : les commandes fournisseur doivent rester comparables au budget révisé.
- Relation -> [../03-contrats-affaires-projets/03-affaire-rattachement-vue-consolidee.md](../03-contrats-affaires-projets/03-affaire-rattachement-vue-consolidee.md) : les écarts budgétaires remontent dans la vue consolidée du projet.
