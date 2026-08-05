# Module 1 - Referentiel

Ce dossier couvre le referentiel (clients, fournisseurs, articles/prestations, sites, depots et ressources).
Les fiches sont structurees pour etre directement exploitables par produit, dev et QA.

## Fichiers

- `01-tiers.md`
- `02-articles-prestations.md`
- `03-sites-depots-ressources.md`
- `04-consultation-desactivation.md`

## Liens documentaires

- Relation -> [matrices/01-referentiel.md](../../matrices/01-referentiel.md) : matrice source du module et synthèse des objets référentiels.
- Relation -> [use-cases.md](../../use-cases.md) : cas d'usage couvrant la création, la modification et la désactivation des référentiels.
- Relation -> [user-stories.md](../../user-stories.md) : formulation métier des besoins référentiel.
- Relation -> [functionnal-requirements.md](../../functionnal-requirements.md) : exigences communes de consultation, création et désactivation.
- Relation -> [permissions.md](../../permissions.md) : droits nécessaires selon les profils référentiel, achats, direction et projet.
- Relation -> [edge-cases.md](../../edge-cases.md) : doublons, désactivation et conservation de l'historique.

## Liens inter-modules

- Relation -> [02-avant-vente/README.md](../02-avant-vente/README.md) : les clients et tiers alimentent les demandes de cotation et les offres.
- Relation -> [03-contrats-affaires-projets/README.md](../03-contrats-affaires-projets/README.md) : les clients, sites et dépôts servent au lancement et au pilotage des projets.
- Relation -> [05-achats/README.md](../05-achats/README.md) : les fournisseurs et articles référentiels servent à l'approvisionnement.
- Relation -> [06-stock-logistique-magasin/README.md](../06-stock-logistique-magasin/README.md) : les dépôts, sites et ressources structurent les mouvements logistiques.

## Liens internes

- Relation -> [01-tiers.md](./01-tiers.md) : gestion des clients et fournisseurs utilisés par les autres modules.
- Relation -> [02-articles-prestations.md](./02-articles-prestations.md) : catalogue articles et prestations consommé par les offres, achats et stocks.
- Relation -> [03-sites-depots-ressources.md](./03-sites-depots-ressources.md) : sites, dépôts et ressources rattachés aux opérations.
- Relation -> [04-consultation-desactivation.md](./04-consultation-desactivation.md) : consultation et désactivation sans rupture d'historique.
