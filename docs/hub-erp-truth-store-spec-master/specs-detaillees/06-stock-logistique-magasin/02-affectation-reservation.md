# Stock / Logistique / Magasin - Affectation et réservation

## Périmètre

Réservation de stock pour une affaire ou un projet et affectation/sortie de stock vers un chantier, site ou équipe.

## Écran / action

### Action 1 - Réserver du stock

- Écran : Stock > Réservation
- Action : Créer une réservation de stock

### Action 2 - Affecter ou sortir du stock

- Écran : Stock > Sortie
- Action : Enregistrer une sortie vers chantier, site, véhicule ou technicien

## Input

### Action 1 - Réserver du stock

- Affaire / projet ; source: sélection ; obligatoire: oui ; remarque: rattachement requis
- Article ; source: sélection ; obligatoire: oui ; remarque: stock disponible
- Quantité réservée ; source: saisie ; obligatoire: oui ; remarque: <= stock disponible

### Action 2 - Affecter ou sortir du stock

- Destination (chantier, site, véhicule, technicien) ; source: sélection ; obligatoire: oui ; remarque: destination métier
- Article et quantité ; source: saisie ; obligatoire: oui ; remarque: trace des sorties
- Bon de sortie valide ; source: référence ; obligatoire: selon règle ; remarque: sortie chantier conditionnée

## Traitement système

### Action 1 - Réserver du stock

1. Vérifier les droits logistiques.
2. Vérifier la disponibilité par emplacement.
3. Créer la réservation et décrémenter le stock disponible.
4. Mettre à jour le statut de la réservation.
5. Historiser l'action.

### Action 2 - Affecter ou sortir du stock

1. Vérifier les droits et la présence d'un bon valide si requis.
2. Vérifier les quantités disponibles.
3. Créer les mouvements de stock sortants.
4. Mettre à jour la disponibilité et l'historique.

## Output

### Action 1 - Réserver du stock

- Résultat visible : Réservation enregistrée
- Statut affiché : Réservée
- Trace créée : Historique de réservation
- Notification éventuelle : aucune par défaut

### Action 2 - Affecter ou sortir du stock

- Résultat visible : Sortie enregistrée
- Statut affiché : n/a
- Trace créée : Mouvement de stock tracé
- Notification éventuelle : alerte si stock insuffisant

## Règle métier

### Action 1 - Réserver du stock

- Le stock peut être réservé pour une affaire ou un projet.
- Un stock réservé peut être réaffecté en urgence selon les règles définies.

### Action 2 - Affecter ou sortir du stock

- Une sortie de stock doit être rattachée à une destination métier identifiable.
- Une sortie chantier ne doit pas être autorisée sans bon validé.

## Exception

### Action 1 - Réserver du stock

- Cas: stock insuffisant ; Effet attendu: réservation partielle ou refusée.
- Cas: stock réservé déjà affecté ; Effet attendu: appliquer la règle de réaffectation.

### Action 2 - Affecter ou sortir du stock

- Cas: quantité demandée supérieure au disponible ; Effet attendu: blocage ou sortie partielle.
- Cas: absence de bon valide ; Effet attendu: action bloquée.

## Liens documentaires

- Relation -> [matrices/06-stock-logistique-magasin.md](../../matrices/06-stock-logistique-magasin.md) : cadrage de l'affectation, de la réservation et des sorties.
- Relation -> [business-rules.md](../../business-rules.md) : règles de réservation, de réaffectation et de sortie contrôlée.
- Relation -> [permissions.md](../../permissions.md) : rôles autorisés à réserver, affecter ou sortir le stock.
- Relation -> [state-transitions.md](../../state-transitions.md) : demandée, réservée, partiellement servie, servie et libérée.
- Relation -> [edge-cases.md](../../edge-cases.md) : stock insuffisant, stock réservé et absence de bon.

## Liens inter-modules

- Relation -> [../05-achats/01-expression-de-besoin.md](../05-achats/01-expression-de-besoin.md) : le stock disponible sert d'abord le besoin avant création de DA.
- Relation -> [../03-contrats-affaires-projets/02-structuration-projet.md](../03-contrats-affaires-projets/02-structuration-projet.md) : l'affectation de stock se rattache à la structure projet.
- Relation -> [../01-referentiel/03-sites-depots-ressources.md](../01-referentiel/03-sites-depots-ressources.md) : les sorties utilisent les emplacements et ressources référentiels.
