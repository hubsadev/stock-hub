# Achats - Consultation fournisseurs et commandes

## Périmètre

Consultation des fournisseurs, saisie des offres, comparatif, sélection et génération des commandes.

## Écran / action

### Action 1 - Saisir des offres fournisseurs

- Écran : Détail DA > Offres fournisseurs
- Action : Ajouter une offre fournisseur

### Action 2 - Comparer et sélectionner les offres

- Écran : Comparatif des offres
- Action : Sélectionner un ou plusieurs fournisseurs

### Action 3 - Générer les commandes fournisseurs

- Écran : Détail DA / Commandes
- Action : Générer un ou plusieurs bons de commande

## Input

### Action 1 - Saisir des offres fournisseurs

- Fournisseur ; source: sélection ; obligatoire: oui ; remarque: multi-fournisseurs autorisés
- Lignes d'offre ; source: saisie ; obligatoire: oui ; remarque: prix, délais, caractéristiques
- Date de validité ; source: saisie ; obligatoire: non ; remarque: période d'engagement

### Action 2 - Comparer et sélectionner les offres

- Critères de comparaison ; source: système ; obligatoire: oui ; remarque: prix, disponibilité, caractéristiques
- Fournisseurs retenus ; source: sélection ; obligatoire: oui ; remarque: un ou plusieurs

### Action 3 - Générer les commandes fournisseurs

- Lignes retenues ; source: sélection ; obligatoire: oui ; remarque: par fournisseur
- Date souhaitée ; source: saisie ; obligatoire: non ; remarque: livraison

## Traitement système

### Action 1 - Saisir des offres fournisseurs

1. Vérifier que la DA est validée.
2. Enregistrer l'offre et ses lignes.
3. Lier l'offre à la DA.
4. Historiser la saisie.

### Action 2 - Comparer et sélectionner les offres

1. Générer le comparatif des offres par critère.
2. Enregistrer les fournisseurs retenus et les lignes sélectionnées.
3. Vérifier la couverture des quantités requises.
4. Historiser la sélection.

### Action 3 - Générer les commandes fournisseurs

1. Vérifier que les lignes sont validées pour achat.
2. Créer un ou plusieurs bons de commande par fournisseur.
3. Lier les commandes à la DA et aux offres.
4. Positionner le statut des commandes sur En cours.
5. Historiser la génération.

## Output

### Action 1 - Saisir des offres fournisseurs

- Résultat visible : Offres rattachées à la DA
- Statut affiché : n/a
- Trace créée : Historique des offres
- Notification éventuelle : aucune par défaut

### Action 2 - Comparer et sélectionner les offres

- Résultat visible : Fournisseurs retenus et lignes sélectionnées
- Statut affiché : n/a
- Trace créée : Historique de sélection
- Notification éventuelle : aucune par défaut

### Action 3 - Générer les commandes fournisseurs

- Résultat visible : Bons de commande créés
- Statut affiché : Commande en cours
- Trace créée : Historique de commande
- Notification éventuelle : équipes logistiques informées si configuré

## Règle métier

### Action 1 - Saisir des offres fournisseurs

- Plusieurs fournisseurs peuvent être consultés pour un même besoin.

### Action 2 - Comparer et sélectionner les offres

- Le comparatif doit inclure au minimum prix, disponibilité et caractéristiques.
- Un même article peut être commandé chez plusieurs fournisseurs si nécessaire.

### Action 3 - Générer les commandes fournisseurs

- Une commande ne peut porter que sur des lignes validées.
- Une commande doit être traçable jusqu'au besoin d'origine.

## Exception

### Action 1 - Saisir des offres fournisseurs

- Cas: DA non validée ; Effet attendu: saisie bloquée.
- Cas: offre incomplète ; Effet attendu: erreur de validation.

### Action 2 - Comparer et sélectionner les offres

- Cas: quantités non couvertes ; Effet attendu: alerte et sélection partielle autorisée.
- Cas: fournisseur indisponible ; Effet attendu: impossibilité de sélection.

### Action 3 - Générer les commandes fournisseurs

- Cas: variation forte de prix après validation ; Effet attendu: demande de reconfirmation.
- Cas: commande partielle ; Effet attendu: statut Partielle et reliquat ouvert.

## Liens documentaires

- Relation -> [matrices/05-achats.md](../../matrices/05-achats.md) : cadrage des fournisseurs, comparatifs et commandes.
- Relation -> [use-cases.md](../../use-cases.md) : consultation des offres et génération de commandes.
- Relation -> [functionnal-requirements.md](../../functionnal-requirements.md) : exigences de sélection fournisseurs et de suivi des commandes.
- Relation -> [business-rules.md](../../business-rules.md) : comparaison des offres, rattachement et commande traçable.
- Relation -> [state-transitions.md](../../state-transitions.md) : validation, partiellement commandée, commandée, clôturée.
- Relation -> [user-flows.md](../../user-flows.md) : parcours consultation fournisseur -> choix -> commande.

## Liens inter-modules

- Relation -> [../01-referentiel/01-tiers.md](../01-referentiel/01-tiers.md) : les fournisseurs proviennent du référentiel tiers.
- Relation -> [../01-referentiel/02-articles-prestations.md](../01-referentiel/02-articles-prestations.md) : les lignes de commande reprennent les articles et prestations du besoin.
- Relation -> [../04-budget-pilotage-financier-projet/03-suivi-ecarts-marge.md](../04-budget-pilotage-financier-projet/03-suivi-ecarts-marge.md) : les commandes impactent le suivi des écarts et de la marge.
- Relation -> [../06-stock-logistique-magasin/01-reception-fournisseur.md](../06-stock-logistique-magasin/01-reception-fournisseur.md) : la commande fournisseur alimente la réception et la mise à jour du stock.
