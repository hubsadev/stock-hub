# Referentiel - Sites, depots et ressources

## Perimetre

Creation et gestion des sites, depots/entrepots, employes, sous-traitants, vehicules et equipements.

## Ecran / action

### Action 1 - Creer un site

- Ecran : Referentiel > Sites > Creer
- Action : Enregistrer la fiche site

### Action 2 - Creer un depot

- Ecran : Referentiel > Depots/Entrepots > Creer
- Action : Enregistrer la fiche depot

### Action 3 - Creer une ressource

- Ecran : Referentiel > Ressources (Employe/Sous-traitant/Vehicule/Equipement) > Creer
- Action : Enregistrer la fiche ressource

## Input

### Action 1 - Creer un site

- Champ / donnee : nom, client rattache, localisation, type de site
- Source : saisie utilisateur
- Caractere obligatoire : oui pour nom et client rattache
- Remarque : rattachement a une affaire si le modele le requiert

### Action 2 - Creer un depot

- Champ / donnee : nom, localisation, type depot
- Source : saisie utilisateur
- Caractere obligatoire : oui pour nom
- Remarque : peut etre associe a un chantier temporaire

### Action 3 - Creer une ressource

- Champ / donnee : type ressource, identifiant, affectation initiale
- Source : saisie utilisateur
- Caractere obligatoire : oui pour type et identifiant
- Remarque : vehicules et equipements peuvent exiger un numero de serie

## Traitement systeme

### Action 1 - Creer un site

1. Verifier les droits de creation.
2. Verifier les champs obligatoires.
3. Generer une reference unique.
4. Creer la fiche site.
5. Rendre le site disponible pour OT, tickets et PV.

### Action 2 - Creer un depot

1. Verifier les droits de creation.
2. Verifier les champs obligatoires.
3. Generer une reference unique.
4. Creer la fiche depot.

### Action 3 - Creer une ressource

1. Verifier les droits de creation.
2. Verifier la validite des champs.
3. Generer une reference unique.
4. Creer la fiche ressource.
5. Historiser la creation.

## Output

### Action 1 - Creer un site

- Resultat visible : fiche site creee
- Statut affiche : Actif
- Trace creee : historique de creation
- Notification eventuelle : none

### Action 2 - Creer un depot

- Resultat visible : fiche depot creee
- Statut affiche : Actif
- Trace creee : historique de creation
- Notification eventuelle : none

### Action 3 - Creer une ressource

- Resultat visible : fiche ressource creee
- Statut affiche : Actif
- Trace creee : historique de creation
- Notification eventuelle : none

## Regle metier

### Action 1 - Creer un site

- Un site doit etre rattache a un client ou a une affaire selon le modele retenu.

### Action 2 - Creer un depot

- Un depot doit etre distingue des autres emplacements logistiques.

### Action 3 - Creer une ressource

- Les ressources actives peuvent etre affectees aux operations terrain.

## Exception

### Action 1 - Creer un site

- Cas : client inexistant ou inactif ; Effet attendu : blocage.

### Action 2 - Creer un depot

- Cas : depot temporaire ferme apres fin de projet ; Effet attendu : passage en inactif, pas suppression.

### Action 3 - Creer une ressource

- Cas : equipement deplace sans historisation ; Effet attendu : blocage ou correction avec trace.

## Liens documentaires

- Relation -> [matrices/01-referentiel.md](../../matrices/01-referentiel.md) : cadrage des sites, dépôts, ressources et équipements du référentiel.
- Relation -> [business-rules.md](../../business-rules.md) : règles de rattachement et de traçabilité des emplacements et ressources.
- Relation -> [state-transitions.md](../../state-transitions.md) : transitions d'activation, d'inactivation et de réaffectation.
- Relation -> [user-flows.md](../../user-flows.md) : parcours de création, affectation et désactivation des ressources.
- Relation -> [edge-cases.md](../../edge-cases.md) : déménagement, double affectation et historique des déplacements.

## Liens inter-modules

- Relation -> [../03-contrats-affaires-projets/02-structuration-projet.md](../03-contrats-affaires-projets/02-structuration-projet.md) : les sites structurent le découpage opérationnel des projets.
- Relation -> [../05-achats/01-expression-de-besoin.md](../05-achats/01-expression-de-besoin.md) : les besoins peuvent être rattachés à un site, un chantier ou un dépôt.
- Relation -> [../06-stock-logistique-magasin/02-affectation-reservation.md](../06-stock-logistique-magasin/02-affectation-reservation.md) : les dépôts et ressources servent à réserver et affecter le stock.
- Relation -> [../06-stock-logistique-magasin/03-transfert-retour.md](../06-stock-logistique-magasin/03-transfert-retour.md) : les transferts et retours reposent sur les emplacements référentiels.
