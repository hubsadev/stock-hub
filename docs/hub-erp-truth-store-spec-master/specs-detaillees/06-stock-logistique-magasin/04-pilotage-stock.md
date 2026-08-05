# Stock / Logistique / Magasin - Pilotage du stock

## Périmètre

Consultation des niveaux de stock, alertes de seuil et inventaires.

## Écran / action

### Action 1 - Consulter le stock par emplacement

- Écran : Stock > Vue par emplacement
- Action : Filtrer et consulter les quantités

### Action 2 - Enregistrer un inventaire

- Écran : Stock > Inventaire
- Action : Saisir et valider un inventaire

## Input

### Action 1 - Consulter le stock par emplacement

- Emplacement ; source: sélection ; obligatoire: non ; remarque: filtre dépôt, chantier, véhicule
- Article ; source: sélection ; obligatoire: non ; remarque: filtre article

### Action 2 - Enregistrer un inventaire

- Emplacement ; source: sélection ; obligatoire: oui ; remarque: périmètre inventorié
- Articles et quantités constatées ; source: saisie ; obligatoire: oui ; remarque: quantité physique
- Date d'inventaire ; source: saisie ; obligatoire: oui ; remarque: période

## Traitement système

### Action 1 - Consulter le stock par emplacement

1. Vérifier les droits de consultation.
2. Calculer les quantités disponibles, réservées et en transit.
3. Afficher les niveaux par emplacement.
4. Déclencher une alerte si seuils atteints.

### Action 2 - Enregistrer un inventaire

1. Vérifier les droits d'inventaire.
2. Enregistrer les quantités constatées.
3. Calculer l'écart entre stock théorique et constaté.
4. Enregistrer les écarts et les ajustements si autorisés.
5. Historiser l'inventaire.

## Output

### Action 1 - Consulter le stock par emplacement

- Résultat visible : Niveaux de stock par emplacement
- Statut affiché : n/a
- Trace créée : aucune par défaut
- Notification éventuelle : alerte de seuil

### Action 2 - Enregistrer un inventaire

- Résultat visible : Inventaire enregistré et écarts visibles
- Statut affiché : n/a
- Trace créée : Historique d'inventaire
- Notification éventuelle : alerte si écart significatif

## Règle métier

### Action 1 - Consulter le stock par emplacement

- Le stock doit distinguer plusieurs emplacements logistiques.
- Le stock doit permettre la gestion de seuil d'alerte et seuil de commande.

### Action 2 - Enregistrer un inventaire

- Un inventaire doit enregistrer l'écart entre stock théorique et stock constaté.

## Exception

### Action 1 - Consulter le stock par emplacement

- Cas: article absent de l'emplacement ; Effet attendu: stock à zéro.
- Cas: seuil non configuré ; Effet attendu: pas d'alerte.

### Action 2 - Enregistrer un inventaire

- Cas: inventaire sur emplacement verrouillé ; Effet attendu: action bloquée.
- Cas: écarts majeurs ; Effet attendu: validation manuelle requise.

## Liens documentaires

- Relation -> [matrices/06-stock-logistique-magasin.md](../../matrices/06-stock-logistique-magasin.md) : cadrage du pilotage du stock, des seuils et des inventaires.
- Relation -> [business-rules.md](../../business-rules.md) : règles de seuils, de rotation, d'inventaire et de traçabilité.
- Relation -> [permissions.md](../../permissions.md) : rôles de consultation et de validation des inventaires.
- Relation -> [state-transitions.md](../../state-transitions.md) : effets des mouvements sur le stock disponible.
- Relation -> [edge-cases.md](../../edge-cases.md) : écarts majeurs, emplacement verrouillé et stock sérialisé.
- Relation -> [user-flows.md](../../user-flows.md) : parcours de suivi du stock, de l'alerte au réapprovisionnement.

## Liens inter-modules

- Relation -> [../05-achats/01-expression-de-besoin.md](../05-achats/01-expression-de-besoin.md) : le pilotage stock détermine si un besoin doit partir en DA.
- Relation -> [../05-achats/03-consultation-fournisseurs-commandes.md](../05-achats/03-consultation-fournisseurs-commandes.md) : les commandes et réceptions s'agrègent dans le coût du stock.
- Relation -> [../04-budget-pilotage-financier-projet/03-suivi-ecarts-marge.md](../04-budget-pilotage-financier-projet/03-suivi-ecarts-marge.md) : les niveaux de stock influencent les écarts de marge.
- Relation -> [../03-contrats-affaires-projets/03-affaire-rattachement-vue-consolidee.md](../03-contrats-affaires-projets/03-affaire-rattachement-vue-consolidee.md) : le stock est consulté au sein de la vue consolidée du projet.
