# Achats - Expression de besoin

## Périmètre

Saisie d'un besoin terrain et affectation éventuelle du stock disponible avant lancement d'une demande d'achat.

## Écran / action

### Action 1 - Créer une expression de besoin

- Écran : Formulaire Expression de besoin
- Action : Enregistrer le besoin

### Action 2 - Affecter le stock disponible

- Écran : Détail expression de besoin
- Action : Affecter le stock disponible au besoin validé

## Input

### Action 1 - Créer une expression de besoin

- Demandeur ; source: utilisateur connecté ; obligatoire: oui ; remarque: rôle terrain ou chef de projet
- Affaire / projet / stock central ; source: sélection ; obligatoire: oui ; remarque: rattachement obligatoire
- Articles ou prestations ; source: sélection ; obligatoire: oui ; remarque: multi-lignes
- Quantité et caractéristiques ; source: saisie ; obligatoire: oui ; remarque: format numérique
- Date souhaitée ; source: saisie ; obligatoire: non ; remarque: planification

### Action 2 - Affecter le stock disponible

- Articles disponibles ; source: stock ; obligatoire: oui ; remarque: dépend du stock réel
- Quantité affectée ; source: saisie ; obligatoire: oui ; remarque: <= stock disponible

## Traitement système

### Action 1 - Créer une expression de besoin

1. Vérifier les droits de création de besoin.
2. Vérifier la validité des articles et du rattachement.
3. Enregistrer l'expression de besoin et générer une référence.
4. Positionner le statut sur Brouillon ou Soumise selon l'action.
5. Historiser la création.

### Action 2 - Affecter le stock disponible

1. Vérifier les droits logistiques.
2. Vérifier les quantités disponibles par emplacement.
3. Créer les mouvements de stock d'affectation.
4. Mettre à jour le statut du besoin comme Servi sur stock ou Partiellement servi.
5. Historiser l'affectation.

## Output

### Action 1 - Créer une expression de besoin

- Résultat visible : Expression de besoin créée
- Statut affiché : Brouillon ou Soumise
- Trace créée : Historique du besoin
- Notification éventuelle : aucune par défaut

### Action 2 - Affecter le stock disponible

- Résultat visible : Mouvement de stock enregistré
- Statut affiché : Servi sur stock ou Partiellement servi
- Trace créée : Historique d'affectation
- Notification éventuelle : alerte si reliquat non couvert

## Règle métier

### Action 1 - Créer une expression de besoin

- Tout besoin doit être rattaché à un projet, une affaire ou un stock central.
- Le besoin doit être confronté au stock disponible avant achat.

### Action 2 - Affecter le stock disponible

- Le stock disponible peut être affecté sans création de demande d'achat.
- La demande d'achat ne porte que sur le besoin non couvert.

## Exception

### Action 1 - Créer une expression de besoin

- Cas: article inactif ; Effet attendu: création bloquée.
- Cas: rattachement manquant ; Effet attendu: erreur de validation.

### Action 2 - Affecter le stock disponible

- Cas: stock insuffisant ; Effet attendu: affectation partielle et reliquat.
- Cas: stock réservé ; Effet attendu: appliquer la règle de réaffectation.

## Liens documentaires

- Relation -> [matrices/05-achats.md](../../matrices/05-achats.md) : cadrage de l'expression de besoin et du contrôle du stock.
- Relation -> [use-cases.md](../../use-cases.md) : création du besoin et bascule éventuelle vers la demande d'achat.
- Relation -> [user-stories.md](../../user-stories.md) : besoin terrain, service stock et demande d'achat.
- Relation -> [permissions.md](../../permissions.md) : profils autorisés à saisir un besoin et à affecter le stock.
- Relation -> [edge-cases.md](../../edge-cases.md) : besoin partiellement couvert, stock réservé, article inactif.
- Relation -> [user-flows.md](../../user-flows.md) : parcours besoin -> stock -> reliquat -> DA.

## Liens inter-modules

- Relation -> [../01-referentiel/02-articles-prestations.md](../01-referentiel/02-articles-prestations.md) : les articles et prestations du besoin proviennent du référentiel.
- Relation -> [../01-referentiel/03-sites-depots-ressources.md](../01-referentiel/03-sites-depots-ressources.md) : le besoin peut être rattaché à un site, un chantier ou un dépôt.
- Relation -> [../04-budget-pilotage-financier-projet/01-budget-initial.md](../04-budget-pilotage-financier-projet/01-budget-initial.md) : le besoin doit rester compatible avec le budget validé.
- Relation -> [../06-stock-logistique-magasin/04-pilotage-stock.md](../06-stock-logistique-magasin/04-pilotage-stock.md) : l'affectation du stock s'appuie sur les niveaux et seuils logistiques.
