# Module 6 — Stock / Logistique / Magasin

Ce module couvre les réceptions fournisseurs, les affectations et réservations, les transferts/retours, et le pilotage des niveaux de stock.

## Fiches

- `01-reception-fournisseur.md`
- `02-affectation-reservation.md`
- `03-transfert-retour.md`
- `04-pilotage-stock.md`

## Liens documentaires

- Relation -> [matrices/06-stock-logistique-magasin.md](../../matrices/06-stock-logistique-magasin.md) : matrice source du module stock et logistique.
- Relation -> [use-cases.md](../../use-cases.md) : cas d'usage de réception, affectation, transfert et pilotage.
- Relation -> [business-rules.md](../../business-rules.md) : règles de réception, de réservation et de traçabilité des mouvements.
- Relation -> [permissions.md](../../permissions.md) : droits du magasinier et du responsable logistique.
- Relation -> [state-transitions.md](../../state-transitions.md) : statuts des réceptions, mouvements et inventaires.
- Relation -> [edge-cases.md](../../edge-cases.md) : litiges, stocks insuffisants, retours dégradés et écarts d'inventaire.
- Relation -> [user-flows.md](../../user-flows.md) : parcours de la réception fournisseur au pilotage du stock.

## Liens inter-modules

- Relation -> [../05-achats/03-consultation-fournisseurs-commandes.md](../05-achats/03-consultation-fournisseurs-commandes.md) : la réception fournisseur prolonge la commande validée.
- Relation -> [../05-achats/01-expression-de-besoin.md](../05-achats/01-expression-de-besoin.md) : le stock disponible couvre une partie du besoin avant la création de DA.
- Relation -> [../03-contrats-affaires-projets/02-structuration-projet.md](../03-contrats-affaires-projets/02-structuration-projet.md) : les affectations de stock s'ancrent dans la structure projet.
- Relation -> [../01-referentiel/03-sites-depots-ressources.md](../01-referentiel/03-sites-depots-ressources.md) : les emplacements logistiques et ressources proviennent du référentiel.

## Liens internes

- Relation -> [01-reception-fournisseur.md](./01-reception-fournisseur.md) : réception et clôture fournisseur.
- Relation -> [02-affectation-reservation.md](./02-affectation-reservation.md) : réservation, affectation et sortie de stock.
- Relation -> [03-transfert-retour.md](./03-transfert-retour.md) : transferts et retours entre emplacements.
- Relation -> [04-pilotage-stock.md](./04-pilotage-stock.md) : suivi des niveaux, seuils et inventaires.
