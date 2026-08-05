# Budget / Pilotage financier projet - Budget initial

## Périmètre

Création d'un budget initial par affaire ou projet, structuré par postes de coût.

## Écran / action

### Action 1 - Enregistrer un budget initial

- Écran : Fiche affaire / projet > onglet Budget
- Action : Créer et enregistrer un budget initial

### Action 2 - Ajouter ou modifier un poste de coût

- Écran : Détail budget > Postes de coût
- Action : Ajouter ou modifier un poste (main-d'oeuvre, achats, sous-traitance, logistique, divers)

## Input

### Action 1 - Enregistrer un budget initial

- Affaire ou projet ; source: sélection ; obligatoire: oui ; remarque: rattachement analytique requis
- Centre de coût (si applicable) ; source: sélection ; obligatoire: selon modèle ; remarque: dépend du périmètre
- Version budget ; source: système ; obligatoire: oui ; remarque: version initiale

### Action 2 - Ajouter ou modifier un poste de coût

- Poste de coût ; source: sélection ; obligatoire: oui ; remarque: liste paramétrée
- Montant budgété ; source: saisie ; obligatoire: oui ; remarque: format monétaire
- Commentaire ; source: saisie ; obligatoire: non ; remarque: justification métier

## Traitement système

### Action 1 - Enregistrer un budget initial

1. Vérifier les droits de création budgétaire.
2. Vérifier que l'affaire ou le projet est actif.
3. Créer l'entité budget initial et lui attribuer une référence.
4. Positionner le statut sur Brouillon.
5. Historiser la création et l'auteur.

### Action 2 - Ajouter ou modifier un poste de coût

1. Vérifier que le budget est en Brouillon ou Révisé modifiable.
2. Enregistrer ou mettre à jour la ligne budgétaire.
3. Recalculer les totaux budgétés.
4. Historiser la modification du budget.

## Output

### Action 1 - Enregistrer un budget initial

- Résultat visible : Budget initial créé et visible dans la fiche projet/affaire
- Statut affiché : Brouillon
- Trace créée : Historique de création
- Notification éventuelle : aucune par défaut

### Action 2 - Ajouter ou modifier un poste de coût

- Résultat visible : Ligne budgétaire ajoutée ou mise à jour
- Statut affiché : inchangé
- Trace créée : Historique de modification
- Notification éventuelle : aucune par défaut

## Règle métier

### Action 1 - Enregistrer un budget initial

- Un budget doit être rattaché à une affaire, un projet ou un centre de coût.
- Le budget initial doit rester consultable même après révision.

### Action 2 - Ajouter ou modifier un poste de coût

- Le budget doit être structuré par postes de coût.
- Les montants doivent être comparables par poste sur tout le cycle.

## Exception

### Action 1 - Enregistrer un budget initial

- Cas: affaire ou projet inactif ; Effet attendu: création bloquée avec message.
- Cas: utilisateur non autorisé ; Effet attendu: accès refusé.

### Action 2 - Ajouter ou modifier un poste de coût

- Cas: budget déjà validé et verrouillé ; Effet attendu: modification bloquée.
- Cas: poste de coût non autorisé ; Effet attendu: erreur de validation.

## Liens documentaires

- Relation -> [matrices/04-budget-pilotage-financier-projet.md](../../matrices/04-budget-pilotage-financier-projet.md) : cadrage du budget initial et des postes de coût.
- Relation -> [use-cases.md](../../use-cases.md) : création d'un budget initial et affectation par poste.
- Relation -> [functionnal-requirements.md](../../functionnal-requirements.md) : exigences de structure budgétaire et d'enregistrement.
- Relation -> [business-rules.md](../../business-rules.md) : validation préalable aux achats et rattachement obligatoire.
- Relation -> [permissions.md](../../permissions.md) : rôles autorisés à créer ou modifier un budget brouillon.

## Liens inter-modules

- Relation -> [../03-contrats-affaires-projets/02-structuration-projet.md](../03-contrats-affaires-projets/02-structuration-projet.md) : le budget initial se rattache au projet structuré.
- Relation -> [../02-avant-vente/02-etude-et-chiffrage.md](../02-avant-vente/02-etude-et-chiffrage.md) : le chiffrage commercial alimente le budget initial.
- Relation -> [../05-achats/02-da-validation.md](../05-achats/02-da-validation.md) : les demandes d'achat doivent respecter le budget validé.
