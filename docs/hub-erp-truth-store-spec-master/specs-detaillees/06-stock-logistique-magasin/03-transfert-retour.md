# Stock / Logistique / Magasin - Transfert et retour

## Périmètre

Transferts de stock entre emplacements et retours de matériel vers l'entrepôt avec réintégration.

## Écran / action

### Action 1 - Enregistrer un transfert de stock

- Écran : Stock > Transfert
- Action : Enregistrer un transfert entre dépôts ou chantiers

### Action 2 - Enregistrer un retour vers l'entrepôt

- Écran : Stock > Retour
- Action : Enregistrer un retour et réintégrer le matériel

## Input

### Action 1 - Enregistrer un transfert de stock

- Origine ; source: sélection ; obligatoire: oui ; remarque: dépôt ou chantier
- Destination ; source: sélection ; obligatoire: oui ; remarque: dépôt, chantier, véhicule
- Articles et quantités ; source: saisie ; obligatoire: oui ; remarque: traçabilité requise

### Action 2 - Enregistrer un retour vers l'entrepôt

- Origine ; source: sélection ; obligatoire: oui ; remarque: chantier ou technicien
- Articles et quantités ; source: saisie ; obligatoire: oui ; remarque: état du matériel
- Motif de retour ; source: saisie ; obligatoire: non ; remarque: traçabilité

## Traitement système

### Action 1 - Enregistrer un transfert de stock

1. Vérifier les droits logistiques.
2. Vérifier la disponibilité à l'origine.
3. Créer un mouvement de sortie et un mouvement d'entrée.
4. Mettre à jour les niveaux de stock sur les deux emplacements.
5. Historiser le transfert.

### Action 2 - Enregistrer un retour vers l'entrepôt

1. Vérifier les droits de retour.
2. Enregistrer l'entrée en stock et l'état du matériel.
3. Réintégrer la quantité acceptée.
4. Historiser le retour.

## Output

### Action 1 - Enregistrer un transfert de stock

- Résultat visible : Transfert enregistré
- Statut affiché : n/a
- Trace créée : Mouvements de stock liés
- Notification éventuelle : aucune par défaut

### Action 2 - Enregistrer un retour vers l'entrepôt

- Résultat visible : Retour enregistré
- Statut affiché : n/a
- Trace créée : Mouvement de retour
- Notification éventuelle : alerte si matériel non conforme

## Règle métier

### Action 1 - Enregistrer un transfert de stock

- Le matériel transféré doit conserver sa traçabilité.
- Un mouvement de stock ne doit jamais faire perdre l'historique d'origine et de destination.

### Action 2 - Enregistrer un retour vers l'entrepôt

- Le retour de matériel vers l'entrepôt doit être autorisé pour réintégration.

## Exception

### Action 1 - Enregistrer un transfert de stock

- Cas: quantité disponible insuffisante ; Effet attendu: transfert partiel ou bloqué.
- Cas: transfert entre chantiers sans autorisation ; Effet attendu: action bloquée.

### Action 2 - Enregistrer un retour vers l'entrepôt

- Cas: matériel dégradé ; Effet attendu: retour accepté avec statut dégradé ou refus.
- Cas: matériel déjà consommé ; Effet attendu: alerte et validation manuelle.

## Liens documentaires

- Relation -> [matrices/06-stock-logistique-magasin.md](../../matrices/06-stock-logistique-magasin.md) : cadrage des transferts, retours et inventaires.
- Relation -> [state-transitions.md](../../state-transitions.md) : mouvements initiés, validés, exécutés et annulés.
- Relation -> [business-rules.md](../../business-rules.md) : règles de conservation de la traçabilité des mouvements.
- Relation -> [permissions.md](../../permissions.md) : habilitations au transfert et au retour de stock.
- Relation -> [edge-cases.md](../../edge-cases.md) : matériel dégradé, déjà consommé ou transféré sans trace.

## Liens inter-modules

- Relation -> [../01-referentiel/03-sites-depots-ressources.md](../01-referentiel/03-sites-depots-ressources.md) : les transferts reposent sur les emplacements et ressources du référentiel.
- Relation -> [../05-achats/01-expression-de-besoin.md](../05-achats/01-expression-de-besoin.md) : un besoin peut être couvert par un retour ou un transfert avant achat.
- Relation -> [../03-contrats-affaires-projets/02-structuration-projet.md](../03-contrats-affaires-projets/02-structuration-projet.md) : les mouvements sont rattachés au projet ou au chantier concerné.
- Relation -> [../06-stock-logistique-magasin/04-pilotage-stock.md](../06-stock-logistique-magasin/04-pilotage-stock.md) : les transferts et retours impactent le pilotage du stock.
