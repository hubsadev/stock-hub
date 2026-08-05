# Achats - Demande d'achat et validation

## Périmètre

Création de la demande d'achat (DA) sur le manque, soumission au circuit de validation et décision d'approbation.

## Écran / action

### Action 1 - Créer une demande d'achat

- Écran : Expression de besoin > Action "Créer DA"
- Action : Générer une DA sur le reliquat non couvert

### Action 2 - Soumettre une DA à validation

- Écran : Détail DA
- Action : Soumettre à validation

### Action 3 - Valider ou rejeter une DA

- Écran : File de validation achats
- Action : Approuver ou rejeter

## Input

### Action 1 - Créer une demande d'achat

- Expression de besoin ; source: contexte ; obligatoire: oui ; remarque: reliquat non couvert
- Articles / prestations et quantités ; source: besoin ; obligatoire: oui ; remarque: lignes DA
- Rattachement affaire / projet / stock central ; source: contexte ; obligatoire: oui ; remarque: traçabilité

### Action 2 - Soumettre une DA à validation

- Commentaire de soumission ; source: saisie ; obligatoire: non ; remarque: justification

### Action 3 - Valider ou rejeter une DA

- Décision ; source: sélection ; obligatoire: oui ; remarque: approuver ou rejeter
- Commentaire ; source: saisie ; obligatoire: selon règle ; remarque: requis si rejet

## Traitement système

### Action 1 - Créer une demande d'achat

1. Vérifier les droits de création de DA.
2. Vérifier que le stock ne couvre pas le reliquat.
3. Générer la référence DA et enregistrer les lignes.
4. Positionner le statut sur Brouillon.
5. Historiser la création et le lien au besoin.

### Action 2 - Soumettre une DA à validation

1. Vérifier la complétude des champs obligatoires.
2. Appliquer le circuit de validation défini.
3. Changer le statut à Soumise.
4. Notifier les valideurs concernés.

### Action 3 - Valider ou rejeter une DA

1. Vérifier les droits du valideur.
2. Enregistrer la décision et le commentaire.
3. Mettre à jour le statut à Validée ou Rejetée.
4. Déverrouiller les actions d'achat si validée.
5. Historiser la décision.

## Output

### Action 1 - Créer une demande d'achat

- Résultat visible : DA créée avec référence
- Statut affiché : Brouillon
- Trace créée : Historique de création
- Notification éventuelle : aucune par défaut

### Action 2 - Soumettre une DA à validation

- Résultat visible : DA en attente de validation
- Statut affiché : Soumise
- Trace créée : Historique de soumission
- Notification éventuelle : valideurs alertés

### Action 3 - Valider ou rejeter une DA

- Résultat visible : Décision visible sur la DA
- Statut affiché : Validée ou Rejetée
- Trace créée : Historique de décision
- Notification éventuelle : demandeur informé

## Règle métier

### Action 1 - Créer une demande d'achat

- Une demande d'achat ne porte que sur le besoin non couvert par le stock.
- Tout achat doit être rattaché à un projet, une affaire ou un stock central.

### Action 2 - Soumettre une DA à validation

- Une DA doit suivre le circuit de validation défini avant engagement fournisseur.

### Action 3 - Valider ou rejeter une DA

- Les validations dépendent des seuils et des rôles habilités.
- Une DA validée est la seule base autorisée pour la commande fournisseur.

## Exception

### Action 1 - Créer une demande d'achat

- Cas: reliquat nul ; Effet attendu: création DA bloquée.
- Cas: lignes de besoin invalides ; Effet attendu: erreur de validation.

### Action 2 - Soumettre une DA à validation

- Cas: circuit non configuré ; Effet attendu: soumission bloquée.
- Cas: DA incomplète ; Effet attendu: message d'erreur.

### Action 3 - Valider ou rejeter une DA

- Cas: valideur non autorisé ; Effet attendu: action refusée.
- Cas: DA déjà traitée ; Effet attendu: double décision bloquée.

## Liens documentaires

- Relation -> [matrices/05-achats.md](../../matrices/05-achats.md) : cadrage de la DA, de la validation et du passage à l'achat.
- Relation -> [business-rules.md](../../business-rules.md) : règles de validation, de seuil et d'engagement fournisseur.
- Relation -> [permissions.md](../../permissions.md) : profils habilités à soumettre, valider ou rejeter la DA.
- Relation -> [state-transitions.md](../../state-transitions.md) : brouillon, soumise, validée, rejetée, commandée.
- Relation -> [edge-cases.md](../../edge-cases.md) : circuit non configuré, DA incomplète, décision multiple.

## Liens inter-modules

- Relation -> [../04-budget-pilotage-financier-projet/02-validation-revision-budget.md](../04-budget-pilotage-financier-projet/02-validation-revision-budget.md) : la DA ne peut être engagée que si le budget reste valide.
- Relation -> [../03-contrats-affaires-projets/03-affaire-rattachement-vue-consolidee.md](../03-contrats-affaires-projets/03-affaire-rattachement-vue-consolidee.md) : la DA se relie à l'affaire ou au projet consulté en vue consolidée.
- Relation -> [../06-stock-logistique-magasin/01-reception-fournisseur.md](../06-stock-logistique-magasin/01-reception-fournisseur.md) : une DA validée peut se transformer en commande puis en réception.
